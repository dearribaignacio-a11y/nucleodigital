/* =========================================================================
   NÚCLEO DIGITAL — catálogo
   Lee servicios.json y arma, según la página, las tarjetas de áreas (Inicio),
   el catálogo con pestañas (Servicios), los rubros (Soluciones) y el armador
   de solución (Contacto). Los textos se editan en servicios.json, no acá.
   Necesita window.ND (lo define main.js, que se carga antes).
   ========================================================================= */
(() => {
  'use strict';

  const ND = window.ND;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------------- íconos */
  // Trazos de 24×24, línea de 1.5. Para usar uno nuevo en servicios.json,
  // agregalo acá con su nombre.
  const ICONOS = {
    pantalla: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    carrito: '<path d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h8.2a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
    panel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    crecimiento: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    escudo: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    celular: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    megafono: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1Z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
    refrescar: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
    idiomas: '<path d="M4 5h8M8 3v2M10 5c-.7 3.4-2.9 6-6 7.5M6 8.5c1 1.7 2.6 3 4.5 3.8"/><path d="m13 21 4-9 4 9M14.5 18h5"/>',
    app: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M12 7v7M9 11l3 3 3-3"/>',
    bolsa: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    catalogo: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M20 20h-3M14 20v.01"/>',
    tarjeta: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    cupon: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    caja: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
    microfono: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    grafico: '<path d="M5 20V11M10 20V5M15 20v-7M20 20V8"/>',
    sync: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1-4.1A8 8 0 1 1 20 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
    chispa: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
    formulario: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    calculadora: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="8" y="5.5" width="8" height="4" rx=".5"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
    planilla: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    metricas: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    sobre: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    arroba: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.3 6.7"/>',
    herramienta: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-.6-.6-2.1 2.2-2.8Z"/>',
    local: '<path d="m3 9 1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>',
    taza: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
    tijera: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 17M8 16.5 20 7"/>',
    maletin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>',
    montana: '<path d="m3 20 6.5-11 4 6.5L16 12l5 8H3Z"/><circle cx="17" cy="6" r="2"/>',
    avion: '<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z"/><path d="m10 13 4.5-4.5"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
  };

  function icono(nombre, clase = '') {
    const trazo = ICONOS[nombre] || ICONOS.mas;
    return `<svg class="${clase}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${trazo}</svg>`;
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* --------------------------------------------------------------- datos */

  function prepararDatos(datos) {
    const areas = (datos.areas || [])
      .filter((a) => a.activo !== false)
      .map((a) => ({ ...a, servicios: (a.servicios || []).filter((s) => s.activo !== false) }))
      .filter((a) => a.servicios.length);

    // Índice id → servicio (con su área), para los rubros y el armador.
    const porId = new Map();
    areas.forEach((a) => a.servicios.forEach((s) => porId.set(s.id, { ...s, area: a })));

    const rubros = (datos.rubros || [])
      .filter((r) => r.activo !== false)
      .map((r) => ({ ...r, servicios: (r.solucion || []).map((id) => porId.get(id)).filter(Boolean) }))
      .filter((r) => r.servicios.length);

    return { areas, porId, rubros, inactivas: (datos.areas || []).filter((a) => a.activo === false).map((a) => a.id) };
  }

  const nombreEnMensaje = (s) => s.mensaje || s.nombre;

  function mensajeServicio(s, area) {
    let texto = `Hola Núcleo Digital, me interesa: ${nombreEnMensaje(s)}`;
    if (area.cierre_mensaje) texto += `. ${area.cierre_mensaje}`;
    return texto;
  }

  /* -------------------------------------------------------- piezas comunes */

  function tarjetaServicio(s, area, i) {
    const etiqueta = area.boton || 'Consultar';
    return `
      <article class="servicio" id="s-${esc(s.id)}" style="--i:${i}">
        <div class="servicio__icono">${icono(s.icono)}</div>
        <h3 class="servicio__nombre">${esc(s.nombre)}</h3>
        <p class="servicio__beneficio">${esc(s.beneficio)}</p>
        <ul class="plan__lista servicio__lista">${(s.incluye || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <a class="plan__cta${area.boton ? ' plan__cta--lleno' : ''} iman" href="${ND.wa(mensajeServicio(s, area))}" target="_blank" rel="noopener" data-cursor="WhatsApp">
          ${esc(etiqueta)}<span class="visualmente-oculto">: ${esc(s.nombre)} (se abre WhatsApp)</span>
        </a>
      </article>`;
  }

  /* Maqueta del panel de Rindo, dibujada con HTML y CSS. Los números son de
     ejemplo y la maqueta lo dice. Si tenés capturas reales, reemplazá este
     bloque por un <img>. */
  function maquetaRindo() {
    const horas = [18, 26, 34, 52, 71, 48, 30, 38, 62, 88, 76, 44];
    const barras = horas
      .map((h, i) => `<span class="mockup__barra-v" style="--h:${h}%;--i:${i}"></span>`)
      .join('');
    const top = [
      ['Yerba 1 kg', 92],
      ['Aceite 900 ml', 74],
      ['Galletitas surtidas', 58],
      ['Detergente 750 ml', 41],
    ]
      .map(([n, v], i) => `<li><span>${n}</span><i style="--v:${v}%;--i:${i}"></i></li>`)
      .join('');

    return `
      <div class="mockup" role="img" aria-label="Maqueta ilustrativa del panel de Rindo con datos de ejemplo: ventas del día, ventas por hora, productos más vendidos y alertas de stock bajo.">
        <div class="mockup__barra">
          <span class="mockup__puntos"><i></i><i></i><i></i></span>
          <span class="mockup__titulo">Rindo · Panel</span>
          <span class="mockup__estado">Hoy</span>
        </div>
        <div class="mockup__cuerpo">
          <div class="mockup__kpis">
            <div><small>Ventas de hoy</small><strong>$ 184.300</strong></div>
            <div><small>Tickets</small><strong>37</strong></div>
            <div><small>Margen</small><strong>32 %</strong></div>
          </div>
          <div class="mockup__caja">
            <small>Ventas por hora</small>
            <div class="mockup__grafico">${barras}</div>
            <div class="mockup__eje"><span>9 h</span><span>12 h</span><span>15 h</span><span>18 h</span></div>
          </div>
          <div class="mockup__fila">
            <div class="mockup__caja">
              <small>Más vendidos</small>
              <ul class="mockup__top">${top}</ul>
            </div>
            <div class="mockup__caja mockup__caja--alerta">
              <small>Stock bajo</small>
              <ul class="mockup__alertas">
                <li><span>Azúcar 1 kg</span><b>3</b></li>
                <li><span>Leche entera</span><b>5</b></li>
              </ul>
            </div>
          </div>
          <div class="mockup__aviso">
            ${icono('camara')}
            <span>Factura del proveedor leída · 12 productos</span>
            <b>Revisar y confirmar</b>
          </div>
        </div>
      </div>
      <p class="mockup__nota">Maqueta ilustrativa · datos de ejemplo</p>`;
  }

  /* ------------------------------------------------------ Inicio: áreas */

  function pintarAreas(contenedor, { areas }) {
    contenedor.innerHTML = areas
      .map((a) => `
        <a class="area revelar-c" href="servicios.html#${esc(a.id)}" data-cursor="Ver">
          <span class="area__icono">${icono(a.icono)}</span>
          ${a.sello ? `<span class="area__sello">${esc(a.sello)}</span>` : ''}
          <h3 class="area__nombre">${esc(a.nombre)}</h3>
          <p class="area__bajada">${esc(a.bajada)}</p>
          <span class="area__ir">${a.servicios.length} ${a.servicios.length === 1 ? 'servicio' : 'servicios'} <span aria-hidden="true">→</span></span>
        </a>`)
      .join('');
    return [contenedor];
  }

  /* -------------------------------------------- Servicios: pestañas */

  function pintarCatalogo(contenedor, { areas }) {
    const pestanas = areas
      .map((a, i) => `
        <button class="pestana" type="button" role="tab" id="pestana-${esc(a.id)}"
                aria-controls="area-${esc(a.id)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-area="${esc(a.id)}">
          ${icono(a.icono)}<span>${esc(a.nombre)}</span>
        </button>`)
      .join('');

    const paneles = areas
      .map((a, i) => `
        <div class="pestana-panel" role="tabpanel" id="area-${esc(a.id)}" aria-labelledby="pestana-${esc(a.id)}" tabindex="0"${i === 0 ? '' : ' hidden'}>
          <header class="pestana-panel__cabecera">
            <h2 class="pestana-panel__titulo">${esc(a.nombre)}${a.sello ? ` <span class="area__sello">${esc(a.sello)}</span>` : ''}</h2>
            <p>${esc(a.bajada)}</p>
            ${a.nota ? `<p class="pestana-panel__nota">${esc(a.nota)} ${a.nota_enlace ? `<a href="${esc(a.nota_enlace.href)}">${esc(a.nota_enlace.texto)} →</a>` : ''}</p>` : ''}
          </header>
          ${a.id === 'rindo' ? `<div class="pestana-panel__maqueta">${maquetaRindo()}</div>` : ''}
          <div class="servicios">${a.servicios.map((s, j) => tarjetaServicio(s, a, j)).join('')}</div>
        </div>`)
      .join('');

    contenedor.innerHTML = `
      <div class="pestanas" role="tablist" aria-label="Áreas de servicio">${pestanas}</div>
      ${paneles}`;

    const botones = $$('.pestana', contenedor);

    const elegir = (boton, { foco = false, desplazar = false } = {}) => {
      botones.forEach((b) => {
        const activa = b === boton;
        b.setAttribute('aria-selected', String(activa));
        b.tabIndex = activa ? 0 : -1;
        $(`#${b.getAttribute('aria-controls')}`).hidden = !activa;
      });
      if (foco) boton.focus();
      // En celular la tira de pestañas se desplaza para mostrar la elegida.
      boton.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      if (desplazar) ND.irA(contenedor);
      history.replaceState(null, '', `#${boton.dataset.area}`);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      activarMaquetas(contenedor);
    };

    botones.forEach((b, i) => {
      b.addEventListener('click', () => elegir(b));
      b.addEventListener('keydown', (ev) => {
        const mover = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
        if (mover) {
          ev.preventDefault();
          elegir(botones[(i + mover + botones.length) % botones.length], { foco: true });
        } else if (ev.key === 'Home' || ev.key === 'End') {
          ev.preventDefault();
          elegir(botones[ev.key === 'Home' ? 0 : botones.length - 1], { foco: true });
        }
      });
    });

    // Llegar con servicios.html#rindo abre esa pestaña.
    const desdeHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const boton = botones.find((b) => b.dataset.area === id);
      if (boton) elegir(boton, { desplazar: true });
    };
    window.addEventListener('hashchange', desdeHash);
    if (location.hash) setTimeout(desdeHash, 60);

    return [contenedor];
  }

  /* ------------------------------------------- Soluciones: rubros */

  function pintarRubros(contenedor, { rubros }) {
    contenedor.innerHTML = rubros
      .map((r) => {
        const nombres = r.servicios.map(nombreEnMensaje).join(', ');
        const mensaje = `Hola Núcleo Digital, me interesa: la solución para ${r.nombre} (${nombres})`;
        const armar = `contacto.html?sumar=${r.servicios.map((s) => s.id).join(',')}#armador`;
        return `
          <article class="rubro revelar-c" id="${esc(r.id)}">
            <header class="rubro__cabecera">
              <span class="area__icono">${icono(r.icono)}</span>
              <div>
                <h2 class="rubro__nombre">${esc(r.nombre)}</h2>
                <p class="rubro__ejemplos">${esc(r.ejemplos)}</p>
              </div>
            </header>
            <p class="rubro__rotulo">El problema de siempre</p>
            <p class="rubro__problema">${esc(r.problema)}</p>
            <p class="rubro__rotulo">Lo que te armamos</p>
            <ul class="rubro__combo">
              ${r.servicios.map((s) => `<li>${icono(s.icono)}<span>${esc(nombreEnMensaje(s))}</span></li>`).join('')}
            </ul>
            <div class="rubro__acciones">
              <a class="plan__cta plan__cta--lleno iman" href="${ND.wa(mensaje)}" target="_blank" rel="noopener" data-cursor="WhatsApp">
                Quiero esto para mi negocio<span class="visualmente-oculto"> (${esc(r.nombre)}, se abre WhatsApp)</span>
              </a>
              <a class="rubro__ajustar" href="${armar}">Ajustarla en el armador</a>
            </div>
          </article>`;
      })
      .join('');
    return [contenedor];
  }

  /* --------------------------------------------- Contacto: armador */

  function pintarArmador(contenedor, { areas, porId }) {
    const grupos = areas
      .map((a) => `
        <fieldset class="armador__grupo">
          <legend>${icono(a.icono)} ${esc(a.nombre)}</legend>
          ${a.servicios.map((s) => `
            <label class="opcion">
              <input type="checkbox" name="servicio" value="${esc(s.id)}">
              <span class="opcion__caja" aria-hidden="true"></span>
              <span class="opcion__texto">${esc(s.nombre)}</span>
            </label>`).join('')}
        </fieldset>`)
      .join('');

    contenedor.innerHTML = `
      <div class="armador__grupos revelar-c">${grupos}</div>
      <div class="campo armador__campo">
        <label for="a-negocio">Tu negocio o rubro (opcional)</label>
        <input id="a-negocio" type="text" autocomplete="organization" placeholder="Ej: almacén en Rivadavia">
      </div>
      <div class="armador__resumen" role="group" aria-label="Tu selección">
        <p class="armador__cuenta" aria-live="polite"><strong data-cuenta>0</strong> <span data-cuenta-texto>servicios elegidos</span></p>
        <button class="armador__limpiar" type="button" data-limpiar>Limpiar</button>
        <button class="boton boton--wa armador__enviar iman" type="button" data-enviar data-cursor="WhatsApp">Enviar por WhatsApp</button>
        <p class="formulario__aviso" data-aviso role="status" aria-live="polite"></p>
      </div>`;

    const casillas = $$('input[name="servicio"]', contenedor);
    const cuenta = $('[data-cuenta]', contenedor);
    const cuentaTexto = $('[data-cuenta-texto]', contenedor);
    const aviso = $('[data-aviso]', contenedor);
    const negocio = $('#a-negocio', contenedor);

    const elegidos = () => casillas.filter((c) => c.checked).map((c) => porId.get(c.value));

    const actualizar = () => {
      const n = elegidos().length;
      cuenta.textContent = n;
      cuentaTexto.textContent = n === 1 ? 'servicio elegido' : 'servicios elegidos';
      contenedor.classList.toggle('con-eleccion', n > 0);
      if (n) aviso.textContent = '';
    };
    casillas.forEach((c) => c.addEventListener('change', actualizar));

    // Llegar desde un rubro (contacto.html?sumar=a,b) deja tildados sus servicios.
    const sumar = new URLSearchParams(location.search).get('sumar');
    if (sumar) {
      const ids = sumar.split(',');
      casillas.forEach((c) => (c.checked = ids.includes(c.value)));
    }
    actualizar();

    $('[data-limpiar]', contenedor).addEventListener('click', () => {
      casillas.forEach((c) => (c.checked = false));
      actualizar();
    });

    $('[data-enviar]', contenedor).addEventListener('click', () => {
      const lista = elegidos();
      if (!lista.length) {
        aviso.className = 'formulario__aviso mal';
        aviso.textContent = 'Tildá al menos un servicio para armar el mensaje.';
        casillas[0].focus();
        return;
      }
      const quien = negocio.value.trim();
      const texto =
        `Hola Núcleo Digital, quiero armar una solución${quien ? ` para mi negocio (${quien})` : ''}. Me interesa:\n` +
        lista.map((s) => `• ${nombreEnMensaje(s)}`).join('\n');
      window.open(ND.wa(texto), '_blank', 'noopener');
      aviso.className = 'formulario__aviso ok';
      aviso.textContent = 'Te abrimos WhatsApp con el mensaje listo. Dale enviar y listo.';
    });

    return [contenedor];
  }

  /* ------------------------------------------- animación de la maqueta */

  // Las barras crecen recién cuando la maqueta entra en pantalla.
  const observador = 'IntersectionObserver' in window
    ? new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('visible');
          observador.unobserve(e.target);
        });
      }, { threshold: 0.3 })
    : null;

  function activarMaquetas(ctx = document) {
    $$('.mockup:not(.visible)', ctx).forEach((m) => {
      if (observador) observador.observe(m);
      else m.classList.add('visible');
    });
  }

  /* ---------------------------------------------------------------- inicio */

  const PIEZAS = [
    ['[data-areas]', pintarAreas],
    ['[data-catalogo]', pintarCatalogo],
    ['[data-rubros]', pintarRubros],
    ['[data-armador]', pintarArmador],
  ];

  function pintar(datos) {
    const listo = prepararDatos(datos);
    const nuevos = [];

    PIEZAS.forEach(([sel, fn]) => {
      const el = $(sel);
      if (el) nuevos.push(...fn(el, listo));
    });

    $$('[data-maqueta-rindo]').forEach((el) => {
      el.innerHTML = maquetaRindo();
      nuevos.push(el);
    });

    // Bloques fijos de la página que dependen de un área (ej. Rindo en Inicio).
    $$('[data-area-bloque]').forEach((el) => {
      if (listo.inactivas.includes(el.dataset.areaBloque)) el.hidden = true;
    });

    activarMaquetas();
    return nuevos;
  }

  if (!PIEZAS.some(([sel]) => $(sel)) && !$('[data-maqueta-rindo]')) return;

  ND.catalogo = fetch('servicios.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(pintar)
    .catch((error) => {
      // Si el JSON tiene un error de tipeo, no dejamos la página vacía:
      // mostramos un aviso con salida directa a WhatsApp.
      console.error('No se pudo leer servicios.json', error);
      PIEZAS.forEach(([sel]) => {
        const el = $(sel);
        if (el) {
          el.innerHTML = `<p class="catalogo-error">No pudimos cargar esta sección. <a href="${ND.wa('Hola Núcleo Digital, quiero consultarles por sus servicios.')}" target="_blank" rel="noopener">Escribinos por WhatsApp</a> y te contamos todo.</p>`;
        }
      });
      return [];
    });
})();
