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

## 2. Cómo se ve el link en WhatsApp

Esto es lo que define la vista previa cuando mandás el link por chat:

- La imagen es `assets/img/og.jpg` (1200×630).
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

### Los precios y qué incluye cada plan

En `servicios.html`, sección `<!-- Planes de página web`. Cada plan es un
bloque `<article class="plan">`. El precio está en `<p class="plan__precio">`
y los puntos en la lista `<ul class="plan__lista">`.

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

**El logo.** El original es azul. La versión ámbar (`assets/img/logo.webp`) se
generó remapeando el azul con ffmpeg. Si alguna vez necesitás rehacerla desde
el original:

```bash
ffmpeg -i logo-original.jpg -vf "crop=1000:300:128:502,format=rgb24,geq=r='if(gt(b(X,Y),r(X,Y)+30), min(255,1.054*b(X,Y)), r(X,Y))':g='if(gt(b(X,Y),r(X,Y)+30), 0.727*b(X,Y), g(X,Y))':b='if(gt(b(X,Y),r(X,Y)+30), 0.132*b(X,Y), b(X,Y))'" plano.png
```

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
