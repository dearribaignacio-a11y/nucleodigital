/* =========================================================================
   NÚCLEO DIGITAL — escena 3D del hero
   La geometría sale del logo: el anillo es la "O" de NUCLEO, adentro va una
   esfera de vidrio (el núcleo) y alrededor orbitan las tres barras de la "E".
   Este módulo lo importa main.js solo en desktop, después del primer pintado.
   ========================================================================= */

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Clock, Vector2, Color,
  TorusGeometry, SphereGeometry, BoxGeometry, BufferGeometry, BufferAttribute,
  MeshStandardMaterial, MeshPhysicalMaterial, PointsMaterial, Points,
  Mesh, DirectionalLight, PointLight, AmbientLight,
  PMREMGenerator, CanvasTexture, EquirectangularReflectionMapping,
  ACESFilmicToneMapping, SRGBColorSpace, MathUtils,
} from './lib/three.module.js';

const AMBAR = 0xffb020;
const NARANJA = 0xff7a2f;

/**
 * Entorno de reflejos hecho a mano: un degradado en canvas que se convierte
 * en mapa equirectangular. Evita bajar un HDR de 2 MB y da el brillo cálido
 * que necesita el vidrio para no verse de plástico.
 */
function crearEntorno(renderer) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 512;
  lienzo.height = 256;
  const ctx = lienzo.getContext('2d');

  // Base oscura. El entorno es casi negro a propósito: lo que define una
  // pieza de vidrio son unos pocos reflejos chicos y duros, no un baño de luz.
  const cielo = ctx.createLinearGradient(0, 0, 0, 256);
  cielo.addColorStop(0.0, '#14110c');
  cielo.addColorStop(0.5, '#08080a');
  cielo.addColorStop(1.0, '#030304');
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, 512, 256);

  const foco = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // Un "softbox" alargado arriba: es el reflejo que recorre el anillo de metal
  // y le da la lectura de superficie pulida.
  const banda = ctx.createLinearGradient(0, 26, 0, 62);
  banda.addColorStop(0, 'rgba(255,240,214,0)');
  banda.addColorStop(0.5, 'rgba(255,240,214,0.95)');
  banda.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = banda;
  ctx.fillRect(90, 26, 260, 36);

  // Focos chicos y saturados: los destellos puntuales del vidrio.
  foco(150, 96, 46, 'rgba(255,176,32,1)');
  foco(392, 74, 34, 'rgba(255,122,47,0.9)');
  foco(60, 150, 28, 'rgba(255,255,255,0.55)');

  const textura = new CanvasTexture(lienzo);
  textura.mapping = EquirectangularReflectionMapping;
  textura.colorSpace = SRGBColorSpace;

  const pmrem = new PMREMGenerator(renderer);
  const entorno = pmrem.fromEquirectangular(textura).texture;
  pmrem.dispose();
  textura.dispose();
  return entorno;
}

/** Polvo suspendido alrededor del núcleo. Da profundidad sin costo real. */
function crearPolvo(cantidad) {
  const posiciones = new Float32Array(cantidad * 3);
  for (let i = 0; i < cantidad; i++) {
    // Distribución en cáscara esférica: hueca en el centro para no tapar el vidrio.
    const radio = MathUtils.randFloat(2.6, 6.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(MathUtils.randFloatSpread(2));
    posiciones[i * 3] = radio * Math.sin(phi) * Math.cos(theta);
    posiciones[i * 3 + 1] = radio * Math.sin(phi) * Math.sin(theta) * 0.6;
    posiciones[i * 3 + 2] = radio * Math.cos(phi);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(posiciones, 3));

  return new Points(
    geo,
    new PointsMaterial({
      size: 0.028,
      color: new Color(AMBAR),
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
    })
  );
}

export function crearNucleo(contenedor) {
  if (!contenedor) return null;

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  // Techo de 1.75: en pantallas 3x el costo del transmission se dispara y la
  // diferencia visual ya no se nota.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = SRGBColorSpace;
  contenedor.appendChild(renderer.domElement);

  const escena = new Scene();
  escena.environment = crearEntorno(renderer);

  const camara = new PerspectiveCamera(38, contenedor.clientWidth / contenedor.clientHeight, 0.1, 100);
  camara.position.set(0, 0, 9);

  // --------------------------------------------------------------- el núcleo
  const nucleo = new Group();
  escena.add(nucleo);

  // El anillo: la "O" del logo, en metal pulido.
  const anillo = new Mesh(
    new TorusGeometry(2.05, 0.095, 40, 200),
    new MeshStandardMaterial({
      color: 0xfff6e8,
      metalness: 1,
      roughness: 0.11,
      envMapIntensity: 2.1,
    })
  );
  nucleo.add(anillo);

  // Anillo secundario, más fino e inclinado: rompe la simetría perfecta.
  const anilloFino = new Mesh(
    new TorusGeometry(2.55, 0.016, 20, 180),
    new MeshStandardMaterial({
      color: new Color(AMBAR),
      metalness: 0.9,
      roughness: 0.3,
      envMapIntensity: 2,
    })
  );
  anilloFino.rotation.x = Math.PI * 0.32;
  anilloFino.rotation.y = Math.PI * 0.12;
  nucleo.add(anilloFino);

  // La esfera de vidrio: el núcleo propiamente dicho.
  const vidrio = new Mesh(
    new SphereGeometry(1.0, 80, 80),
    new MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 1,
      // Imprescindible: sin transparent el material va a la cola de opacos y
      // el renderer descarta el alfa que produce la transmisión — el vidrio
      // termina siendo una bola blanca.
      transparent: true,
      // Espesor generoso para que la refracción se note, pero sin teñir:
      // el vidrio tiene que distorsionar lo de atrás, no volverlo lechoso.
      thickness: 1.5,
      ior: 1.52,
      // Sin clearcoat: sobre vidrio duplica el reflejo especular y es lo que
      // lo terminaba de convertir en una perla.
      clearcoat: 0,
      envMapIntensity: 1.6,
      specularIntensity: 0.9,
      attenuationColor: new Color(0xffe9c4),
      attenuationDistance: 10,
    })
  );

  // Distorsión sutil: un latido lento en los vértices, como si el vidrio
  // respirara. Se inyecta en el shader para que no cueste nada en CPU.
  vidrio.material.onBeforeCompile = (shader) => {
    shader.uniforms.uTiempo = { value: 0 };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n uniform float uTiempo;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float onda = sin(position.x * 3.0 + uTiempo) * sin(position.y * 3.4 + uTiempo * 1.2)
                    * sin(position.z * 2.6 + uTiempo * 0.8);
         transformed += normal * onda * 0.035;`
      );
    vidrio.material.userData.shader = shader;
  };
  // Adelantada respecto del anillo: así el vidrio tiene el arco trasero del
  // anillo detrás para refractar, que es lo que delata que es vidrio.
  vidrio.position.z = 0.8;
  nucleo.add(vidrio);

  // El corazón: una brasa ámbar chica detrás del vidrio. Es el mismo símbolo
  // del favicon (anillo + punto) y la refracción la agranda y la deforma.
  const brasa = new Mesh(
    new SphereGeometry(0.16, 32, 32),
    new MeshStandardMaterial({
      color: new Color(AMBAR),
      emissive: new Color(AMBAR),
      emissiveIntensity: 2.2,
      roughness: 0.4,
    })
  );
  // Centrada dentro del vidrio: la refracción la agranda y queda el mismo
  // signo que el favicon, un anillo con un punto ámbar en el medio.
  brasa.position.z = vidrio.position.z;
  nucleo.add(brasa);

  const luzBrasa = new PointLight(AMBAR, 6, 6);
  luzBrasa.position.z = vidrio.position.z;
  nucleo.add(luzBrasa);

  // Las tres barras de la "E", orbitando en un plano inclinado.
  const barras = new Group();
  barras.rotation.z = Math.PI * 0.09;
  const materialBarra = new MeshStandardMaterial({
    color: new Color(NARANJA),
    metalness: 0.85,
    roughness: 0.25,
    emissive: new Color(AMBAR),
    emissiveIntensity: 0.35,
    envMapIntensity: 1.8,
  });
  [-0.34, 0, 0.34].forEach((desplazamiento, i) => {
    const barra = new Mesh(new BoxGeometry(0.82, 0.062, 0.062), materialBarra);
    barra.position.set(2.5, desplazamiento, 0);
    barra.userData.fase = i * 0.35;
    barras.add(barra);
  });
  nucleo.add(barras);

  const polvo = crearPolvo(240);
  nucleo.add(polvo);

  // ----------------------------------------------------------------- luces
  // Luces bajas a propósito: el vidrio y el metal los define el mapa de
  // entorno. Con luces fuertes aparece un brillo lechoso que arruina el vidrio.
  escena.add(new AmbientLight(0xffffff, 0.18));

  const clave = new DirectionalLight(0xfff2e0, 0.55);
  clave.position.set(4, 5, 6);
  escena.add(clave);

  const contra = new PointLight(NARANJA, 22, 22);
  contra.position.set(-5, -2.5, -4);
  escena.add(contra);

  const realce = new PointLight(AMBAR, 14, 18);
  realce.position.set(3.5, 3, -3);
  escena.add(realce);

  // -------------------------------------------------------------- reacción
  const puntero = new Vector2(0, 0);
  const objetivo = new Vector2(0, 0);
  let avanceScroll = 0;

  const alMover = (ev) => {
    objetivo.x = (ev.clientX / window.innerWidth) * 2 - 1;
    objetivo.y = (ev.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', alMover, { passive: true });

  const alScrollear = () => {
    avanceScroll = window.scrollY / Math.max(window.innerHeight, 1);
  };
  alScrollear();
  window.addEventListener('scroll', alScrollear, { passive: true });

  /**
   * Acomoda el núcleo en la franja derecha del hero, que es la que queda
   * libre de texto. Cuanto más angosta la pantalla, más chico y más al
   * costado: el titular siempre gana.
   */
  const acomodar = () => {
    const a = contenedor.clientWidth;
    const h = contenedor.clientHeight;
    if (!a || !h) return;

    camara.aspect = a / h;
    camara.updateProjectionMatrix();
    renderer.setSize(a, h);

    // Mitad del ancho visible a la altura del núcleo (z = 0).
    const mitadAlto = Math.tan(MathUtils.degToRad(camara.fov / 2)) * camara.position.z;
    const mitadAncho = mitadAlto * camara.aspect;

    // El texto ocupa el 62% izquierdo (ver .hero__cuerpo en el CSS).
    const izquierdaLibre = mitadAncho - 0.38 * (mitadAncho * 2);
    const centroLibre = (izquierdaLibre + mitadAncho) / 2;

    // El conjunto mide 2.55 de radio (el anillo fino, que es el más grande):
    // lo escalamos para que ese radio entre en la mitad de la franja libre.
    const mitadBanda = (mitadAncho - izquierdaLibre) / 2;
    const escala = MathUtils.clamp(mitadBanda / 2.55, 0.42, 0.9);

    nucleo.scale.setScalar(escala);
    nucleo.position.x = centroLibre;
  };
  acomodar();
  window.addEventListener('resize', acomodar);

  // ---------------------------------------------------------------- bucle

  const reloj = new Clock();
  let vivo = true;
  let visible = true;

  // Cuando el hero sale de pantalla, se deja de renderizar: no tiene sentido
  // gastar GPU dibujando algo que nadie ve.
  const observador = new IntersectionObserver(
    ([entrada]) => { visible = entrada.isIntersecting; },
    { threshold: 0 }
  );
  observador.observe(contenedor);

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden && visible;
  });

  function animar() {
    if (!vivo) return;
    requestAnimationFrame(animar);
    if (!visible) return;

    const t = reloj.getElapsedTime();

    // El puntero se persigue con retraso: el movimiento queda suave, no nervioso.
    puntero.lerp(objetivo, 0.045);

    nucleo.rotation.y = t * 0.16 + puntero.x * 0.42;
    nucleo.rotation.x = puntero.y * 0.26 + avanceScroll * 0.35;
    nucleo.position.y = -avanceScroll * 1.7;

    anillo.rotation.z = t * 0.1;
    anilloFino.rotation.z = -t * 0.22;

    barras.rotation.y = -t * 0.42;
    barras.children.forEach((barra, i) => {
      barra.rotation.y = t * 0.9 + barra.userData.fase;
      barra.position.y = [-0.34, 0, 0.34][i] + Math.sin(t * 1.2 + i) * 0.05;
    });

    polvo.rotation.y = -t * 0.05;
    polvo.rotation.x = t * 0.02;

    const shader = vidrio.material.userData.shader;
    if (shader) shader.uniforms.uTiempo.value = t * 0.7;

    renderer.render(escena, camara);
  }
  animar();

  // ------------------------------------------------------------- limpieza
  return {
    destruir() {
      vivo = false;
      observador.disconnect();
      window.removeEventListener('pointermove', alMover);
      window.removeEventListener('scroll', alScrollear);
      window.removeEventListener('resize', acomodar);
      escena.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
