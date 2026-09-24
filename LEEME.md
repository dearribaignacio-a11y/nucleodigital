# Núcleo Digital — sitio web

Sitio de cuatro páginas: Inicio (`index.html`), Servicios (`servicios.html`),
Soluciones (`soluciones.html`) y Contacto (`contacto.html`). HTML, CSS y
JavaScript sin frameworks: se sube tal cual a Hostinger y anda. No hay que
compilar nada.

Todos los servicios y rubros salen de **un solo archivo: `servicios.json`**
(ver sección 3).

---

## 1. Subirlo a Hostinger

1. Entrá al **hPanel** → *Administrador de archivos* → carpeta `public_html`.
2. Borrá lo que haya adentro (si es un sitio nuevo, va a estar vacío).
3. Subí **el contenido** de esta carpeta, no la carpeta en sí. Es decir, que
   `index.html` quede directo en `public_html/index.html`.
4. **No subas la carpeta `tools/`**: es solo para desarrollo.

Lo que sí va:

```
index.html  servicios.html  soluciones.html  contacto.html
styles.css  main.js  catalogo.js  escena.js  servicios.json
.htaccess   sitemap.xml  robots.txt
assets/     lib/
```

> El archivo `.htaccess` es el que activa la compresión y el caché. Empieza con
> punto, así que en algunos gestores de archivos está oculto: fijate de tener
> activada la opción de "mostrar archivos ocultos" antes de subirlo.

5. En hPanel → *SSL*, verificá que el certificado esté activo (tiene que abrir
   con `https://`, no `http://`).

---

## 1 bis. Publicarlo en Vercel

El repo ya está listo para Vercel (sitio estático, sin compilar). `vercel.json`
hace lo mismo que `.htaccess` en Hostinger: redirige `/portfolio`,
`/trabajos` y `/demo-panel.html` a Soluciones y ajusta el caché.

Vercel publica lo que está en la rama `main`. Cada cambio en otra rama genera
una vista previa aparte, sin tocar el sitio publicado.

Las imágenes de `assets/img/` ya están en el repo: `logo.svg` (el logo en
vector, nítido en cualquier pantalla), `favicon.svg`, `apple-touch-icon.png` y
`og.jpg` (la vista previa del link).

## 2. Cómo se ve el link en WhatsApp

Esto es lo que define la vista previa cuando mandás el link por chat:

- La imagen es `assets/img/og.jpg` (1200×630): logo, título y bajada del Inicio.
- El título y la descripción están en las etiquetas `og:` del `<head>` de
  `index.html`.

**Importante:** WhatsApp guarda esa vista previa en caché. Si cambiás la imagen
o el texto y el link sigue mostrando lo viejo, mandalo con un parámetro al
final para forzar que la vuelva a leer:

```
https://nucleodigital.art/?v=2
```

Para probar cómo se va a ver antes de mandarlo:
https://developers.facebook.com/tools/debug/

---

## 3. Cosas que vas a querer cambiar

Todo lo que sigue está en un solo lugar, no hay que buscar por todo el código.

### Servicios y rubros: `servicios.json`

Es el único archivo que hay que tocar para cambiar el catálogo. De ahí salen
las tarjetas del Inicio, las pestañas de Servicios, las Soluciones por rubro y
el armador de Contacto. Se abre con cualquier editor de texto (incluso el
Administrador de archivos de Hostinger).

**Ocultar** un servicio, un área o un rubro: cambiá `"activo": true` por
`"activo": false`. Si ocultás un servicio que forma parte de un rubro,
desaparece también de ese rubro.

**Editar**: cambiá el texto entre comillas de `nombre`, `beneficio` o de los
puntos de `incluye`. `mensaje` (opcional) es cómo aparece el servicio en el
WhatsApp que se abre; si no está, se usa `nombre`.

**Agregar**: copiá un bloque `{ ... }` completo de un servicio, pegalo dentro
de la lista `servicios` del área que quieras, ponele un `id` nuevo (sin
espacios ni tildes, ej. `"tienda-mayorista"`) y cambiá los textos. El `icono`
tiene que ser uno de los nombres de la lista `ICONOS` de `catalogo.js`.

> Cuidado con las comas: entre bloques va coma, después del último no. Si
> después de editar el catálogo no aparece, pegá el contenido en
> https://jsonlint.com y te marca la línea con el error.

### El número de WhatsApp

- `main.js`, arriba de todo: la constante `WHATSAPP`. Todos los botones de la
  web arman su link con este número.
- En los `.html` hay una copia en cada botón como respaldo (por si el JS no
  carga). Buscá `5492646071925` y reemplazalo en los cuatro archivos.

Va sin `+`, sin espacios y sin guiones: `5492646071925`.

### Qué incluye cada plan

En `servicios.html`, sección `<!-- Planes de página web`. Cada plan es un
bloque `<article class="plan">` y sus puntos están en la lista
`<ul class="plan__lista">`. La web no muestra precios: se consultan por
WhatsApp. Si algún día querés volver a mostrarlos, agregá debajo de
`</header>` una línea `<p class="plan__precio">$100.000</p>` (el estilo ya está).

### Preguntas frecuentes y "Cómo trabajamos"

En `index.html`, secciones `PREGUNTAS FRECUENTES` y `CÓMO TRABAJAMOS`. Cada
pregunta es un bloque `<details class="pregunta">`.

### El dominio

Si cambia, reemplazalo en el `<head>` de las cuatro páginas (canonical, `og:`
y datos del negocio), en `sitemap.xml` y en `robots.txt`.

### Los colores

En `styles.css`, bloque `:root` (arriba de todo). Cambiando `--ambar` cambia el
acento de todo el sitio de una.

---

## 3 bis. Datos pendientes para las preguntas frecuentes

Se sacaron de la web hasta tenerlos. Cuando los tengas, sumalos a la
respuesta que corresponde en `index.html` (sección PREGUNTAS FRECUENTES):

- Plazos típicos de tienda online, Rindo y automatizaciones.
- Cómo se cobran los cambios puntuales después de la entrega.
- Otros medios de pago además de Mercado Pago, y si se pide seña o se paga en partes.
- Si atienden a distancia otras provincias y si hacen reuniones presenciales.

## 4. El formulario de contacto

Hoy funciona **sin backend**: cuando alguien lo completa y le da enviar, se le
abre WhatsApp con el mensaje ya armado y solo tiene que apretar enviar. No se
pierde ninguna consulta y no hay nada que mantener.

Si en algún momento querés que además te llegue por mail:

1. Creá un Google Apps Script que reciba un POST y te mande el mail.
2. Publicalo como aplicación web con acceso "cualquier persona".
3. Pegá la URL en `main.js`, en la constante `ENDPOINT_FORMULARIO`.

Con esa constante cargada, el formulario deja de abrir WhatsApp y manda directo.

---

## 5. Trabajar en el sitio localmente

Necesitás Node instalado.

```bash
node tools/serve.js
```

Y abrís http://localhost:4321

### Regenerar la imagen de WhatsApp

Editás `tools/og.html` (es una página normal) y después:

```bash
node tools/generar-imagenes.js
```

### Revisar cómo quedó, sin ir mirando a mano

```bash
node tools/revisar.js         # tira de capturas en desktop
node tools/revisar.js movil   # lo mismo en celular
```

---

## 6. Detalles técnicos que conviene saber

**El logo.** Está en `assets/img/logo.svg`, dibujado en vector: se edita con
cualquier editor de texto o con Illustrator/Inkscape. "NUCLEO" va en blanco y
"DIGITAL" en ámbar (`#ffb020`).

**La escena 3D del inicio.** Está en `escena.js` y **solo se carga en
computadoras**, después de que la página ya se pintó. En celular no se descarga
ni un byte de Three.js: ahí se ve un degradado hecho con CSS. También se saltea
si el visitante tiene activado el ahorro de datos o pidió menos animaciones en
su sistema.

**Las tipografías** están en `assets/fonts/`, no se piden a Google. Eso ahorra
una conexión a otro servidor y hace que el texto aparezca antes.

**Peso.** No hay fotos: los íconos son SVG dibujados en `catalogo.js` y la
maqueta de Rindo está hecha con HTML y CSS.

**Links viejos.** `.htaccess` redirige `/portfolio`, `/trabajos` y
`/demo-panel.html` a Soluciones, y `main.js` manda los links viejos con ancla
(`/#portfolio`, `/#servicios`, `/#contacto`) a la página nueva que corresponde.

---

## 7. La maqueta de Rindo

El panel que se ve en Inicio y en la pestaña Rindo de Servicios es una maqueta
hecha con HTML y CSS (función `maquetaRindo` en `catalogo.js`). Los números son
de ejemplo y la maqueta lo aclara abajo. Si tenés capturas reales de Rindo,
se puede reemplazar por una imagen.
