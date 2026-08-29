# HANDOFF — Landing page consultorio dental

**Proyecto:** sitio demo para cliente de consultorio dental
**Construido por:** Mattera Systems
**Estado:** base completa, funcional y verificada. Faltan imágenes, datos reales y despliegue.
**Fecha:** 29 de agosto de 2026

---

## 1. Qué es esto

Landing page de una sola página, estática (HTML + CSS + JS sin build step), para un
consultorio dental con 14 años de experiencia que ofrece **ortodoncia, blanqueamiento
y rehabilitación oral**. El objetivo único de la página es que el visitante escriba
por **WhatsApp**. No hay formularios: 12 puntos de contacto llevan todos a `wa.me`
con un mensaje precargado distinto según la sección de origen.

Los datos del consultorio son **placeholders de demo** ("Clínica Dental Aurora",
Guadalajara). La sección 4 tiene la lista exacta de reemplazos.

### Dirección de arte — "Esmalte"

No es un template dental genérico. Las decisiones y por qué:

| Elemento | Decisión | Razón |
|---|---|---|
| Motivo estructural | **Arcos dentales**, no líneas rectas | Los separadores entre secciones son la curva de una arcada; el hero es una arcada superior de 14 piezas con brackets; la línea del proceso es una curva que pasa por cada nodo |
| Numeración de pasos | **Notación FDI** (11, 12, 13, 14 / 21 / 36) | Es la numeración real de las piezas dentales en la ficha clínica. Reemplaza al genérico 01/02/03 y transmite oficio |
| Paleta | Porcelana `#F7FAFB`, tinta teal `#0B2B33`, cian clínico `#0E9BB5`, profundo `#073C4A`, menta `#7FD9C0` | Blancos con sesgo cian (nunca gris puro) = higiene y luz sobre esmalte. Verde WhatsApp `#25D366` reservado **solo** para los botones de WhatsApp |
| Tipografía | **Fraunces** (display serif variable) + **Manrope** (texto) + **IBM Plex Mono** (etiquetas, datos, FDI) | El serif suave carga la confianza de los 14 años; el sans redondeado la cercanía; el mono la precisión clínica |
| Tema | Claro y oscuro completos, por tokens | Definidos en `:root`, `@media (prefers-color-scheme: dark)` con guarda `:not([data-theme="light"])`, y `:root[data-theme="dark"]` |

### Animaciones ya implementadas (anime.js 3.2.2)

1. **Secuencia de entrada** — la curva de la arcada se dibuja trazo a trazo (`stroke-dashoffset`), los 14 dientes aparecen en stagger desde el centro, los brackets se encienden y el arco de ortodoncia se dibuja al final. El titular entra por líneas con máscara `overflow:hidden`.
2. **Parallax de esmalte** — un halo radial sigue al cursor en el hero (`--mx`/`--my`) y la arcada se desplaza con lerp suave a 0.08.
3. **Parallax de scroll** — la malla de fondo del hero se mueve a 0.22 y los anillos concéntricos rotan con el scroll.
4. **Scroll-driven en el proceso** — la curva punteada se rellena progresivamente conforme se baja, y cada nodo se enciende al entrar en pantalla. Es el efecto "que avanza según se scrollea".
5. **Barra de progreso** de lectura fija arriba.
6. **Contadores** animados (14 / 3,200+ / 4.9) al entrar en viewport.
7. **Comparador antes/después** arrastrable, con teclado (flechas, Home, End) y una animación de invitación al entrar en pantalla.
8. **Acordeón de FAQ** con altura animada y cierre de los demás.
9. **Luz que sigue el cursor** dentro de las tarjetas de servicio + elevación en hover.
10. **Chips flotantes** en bucle sobre la arcada, marquesina de confianza infinita, botón de WhatsApp con eco pulsante que entra tras 520px de scroll.

Todo respeta `prefers-reduced-motion: reduce` y **degrada correctamente si anime.js no carga**: probado con el CDN bloqueado, la página se ve completa y estática.

---

## 2. Estructura de archivos

```
dental/
├── index.html            Todo el marcado + los datos estructurados (JSON-LD)
├── css/styles.css        Sistema de diseño completo, 19 bloques numerados
├── js/config.js          ← ÚNICO archivo a tocar para cambiar WhatsApp
├── js/main.js            Interacción y motion, 13 funciones numeradas
├── robots.txt            Con los bots de IA permitidos explícitamente
├── sitemap.xml
├── llms.txt              Resumen del negocio para modelos de lenguaje (GEO)
├── site.webmanifest
├── assets/icons/favicon.svg
├── assets/img/LEEME.txt  Nombres exactos que espera el código
├── build-preview.py      Genera preview/index.html (todo en un archivo)
├── build-artifact.py     Genera preview/artifact.html
└── HANDOFF.md            Este archivo
```

`preview/index.html` es el mismo sitio con CSS y JS embebidos: sirve para abrirlo
de un doble clic sin servidor. **No es el entregable**; el entregable son los
archivos separados.

---

## 3. PENDIENTE 1 — Imágenes con Kie.ai (prioridad alta)

Es lo único que separa la página de verse terminada. Hay 4 huecos marcados en la
interfaz con el nombre de archivo que espera el código. Ya tienes kie.ai configurado
(el skill `facebook-ads-creator` tiene el flujo: `POST /api/v1/jobs/createTask` con
`google/nano-banana`, luego polling a `getTaskDetail`).

> **Advertencia clínica importante:** las fotos "antes/después" de pacientes **no
> deben generarse con IA y presentarse como resultados reales** — eso es publicidad
> engañosa y en salud tiene consecuencias legales. Genera con IA solo lo ambiental
> (texturas, consultorio, abstractos). Para el comparador, pide al cliente fotos
> reales de un caso propio con consentimiento firmado del paciente. Si aún no las
> tiene, usa el comparador con una **ilustración de arcada antes/después** claramente
> etiquetada como ilustrativa, o quita la sección hasta tener material real.

### Prompts listos para kie.ai

**A) `assets/img/og-clinica-dental-aurora.jpg` — 1200×630, para redes**
```
Clean minimal dental clinic interior, soft natural daylight, porcelain white and pale
cyan color palette, modern dental chair slightly out of focus in background, shallow
depth of field, negative space on the left third for text overlay, calm and premium
medical aesthetic, no people, no logos, no text. Photorealistic, 1200x630, high detail.
```

**B) `assets/img/consultorio-01.jpg` — 1600×1200, ambiente**
```
Modern boutique dental office interior in Guadalajara Mexico, white and soft mint
surfaces, warm wood accent, large window with diffused light, plants, spotless and
uncluttered, wide angle, architectural photography, no people, no text, no branding.
Photorealistic, high detail.
```

**C) `assets/img/textura-esmalte.jpg` — 2000×1200, capa decorativa opcional**
```
Abstract macro texture of polished tooth enamel, iridescent pale cyan and mint
highlights on white, soft caustic light reflections, extremely subtle, high key,
minimal, no objects, no text. Suitable as a very light background overlay.
```

**D) `assets/img/doctora.jpg` — 1200×1500, retrato**
No lo generes con IA: es una persona real y el sitio afirma su cédula profesional.
Pide al cliente una foto vertical con bata, fondo claro y liso. Si no la tiene aún,
deja el hueco puesto; se ve intencional.

### Después de generar
1. Guarda cada imagen con el **nombre exacto** del listado en `assets/img/LEEME.txt`.
2. Exporta también WebP: `cwebp -q 82 foto.jpg -o foto.webp`.
3. Sustituye cada `<p class="hueco">` / `<div class="comparador__vacio">` por:
   ```html
   <picture>
     <source srcset="assets/img/archivo.webp" type="image/webp">
     <img src="assets/img/archivo.jpg" alt="[descripción real y específica]"
          width="1600" height="1000" loading="lazy" decoding="async">
   </picture>
   ```
   La del hero/OG lleva `loading="eager"` y `fetchpriority="high"`.
4. Borra la regla `.hueco` de `css/styles.css` cuando ya no quede ninguna.

---

## 4. PENDIENTE 2 — Datos reales del consultorio

Buscar y reemplazar en **todo el proyecto** (`index.html`, `js/config.js`,
`llms.txt`, `sitemap.xml`, `robots.txt`, `site.webmanifest`). La lista también está
como comentario al inicio de `index.html`.

| Buscar | Reemplazar por |
|---|---|
| `Clínica Dental Aurora` | Nombre real del consultorio |
| `Dental Aurora` | Nombre corto (logo y footer) |
| `Dra. Mariana Villaseñor Rangel` | Nombre real de la dentista |
| `523312345678` | WhatsApp real: 52 + LADA + número, sin espacios ni signos |
| `+52 33 1234 5678` | El mismo, formateado para lectura |
| `Av. Américas 1254, interior 302` | Calle y número reales |
| `Providencia` | Colonia real |
| `44630` | Código postal real |
| `Guadalajara` / `Jalisco` | Ciudad y estado reales |
| `20.6897` / `-103.3918` | Coordenadas reales (clic derecho en Google Maps → copiar) |
| `0000000` | Cédula profesional y cédula de especialidad reales |
| `https://clinicadentalaurora.mx` | Dominio real |
| `contacto@clinicadentalaurora.mx` | Correo real |
| `2012` / `foundingDate` | Año real de apertura |
| `4.9` / `187` | Calificación y número de reseñas **reales de Google** |

**No inventes el `aggregateRating`.** Si el cliente no tiene reseñas verificables en
Google, borra el bloque `aggregateRating` del JSON-LD y cambia el H2 de la sección de
testimonios. Un rating falso en datos estructurados es motivo de penalización manual
de Google y, en salud, un problema de PROFECO.

Lo mismo aplica a los **precios**: los de la demo ($12,000 / $3,500) son de referencia
de mercado. Confírmalos con el cliente o quítalos — aparecen en las tarjetas, en el
FAQ, en el JSON-LD y en `llms.txt`.

---

## 5. PENDIENTE 3 — Skills de diseño que no estaban disponibles

El usuario pidió usar **frontend design, ux-ui pro max, shadcn y web guidelines**.
Ninguna de las cuatro está instalada en la sesión donde se construyó esto; se trabajó
con los fundamentos de diseño de artifacts. **Si esas skills están disponibles en tu
sesión, pásale la página por encima** y aplica lo que corresponda:

- **web guidelines** — auditoría de accesibilidad y semántica. Ya está: un solo H1,
  jerarquía h1→h2→h3 correcta, `lang="es-MX"`, `aria-expanded` en nav y FAQ, slider
  con `role="slider"` y teclado, foco visible, sin scroll horizontal, cero errores de
  consola. Verifica lo que se me haya escapado.
- **ux-ui pro max / frontend design** — segunda pasada sobre jerarquía visual,
  microcopy de los CTA y orden de las secciones.
- **shadcn** — **no aplica tal cual**: el entregable es HTML estático sin React. Si el
  cliente pide después un panel de administración o un blog, ahí sí conviene migrar a
  Next.js + Tailwind + shadcn/ui reusando este sistema de tokens (los nombres de
  variables CSS mapean casi 1:1 a un `theme.css` de shadcn).

---

## 6. PENDIENTE 4 — Google Maps

En la sección `#contacto`, sustituir el `<p class="hueco">` dentro de `.lugar__mapa` por:

```html
<iframe src="https://www.google.com/maps/embed?pb=[CÓDIGO_DEL_CLIENTE]"
        title="Ubicación de [nombre del consultorio] en [ciudad]"
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen></iframe>
```
Se obtiene en Google Maps → Compartir → Insertar un mapa → HTML.

Para no cargar Google en el primer render (mejora LCP y evita cookies de terceros),
lo ideal es una imagen estática del mapa que al hacer clic sustituya el `<iframe>`.

---

## 7. PENDIENTE 5 — GEO y SEO fuera del sitio

Lo que está **dentro** del sitio ya se hizo:

- `<title>` con servicio + ciudad, meta description de 155 caracteres, canonical,
  `robots` con `max-snippet:-1` y `max-image-preview:large`, Open Graph y Twitter Card
  completos, `geo.region` / `geo.position` / ICBM.
- **JSON-LD `@graph`** con 6 nodos enlazados por `@id`: `Dentist`+`MedicalBusiness`+
  `LocalBusiness`, `Dentist` (la profesional, con `hasCredential`), `WebSite`,
  `WebPage`, `BreadcrumbList` y **`FAQPage` con 7 preguntas**. Incluye
  `openingHoursSpecification`, `areaServed`, `makesOffer` con `MedicalProcedure`,
  y `potentialAction` de tipo `ReserveAction` apuntando a WhatsApp.
- **Optimización para respuestas de IA**: cada respuesta del FAQ abre con la
  conclusión en negrita y una cifra concreta (así se extrae limpia como snippet), los
  encabezados están escritos como las preguntas que la gente teclea, y hay un
  `llms.txt` con los datos verificables, precios y respuestas en texto plano.
- `robots.txt` permite explícitamente GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
  Google-Extended y meta-externalagent. **Esto es deliberado**: bloquearlos deja al
  consultorio fuera de las respuestas cuando alguien pregunta a un modelo por un
  dentista en la ciudad.

Lo que falta y **vale más que cualquier cosa del código** para un negocio local:

1. **Google Business Profile** — reclamarlo y completarlo al 100%: categoría primaria
   "Dentista", secundarias "Ortodoncista" y "Clínica dental estética", horario, fotos
   reales (mínimo 20), servicios con descripción, y el enlace de WhatsApp. **Los datos
   NAP (nombre, dirección, teléfono) deben coincidir carácter por carácter con el
   JSON-LD del sitio.** Un dígito distinto rompe la coincidencia de entidad.
2. **Publicaciones semanales** en el perfil de Google (Google las indexa).
3. **Pedir reseñas de forma sistemática** — plantilla de WhatsApp post-cita con el
   enlace directo a reseñar. Es el factor #1 del ranking local.
4. **Citations / directorios MX**: Doctoralia, Sección Amarilla, Directorio Médico,
   Yelp MX, Waze, Apple Business Connect, Bing Places. Mismo NAP en todos.
5. **Contenido para las consultas largas**: cuando haya presupuesto, un blog con una
   entrada por duda real ("cuánto cuesta ponerse brackets en [ciudad]", "brackets vs
   alineadores", "cuánto dura un blanqueamiento"). Es lo que alimenta tanto Google
   como las respuestas de los modelos.
6. **Search Console y Bing Webmaster Tools** — verificar dominio y mandar el sitemap.
7. **Verificar los datos estructurados** en `search.google.com/test/rich-results`
   antes de dar por cerrada la entrega.

---

## 8. PENDIENTE 6 — Despliegue y medición

1. **Hosting**: Vercel o Netlify, arrastrando la carpeta. Es estático, no necesita
   Node ni build. Configurar el dominio del cliente y forzar HTTPS.
2. **Cabeceras** (`vercel.json` o `_headers`):
   - `Cache-Control: public, max-age=31536000, immutable` para `/assets`, `/css`, `/js`
   - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
   - CSP permitiendo `cdnjs.cloudflare.com` (anime.js) y `fonts.googleapis.com` /
     `fonts.gstatic.com`
3. **Autohospedar anime.js** (opcional, mejora el LCP y elimina una dependencia
   externa): `npm pack animejs@3.2.2`, copiar `lib/anime.min.js` a `js/` y cambiar el
   `<script src>`. Son 17 KB.
4. **Autohospedar las fuentes** con `@fontsource-variable/fraunces`, `@fontsource/manrope`
   y `@fontsource/ibm-plex-mono` si se quiere eliminar la petición a Google Fonts
   (relevante para GDPR y para el TTFB desde México).
5. **Medición**: Google Analytics 4 + Meta Pixel. **Evento clave**: clic en cualquier
   `a[href^="https://wa.me/"]`. Un solo listener delegado los captura todos y ya viene
   etiquetado con `data-wa` (`hero`, `ortodoncia`, `blanqueamiento`, `rehabilitacion`,
   `faq`, `cierre`, `flotante`…), así se sabe **qué sección genera los leads**:
   ```js
   document.addEventListener('click', e => {
     const a = e.target.closest('a[href^="https://wa.me/"]');
     if (a) gtag('event', 'clic_whatsapp', { origen: a.dataset.wa });
   });
   ```
6. **Lighthouse** en móvil antes de entregar. Objetivo ≥95 en Performance con las
   imágenes ya optimizadas, y 100 en Accesibilidad, Buenas prácticas y SEO.

---

## 9. Ideas para una segunda fase (venta adicional de Mattera)

Esto es una landing; el servicio de Mattera empieza donde termina:

- **Chatbot de WhatsApp con IA** que califique al paciente antes de que la doctora
  conteste (motivo de consulta, urgencia, presupuesto) y agende solo. Es exactamente
  el producto de Mattera y el sitio ya está mandando todo el tráfico a WhatsApp.
- **Recordatorios automáticos de cita** — el ausentismo es el dolor #1 de un
  consultorio dental. Un recordatorio 24 h antes por WhatsApp recupera ingresos reales
  y es fácil de justificar en pesos.
- **CRM simple de pacientes** con seguimiento de tratamientos en curso y avisos de
  reactivación a los 6 meses (limpieza) y al año.
- **Páginas de aterrizaje por tratamiento** (`/ortodoncia`, `/blanqueamiento`) para
  campañas de Meta Ads segmentadas: mismo diseño, copy y CTA específicos, mejor
  Quality Score y mejor SEO de cola larga.

---

## 10. Cómo verificar tu trabajo cuando termines

```bash
python3 build-preview.py       # regenera preview/index.html tras cualquier cambio
```
Checklist antes de entregar al cliente:

- [ ] Los 12 enlaces de WhatsApp abren el número real con el mensaje correcto
- [ ] No queda ningún `.hueco` ni `comparador__vacio` visible
- [ ] Búsqueda de `Aurora`, `1234 5678`, `0000000` y `44630` en el proyecto: 0 resultados
- [ ] Rich Results Test sin errores
- [ ] Lighthouse móvil ≥95 / 100 / 100 / 100
- [ ] Probado en Safari iOS (el `backdrop-filter` del nav y el `pointer` del comparador)
- [ ] Modo oscuro del sistema activado: la página se lee bien
- [ ] `prefers-reduced-motion` activado: todo visible y sin movimiento
- [ ] Con JavaScript desactivado: el contenido y los enlaces de WhatsApp siguen ahí
