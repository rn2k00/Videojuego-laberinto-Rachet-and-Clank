import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js';

class GuitonOro extends THREE.Object3D {
    constructor(gui, titleGui) {
        super();

        this.createGUI(gui, titleGui);

        this.materialOro = new THREE.MeshStandardMaterial({
            color: 0xFFE666,
            roughness: 0.3,
            metalness: 1.0,
            side: THREE.DoubleSide
        });

        // 1. Cuerpo del tornillo
        this.cuerpo = this.createCuerpo();
        this.add(this.cuerpo);

        // 2. Cabeza del tornillo
        this.cabeza = this.createCabeza();
        this.add(this.cabeza);
    }

    createCuerpo() {
        var grupoCuerpo = new THREE.Object3D();

        var alturaCuerpo = 0.15;
        var radioCilindro = 0.04;

        // 1. EL NÚCLEO CENTRAL
        var geoCilindro = new THREE.CylinderGeometry(radioCilindro, radioCilindro, alturaCuerpo, 32);
        geoCilindro.translate(0, alturaCuerpo / 2, 0);
        var mallaCilindro = new THREE.Mesh(geoCilindro, this.materialOro);
        grupoCuerpo.add(mallaCilindro);

        // 2. LA ROSCA 
        var numAnillos = 8;
        var separacion = alturaCuerpo / numAnillos;

        var geoAnillo = new THREE.TorusGeometry(radioCilindro, 0.01, 8, 32);
        geoAnillo.rotateX(Math.PI / 2);

        for (let i = 0; i < numAnillos; i++) {
            var anillo = new THREE.Mesh(geoAnillo, this.materialOro);
            // Los colocamos a lo largo del eje Y
            anillo.position.y = (i * separacion) + (separacion / 2);
            grupoCuerpo.add(anillo);
        }

        return grupoCuerpo;
    }

    createCabeza() {
        // Hexágono en 2D
        var shapeHexagono = new THREE.Shape();
        var radioHex = 0.10;

        for (let i = 0; i < 6; i++) {
            let angulo = (i / 6) * Math.PI * 2 + (Math.PI / 6);
            let x = radioHex * Math.cos(angulo);
            let y = radioHex * Math.sin(angulo);

            if (i === 0) shapeHexagono.moveTo(x, y);
            else shapeHexagono.lineTo(x, y);
        }
        shapeHexagono.lineTo(radioHex * Math.cos(Math.PI / 6), radioHex * Math.sin(Math.PI / 6));

        var extrudeSettings = {
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 2,
            curveSegments: 1
        };

        var geoCabeza = new THREE.ExtrudeGeometry(shapeHexagono, extrudeSettings);

        // Centramos la pieza y la tumbamos para que apoye bien sobre el tornillo
        geoCabeza.translate(0, 0, -0.025);
        geoCabeza.rotateX(Math.PI / 2);

        var geoMuesca = new THREE.BoxGeometry(0.2, 0.03, 0.035);

        var brushCabeza = new CSG.Brush(geoCabeza);
        brushCabeza.updateMatrixWorld();

        var brushMuesca = new CSG.Brush(geoMuesca);
        brushMuesca.position.y = 0.025;
        brushMuesca.updateMatrixWorld();

        // Usamos el Evaluator para hacer la resta Cabeza - Caja
        var evaluator = new CSG.Evaluator();
        var mallaCabezaFinal = evaluator.evaluate(brushCabeza, brushMuesca, CSG.SUBTRACTION);

        mallaCabezaFinal.material = this.materialOro;
        mallaCabezaFinal.geometry.computeVertexNormals();

        // Colocamos la cabeza terminada justo encima del cuerpo del tornillo
        mallaCabezaFinal.position.y = 0.15;

        return mallaCabezaFinal;
    }

    createGUI(gui, titleGui) {
        this.guiControls = {
            rotacion: 0.0
        }

        var folder = gui.addFolder(titleGui);
        folder.add(this.guiControls, 'rotacion', 0.0, Math.PI * 2, 0.1)
            .name('Girar Guitón: ')
            .onChange((value) => {
                this.rotation.y = value;
            });
    }

    update() {
    }
}

export { GuitonOro }