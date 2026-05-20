import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js';

class Clank extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        this.matGris = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 });
        this.matOscuro = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.5 });
        this.matOjos = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 });

        // nodo raíz del modelo, aquí enganchamos todo para que no se desmonte
        this.cuerpo = this.createCuerpo();
        this.add(this.cuerpo);

        // nodo del cuello independiente para poder rotar la cabeza sin girar el tronco entero
        this.nodoCuello = new THREE.Object3D();
        this.nodoCuello.position.y = 0.41;
        this.add(this.nodoCuello);

        this.cabeza = this.createCabeza();
        this.nodoCuello.add(this.cabeza);

        // instanciamos los brazos. al colgarlos del 'this' global se mueven con el cuerpo
        this.brazoDer = this.createBrazo(false);
        this.brazoDer.position.set(0.12, 0.26, 0);
        this.add(this.brazoDer);

        this.brazoIzq = this.createBrazo(true);
        this.brazoIzq.position.set(-0.12, 0.26, 0);
        this.add(this.brazoIzq);

        this.createGUI(gui, titleGui);
    }

    createCuerpo() {
        var grupoCuerpo = new THREE.Object3D();

        var geoPie = new THREE.BoxGeometry(0.08, 0.04, 0.1);
        var pieDer = new THREE.Mesh(geoPie, this.matOscuro);
        pieDer.position.set(0.06, 0.02, 0.03);
        var pieIzq = new THREE.Mesh(geoPie, this.matOscuro);
        pieIzq.position.set(-0.06, 0.02, 0.03);

        grupoCuerpo.add(pieDer);
        grupoCuerpo.add(pieIzq);

        var geoTronco = new THREE.CylinderGeometry(0.08, 0.14, 0.26, 4);
        var mallaTronco = new THREE.Mesh(geoTronco, this.matGris);
        mallaTronco.rotation.y = Math.PI / 4;
        mallaTronco.position.y = 0.17;

        grupoCuerpo.add(mallaTronco);
        return grupoCuerpo;
    }

    createCabeza() {
        var grupoCabeza = new THREE.Object3D();

        var geoCráneo = new THREE.SphereGeometry(0.1, 32, 32);
        var mallaCráneo = new THREE.Mesh(geoCráneo, this.matGris);
        grupoCabeza.add(mallaCráneo);

        var geoBoca = new THREE.SphereGeometry(0.102, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        var mallaBoca = new THREE.Mesh(geoBoca, this.matOscuro);
        mallaBoca.position.y = -0.01;
        grupoCabeza.add(mallaBoca);

        var geoOjo = new THREE.SphereGeometry(0.025, 16, 16);
        var ojoDer = new THREE.Mesh(geoOjo, this.matOjos);
        ojoDer.position.set(0.04, 0.02, 0.09);
        var ojoIzq = new THREE.Mesh(geoOjo, this.matOjos);
        ojoIzq.position.set(-0.04, 0.02, 0.09);
        grupoCabeza.add(ojoDer);
        grupoCabeza.add(ojoIzq);

        var geoPalo = new THREE.CylinderGeometry(0.005, 0.005, 0.06);
        var palo = new THREE.Mesh(geoPalo, this.matGris);
        palo.position.y = 0.13;
        grupoCabeza.add(palo);

        var geoPunta = new THREE.SphereGeometry(0.015, 16, 16);
        var punta = new THREE.Mesh(geoPunta, this.matOjos);
        punta.position.y = 0.15;
        grupoCabeza.add(punta);

        return grupoCabeza;
    }

    // la jerarquía clave: hombro -> codo -> muñeca -> dedos. 
    // metiendo un Object3D dentro de otro soluciono el problema de que el antebrazo se mueva por libre al rotar el brazo
    createBrazo(esIzquierdo) {
        var signo;
        if (esIzquierdo == true) {
            signo = -1;
        } else {
            signo = 1;
        }

        // nodo pivote del hombro
        var nodoHombro = new THREE.Object3D();

        var geoHombro = new THREE.SphereGeometry(0.04, 16, 16);
        var mallaHombro = new THREE.Mesh(geoHombro, this.matGris);
        nodoHombro.add(mallaHombro);

        var largoBrazoSup = 0.1;
        var geoBrazoSup = new THREE.BoxGeometry(0.04, largoBrazoSup, 0.04);
        var mallaBrazoSup = new THREE.Mesh(geoBrazoSup, this.matOscuro);
        // Bajo la malla la mitad de su tamaño para que el eje de rotación se quede justo arriba
        mallaBrazoSup.position.y = -largoBrazoSup / 2;
        nodoHombro.add(mallaBrazoSup);

        // el codo va anidado dentro del hombro para heredar sus transformaciones
        var nodoCodo = new THREE.Object3D();
        nodoCodo.position.y = -largoBrazoSup;
        nodoHombro.add(nodoCodo);

        var largoAntebrazo = 0.06;
        var geoAntebrazo = new THREE.BoxGeometry(0.03, largoAntebrazo, 0.03);
        var mallaAntebrazo = new THREE.Mesh(geoAntebrazo, this.matGris);
        mallaAntebrazo.position.y = -largoAntebrazo / 2;
        nodoCodo.add(mallaAntebrazo);

        // misma jugada: la muñeca hereda del codo
        var nodoMuneca = new THREE.Object3D();
        nodoMuneca.position.y = -largoAntebrazo;
        nodoCodo.add(nodoMuneca);

        var geoManoBase = new THREE.BoxGeometry(0.04, 0.01, 0.04);
        var mallaManoBase = new THREE.Mesh(geoManoBase, this.matOscuro);
        nodoMuneca.add(mallaManoBase);

        // nodos de los dedos al final de la cadena cinemática
        var altoDedo = 0.04;
        var geoDedo = new THREE.BoxGeometry(0.01, altoDedo, 0.04);

        var nodoDedo1 = new THREE.Object3D();
        nodoDedo1.position.set(0.015, -0.005, 0);

        var mallaDedo1 = new THREE.Mesh(geoDedo, this.matGris);
        // desplazo la malla para que pivote desde la base de la muñeca
        mallaDedo1.position.y = -altoDedo / 2;

        nodoDedo1.add(mallaDedo1);
        nodoMuneca.add(nodoDedo1);

        var nodoDedo2 = new THREE.Object3D();
        nodoDedo2.position.set(-0.015, -0.005, 0);

        var mallaDedo2 = new THREE.Mesh(geoDedo, this.matGris);
        mallaDedo2.position.y = -altoDedo / 2;

        nodoDedo2.add(mallaDedo2);
        nodoMuneca.add(nodoDedo2);

        // guardo los nodos hijos en el userData del hombro
        // así los tengo a mano en el update() para animarlos directo sin tener que recorrer todo el grafo buscando hijos
        nodoHombro.userData = {
            codo: nodoCodo,
            muneca: nodoMuneca,
            dedo1: nodoDedo1,
            dedo2: nodoDedo2
        };

        return nodoHombro;
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotCabeza: 0.0,
            hombroX: 0.0,
            hombroZ: 0.0,
            codoX: 0.0,
            munecaY: 0.0,
            pinza: 0.0
        }

        var folder = gui.addFolder(titleGui);

        folder.add(this.guiControls, 'rotCabeza', -Math.PI / 2, Math.PI / 2, 0.01).name('Girar Cabeza').onChange((v) => this.nodoCuello.rotation.y = v);

        var fBrazo = folder.addFolder("Brazo Derecho");
        fBrazo.add(this.guiControls, 'hombroX', -Math.PI / 2, Math.PI / 2, 0.01).name('Hombro Adelante').onChange((v) => this.brazoDer.rotation.x = v);
        fBrazo.add(this.guiControls, 'hombroZ', 0, Math.PI, 0.01).name('Hombro Lateral').onChange((v) => this.brazoDer.rotation.z = v);
        fBrazo.add(this.guiControls, 'codoX', -Math.PI / 1.4, 0, 0.01).name('Doblar Codo').onChange((v) => this.brazoDer.userData.codo.rotation.x = v);
        fBrazo.add(this.guiControls, 'munecaY', -Math.PI, Math.PI, 0.01).name('Girar Muñeca').onChange((v) => this.brazoDer.userData.muneca.rotation.y = v);
        fBrazo.add(this.guiControls, 'pinza', 0, 0.25, 0.01).name('Abrir Pinza').onChange((v) => {
            // abro la pinza rotando cada nodo en direcciones opuestas
            this.brazoDer.userData.dedo1.rotation.z = -v;
            this.brazoDer.userData.dedo2.rotation.z = v;
        });
    }

    update() {
        const t = Date.now() * 0.003;

        if (this.brazoDer && this.brazoIzq) {
            const elevacionBrazos = -(Math.sin(t) + 1) * 0.8;

            this.brazoDer.rotation.x = elevacionBrazos;
            this.brazoIzq.rotation.x = elevacionBrazos;

            const apertura = 0.1 + Math.abs(Math.sin(t * 5)) * 0.15;
            this.brazoDer.userData.dedo1.rotation.z = -apertura;
            this.brazoDer.userData.dedo2.rotation.z = apertura;
            this.brazoIzq.userData.dedo1.rotation.z = -apertura;
            this.brazoIzq.userData.dedo2.rotation.z = apertura;
        }

        if (this.nodoCuello) {
            this.nodoCuello.rotation.x = -0.2 + Math.sin(t * 2) * 0.4;
        }
    }
}

export { Clank }