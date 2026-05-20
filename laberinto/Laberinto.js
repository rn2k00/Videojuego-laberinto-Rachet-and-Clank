import * as THREE from 'three'

class Laberinto extends THREE.Object3D {
    constructor() {
        super();

        this.mapa = [
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // [0,1] es la Salida (S)
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],// Pick 1 - Zona alta derecha - [1,13]
            [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // Centro: Jugador [7,7]
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1], // Pick 2 - Zona media derecha - [9,13]
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // Pick 3 - Esquina inferior izquierda - [1,10]
            [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // Pick 4 - Zona inferior izquierda - [9,10]
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        this.tamanoCasilla = 2;
        this.altoPared = 3;     // Altura de 3 metros

        // Construimos paredes en los 1s del mapa
        this.construirLaberinto();
    }

    construirLaberinto() {
        // 1. Cargamos las texturas
        var textureLoader = new THREE.TextureLoader();

        // Textura base 
        var texturaColor = textureLoader.load('../imgs/pared11.png');

        // Textura de RELIEVE 
        var texturaRelieve = textureLoader.load('../imgs/pared11-normal.png');

        // 2. Creamos el material aplicando ambas texturas
        var matPared = new THREE.MeshStandardMaterial({
            map: texturaColor,           // Aplica la foto normal
            normalMap: texturaRelieve,   // Aplica el relieve falso a la luz
            normalScale: new THREE.Vector2(3, 3),
            roughness: 0.9,              // Muy rugoso para que parezca pared real
            metalness: 0.1
        });

        var geoPared = new THREE.BoxGeometry(this.tamanoCasilla, this.altoPared, this.tamanoCasilla);

        // 1. Calculamos las dimensiones totales del mapa
        var numFilas = this.mapa.length;
        var numColumnas = this.mapa[0].length;

        var anchoTotal = numColumnas * this.tamanoCasilla;
        var fondoTotal = numFilas * this.tamanoCasilla;

        // 2. Calculamos el desplazamiento necesario para centrarlo
        var offsetX = anchoTotal / 2;
        var offsetZ = fondoTotal / 2;

        for (let f = 0; f < numFilas; f++) {
            for (let c = 0; c < numColumnas; c++) {

                if (this.mapa[f][c] === 1) {
                    var pared = new THREE.Mesh(geoPared, matPared);

                    // 3. Centramos cada pared en su casilla correspondiente:
                    // (Posición original) - (Mitad del tamaño total) + (Mitad de una casilla para ajustar el centro del cubo)
                    pared.position.x = (c * this.tamanoCasilla) - offsetX + (this.tamanoCasilla / 2);
                    pared.position.z = (f * this.tamanoCasilla) - offsetZ + (this.tamanoCasilla / 2);

                    pared.position.y = this.altoPared / 2;

                    this.add(pared);
                }
            }
        }
    }

    update() {
    }
}

export { Laberinto }