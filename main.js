/* =========================================================================
   NÚCLEO DIGITAL — comportamiento
   Lenis (scroll con inercia) + GSAP/ScrollTrigger (animaciones al scroll).
   La escena 3D se carga aparte y solo en desktop: en celular manda la
   velocidad de carga, no el efecto.
   ========================================================================= */
(() => {
  'use strict';

  /* ---------------------------------------------------------- configuración */

  // Pegar acá la URL del despliegue de Google Apps Script para que el
  // formulario mande por mail. Mientras esté vacío, el formulario arma el
  // mensaje y lo abre en WhatsApp: nunca se pierde una consulta.
  const ENDPOINT_FORMULARIO = '';

  // Número de WhatsApp: sin +, sin espacios y sin guiones. Todos los botones
  // de la web arman su link con este número (ver ND.wa más abajo). En el HTML
  // queda una copia en cada botón solo como respaldo si el JS no carga.
  const WHATSAPP = '5492646071925';

  // Links viejos de cuando la web era una sola página (ej. nucleodigital.ar/#portfolio).
  const ANCLAS_VIEJAS = {
    '#portfolio': 'soluciones.html',
    '#trabajos': 'soluciones.html',
    '#nosotros': 'contacto.html',
    '#servicios': 'servicios.html',
    '#contacto': 'contacto.html',
  };
  if (document.body && document.body.dataset.pagina === 'inicio' && ANCLAS_VIEJAS[location.hash]) {
    location.replace(ANCLAS_VIEJAS[location.hash]);
    return;
  }

  /* ------------------------------------------------------------- utilidades */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esCelular = window.matchMedia('(max-width: 899px)').matches;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hayGsap = Boolean(gsap && ScrollTrigger);

  if (hayGsap) gsap.registerPlugin(ScrollTrigger);

  /** Link de WhatsApp con el mensaje ya escrito. */
  const wa = (texto) => `https://wa.me/${WHATSAPP}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

  // Lo comparte con catalogo.js, que se carga después.
  const ND = (window.ND = { whatsapp: WHATSAPP, wa, irA: (d) => irA(d), catalogo: null });

  /* ------------------------------------------------ scroll suave con Lenis */

  let lenis = null;

  function iniciarLenis() {
    if (menosMovimiento || typeof window.Lenis === 'undefined') return;

    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // En touch dejamos el scroll nativo: el del sistema se siente mejor
      // en el pulgar y no compite con el gesto de volver atrás.
      smoothTouch: false,
      touchMultiplier: 1.6,
    });

    if (hayGsap) {
      // Lenis y ScrollTrigger tienen que compartir el mismo reloj, si no
      // los disparadores quedan un cuadro atrás del contenido.
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const bucle = (t) => {
        lenis.raf(t);
        requestAnimationFrame(bucle);
      };
      requestAnimationFrame(bucle);
    }
  }

  /** Lleva a una sección respetando Lenis (o el scroll nativo si no está). */
  function irA(destino) {
    const el = typeof destino === 'string' ? $(destino) : destino;
    if (!el) return;
    const alto = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cabecera-alto'), 10) || 72;
    if (lenis) lenis.scrollTo(el, { offset: -alto, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - alto, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------- navegación */

  function iniciarNavegacion() {
    const cabecera = $('#cabecera');
    const boton = $('.cabecera__menu');
    const menu = $('#menu-movil');

    // Fondo sólido apenas se despega del hero.
    const alSscrollear = () => {
      cabecera.classList.toggle('solida', window.scrollY > 40);
    };
    alSscrollear();
    window.addEventListener('scroll', alSscrollear, { passive: true });

    const cerrarMenu = () => {
      menu.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sin-scroll');
      if (lenis) lenis.start();
    };

    boton.addEventListener('click', () => {
      const abierto = boton.getAttribute('aria-expanded') === 'true';
      if (abierto) return cerrarMenu();
      menu.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sin-scroll');
      if (lenis) lenis.stop();
    });

    // Todos los enlaces internos pasan por Lenis. Va por delegación porque
    // parte del contenido (el catálogo) se arma después de cargar.
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      const destino = a.getAttribute('href');
      if (destino === '#' || !$(destino)) return;
      ev.preventDefault();
      if (!menu.hidden) cerrarMenu();
      irA(destino);
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && !menu.hidden) {
        cerrarMenu();
        boton.focus();
      }
    });
  }

  /** Todos los botones de WhatsApp fijos del HTML usan el número de arriba. */
  function iniciarWhatsApp() {
    $$('a[data-wa]').forEach((a) => {
      a.href = wa(a.dataset.wa);
    });
  }

  /* -------------------------------------------------------------- reveals */

  /** Envuelve cada palabra en un <span> sin romper el marcado interno (<em>). */
  function partirEnPalabras(elemento) {
    const paseo = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT);
    const textos = [];
    while (paseo.nextNode()) textos.push(paseo.currentNode);

    textos.forEach((nodo) => {
      if (!nodo.nodeValue.trim()) return;
      const fragmento = document.createDocumentFragment();
      nodo.nodeValue.split(/(\s+)/).forEach((trozo) => {
        if (!trozo.trim()) {
          fragmento.appendChild(document.createTextNode(trozo));
          return;
        }
        const span = document.createElement('span');
        span.className = 'palabra';
        span.style.display = 'inline-block';
        span.textContent = trozo;
        fragmento.appendChild(span);
      });
      nodo.parentNode.replaceChild(fragmento, nodo);
    });
  }

  function iniciarReveals() {
    if (!hayGsap || menosMovimiento) {
      revelar(document);
      return;
    }

    // Título del hero: cada línea sube desde abajo de su propia máscara.
    const lineas = $$('.hero__titulo .linea');
    lineas.forEach((linea) => {
      const envoltura = document.createElement('span');
      envoltura.innerHTML = linea.innerHTML;
      linea.innerHTML = '';
      linea.appendChild(envoltura);
    });

    gsap.from('.hero__titulo .linea > span', {
      yPercent: 115,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.09,
      delay: 0.15,
    });

    // Resto del hero: entra escalonado detrás del título.
    gsap.to('.hero .revelar', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.45,
      startAt: { y: 24 },
    });

    revelar(document);

    // Celdas del bento: la del plan destacado entra un toque después.
    if (document.querySelector('.bento')) {
      gsap.from('.bento__celda', {
        opacity: 0,
        y: 40,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.bento', start: 'top 80%' },
      });
    }
  }

  /** Reveals al scroll dentro de un contenedor. Se usa al cargar y cada vez
      que catalogo.js agrega contenido. */
  function revelar(ctx) {
    const dentro = (sel) => [
      ...(ctx !== document && ctx.matches(sel) ? [ctx] : []),
      ...$$(sel, ctx),
    ].filter((el) => !el.dataset.revelado && (el.dataset.revelado = '1'));

    if (!hayGsap || menosMovimiento) {
      dentro('.revelar, .revelar-c').forEach((el) => (el.style.opacity = 1));
      return;
    }

    // Títulos de sección, palabra por palabra.
    dentro('.revelar-t').forEach((titulo) => {
      partirEnPalabras(titulo);
      gsap.to(titulo.querySelectorAll('.palabra'), {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.045,
        startAt: { y: 22 },
        scrollTrigger: { trigger: titulo, start: 'top 82%' },
      });
    });

    // Bloques sueltos fuera del hero.
    dentro('.revelar').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        startAt: { y: 22 },
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // Tarjetas: entran en cascada dentro de su grilla.
    dentro('.revelar-c').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 2) * 0.08,
        startAt: { y: 34 },
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
  }

  /* ------------------------------------------------- cursor y botones imán */

  function iniciarCursor() {
    if (!punteroFino || menosMovimiento || !hayGsap) return;

    const cursor = $('.cursor');
    const punto = $('.cursor__punto');
    const anillo = $('.cursor__anillo');
    document.body.classList.add('cursor-propio');

    const mover = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    gsap.set([punto, anillo], { xPercent: -50, yPercent: -50 });

    const seguirPunto = gsap.quickTo(punto, 'x', { duration: 0.15, ease: 'power3' });
    const seguirPuntoY = gsap.quickTo(punto, 'y', { duration: 0.15, ease: 'power3' });
    const seguirAnillo = gsap.quickTo(anillo, 'x', { duration: 0.5, ease: 'power3' });
    const seguirAnilloY = gsap.quickTo(anillo, 'y', { duration: 0.5, ease: 'power3' });

    window.addEventListener('pointermove', (ev) => {
      mover.x = ev.clientX;
      mover.y = ev.clientY;
      seguirPunto(mover.x);
      seguirPuntoY(mover.y);
      seguirAnillo(mover.x);
      seguirAnilloY(mover.y);
    });

    // Al pasar por algo interactivo el anillo crece y muestra su etiqueta.
    // Por delegación: también toma los botones que arma catalogo.js.
    const interactivo = 'a, button, label, [data-cursor]';
    document.addEventListener('pointerover', (ev) => {
      const el = ev.target.closest(interactivo);
      if (!el) return;
      cursor.classList.add('activo');
      anillo.dataset.texto = el.dataset.cursor || '';
    });
    document.addEventListener('pointerout', (ev) => {
      const el = ev.target.closest(interactivo);
      if (!el || (ev.relatedTarget && el.contains(ev.relatedTarget))) return;
      cursor.classList.remove('activo');
      anillo.dataset.texto = '';
    });
  }

  function iniciarImanes(ctx = document) {
    if (!punteroFino || menosMovimiento || !hayGsap) return;

    $$('.iman', ctx).forEach((el) => {
      if (el.dataset.iman) return;
      el.dataset.iman = '1';
      const fuerza = 0.32;
      const aX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const aY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

      el.addEventListener('pointermove', (ev) => {
        const caja = el.getBoundingClientRect();
        aX((ev.clientX - (caja.left + caja.width / 2)) * fuerza);
        aY((ev.clientY - (caja.top + caja.height / 2)) * fuerza);
      });
      el.addEventListener('pointerleave', () => {
        aX(0);
        aY(0);
      });
    });
  }

  /* ------------------------------------------------------------ formulario */

  function iniciarFormulario() {
    const form = $('#formulario');
    if (!form) return;
    const aviso = $('#aviso');

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      // Trampa antispam: si el bot completó el campo oculto, no pasa nada.
      if (form.web.value) return;

      const obligatorios = ['nombre', 'contacto'];
      let falta = false;
      obligatorios.forEach((nombre) => {
        const campo = form[nombre];
        const vacio = !campo.value.trim();
        campo.setAttribute('aria-invalid', vacio ? 'true' : 'false');
        if (vacio && !falta) {
          campo.focus();
          falta = true;
        }
      });
      if (falta) {
        aviso.className = 'formulario__aviso mal';
        aviso.textContent = 'Falta tu nombre y por dónde te respondemos.';
        return;
      }

      const datos = {
        nombre: form.nombre.value.trim(),
        negocio: form.negocio.value.trim(),
        contacto: form.contacto.value.trim(),
        plan: form.plan.value,
        mensaje: form.mensaje.value.trim(),
      };

      const boton = form.querySelector('button[type="submit"]');
      boton.disabled = true;

      // Sin backend configurado: armamos el mensaje y lo abrimos en WhatsApp.
      if (!ENDPOINT_FORMULARIO) {
        const texto =
          `Hola Núcleo Digital, les escribo desde la web.\n\n` +
          `Nombre: ${datos.nombre}\n` +
          (datos.negocio ? `Negocio: ${datos.negocio}\n` : '') +
          `Contacto: ${datos.contacto}\n` +
          `Le interesa: ${datos.plan}\n` +
          (datos.mensaje ? `\n${datos.mensaje}` : '');
        window.open(wa(texto), '_blank', 'noopener');
        aviso.className = 'formulario__aviso ok';
        aviso.textContent = 'Te abrimos WhatsApp con el mensaje listo. Dale enviar y listo.';
        boton.disabled = false;
        return;
      }

      aviso.className = 'formulario__aviso';
      aviso.textContent = 'Enviando…';

      try {
        await fetch(ENDPOINT_FORMULARIO, {
          method: 'POST',
          mode: 'no-cors', // Apps Script no devuelve cabeceras CORS
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(datos),
        });
        form.reset();
        aviso.className = 'formulario__aviso ok';
        aviso.textContent = '¡Listo! Recibimos tu consulta, te escribimos hoy mismo.';
      } catch {
        aviso.className = 'formulario__aviso mal';
        aviso.textContent = 'No pudimos enviarlo. Escribinos por WhatsApp y lo resolvemos.';
      } finally {
        boton.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------- escena 3D */

  function iniciarEscena() {
    // En celular no se carga Three.js: son cientos de KB para un adorno.
    // El hero ya tiene su degradado de CSS, que es lo que se ve ahí.
    if (!$('#escena') || esCelular || menosMovimiento) return;
    if (navigator.connection && navigator.connection.saveData) return;

    // Después del primer pintado, para no competir con el texto ni con el LCP.
    const arrancar = () => {
      import('./escena.js')
        .then((mod) => mod.crearNucleo($('#escena')))
        .catch(() => { /* si falla, queda el degradado: no se rompe nada */ });
    };

    if ('requestIdleCallback' in window) requestIdleCallback(arrancar, { timeout: 2500 });
    else setTimeout(arrancar, 1200);
  }

  /* ------------------------------------------------------------------ inicio */

  function iniciar() {
    $('#anio').textContent = new Date().getFullYear();

    iniciarWhatsApp();
    iniciarLenis();
    iniciarNavegacion();
    iniciarReveals();
    iniciarCursor();
    iniciarImanes();
    iniciarFormulario();
    iniciarEscena();

    // El catálogo llega después (lee servicios.json): cuando está, le
    // aplicamos las mismas animaciones y recalculamos los disparadores.
    if (ND.catalogo) {
      ND.catalogo.then((nuevos) => {
        nuevos.forEach((el) => {
          revelar(el);
          iniciarImanes(el);
        });
        if (hayGsap) ScrollTrigger.refresh();
        // Si se llegó con un ancla a algo que armó el catálogo, ahora existe.
        if (location.hash && location.hash.length > 1 && $(location.hash)) irA(location.hash);
      });
    }

    if (hayGsap) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
