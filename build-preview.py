#!/usr/bin/env python3
"""Genera preview/index.html: una sola página autocontenida (CSS + JS en línea).
Úsalo para previsualizar o publicar como artifact. El sitio real usa los archivos
separados de la raíz del proyecto."""
import re, pathlib, html
raiz = pathlib.Path(__file__).parent
doc  = (raiz/"index.html").read_text(encoding="utf-8")
css  = (raiz/"css/styles.css").read_text(encoding="utf-8")
cfg  = (raiz/"js/config.js").read_text(encoding="utf-8")
main = (raiz/"js/main.js").read_text(encoding="utf-8")

doc = doc.replace('<link rel="stylesheet" href="css/styles.css">', "<style>\n"+css+"\n</style>")
doc = doc.replace('<script src="js/config.js" defer></script>', "<script>\n"+cfg+"\n</script>")
doc = doc.replace('<script src="js/main.js" defer></script>', "<script>\n"+main+"\n</script>")
doc = doc.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js" defer></script>',
                  '<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>')
# rutas locales que no existen en el preview
doc = doc.replace('<link rel="manifest" href="site.webmanifest">', '')
doc = doc.replace('<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">', '')
# preview/ está un nivel más adentro: las rutas relativas a assets suben uno
doc = doc.replace('="assets/', '="../assets/').replace('srcset="assets/', 'srcset="../assets/')
salida = raiz/"preview"
salida.mkdir(exist_ok=True)
(salida/"index.html").write_text(doc, encoding="utf-8")
print("preview/index.html", len(doc), "bytes")
