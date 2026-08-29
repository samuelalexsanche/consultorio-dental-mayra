#!/usr/bin/env python3
"""Genera preview/artifact.html — el mismo sitio sin las etiquetas
<!doctype>/<html>/<head>/<body>, tal como lo pide la herramienta Artifact."""
import re, pathlib
raiz = pathlib.Path(__file__).parent
doc  = (raiz/"preview/index.html").read_text(encoding="utf-8")
head = re.search(r"<head>(.*?)</head>", doc, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", doc, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>', '', head)
(raiz/"preview/artifact.html").write_text(head.strip()+"\n"+body.strip()+"\n", encoding="utf-8")
print("ok", (raiz/"preview/artifact.html").stat().st_size)
