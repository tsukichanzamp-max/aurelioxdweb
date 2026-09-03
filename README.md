# Aurelio · Perfil personal

Sitio de una sola página para Aurelio (@mr.aurelioxd), creador de contenido de tutoriales de PC y gaming, jugador de Genshin Impact y osu!.

## Tecnologías

Sitio estático puro — HTML, CSS y JavaScript sin frameworks ni proceso de build.

- `index.html` — estructura de la página (hero, biografía, ficha de jugador, enlaces, reproductor).
- `css/style.css` — estilos, fondo animado con gradiente + bokeh, animación de lluvia de hojas dendro y el widget del reproductor.
- `js/main.js` — animaciones (scroll reveal, carrusel de la ficha, generación de partículas) y toda la lógica del reproductor de música flotante y arrastrable.
- `assets/` — imágenes de perfil y capturas, video de fondo y pistas de audio.

## Ejecutar en local

Al ser un sitio estático, basta con servir la carpeta con cualquier servidor HTTP, por ejemplo:

```bash
npx serve .
```

o con la CLI de Netlify:

```bash
netlify dev --port 8889
```
