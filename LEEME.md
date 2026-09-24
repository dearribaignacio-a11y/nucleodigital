# Núcleo Digital — sitio web

Landing de una sola página. HTML, CSS y JavaScript sin frameworks: se sube tal
cual a Hostinger y anda. No hay que compilar nada.

---

## 1. Subirlo a Hostinger

1. Entrá al **hPanel** → *Administrador de archivos* → carpeta `public_html`.
2. Borrá lo que haya adentro (si es un sitio nuevo, va a estar vacío).
3. Subí **el contenido** de esta carpeta, no la carpeta en sí. Es decir, que
   `index.html` quede directo en `public_html/index.html`.
4. **No subas la carpeta `tools/`**: es solo para desarrollo.

Lo que sí va:

```
index.html   styles.css   main.js   escena.js   .htaccess
assets/      lib/
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

### El número de WhatsApp

Aparece en dos lados:

- `main.js`, arriba de todo: la constante `WHATSAPP`.
- `index.html`: buscá `wa.me/` y reemplazá en todos los enlaces.

Va sin `+`, sin espacios y sin guiones: `5492646071925`.

### Los precios y qué incluye cada plan

En `index.html`, sección `<!-- SERVICIOS -->`. Cada plan es un bloque
`<article class="plan">`. El precio está en `<p class="plan__precio">` y los
puntos en la lista `<ul class="plan__lista">`.

### Los contadores del inicio

En `index.html`, buscá `data-hasta`. El número que pongas ahí es hasta dónde
cuenta la animación.

### Un proyecto del portfolio

Cada uno es un `<article class="trabajo">`. Para agregarle el link al sitio en
vivo a uno que hoy no lo tiene, cambiá:

```html
<div class="trabajo__marco trabajo__marco--quieto">
```

por:

```html
<a class="trabajo__marco" href="https://EL-SITIO.com" target="_blank" rel="noopener" data-cursor="Visitar">
```

y antes de cerrar, agregá `<span class="trabajo__ir">Ver el sitio</span>` y
cerrá con `</a>` en lugar de `</div>`.

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

### Regenerar las capturas del portfolio

```bash
node tools/capturar.js
```

Levanta Chrome en segundo plano, entra a cada proyecto y saca la captura.
Los proyectos y sus rutas están listados arriba de todo en `tools/capturar.js`.

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

**Peso.** Un celular descarga alrededor de **160 KB** para ver la primera
pantalla. Las capturas del portfolio se cargan recién cuando el visitante llega
a esa altura.

---

## 7. La demo del panel de stock

Está en `demo-panel.html` (con `demo-panel.css` y `demo-panel.js`). Es la página
que le mostrás al cliente en una reunión para que entienda qué es un panel de
administración.

**Cómo usarla en una reunión:**

1. Abrí `https://nucleodigital.art/demo-panel.html`.
2. Arrancá en **Vista pública**: "esto es lo que ve tu cliente".
3. Pasá a **Vista de administración**, entrá con `admin` / `demo1234`.
4. Cambiale el stock a un producto y ponelo en 0.
5. Volvé a **Vista pública**: el producto ahora dice "Sin stock".

Ese ida y vuelta es el momento en que se entiende de qué se trata.

**Restablecer demo** (botón arriba a la derecha) devuelve los 5 productos
originales. Usalo al terminar cada reunión para dejarla lista para la próxima.

**Dónde se guardan los datos.** En el `localStorage` del navegador de quien la
abre. No hay base de datos ni servidor: si el cliente la abre en su celular,
ve los productos originales y lo que toque queda solo en su teléfono. Es una
maqueta, no un sistema.

**Las imágenes.** Los productos de ejemplo no traen foto: se muestra la inicial
del nombre sobre un fondo. Si cargás un link de imagen en el formulario, se usa
esa; si el link falla, vuelve a la inicial. Así nunca aparece una imagen rota
delante de un cliente.

**Cambiar los productos de ejemplo.** En `demo-panel.js`, arriba de todo, está
la lista `PRODUCTOS_INICIALES`. Si vas a una reunión con una ferretería, poné
ahí cinco productos de ferretería y la demo pega mucho más.

**Usuario y contraseña.** También arriba de `demo-panel.js`, en `USUARIO` y
`CONTRASENA`. Están a la vista en la pantalla de ingreso a propósito. No
protegen nada: es una demostración del flujo, no seguridad real.

**No está enlazada desde el sitio.** Se llega solo por la dirección directa. Si
querés que aparezca en el menú, agregá un enlace a `demo-panel.html` en el
`<nav>` de `index.html`.
