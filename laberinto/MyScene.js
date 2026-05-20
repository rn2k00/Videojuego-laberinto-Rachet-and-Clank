
// Clases de la biblioteca
// import * as THREE from "three"

import * as THREE from 'three'
import { GUI } from 'gui'
import { TrackballControls } from 'trackball'

// Clases de mi proyecto

import { Clank } from '../clank/Clank.js'
import { Laberinto } from '../laberinto/Laberinto.js'
import { GuitonOro } from '../guitonOro/GuitonOro.js'
import { Omnillave } from '../omnillave/Omnillave.js'
import { Nanotec } from '../nanotec/Nanotec.js'
import { Puerta } from '../puerta/Puerta.js'



/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
    // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
    // la visualización de la escena
    constructor(myCanvas) {
        super();

        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);




        // ===============================
        // FONDO ESPACIAL
        // ===============================

        // Cargamos la textura del espacio
        const texturaEspacio = new THREE.TextureLoader().load('../imgs/espacio.jpeg');

        // Repetir la textura como un mosaico
        texturaEspacio.wrapS = THREE.RepeatWrapping;
        texturaEspacio.wrapT = THREE.RepeatWrapping;
        texturaEspacio.repeat.set(6, 6);

        // Creamos una esfera gigante que rodea toda la escena
        const geometriaEspacio = new THREE.SphereGeometry(400, 64, 64);

        // Material con la textura espacial
        const materialEspacio = new THREE.MeshBasicMaterial({
            map: texturaEspacio,
            // La textura se verá desde dentro de la esfera
            side: THREE.BackSide
        });

        // Creamos el skybox espacial
        const espacio = new THREE.Mesh(geometriaEspacio, materialEspacio);

        // Lo añadimos a la escena
        this.add(espacio);






        // Se crea la interfaz gráfica de usuario
        this.gui = this.createGUI();

        // Capturamos los eventos de ratón en el contenedor de la GUI
        const guiContainer = this.gui.domElement;

        guiContainer.addEventListener('mousedown', (event) => {
            event.stopPropagation(); // Evita que el clic llegue al canvas 3D
        }, false);

        guiContainer.addEventListener('wheel', (event) => {
            event.stopPropagation(); // Evita que el zoom afecte a la escena mientras usas la GUI
        }, false);

        //DEFENSA 3 - Control del personaje desde el teclado
        // Variables para el control de movimiento
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Reloj para calcular el tiempo entre frames (delta) y que la velocidad sea constante
        this.clock = new THREE.Clock();
        this.velocidadMovimiento = 5.0; // 5 metros por segundo
        ////////////////////////////////

        // Construimos los distinos elementos que tendremos en la escena

        // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
        // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
        this.createLights();

        // Tendremos una cámara con un control de movimiento con el ratón
        this.createCamera();

        // Un suelo 
        this.createGround();

        // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
        // Todas las unidades están en metros
        this.axis = new THREE.AxesHelper(5);
        this.add(this.axis);


        // 2. AÑADIMOS EL LABERINTO
        this.laberinto = new Laberinto();
        this.add(this.laberinto);

        // 3. AÑADIMOS A CLANK y demas personajes
        this.clank = new Clank(this.gui, "Controles de Clank");
        this.add(this.clank);
        this.clank.position.set(0.5, 0, 0.5);

        this.clank2 = new Clank(this.gui, "Controles de Clank2");
        this.add(this.clank2);
        // Si vemos el mapa desde arriba seria en la mitad de[1,13], pero como el personaje se situa en el centro de su casilla, lo colocamos en [12, 0, -12] 
        // (coordenadas del mundo) para que quede centrado en esa casilla
        // Pick 1 - Zona alta derecha - [1,13]
        this.clank2.position.set(12, 0, -12);

        this.guitonOro = new GuitonOro(this.gui, "Controles de GuitonOro");
        this.add(this.guitonOro);
        this.guitonOro.position.set(0.5, 0, -0.5);

        this.omnillave = new Omnillave(this.gui, "Controles de Omnillave");
        this.add(this.omnillave);
        this.omnillave.position.set(-0.5, 0, 0.5);

        this.nanotec = new Nanotec(this.gui, "Controles de Nanotec");
        this.add(this.nanotec);
        this.nanotec.position.set(-0.5, 0.15, -0.5);

        this.puerta = new Puerta();
        this.puerta.position.set(-13, 0, -13);
        this.add(this.puerta);


        //Defensa 3 - Control del personaje desde el teclado
        this.raycaster = new THREE.Raycaster();

        //Defensa 3 - Recogida de objetos
        this.pickups = []; // Aquí guardaremos los objetos que se pueden coger
        this.pickups.push(this.clank);
        this.pickups.push(this.clank2);
        this.pickups.push(this.guitonOro);
        this.pickups.push(this.omnillave);
        this.pickups.push(this.nanotec);
        this.pickups.push(this.puerta);

        //Correccion defensa 3 - Descentrar mira para que no se superponga el centro de la pantalla con el objeto a recoger
        this.mouseClickDerecho = false;
        this.camaraRotacionY = 0; // Rotación horizontal (mirar izquierda/derecha)
        this.camaraRotacionX = 0; // Rotación vertical (mirar arriba/abajo)
        this.sensibilidadRaton = 0.003;

        // Defensa 4 - Elevacion de clank 
        this.tiempoVisionAerea = 0; // Temporizador para el salto de Clank
        this.alturaNormal = 1.7;    // Tu altura normal al caminar
        this.alturaSalto = 20.0;    // A cuántos metros subirá la cámara

        // Defensa 4 - Vista aérea
        this.tiempoVistaNanotec = 0;
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 500);
        this.camera.position.set(2, 1.7, 0);
        this.add(this.camera);

        // Inicializamos los ángulos con la orientación actual de la cámara
        this.camaraRotacionY = this.camera.rotation.y;
        this.camaraRotacionX = this.camera.rotation.x;

        // 1. Detectar cuando se pulsa un botón del ratón
        document.body.addEventListener('mousedown', (event) => {
            if (event.button === 2) { // Clic DERECHO para girar la cabeza
                this.mouseClickDerecho = true;
            }
            if (event.button === 0) { // Clic IZQUIERDO para coger objetos
                // Le pasamos el evento completo para saber las coordenadas del ratón
                this.intentarRecogerObjeto(event);
            }
        });

        // 2. Detectar cuando se suelta el botón del ratón
        document.body.addEventListener('mouseup', (event) => {
            if (event.button === 2) {
                this.mouseClickDerecho = false;
            }
        });

        // 3. Desactivar el menú contextual que sale en el navegador al hacer clic derecho
        document.body.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        // 4. Mover el ratón (Girar la cámara solo si el botón derecho está pulsado)
        document.body.addEventListener('mousemove', (event) => {
            if (this.mouseClickDerecho) {
                // event.movementX y movementY nos dan los píxeles que se ha movido el ratón desde el último frame
                this.camaraRotacionY -= event.movementX * this.sensibilidadRaton;
                this.camaraRotacionX -= event.movementY * this.sensibilidadRaton;

                // Limitamos la rotación vertical para que no pueda dar la vuelta completa (mirar atrás por arriba)
                this.camaraRotacionX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.camaraRotacionX));

                // Aplicamos las rotaciones a la cámara de forma manual en el orden correcto
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y = this.camaraRotacionY;
                this.camera.rotation.x = this.camaraRotacionX;
            }
        });

        // Eventos del teclado para movernos (estos se quedan igual)
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));


        // CÁMARA SUPERIOR (NANOTEC)
        this.mapCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        this.mapCamera.position.set(0, 30, 0); // Altura de 50 metros
        this.mapCamera.lookAt(0, 0, 0); // Mirando al centro del laberinto
        this.add(this.mapCamera);
    }

    // Método que detecta cuando PULSAMOS una tecla
    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = true; break;
        }
    }

    // Método que detecta cuando SOLTAMOS una tecla
    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = false; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = false; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = false; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = false; break;
        }
    }

    createGround() {
        // El suelo es un Mesh, necesita una geometría y un material.

        // La geometría es una caja con muy poca altura
        var geometryGround = new THREE.BoxGeometry(30, 0.2, 30);

        // El material una imagen plana
        var texture = new THREE.TextureLoader().load('../imgs/suelopro.png');
        // Hacemos que la textura se repita
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(15, 15);

        var materialGround = new THREE.MeshStandardMaterial({ map: texture });

        // Ya se puede construir el Mesh
        var ground = new THREE.Mesh(geometryGround, materialGround);

        // Todas las figuras se crean centradas en el origen.
        // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
        ground.position.y = -0.1;

        // Que no se nos olvide añadirlo a la escena, que en este caso es  this
        this.add(ground);
    }

    createGUI() {
        // Se crea la interfaz gráfica de usuario
        var gui = new GUI();

        // La escena le va a añadir sus propios controles. 
        // Se definen mediante un objeto de control
        // En este caso la intensidad de la luz y si se muestran o no los ejes
        this.guiControls = {
            // En el contexto de una función   this   alude a la función
            lightPower: 50.0,  // La potencia de esta fuente de luz se mide en lúmenes
            ambientIntensity: 0.5,
            axisOnOff: true,
        }

        // Se crea una sección para los controles de esta clase
        var folder = gui.addFolder('Luz y Ejes');

        // Se le añade un control para la potencia de la luz puntual
        folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
            .name('Luz puntual : ')
            .onChange((value) => this.setLightPower(value));

        // Otro para la intensidad de la luz ambiental
        folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
            .name('Luz ambiental: ')
            .onChange((value) => this.setAmbientIntensity(value));

        // Y otro para mostrar u ocultar los ejes
        folder.add(this.guiControls, 'axisOnOff')
            .name('Mostrar ejes : ')
            .onChange((value) => this.setAxisVisible(value));

        return gui;
    }

    createLights() {
        // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
        // La luz ambiental solo tiene un color y una intensidad
        // Se declara como   var   y va a ser una variable local a este método
        //    se hace así puesto que no va a ser accedida desde otros métodos
        this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
        // La añadimos a la escena
        this.add(this.ambientLight);

        // Se crea una luz focal que va a ser la luz principal de la escena
        // La luz focal, además tiene una posición, y un punto de mira
        // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
        // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
        this.pointLight = new THREE.SpotLight(0xffffff);
        this.pointLight.power = this.guiControls.lightPower;
        this.pointLight.position.set(2, 3, 1);
        console.log(this.pointLight);
        this.add(this.pointLight);
    }

    setLightPower(valor) {
        this.pointLight.power = valor;
    }

    setAmbientIntensity(valor) {
        this.ambientLight.intensity = valor;
    }

    setAxisVisible(valor) {
        this.axis.visible = valor;
    }

    createRenderer(myCanvas) {
        // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

        // Se instancia un Renderer   WebGL
        var renderer = new THREE.WebGLRenderer();

        // Se establece un color de fondo en las imágenes que genera el render
        //renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);

        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);

        return renderer;
    }

    getCamera() {
        // En principio se devuelve la única cámara que tenemos
        // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
        return this.camera;
    }

    setCameraAspect(ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.camera.aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.camera.updateProjectionMatrix();
    }

    onWindowResize() {
        // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
        // Hay que actualizar el ratio de aspecto de la cámara
        this.setCameraAspect(window.innerWidth / window.innerHeight);

        // Y también el tamaño del renderizador
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Defensa 3 - Recogida de objetos
    intentarRecogerObjeto(event) {
        var raton = new THREE.Vector2();
        raton.x = (event.clientX / window.innerWidth) * 2 - 1;
        raton.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(raton, this.camera);
        var colisiones = this.raycaster.intersectObjects(this.pickups, true);

        if (colisiones.length > 0) {
            var distancia = colisiones[0].distance;

            if (distancia < 4.0) {
                var mallaTocada = colisiones[0].object;
                var pickupRaiz = mallaTocada;

                while (pickupRaiz.parent && !this.pickups.includes(pickupRaiz)) {
                    pickupRaiz = pickupRaiz.parent;
                }

                if (this.pickups.includes(pickupRaiz)) {

                    // NUEVA LÓGICA DE DECISIÓN
                    if (pickupRaiz === this.puerta) {
                        // Es la puerta. Comprobamos si quedan objetos en el array.
                        // Como la puerta misma está en el array, si la longitud es 1, 
                        // significa que SOLO queda la puerta (has cogido todo lo demás).
                        if (this.pickups.length === 1) {
                            console.log("¡Tienes todo! Abriendo la puerta...");
                            this.puerta.abrir();
                        } else {
                            // Faltan objetos, puedes mostrar un mensaje en consola o alerta
                            console.log("La puerta está cerrada. Aún te faltan " + (this.pickups.length - 1) + " objetos.");
                        }
                    } else {
                        // Es un objeto normal (Omnillave, Clank, etc.)
                        this.remove(pickupRaiz);
                        this.pickups = this.pickups.filter(p => p !== pickupRaiz);
                        console.log("¡Objeto recogido! Te faltan: " + (this.pickups.length - 1));

                        // D4 - EFECTO CLANK (Helipack)
                        // Comprobamos si el objeto recién recogido es alguno de los Clanks
                        if (pickupRaiz === this.clank || pickupRaiz === this.clank2) {
                            console.log("¡Helipack activado! Visión táctica aérea...");
                            this.tiempoVisionAerea = 5.0; // 5 segundos en el aire
                        }

                        // D4 -EFECTO NANOTEC (Cambio de Cámara)
                        else if (pickupRaiz === this.nanotec) {
                            console.log("¡Nanotec recogido! Vista superior por 5 segundos.");
                            this.tiempoVistaNanotec = 5.0; // 5 segundos
                        }
                    }
                }
            }
        }
    }

    update() {
        const delta = this.clock.getDelta();

        // DEFENSA 4 - EFECTO HELIPACK DE CLANK
        if (this.tiempoVisionAerea > 0) {
            // Descontamos el tiempo que ha pasado
            this.tiempoVisionAerea -= delta;
            // Subimos la cámara suavemente hacia la altura de salto
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.alturaSalto, delta * 4);
        } else {
            // Si el tiempo se ha acabado, devolvemos la cámara suavemente a la altura normal
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.alturaNormal, delta * 4);
        }

        // --- MOVIMIENTO MANUAL USANDO VECTORES 
        // 1. Obtenemos el vector que indica hacia dónde mira la cámara (Frente)
        var dirFrente = new THREE.Vector3();
        this.camera.getWorldDirection(dirFrente);
        dirFrente.y = 0; // Forzamos Y a 0 para caminar a ras de suelo y no volar al mirar al cielo
        dirFrente.normalize();

        // 2. Calculamos el vector Derecha matemáticamente
        var dirDerecha = new THREE.Vector3();
        dirDerecha.crossVectors(dirFrente, this.camera.up).normalize();

        // 3. Variables de colisión y velocidad
        var paso = this.velocidadMovimiento * delta;
        var distanciaChoque = 0.6;

        var paredes = this.laberinto.children;
        var objetosColisionables = paredes.concat(this.pickups);

        // COMPROBAR ADELANTE (W)
        if (this.moveForward) {
            this.raycaster.set(this.camera.position, dirFrente);
            var choques = this.raycaster.intersectObjects(objetosColisionables, true);
            if (choques.length === 0 || choques[0].distance > distanciaChoque) {
                // En vez de moveForward(), sumamos el vector dirección escalado por el paso
                this.camera.position.addScaledVector(dirFrente, paso);
            }
        }

        // COMPROBAR ATRÁS (S)
        if (this.moveBackward) {
            var dirAtras = dirFrente.clone().negate();
            this.raycaster.set(this.camera.position, dirAtras);
            var choques = this.raycaster.intersectObjects(objetosColisionables, true);
            if (choques.length === 0 || choques[0].distance > distanciaChoque) {
                this.camera.position.addScaledVector(dirFrente, -paso);
            }
        }

        // COMPROBAR IZQUIERDA (A)
        if (this.moveLeft) {
            var dirIzquierda = dirDerecha.clone().negate();
            this.raycaster.set(this.camera.position, dirIzquierda);
            var choques = this.raycaster.intersectObjects(objetosColisionables, true);
            if (choques.length === 0 || choques[0].distance > distanciaChoque) {
                this.camera.position.addScaledVector(dirDerecha, -paso);
            }
        }

        // COMPROBAR DERECHA (D)
        if (this.moveRight) {
            this.raycaster.set(this.camera.position, dirDerecha);
            var choques = this.raycaster.intersectObjects(objetosColisionables, true);
            if (choques.length === 0 || choques[0].distance > distanciaChoque) {
                this.camera.position.addScaledVector(dirDerecha, paso);
            }
        }

        // D4 - EFECTO NANOTEC (Cambio de Cámara)
        // Definimos qué cámara usaremos para el render final
        let camaraParaRender = this.camera;

        if (this.tiempoVistaNanotec > 0) {
            this.tiempoVistaNanotec -= delta;
            camaraParaRender = this.mapCamera; // Usamos la del cielo
        }

        // 4. RENDERIZADO ÚNICO
        this.renderer.render(this, camaraParaRender);

        // 5. ACTUALIZACIONES FINALES
        this.clank.update();
        if (this.clank2) this.clank2.update();
        if (this.nanotec) this.nanotec.update();
        if (this.puerta) this.puerta.update();

        requestAnimationFrame(() => this.update());
    }
}


/// La función   main
$(function () {

    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
    var scene = new MyScene("#WebGL-output");

    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener("resize", () => scene.onWindowResize());

    // Que no se nos olvide, la primera visualización.
    scene.update();
});
