/* =========================================================================
   NÚCLEO DIGITAL — demo del panel de stock

   Las dos vistas (tienda y panel) leen y escriben la MISMA lista guardada en
   localStorage. Por eso, cualquier cambio hecho en el panel aparece en la
   tienda al instante, y también en otra pestaña abierta en paralelo.

   Es una demostración: la contraseña está a la vista y no protege nada.
   ========================================================================= */
(() => {
  'use strict';

  const CLAVE_DATOS = 'nd_demo_productos';
  const CLAVE_SESION = 'nd_demo_sesion';

  // Credenciales de la demo. Están a la vista en la pantalla de ingreso a
  // propósito: sirven para mostrar el flujo, no para proteger nada.
  const USUARIO = 'admin';
  const CONTRASENA = 'demo1234';

  const PRODUCTOS_INICIALES = [
    { id: 'p1', nombre: 'Auriculares inalámbricos', precio: 45000, stock: 12, imagen: '' },
    { id: 'p2', nombre: 'Mochila urbana impermeable', precio: 32000, stock: 4, imagen: '' },
    { id: 'p3', nombre: 'Botella térmica 750 ml', precio: 18500, stock: 0, imagen: '' },
    { id: 'p4', nombre: 'Lámpara de escritorio LED', precio: 27900, stock: 8, imagen: '' },
    { id: 'p5', nombre: 'Teclado mecánico compacto', precio: 89000, stock: 2, imagen: '' },
  ];

  const POCO_STOCK = 5; // a partir de acá se avisa "Quedan pocos"

  /* ------------------------------------------------------------ utilidades */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const plata = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
  const entero = new Intl.NumberFormat('es-AR');

  /** Evita que un nombre con < o > rompa el marcado al insertarlo. */
  const limpiar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  /* --------------------------------------------------------------- datos */

  let productos = [];

  function leer() {
    try {
      const crudo = localStorage.getItem(CLAVE_DATOS);
      if (!crudo) return estructuraInicial();
      const datos = JSON.parse(crudo);
      if (!Array.isArray(datos)) return estructuraInicial();
      // Nos quedamos solo con lo que tiene la forma esperada: si alguien tocó
      // el localStorage a mano, la demo no se rompe.
      return datos.filter((p) => p && typeof p.nombre === 'string').map(normalizar);
    } catch {
      return estructuraInicial();
    }
  }

  function estructuraInicial() {
    return PRODUCTOS_INICIALES.map(normalizar);
  }

  function normalizar(p) {
    return {
      id: String(p.id || nuevoId()),
      nombre: String(p.nombre || '').trim(),
      precio: Math.max(0, Number(p.precio) || 0),
      stock: Math.max(0, Math.trunc(Number(p.stock) || 0)),
      imagen: String(p.imagen || '').trim(),
    };
  }

  const nuevoId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function guardar() {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify(productos));
    } catch {
      avisar('No se pudo guardar en este navegador (modo privado).');
    }
    pintarTodo();
  }

  /* ------------------------------------------------------------- estados */

  function estadoDe(p) {
    if (p.stock <= 0) return { clase: 'no', texto: 'Sin stock' };
    if (p.stock <= POCO_STOCK) return { clase: 'poco', texto: 'Quedan pocos' };
    return { clase: 'hay', texto: 'En stock' };
  }

  /**
   * Devuelve el HTML de la imagen. Si no hay link, usa un monograma con la
   * inicial. Si el link falla, el onerror cambia al monograma: en una demo
   * frente a un cliente no puede aparecer nunca un cuadro de imagen rota.
   */
  function htmlImagen(p) {
    const inicial = limpiar((p.nombre.trim()[0] || '?').toUpperCase());
    const monograma = `<span class="monograma">${inicial}</span>`;
    if (!p.imagen) return monograma;
    return (
      `<img src="${limpiar(p.imagen)}" alt="${limpiar(p.nombre)}" loading="lazy"` +
      ` onerror="this.outerHTML='<span class=\\'monograma\\'>${inicial}</span>'">`
    );
  }

  /* ------------------------------------------------------- vista pública */

  function pintarTienda() {
    const grilla = $('#grilla-publica');
    const busqueda = $('#buscar-publico').value.trim().toLowerCase();
    const soloDisponibles = $('#solo-disponibles').checked;

    const lista = productos.filter((p) => {
      if (soloDisponibles && p.stock <= 0) return false;
      return !busqueda || p.nombre.toLowerCase().includes(busqueda);
    });

    $('#vacio-publico').hidden = lista.length > 0;
    $('#vacio-publico').textContent = productos.length
      ? 'Ningún producto coincide con la búsqueda.'
      : 'No hay productos para mostrar. Cargá uno desde la vista de administración.';

    grilla.innerHTML = lista
      .map((p) => {
        const est = estadoDe(p);
        return `
          <article class="producto ${p.stock <= 0 ? 'producto--agotado' : ''}">
            <div class="producto__figura">${htmlImagen(p)}</div>
            <div class="producto__cuerpo">
              <h3 class="producto__nombre">${limpiar(p.nombre)}</h3>
              <p class="producto__precio">${plata.format(p.precio)}</p>
              <div class="producto__pie">
                <span class="estado estado--${est.clase}">${est.texto}</span>
                ${p.stock > 0 ? `<span class="producto__unidades">${entero.format(p.stock)} u.</span>` : ''}
              </div>
            </div>
          </article>`;
      })
      .join('');
  }

  /* --------------------------------------------------------- vista panel */

  function pintarPanel() {
    const cuerpo = $('#cuerpo-tabla');
    const busqueda = $('#buscar-admin').value.trim().toLowerCase();
    const lista = busqueda
      ? productos.filter((p) => p.nombre.toLowerCase().includes(busqueda))
      : productos;

    $('#vacio-admin').hidden = lista.length > 0;
    $('.tabla__marco').hidden = lista.length === 0;

    cuerpo.innerHTML = lista
      .map((p) => {
        const est = estadoDe(p);
        return `
          <tr data-id="${p.id}">
            <td><div class="miniatura">${htmlImagen(p)}</div></td>
            <td class="celda-nombre">${limpiar(p.nombre)}</td>
            <td class="col-num">${plata.format(p.precio)}</td>
            <td class="col-num">${entero.format(p.stock)}</td>
            <td><span class="estado estado--${est.clase}">${est.texto}</span></td>
            <td>
              <div class="acciones">
                <button class="icono" type="button" data-accion="editar" data-id="${p.id}"
                        aria-label="Editar ${limpiar(p.nombre)}" title="Editar">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 20h4L20 8l-4-4L4 16v4Z"/></svg>
                </button>
                <button class="icono icono--borrar" type="button" data-accion="borrar" data-id="${p.id}"
                        aria-label="Eliminar ${limpiar(p.nombre)}" title="Eliminar">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
      })
      .join('');

    // Resumen
    const unidades = productos.reduce((s, p) => s + p.stock, 0);
    const valor = productos.reduce((s, p) => s + p.stock * p.precio, 0);
    $('#r-productos').textContent = entero.format(productos.length);
    $('#r-unidades').textContent = entero.format(unidades);
    $('#r-sinstock').textContent = entero.format(productos.filter((p) => p.stock <= 0).length);
    $('#r-valor').textContent = plata.format(valor);
  }

  function pintarTodo() {
    pintarTienda();
    pintarPanel();
  }

  /** Marca la fila recién tocada, para que se vea el cambio en la reunión. */
  function destacar(id) {
    const fila = document.querySelector(`tr[data-id="${id}"]`);
    if (fila) {
      fila.classList.remove('recien-cambiado');
      void fila.offsetWidth; // reinicia la animación
      fila.classList.add('recien-cambiado');
    }
  }

  /* ------------------------------------------------------------- vistas */

  function moverMarcador() {
    const activa = $('.conmutador__opcion.activa');
    const marca = $('.conmutador__marca');
    if (!activa || !marca) return;
    marca.style.width = activa.offsetWidth + 'px';
    marca.style.transform = `translateX(${activa.offsetLeft - 4}px)`;
  }

  function cambiarVista(vista) {
    $$('.conmutador__opcion').forEach((b) => {
      const activa = b.dataset.vista === vista;
      b.classList.toggle('activa', activa);
      b.setAttribute('aria-selected', String(activa));
    });
    $('#vista-publica').hidden = vista !== 'publica';
    $('#vista-admin').hidden = vista !== 'admin';
    moverMarcador();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------- sesión */

  function haySesion() {
    try {
      return sessionStorage.getItem(CLAVE_SESION) === '1';
    } catch {
      return false;
    }
  }

  function aplicarSesion() {
    const dentro = haySesion();
    $('#ingreso').hidden = dentro;
    $('#panel').hidden = !dentro;
  }

  /* --------------------------------------------------------- formulario */

  const dialogo = $('#dialogo');
  const dialogoBorrar = $('#dialogo-borrar');
  let idABorrar = null;

  function abrirFormulario(id) {
    const p = id ? productos.find((x) => x.id === id) : null;

    $('#dialogo-titulo').textContent = p ? 'Editar producto' : 'Agregar producto';
    $('#p-id').value = p ? p.id : '';
    $('#p-nombre').value = p ? p.nombre : '';
    $('#p-precio').value = p ? p.precio : '';
    $('#p-stock').value = p ? p.stock : '';
    $('#p-imagen').value = p ? p.imagen : '';
    $('#error-producto').hidden = true;

    actualizarVistaPrevia();
    dialogo.showModal();
    $('#p-nombre').focus();
  }

  function actualizarVistaPrevia() {
    $('#vista-previa').innerHTML = htmlImagen({
      nombre: $('#p-nombre').value || '?',
      imagen: $('#p-imagen').value.trim(),
    });
  }

  function guardarProducto(ev) {
    ev.preventDefault();

    const id = $('#p-id').value;
    const nombre = $('#p-nombre').value.trim();
    const precio = Number($('#p-precio').value);
    const stock = Number($('#p-stock').value);
    const imagen = $('#p-imagen').value.trim();

    const error = $('#error-producto');
    if (!nombre) return mostrarError(error, 'Poné un nombre para el producto.');
    if (!Number.isFinite(precio) || precio < 0) return mostrarError(error, 'El precio tiene que ser un número de 0 o más.');
    if (!Number.isFinite(stock) || stock < 0) return mostrarError(error, 'El stock tiene que ser un número de 0 o más.');
    error.hidden = true;

    if (id) {
      const i = productos.findIndex((p) => p.id === id);
      if (i > -1) productos[i] = normalizar({ id, nombre, precio, stock, imagen });
      avisar('Producto actualizado');
    } else {
      productos.unshift(normalizar({ id: nuevoId(), nombre, precio, stock, imagen }));
      avisar('Producto agregado');
    }

    guardar();
    destacar(id || productos[0].id);
    dialogo.close();
  }

  function mostrarError(el, texto) {
    el.textContent = texto;
    el.hidden = false;
  }

  /* ---------------------------------------------------------- avisos */

  let temporizador = null;
  function avisar(texto) {
    const n = $('#notificacion');
    n.textContent = texto;
    n.hidden = false;
    requestAnimationFrame(() => n.classList.add('visible'));
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      n.classList.remove('visible');
      setTimeout(() => (n.hidden = true), 300);
    }, 2200);
  }

  /* ------------------------------------------------------------- inicio */

  function iniciar() {
    productos = leer();
    aplicarSesion();
    pintarTodo();
    moverMarcador();

    // --- cambio de vista ---
    $$('.conmutador__opcion').forEach((b) =>
      b.addEventListener('click', () => cambiarVista(b.dataset.vista))
    );
    window.addEventListener('resize', moverMarcador);

    // --- ingreso ---
    $('#form-ingreso').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const u = $('#usuario').value.trim();
      const c = $('#clave').value;
      if (u === USUARIO && c === CONTRASENA) {
        try { sessionStorage.setItem(CLAVE_SESION, '1'); } catch { /* modo privado */ }
        $('#error-ingreso').hidden = true;
        aplicarSesion();
        pintarPanel();
      } else {
        mostrarError($('#error-ingreso'), 'Usuario o contraseña incorrectos. Probá con admin / demo1234.');
      }
    });

    $('#salir').addEventListener('click', () => {
      try { sessionStorage.removeItem(CLAVE_SESION); } catch { /* nada */ }
      aplicarSesion();
      $('#clave').value = CONTRASENA;
    });

    // --- alta / edición / borrado ---
    $('#nuevo').addEventListener('click', () => abrirFormulario(null));
    $('#form-producto').addEventListener('submit', guardarProducto);
    $('#cancelar').addEventListener('click', () => dialogo.close());
    $('#cerrar-dialogo').addEventListener('click', () => dialogo.close());
    $('#p-imagen').addEventListener('input', actualizarVistaPrevia);
    $('#p-nombre').addEventListener('input', actualizarVistaPrevia);

    $('#cuerpo-tabla').addEventListener('click', (ev) => {
      const boton = ev.target.closest('[data-accion]');
      if (!boton) return;
      const { accion, id } = boton.dataset;
      if (accion === 'editar') return abrirFormulario(id);
      if (accion === 'borrar') {
        const p = productos.find((x) => x.id === id);
        if (!p) return;
        idABorrar = id;
        $('#texto-borrar').textContent = `Se va a eliminar «${p.nombre}» de la lista.`;
        dialogoBorrar.showModal();
      }
    });

    $('#cancelar-borrar').addEventListener('click', () => dialogoBorrar.close());
    $('#confirmar-borrar').addEventListener('click', () => {
      productos = productos.filter((p) => p.id !== idABorrar);
      guardar();
      dialogoBorrar.close();
      avisar('Producto eliminado');
    });

    // --- búsquedas y filtros ---
    $('#buscar-publico').addEventListener('input', pintarTienda);
    $('#solo-disponibles').addEventListener('change', pintarTienda);
    $('#buscar-admin').addEventListener('input', pintarPanel);

    // --- restablecer ---
    $('#restablecer').addEventListener('click', () => {
      productos = estructuraInicial();
      guardar();
      $('#buscar-publico').value = '';
      $('#buscar-admin').value = '';
      $('#solo-disponibles').checked = false;
      pintarTodo();
      avisar('Demo restablecida');
    });

    // Si la demo está abierta en dos pestañas (por ejemplo, el panel en una y
    // la tienda en otra, proyectada), la segunda se entera del cambio.
    window.addEventListener('storage', (ev) => {
      if (ev.key !== CLAVE_DATOS) return;
      productos = leer();
      pintarTodo();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
