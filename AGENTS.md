# AGENTS.md

## Arquitectura

Sitio estático de una sola página, sin build step ni framework. Netlify sirve el directorio raíz directamente (`netlify.toml` → `publish = "."`).

- `index.html` — todo el markup de la página en un único archivo (hero, bio, ficha de jugador tipo tarjeta de Genshin, enlaces sociales, reproductor flotante).
- `css/style.css` — todos los estilos. Usa variables CSS en `:root` para la paleta (verde `--emerald`, cian, morado). El fondo animado combina un gradiente en movimiento (`.bg-fx`), círculos "bokeh" generados por JS (`.bokeh span`) y una lluvia de hojas estilo Sumeru (`#leafRain .leaf`, SVGs generados dinámicamente).
- `js/main.js` — un único archivo sin módulos. Contiene, en orden: boot overlay, scroll reveal, ciclo de avatar, carrusel/tilt de la ficha, generación de bokeh y hojas, y un IIFE con toda la lógica del reproductor de música (`PLAYLIST`, controles, arrastre del widget).
- `assets/audio`, `assets/img`, `assets/video` — medios estáticos servidos tal cual.

## Convenciones

- No hay bundler: cualquier script o estilo nuevo debe añadirse como `<script>`/`<link>` adicional en `index.html`, sin imports de módulos ES para mantener la simplicidad.
- La paleta vive en variables CSS (`--emerald`, `--emerald-dim`, `--cyan`, `--purple`, `--bg-0/1/2`) — reutilízalas en vez de hardcodear colores nuevos.
- El reproductor de música (`.player`) es arrastrable vía mouse/touch y su posición se ajusta con `left/top` en JS; evita volver a `position: fixed` con `bottom/right` salvo en el estado inicial.
- La lista de reproducción (`PLAYLIST` en `js/main.js`) referencia archivos en `assets/audio/`. Para añadir más canciones: colocar el `.mp3` en esa carpeta y agregar un objeto `{ title, artist, src }` al arreglo.

## Decisiones no obvias

- El personaje "chibi inspirado en Kinich" en el hero es un SVG original hecho a medida (paleta ámbar/dorado, motivo de dinosaurio), no arte oficial de Genshin Impact, para evitar el uso de material con derechos de autor sin licencia.
- El "efecto de lluvia" pedido a partir de la captura de Sumeru se implementó como hojas SVG en tonos verdes (no como recorte de la imagen original), ya que la imagen de referencia no se podía recortar/limpiar de forma fiable sin herramientas de edición de imagen.
- El autoplay de audio intenta reproducir al cargar, pero los navegadores modernos lo bloquean sin gesto del usuario; por eso hay un listener de respaldo en el primer click/tecla de la página (`startOnGesture` en `js/main.js`).
