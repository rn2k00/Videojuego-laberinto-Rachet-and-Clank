import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js '

class Puerta extends THREE.Object3D {
    constructor() {
        super();

        // Materiales básicos
        this.matMadera = new THREE.MeshStandardMaterial({
            color: 0x8B5A2B,
            roughness: 0.8
        });
        this.matMetal = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.3,
            metalness: 0.8
        });

        // Variables para la animación
        this.estaAbriendo = false;
        this.anguloAperturaMaxima = Math.PI / 2; // Equivalente a 90 grados ($90^{\circ}$)

        // 1. NODO BISAGRA (El punto de pivote)
        // Todo colgará de este nodo. Al rotarlo, la puerta girará como una de verdad.
        this.nodoBisagra = new THREE.Object3D();
        this.add(this.nodoBisagra);

        // 2. LA PUERTA (Malla)
        // Supongamos que tu pasillo mide 2 metros de ancho y 3 de alto
        var anchoPuerta = 2.0;
        var altoPuerta = 3.0;
        var grosorPuerta = 0.2;

        var geoPuerta = new THREE.BoxGeometry(anchoPuerta, altoPuerta, grosorPuerta);
        var mallaPuerta = new THREE.Mesh(geoPuerta, this.matMadera);

        // Desplazamos la malla la mitad de su ancho hacia la derecha. 
        // Así, el borde izquierdo de la puerta coincidirá exactamente con el nodo bisagra.
        mallaPuerta.position.x = anchoPuerta / 2;
        mallaPuerta.position.y = altoPuerta / 2; // La levantamos para que esté sobre el suelo

        this.nodoBisagra.add(mallaPuerta);

        // 3. EL POMO
        var geoPomo = new THREE.SphereGeometry(0.1, 16, 16);
        var mallaPomo = new THREE.Mesh(geoPomo, this.matMetal);

        // Colocamos el pomo en el lado derecho de la puerta
        mallaPomo.position.set(anchoPuerta - 0.2, altoPuerta / 2, grosorPuerta);
        this.nodoBisagra.add(mallaPomo);
    }

    // Método que llamaremos al hacer clic en el pomo
    abrir() {
        this.estaAbriendo = true;
    }

    update() {
        // Animación suave de apertura
        if (this.estaAbriendo && this.nodoBisagra.rotation.y < this.anguloAperturaMaxima) {
            // Incrementamos la rotación en cada frame
            this.nodoBisagra.rotation.y += 0.02;
        }
    }
}

export { Puerta }