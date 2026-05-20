import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js';

class Nanotec extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        this.createGUI(gui, titleGui);


        this.materialNucleo = new THREE.MeshStandardMaterial({
            color: 0x00FFFF,
            emissive: 0x0088FF,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        });

        this.material2 = new THREE.MeshNormalMaterial();

        this.jaula = this.createJaula();
        this.jaula.position.y = 0.15;
        this.add(this.jaula);

        this.nucleo = this.createNucleo();
        this.nucleo.position.y = 0.15;
        this.add(this.nucleo);
    }

    createJaula() {
        var tamanoCubo = 0.3;

        // 1. EL CUBO BASE
        var geoCubo = new THREE.BoxGeometry(tamanoCubo, tamanoCubo, tamanoCubo);
        var brushBase = new CSG.Brush(geoCubo);
        brushBase.updateMatrixWorld();

        // 2. Cortar las 8 esquinas a la vez
        var geoOctaedro = new THREE.OctahedronGeometry(0.38);
        var brushOctaedro = new CSG.Brush(geoOctaedro);
        brushOctaedro.updateMatrixWorld();

        var visualOctaedro = new THREE.Mesh(
            geoOctaedro, this.materia2
        );

        //this.add(visualOctaedro);

        var evaluator = new CSG.Evaluator();

        // INTERSECCIÓN: Nos quedamos con el cubo, pero le restamos las esquinas con el octaedro
        var brushCuboAchaflanado = evaluator.evaluate(brushBase, brushOctaedro, CSG.INTERSECTION);

        // 3. EL HUECO INTERIOR 
        var geoHuecoInt = new THREE.SphereGeometry(tamanoCubo * 0.6, 32, 32);
        var brushHuecoInt = new CSG.Brush(geoHuecoInt);
        brushHuecoInt.updateMatrixWorld();

        // RESTA: Vaciamos el interior
        var brushJaulaHueca = evaluator.evaluate(brushCuboAchaflanado, brushHuecoInt, CSG.SUBTRACTION);

        // 4. LOS CORTES LATERALES 
        var radioCorte = tamanoCubo * 0.35;
        var geoCorte = new THREE.CylinderGeometry(radioCorte, radioCorte, tamanoCubo * 1.5, 8);

        // Corte en el Eje Y
        var brushCorteY = new CSG.Brush(geoCorte);
        brushCorteY.updateMatrixWorld();
        brushJaulaHueca = evaluator.evaluate(brushJaulaHueca, brushCorteY, CSG.SUBTRACTION);

        // Corte en el Eje X
        var brushCorteX = new CSG.Brush(geoCorte);
        brushCorteX.rotation.z = Math.PI / 2;
        brushCorteX.updateMatrixWorld();
        brushJaulaHueca = evaluator.evaluate(brushJaulaHueca, brushCorteX, CSG.SUBTRACTION);

        // Corte en el Eje Z
        var brushCorteZ = new CSG.Brush(geoCorte);
        brushCorteZ.rotation.x = Math.PI / 2;
        brushCorteZ.updateMatrixWorld();

        var mallaFinalJaula = evaluator.evaluate(brushJaulaHueca, brushCorteZ, CSG.SUBTRACTION);

        mallaFinalJaula.material = this.material2;
        mallaFinalJaula.geometry.computeVertexNormals();

        return mallaFinalJaula;
    }

    createNucleo() {
        var grupoNucleo = new THREE.Group();

        // 1. LA ESFERA CONTENEDORA 
        var geoEsfera = new THREE.SphereGeometry(0.08, 32, 32);

        var mallaEsfera = new THREE.Mesh(geoEsfera, this.materialNucleo);
        grupoNucleo.add(mallaEsfera);

        var geoOrbita = new THREE.TorusGeometry(0.06, 0.003, 16, 64);

        // Creamos 3 órbitas en diferentes ángulos
        this.orbitas = [];

        for (let i = 0; i < 3; i++) {
            let mallaOrbita = new THREE.Mesh(geoOrbita, this.material2);

            // Las inclinamos de forma aleatoria 
            mallaOrbita.rotation.x = Math.random() * Math.PI;
            mallaOrbita.rotation.y = Math.random() * Math.PI;

            grupoNucleo.add(mallaOrbita);
            this.orbitas.push(mallaOrbita);
        }

        return grupoNucleo;
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotacion: 0.0
        }

        var folder = gui.addFolder(titleGui);
        folder.add(this.guiControls, 'rotacion', 0.0, Math.PI * 2, 0.1)
            .name('Girar Nanotec: ')
            .onChange((value) => {
                this.rotation.y = value;
            });
    }

    update() {
        // Hacemos que cada una gire en direcciones cruzadas 
        if (this.orbitas) {
            this.orbitas[0].rotation.x += 0.04;
            this.orbitas[1].rotation.y += 0.05;

            // A la tercera le damos rotación en X y en Y para que haga un giro rarete
            this.orbitas[2].rotation.x += 0.03;
            this.orbitas[2].rotation.y += 0.03;
        }
    }
}

export { Nanotec }