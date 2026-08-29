/* ============================================================
   Clínica Dental Aurora — interacción y motion
   Requiere anime.js 3.2.2 (cargado desde CDN en index.html)
   ============================================================ */
(function () {
  "use strict";

  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tieneAnime = typeof window.anime === "function";
  var NS = "http://www.w3.org/2000/svg";
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Enlaces de WhatsApp ---------- */
  function armarWhatsApp() {
    var cfg = window.CLINICA;
    if (!cfg || !cfg.whatsapp) return;
    $$("[data-wa]").forEach(function (a) {
      var clave = a.getAttribute("data-wa");
      var texto = (cfg.mensajes && cfg.mensajes[clave]) || cfg.mensajes.general || "";
      if (cfg.firmaOrigen) texto += cfg.firmaOrigen;
      a.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(texto);
    });
  }

  /* ---------- 2. Arcada dental del hero ---------- */
  function caminoDiente(w, h) {
    var hw = w / 2;
    return "M" + (-hw) + " " + (h * 0.12) +
           "C" + (-hw) + " " + (-h * 0.52) + "," + (-w * 0.34) + " " + (-h * 0.58) + ",0 " + (-h * 0.58) +
           "C" + (w * 0.34) + " " + (-h * 0.58) + "," + hw + " " + (-h * 0.52) + "," + hw + " " + (h * 0.12) +
           "C" + hw + " " + (h * 0.44) + "," + (w * 0.3) + " " + (h * 0.58) + ",0 " + (h * 0.58) +
           "C" + (-w * 0.3) + " " + (h * 0.58) + "," + (-hw) + " " + (h * 0.44) + "," + (-hw) + " " + (h * 0.12) + "Z";
  }

  function construirArcada() {
    var caja = $("#arcada");
    if (!caja) return null;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 560 470");
    svg.setAttribute("role", "presentation");
    svg.setAttribute("focusable", "false");

    /* Definiciones: degradados del esmalte */
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      '<linearGradient id="gEsmalte" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#FFFFFF"/>' +
        '<stop offset="55%" stop-color="#F2FAFC"/>' +
        '<stop offset="100%" stop-color="#D9EDF2"/>' +
      '</linearGradient>' +
      '<linearGradient id="gBrillo" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#FFFFFF" stop-opacity=".95"/>' +
        '<stop offset="60%" stop-color="#FFFFFF" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="gAura" cx="50%" cy="42%" r="55%">' +
        '<stop offset="0%" stop-color="#7FD9C0" stop-opacity=".40"/>' +
        '<stop offset="70%" stop-color="#0E9BB5" stop-opacity=".05"/>' +
        '<stop offset="100%" stop-color="#0E9BB5" stop-opacity="0"/>' +
      '</radialGradient>';
    svg.appendChild(defs);

    /* Aura */
    var aura = document.createElementNS(NS, "ellipse");
    aura.setAttribute("cx", "280"); aura.setAttribute("cy", "215");
    aura.setAttribute("rx", "250"); aura.setAttribute("ry", "215");
    aura.setAttribute("fill", "url(#gAura)");
    svg.appendChild(aura);

    /* Anillos concéntricos (capa de profundidad, giran con el scroll) */
    var anillos = document.createElementNS(NS, "g");
    anillos.setAttribute("class", "arcada__anillo");
    anillos.setAttribute("id", "anillos");
    [130, 175, 222].forEach(function (r, i) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", "280"); c.setAttribute("cy", "215");
      c.setAttribute("r", r);
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", "var(--agua)");
      c.setAttribute("stroke-width", "1");
      c.setAttribute("stroke-dasharray", i === 1 ? "3 12" : "2 16");
      c.setAttribute("opacity", "0.30");
      anillos.appendChild(c);
    });
    svg.appendChild(anillos);

    /* Arco guía de la arcada (la curva que se dibuja al cargar) */
    var guia = document.createElementNS(NS, "path");
    guia.setAttribute("id", "guiaArcada");
    guia.setAttribute("d", "M92 168C92 300 168 392 280 392S468 300 468 168");
    guia.setAttribute("fill", "none");
    guia.setAttribute("stroke", "var(--agua)");
    guia.setAttribute("stroke-width", "1.6");
    guia.setAttribute("stroke-linecap", "round");
    guia.setAttribute("opacity", ".32");
    svg.appendChild(guia);

    /* Dientes sobre una elipse — 14 piezas, arcada superior */
    var grupo = document.createElementNS(NS, "g");
    grupo.setAttribute("id", "dientes");
    var N = 14, cx = 280, cy = 232, rx = 188, ry = 168;
    var piezas = [];
    for (var i = 0; i < N; i++) {
      var t = (i / (N - 1)) * 2 - 1;                 // -1 .. 1
      var ang = t * 1.42;                            // ±81°
      var x = cx + rx * Math.sin(ang);
      var y = cy - ry * Math.cos(ang);
      var central = 1 - Math.abs(t);                 // 1 al centro, 0 en molares
      var w = 26 + (1 - central) * 20;               // molares más anchos
      var h = 62 - (1 - central) * 20;               // incisivos más altos
      /* Grupo exterior: posición fija por atributo transform.
         Grupo interior: el que anima anime.js con transform CSS —
         si se animara el exterior, el CSS pisaría el atributo y
         todas las piezas se apilarían en el origen. */
      var ext = document.createElementNS(NS, "g");
      ext.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + (ang * 180 / Math.PI).toFixed(1) + ")");
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "arcada__diente");
      g.setAttribute("opacity", quieto ? "1" : "0");
      ext.appendChild(g);

      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", caminoDiente(w, h));
      p.setAttribute("fill", "url(#gEsmalte)");
      p.setAttribute("stroke", "var(--agua)");
      p.setAttribute("stroke-width", "1.1");
      p.setAttribute("stroke-opacity", ".45");
      g.appendChild(p);

      /* Reflejo de esmalte */
      var b = document.createElementNS(NS, "path");
      b.setAttribute("class", "arcada__brillo");
      b.setAttribute("d", caminoDiente(w * 0.5, h * 0.55));
      b.setAttribute("transform", "translate(" + (-w * 0.16) + "," + (-h * 0.1) + ")");
      b.setAttribute("fill", "url(#gBrillo)");
      g.appendChild(b);

      /* Bracket en las 6 piezas anteriores — el detalle de ortodoncia */
      if (Math.abs(t) < 0.45) {
        var br = document.createElementNS(NS, "rect");
        br.setAttribute("class", "bracket");
        br.setAttribute("x", (-5.5).toString()); br.setAttribute("y", (-6).toString());
        br.setAttribute("width", "11"); br.setAttribute("height", "12"); br.setAttribute("rx", "3");
        br.setAttribute("fill", "none");
        br.setAttribute("stroke", "var(--agua)");
        br.setAttribute("stroke-width", "1.6");
        br.setAttribute("opacity", quieto ? ".85" : "0");
        g.appendChild(br);
      }

      grupo.appendChild(ext);
      piezas.push(g);
    }
    svg.appendChild(grupo);

    /* Arco de ortodoncia que une los brackets */
    var arco = document.createElementNS(NS, "path");
    arco.setAttribute("id", "arcoOrto");
    arco.setAttribute("d", "M196 92C232 74 328 74 364 92");
    arco.setAttribute("fill", "none");
    arco.setAttribute("stroke", "var(--menta)");
    arco.setAttribute("stroke-width", "2.4");
    arco.setAttribute("stroke-linecap", "round");
    svg.appendChild(arco);

    caja.insertBefore(svg, caja.firstChild);
    return { svg: svg, piezas: piezas, guia: guia, arco: arco, anillos: anillos };
  }

  /* ---------- 3. Secuencia de entrada ---------- */
  function entrada(arcada) {
    var lineas = $$(".hero h1 .linea > span");
    var sueltos = $$("[data-anim]");

    if (quieto || !tieneAnime) {
      lineas.forEach(function (l) { l.style.transform = "none"; l.style.opacity = 1; });
      sueltos.forEach(function (e) { e.style.opacity = 1; });
      return;
    }

    lineas.forEach(function (l) { l.style.transform = "translateY(105%)"; });
    sueltos.forEach(function (e) { e.style.opacity = 0; });
    $$(".chip").forEach(function (c) { c.style.opacity = 0; });

    var tl = anime.timeline({ easing: "cubicBezier(.22,1,.36,1)" });

    tl.add({
      targets: "[data-anim='insignia']",
      opacity: [0, 1], translateY: [14, 0], duration: 700
    })
    .add({
      targets: lineas,
      translateY: ["105%", "0%"],
      duration: 1150,
      delay: anime.stagger(105)
    }, "-=420")
    .add({
      targets: "[data-anim='parrafo'], [data-anim='acciones'], [data-anim='datos']",
      opacity: [0, 1], translateY: [22, 0], duration: 850, delay: anime.stagger(110)
    }, "-=700");

    if (arcada) {
      /* La curva de la arcada se dibuja trazo a trazo */
      var largo = arcada.guia.getTotalLength();
      arcada.guia.setAttribute("stroke-dasharray", largo);
      arcada.guia.setAttribute("stroke-dashoffset", largo);
      var largoArco = arcada.arco.getTotalLength();
      arcada.arco.setAttribute("stroke-dasharray", largoArco);
      arcada.arco.setAttribute("stroke-dashoffset", largoArco);

      tl.add({
        targets: arcada.guia,
        strokeDashoffset: [largo, 0],
        duration: 1400, easing: "easeInOutSine"
      }, 260)
      .add({
        targets: arcada.piezas,
        opacity: [0, 1],
        scale: [0.55, 1],
        translateY: [10, 0],
        duration: 780,
        delay: anime.stagger(52, { from: "center" })
      }, "-=1000")
      .add({
        targets: ".bracket",
        opacity: [0, .85],
        scale: [0.3, 1],
        duration: 520,
        delay: anime.stagger(45, { from: "center" })
      }, "-=380")
      .add({
        targets: arcada.arco,
        strokeDashoffset: [largoArco, 0],
        duration: 780, easing: "easeInOutQuad"
      }, "-=300");
    }

    tl.add({
      targets: ".chip",
      opacity: [0, 1], translateY: [16, 0], scale: [.9, 1],
      duration: 700, delay: anime.stagger(130)
    }, "-=500");

    /* Flotación permanente de los chips */
    $$(".chip").forEach(function (c, i) {
      anime({
        targets: c, translateY: [0, -9], direction: "alternate", loop: true,
        duration: 2600 + i * 450, easing: "easeInOutSine", delay: i * 300
      });
    });
  }

  /* ---------- 4. Parallax y luz del hero ---------- */
  function parallaxHero(arcada) {
    if (quieto) return;
    var hero = $(".hero");
    var esmalte = $("#esmalte");
    var caja = $("#arcada");
    if (!hero) return;

    var destinoX = 0, destinoY = 0, actualX = 0, actualY = 0, activo = false;

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      if (esmalte) {
        esmalte.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        esmalte.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      }
      destinoX = (px - 0.5) * 26;
      destinoY = (py - 0.5) * 20;
      if (!activo) { activo = true; requestAnimationFrame(seguir); }
    });

    function seguir() {
      actualX += (destinoX - actualX) * 0.08;
      actualY += (destinoY - actualY) * 0.08;
      if (caja) caja.style.transform = "translate3d(" + actualX.toFixed(2) + "px," + actualY.toFixed(2) + "px,0)";
      if (Math.abs(destinoX - actualX) > 0.05 || Math.abs(destinoY - actualY) > 0.05) {
        requestAnimationFrame(seguir);
      } else { activo = false; }
    }
  }

  /* ---------- 5. Scroll: progreso, nav, parallax de capas ---------- */
  function scrollGlobal(arcada) {
    var barra = $("#progreso");
    var nav = $("#nav");
    var wa = $("#waFlota");
    var malla = $(".hero__malla");
    var aura = $("#aura");
    var pendiente = false;

    function pintar() {
      pendiente = false;
      var y = window.scrollY || window.pageYOffset;
      var alto = document.documentElement.scrollHeight - window.innerHeight;
      var p = alto > 0 ? Math.min(y / alto, 1) : 0;

      if (barra) barra.style.transform = "scaleX(" + p + ")";
      if (nav) nav.classList.toggle("pegado", y > 40);
      if (wa) wa.classList.toggle("dentro", y > 520);

      if (!quieto) {
        if (malla) malla.style.transform = "translate3d(0," + (y * 0.22).toFixed(1) + "px,0)";
        if (arcada && arcada.anillos && y < window.innerHeight * 1.4) {
          arcada.anillos.style.transform = "rotate(" + (y * 0.06).toFixed(2) + "deg)";
        }
        if (aura) aura.style.setProperty("--auraY", (55 + p * 25).toFixed(0) + "%");
      }
    }

    function alScroll() { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    pintar();
  }

  /* ---------- 6. Revelado por scroll ---------- */
  function revelados() {
    var elementos = $$(".revelar");
    if (quieto || !("IntersectionObserver" in window)) {
      elementos.forEach(function (e) { e.classList.add("visible"); });
      $$(".paso").forEach(function (e) { e.classList.add("visible"); });
      return;
    }

    elementos.forEach(function (e) { e.style.transition = "opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)"; });

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var hermanos = Array.prototype.slice.call(el.parentElement.children).filter(function (n) {
          return n.classList.contains("revelar");
        });
        var idx = Math.max(0, hermanos.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 90, 360) + "ms";
        el.classList.add("visible");
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    elementos.forEach(function (e) { obs.observe(e); });
  }

  /* ---------- 7. Contadores ---------- */
  function contadores() {
    var nodos = $$("[data-contador]");
    if (!nodos.length) return;
    if (quieto || !tieneAnime || !("IntersectionObserver" in window)) {
      nodos.forEach(function (n) {
        var dec = parseInt(n.dataset.decimal || "0", 10);
        n.textContent = parseFloat(n.dataset.contador).toFixed(dec) + (n.dataset.sufijo || "");
      });
      return;
    }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        var dec = parseInt(n.dataset.decimal || "0", 10);
        var fin = parseFloat(n.dataset.contador);
        var suf = n.dataset.sufijo || "";
        anime({
          targets: { v: 0 }, v: fin, duration: 1700, easing: "easeOutExpo",
          update: function (a) {
            var v = a.animatables[0].target.v;
            n.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("es-MX")) + suf;
          }
        });
        obs.unobserve(n);
      });
    }, { threshold: 0.35 });
    nodos.forEach(function (n) { obs.observe(n); });
  }

  /* ---------- 8. Línea del proceso dibujada por scroll ---------- */
  function lineaProceso() {
    var base = $("#rutaProceso");
    var seccion = $(".proceso__lienzo");
    if (!base || !seccion || quieto) return;

    var trazo = base.cloneNode(false);
    trazo.removeAttribute("id");
    trazo.setAttribute("stroke-dasharray", "");
    trazo.setAttribute("stroke-width", "2.6");
    trazo.setAttribute("opacity", "1");
    base.parentNode.appendChild(trazo);

    var largo = trazo.getTotalLength();
    trazo.style.strokeDasharray = largo;
    trazo.style.strokeDashoffset = largo;

    var pendiente = false;
    function pintar() {
      pendiente = false;
      var r = seccion.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      trazo.style.strokeDashoffset = largo * (1 - p);
    }
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener("resize", pintar);
    pintar();

    /* Nodos que se encienden */
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
      }, { threshold: 0.4 });
      $$(".paso").forEach(function (p) { obs.observe(p); });
    }
  }

  /* ---------- 9. Comparador antes / después ---------- */
  function comparador() {
    var caja = $("#comparador");
    var tirador = $("#tirador");
    if (!caja || !tirador) return;
    var arrastrando = false;

    function poner(pct) {
      pct = Math.max(2, Math.min(98, pct));
      caja.style.setProperty("--corte", pct + "%");
      tirador.setAttribute("aria-valuenow", Math.round(pct));
    }
    function desdeEvento(e) {
      var r = caja.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      poner((x / r.width) * 100);
    }

    caja.addEventListener("pointerdown", function (e) {
      arrastrando = true; caja.setPointerCapture(e.pointerId); desdeEvento(e);
    });
    caja.addEventListener("pointermove", function (e) { if (arrastrando) desdeEvento(e); });
    caja.addEventListener("pointerup", function () { arrastrando = false; });
    caja.addEventListener("pointercancel", function () { arrastrando = false; });

    tirador.addEventListener("keydown", function (e) {
      var actual = parseFloat(tirador.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft")  { poner(actual - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { poner(actual + 4); e.preventDefault(); }
      if (e.key === "Home")       { poner(2);  e.preventDefault(); }
      if (e.key === "End")        { poner(98); e.preventDefault(); }
    });

    /* Al entrar en pantalla, el tirador se mueve solo una vez para invitar al gesto */
    if (!quieto && tieneAnime && "IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          anime({
            targets: { v: 50 }, v: [50, 78, 26, 50], duration: 2600, easing: "easeInOutQuad",
            update: function (a) { poner(a.animatables[0].target.v); }
          });
          obs.unobserve(en.target);
        });
      }, { threshold: 0.5 });
      obs.observe(caja);
    }
    poner(50);
  }

  /* ---------- 10. Acordeón de preguntas ---------- */
  function acordeon() {
    $$("#faq .faq__item").forEach(function (item) {
      var btn = $(".faq__boton", item);
      var panel = $(".faq__panel", item);
      if (!btn || !panel) return;

      btn.addEventListener("click", function () {
        var abierto = item.classList.contains("abierto");

        /* Cierra los demás */
        $$("#faq .faq__item.abierto").forEach(function (otro) {
          if (otro === item) return;
          otro.classList.remove("abierto");
          $(".faq__boton", otro).setAttribute("aria-expanded", "false");
          animarAltura($(".faq__panel", otro), 0);
        });

        item.classList.toggle("abierto", !abierto);
        btn.setAttribute("aria-expanded", String(!abierto));
        animarAltura(panel, abierto ? 0 : panel.firstElementChild.offsetHeight);
      });
    });

    function animarAltura(panel, destino) {
      if (quieto || !tieneAnime) { panel.style.height = destino ? "auto" : "0px"; return; }
      anime.remove(panel);
      anime({
        targets: panel, height: destino, duration: 480, easing: "cubicBezier(.22,1,.36,1)",
        complete: function () { if (destino) panel.style.height = "auto"; }
      });
    }
  }

  /* ---------- 11. Luz que sigue el cursor en las tarjetas ---------- */
  function luzTarjetas() {
    if (quieto) return;
    $$("[data-luz]").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--px", (e.clientX - r.left) + "px");
        t.style.setProperty("--py", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- 12. Navegación ---------- */
  function navegacion() {
    var hamb = $("#hamb"), menu = $("#menu");
    if (hamb && menu) {
      hamb.addEventListener("click", function () {
        var abierto = menu.classList.toggle("abierto");
        hamb.setAttribute("aria-expanded", String(abierto));
        hamb.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        document.body.style.overflow = abierto ? "hidden" : "";
      });
      $$(".nav__link, .nav__menu .btn", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("abierto");
          hamb.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
    var anio = $("#anio");
    if (anio) anio.textContent = new Date().getFullYear();
  }

  /* ---------- 13. Marquesina duplicada ---------- */
  function marquesina() {
    var pista = $("#tira");
    if (!pista || !pista.firstElementChild) return;
    pista.appendChild(pista.firstElementChild.cloneNode(true));
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    armarWhatsApp();
    navegacion();
    marquesina();
    var arcada = construirArcada();
    entrada(arcada);
    parallaxHero(arcada);
    scrollGlobal(arcada);
    revelados();
    contadores();
    lineaProceso();
    comparador();
    acordeon();
    luzTarjetas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else { iniciar(); }
})();
