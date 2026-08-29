# Sitio web — consultorio dental (demo)

Landing page estática de una página. Sin build step: se abre `index.html` y funciona.

## Poner en marcha

1. Cambia el número en `js/config.js`.
2. Reemplaza los datos de demo (lista completa en `HANDOFF.md`, sección 4).
3. Sube la carpeta a Vercel, Netlify o cualquier hosting.

## Estructura

- `index.html` — marcado y datos estructurados (JSON-LD)
- `css/styles.css` — sistema de diseño en tokens, tema claro y oscuro
- `js/config.js` — WhatsApp y mensajes precargados (lo único que se edita a diario)
- `js/main.js` — animaciones e interacción
- `llms.txt`, `robots.txt`, `sitemap.xml` — SEO y GEO

## Vista previa en un solo archivo

```bash
python3 build-preview.py   # genera preview/index.html
```

Construido por Mattera Systems.
