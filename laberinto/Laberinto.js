import * as THREE from 'three'

class Laberinto extends THREE.Object3D {
    constructor() {
        super();

        this.mapa = [
            // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0  - Salida en [0,1]
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 1  - Pick 1 en [1,13]
            [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1], // 2
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1], // 4
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 5
            [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1], // 6
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7  - Centro [7,7] | Pick 2 en [7,13]
            [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 8
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
            [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1], // 10
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 11
            [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1], // 12
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // 13 - Pick 3 en [13,1] | Pick 4 en [13,13]
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
        ];

        /*
                this.mapa = [
                    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // [0,1] es la Salida (S)
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],// Pick 1 - Zona alta derecha - [1,13]
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Centro: Jugador [7,7]
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Pick 2 - Zona media derecha - [9,13]
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Pick 3 - Esquina inferior izquierda - [1,10]
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Pick 4 - Zona inferior izquierda - [9,10]
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ];
        */


        this.tamanoCasilla = 2;
        this.altoPared = 3;     // Altura de 3 metros

        // Construimos paredes en los 1s del mapa
        this.construirLaberinto();
    }

    construirLaberinto() {
        // 1. Cargamos las texturas
        var textureLoader = new THREE.TextureLoader();

        // DEFENSA 4 - TEXTIRAS CON RELIEVE PARA MEJORAR EL REALISMO DE LAS PAREDES
        // Textura base 
        var texturaColor = textureLoader.load('../imgs/pared11.png');

        // Textura de RELIEVE 
        var texturaRelieve = textureLoader.load('../imgs/pared11-normal.png');

        // 2. Creamos el material aplicando ambas texturas
        var matPared = new THREE.MeshStandardMaterial({
            map: texturaColor,
            normalMap: texturaRelieve,
            normalScale: new THREE.Vector2(3, 3),
            roughness: 0.9,
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