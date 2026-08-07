# Landing page — Shopping donde EMSA

Página de una sola vista para presentar y vender los tres productos de la tienda.
Sin frameworks ni dependencias: se abre con doble clic en `index.html` o se sube
tal cual a cualquier hosting estático (Netlify, Vercel, GitHub Pages, un cPanel…).

## Estructura

```
index.html                    ← toda la página
assets/css/styles.css         ← estilos
assets/js/main.js             ← interacción (WhatsApp, galerías, menú, animaciones)
assets/img/                   ← imágenes optimizadas para web (.webp + .jpg de respaldo)
tools/optimizar-imagenes.py   ← regenera assets/img/ a partir de los originales
README.md
```

Las imágenes originales pesaban 18 MB en total. En `assets/img/` están
comprimidas a ~1 MB conservando la calidad, y son las únicas que la página
carga.

Los originales **no están en el repositorio**: viven en una carpeta `img/`
local, excluida en `.gitignore` para que el repo se mantenga liviano. Guárdalos
aparte, porque son los que permiten regenerar las versiones de la web. Si
agregas o cambias una foto, colócala en `img/` y ejecuta:

```bash
pip install Pillow
python tools/optimizar-imagenes.py
```

## Cómo cambiar cosas

**El número de WhatsApp** — `assets/js/main.js`, primera línea del bloque:

```js
var WHATSAPP = '573127661561';   // 57 = Colombia, sin +, sin espacios
```

**El texto del mensaje de WhatsApp** — misma función `whatsappUrl()` en
`assets/js/main.js`. Cada botón lleva el nombre de su producto en el atributo
`data-wa-product` dentro de `index.html`, y la página añade sola las opciones
que el cliente eligió (estilo, talla, color).

**Precios, colores, tallas y textos** — todo está en `index.html`, dentro de la
sección de cada producto (`id="bodies"`, `id="botas"`, `id="pantalones"`).
Para agregar un color basta con copiar un `<button class="swatch" …>` y cambiar
`data-value` y `--tone`.

**Cambiar una foto** — reemplaza el archivo en `assets/img/` conservando el
nombre, o apunta a otro nombre desde el `<picture>` y los `.thumb` del producto.

## Detalles incluidos

- Diseño responsive: una sola columna y menú desplegable por debajo de 860 px.
- Botón flotante de WhatsApp que aparece al salir del encabezado.
- Galería por producto con miniaturas.
- Selección de estilo / talla / color que viaja en el mensaje de WhatsApp.
- Accesibilidad: navegación por teclado, `aria-*` en menú y selectores,
  enlace de salto al contenido y respeto por `prefers-reduced-motion`.
- Etiquetas Open Graph para que el enlace se vea bien al compartirlo.
