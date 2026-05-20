import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js '

class Omnillave extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        this.createGUI(gui, titleGui);

        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.4,
            metalness: 0.8,
            side: THREE.DoubleSide
        });

        this.material2 = new THREE.MeshNormalMaterial();


        // 1. Mango (Lathe)
        this.mango = this.createMango();
        this.add(this.mango);

        // 2. Cabeza (Extrude)
        this.cabeza = this.createCabeza();
        this.add(this.cabeza);

        // 3. Protector (Tube)
        this.protector = this.createProtector();
        this.add(this.protector);

        // 4. Tornillos Gigantes (CSG)
        this.tornillos = this.createTornillos();
        this.add(this.tornillos);
    }

    createMango() {
        var puntos = [];

        puntos.push(new THREE.Vector2(0.0, 0.0));
        puntos.push(new THREE.Vector2(0.075, 0.0));
        puntos.push(new THREE.Vector2(0.05, 0.05));
        puntos.push(new THREE.Vector2(0.05, 0.35));
        puntos.push(new THREE.Vector2(0.06, 0.39));
        puntos.push(new THREE.Vector2(0.075, 0.41));
        puntos.push(new THREE.Vector2(0.1, 0.41));
        puntos.push(new THREE.Vector2(0.1, 0.44));
        puntos.push(new THREE.Vector2(0.075, 0.44));
        puntos.push(new THREE.Vector2(0.06, 0.46));
        puntos.push(new THREE.Vector2(0.05, 0.5));
        puntos.push(new THREE.Vector2(0.0, 0.5));

        var geoMango = new THREE.LatheGeometry(puntos, 32);
        var mallaMango = new THREE.Mesh(geoMango, this.material2);

        return mallaMango;
    }

    createCabeza() {
        var shape = new THREE.Shape();
        shape.moveTo(0.0, 0.0);
        shape.lineTo(0.07, 0.01);
        shape.lineTo(0.1, 0.05);
        shape.lineTo(0.09, 0.2);
        shape.lineTo(0.05, 0.3);
        shape.lineTo(0.0, 0.3);
        shape.lineTo(0.0, 0.0);

        var extrudeSettings = {
            depth: 0.08,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 2,
            curveSegments: 1
        };

        var geoMordaza = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        geoMordaza.translate(0, 0, -0.04);

        var mordazaDer = new THREE.Mesh(geoMordaza, this.material2);
        mordazaDer.position.set(0.1, 0.35, 0);

        var mordazaIzq = mordazaDer.clone();
        mordazaIzq.position.set(-0.1, 0.35, 0);
        mordazaIzq.rotation.y = Math.PI;

        var grupoCabeza = new THREE.Object3D();
        grupoCabeza.add(mordazaDer);
        grupoCabeza.add(mordazaIzq);

        return grupoCabeza;
    }

    createProtector() {
        var curva = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.04, 0.05, 0),
            new THREE.Vector3(0.1, 0.11, 0),
            new THREE.Vector3(0.11, 0.17, 0),
            new THREE.Vector3(0.04, 0.2, 0)
        ]);

        var geoTubo = new THREE.TubeGeometry(curva, 20, 0.015, 8, false);
        var mallaTubo = new THREE.Mesh(geoTubo, this.material2);

        return mallaTubo;
    }

    createTornillos() {
        var grupoTornillos = new THREE.Object3D();

        var geoCabeza = new THREE.CylinderGeometry(0.015, 0.015, 0.015, 16);
        var geoHendidura = new THREE.BoxGeometry(0.08, 0.005, 0.02);


        var brushCabeza = new CSG.Brush(geoCabeza);
        brushCabeza.rotation.x = Math.PI / 2;
        brushCabeza.updateMatrixWorld();

        var brushHendidura = new CSG.Brush(geoHendidura);
        brushHendidura.position.z = 0.005;
        brushHendidura.updateMatrixWorld();

        // RESTA
        var evaluator = new CSG.Evaluator();
        var mallaTornilloFrontal = evaluator.evaluate(brushCabeza, brushHendidura, CSG.SUBTRACTION);

        mallaTornilloFrontal.material = this.material;
        mallaTornilloFrontal.geometry.computeVertexNormals();

        mallaTornilloFrontal.position.set(0, 0.425, 0.1);
        grupoTornillos.add(mallaTornilloFrontal);

        var mallaTornilloTrasero = mallaTornilloFrontal.clone();
        mallaTornilloTrasero.position.set(0, 0.425, -0.1);
        mallaTornilloTrasero.rotation.x = Math.PI;
        grupoTornillos.add(mallaTornilloTrasero);


        return grupoTornillos;
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            escala: 1.0
        }

        var folder = gui.addFolder(titleGui);
        folder.add(this.guiControls, 'escala', 0.1, 15.0, 0.1)
            .name('Escala Llave: ')
            .onChange((value) => this.scale.set(value, value, value));
    }

    update() {
        // Espacio para animaciones
    }
}

export { Omnillave }