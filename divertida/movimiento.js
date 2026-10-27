/* Escenas de scroll de la variante divertida.
   Reglas: todo con scrub e easings inOut, nada aparece de golpe, y la entrada
   nunca anima el mismo elemento que la escena de scroll. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var suave = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var arriba = window.scrollY < 40;
  var IO = 'sine.inOut';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* Scroll suave */
  if (!suave && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    var cerrar = new MutationObserver(function () {
      if (document.documentElement.classList.contains('ar-bloqueado')) lenis.stop(); else lenis.start();
    });
    cerrar.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- Portada: la foto hace zoom-in hasta llenar la pantalla ---------- */
  var hero = $('[data-hero]');
  if (hero) {
    var pin = $('.hero__pin', hero), card = $('[data-hero-foto]'), cardIn = $('.hero__foto-in', card), cardImg = $('img', card);
    var cubre = function () {
      return Math.max(pin.clientWidth / card.offsetWidth, pin.clientHeight / card.offsetHeight) * 1.04;
    };
    var tl = gsap.timeline({
      defaults: { ease: IO },
      scrollTrigger: { trigger: hero, pin: pin, start: 'top top', end: '+=150%', scrub: 1, invalidateOnRefresh: true }
    });
    tl.fromTo(card, { x: 0, y: 0, scale: 1, rotation: -5 }, {
      x: function () { return pin.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2); },
      y: function () { return pin.clientHeight / 2 - (card.offsetTop + card.offsetHeight / 2); },
      scale: cubre, rotation: 0, duration: .7
    }, 0)
      .fromTo(cardIn, { borderRadius: 22 }, { borderRadius: function () { return 22 / cubre(); }, duration: .7 }, 0)
      .fromTo(cardImg, { scale: 1 }, { scale: 1.12, duration: 1 }, 0);

    $$('[data-hero-titulo] .linea').forEach(function (l, i) {
      tl.fromTo(l, { xPercent: 0 }, { xPercent: -(70 + i * 25), duration: .6 }, i * .04);
    });
    $$('[data-sticker]').forEach(function (s) {
      var dx = parseFloat(s.getAttribute('data-dx')), dy = parseFloat(s.getAttribute('data-dy'));
      tl.fromTo(s, { x: 0, y: 0, scale: 1, rotation: 0 }, {
        x: function () { return dx * innerWidth * .5; },
        y: function () { return dy * innerHeight * .55; },
        scale: 1.7, rotation: suave ? 0 : dx * 24, duration: .65
      }, 0);
    });
    tl.fromTo('[data-hero-nota]', { x: 0 }, { x: function () { return -innerWidth * .6; }, duration: .5 }, 0)
      .fromTo('.hero__baja', { opacity: 1 }, { opacity: 0, duration: .15 }, 0)
      .fromTo('[data-hero-velo]', { opacity: 0 }, { opacity: 1, duration: .35 }, .6)
      .fromTo('[data-hero-cartel]', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .3 }, .68);

    /* Entrada al cargar arriba, en envoltorios que la escena no toca */
    var trazo = $('[data-hero-nota] path');
    var largo = trazo.getTotalLength();
    gsap.set(trazo, { strokeDasharray: largo, strokeDashoffset: arriba ? largo : 0 });
    if (arriba) {
      var e = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      e.from('[data-hero-titulo] .linea > span', { yPercent: 110, duration: 1, stagger: .12 })
        .from('.hero__foto-entra', { scale: .6, rotation: 8, opacity: 0, duration: 1.1 }, .15)
        .from('.sticker__entra', { scale: .3, opacity: 0, duration: .9, stagger: .1 }, .45)
        .to(trazo, { strokeDashoffset: 0, duration: 1.1 }, .9)
        .from('.hero__nota', { opacity: 0, duration: .6 }, .8);
    }
  }

  /* ---------- Bandas que corren en sentidos opuestos ---------- */
  $$('[data-banda]').forEach(function (b) {
    var dir = parseFloat(b.getAttribute('data-banda'));
    gsap.fromTo(b, { xPercent: dir < 0 ? 0 : -22 }, {
      xPercent: dir < 0 ? -22 : 0, ease: 'none',
      scrollTrigger: { trigger: b.closest('.bandas'), start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* ---------- Tarjetas que suben y se enderezan ---------- */
  function subir(sel, base) {
    $$(sel).forEach(function (c, i) {
      gsap.fromTo(c, { y: 110, scale: .86, rotation: suave ? 0 : (i % 2 ? 5 : -5) }, {
        y: 0, scale: 1, rotation: 0, ease: IO,
        scrollTrigger: { trigger: base ? c.parentNode : c, start: 'top bottom', end: 'top 55%', scrub: 1 }
      });
    });
  }
  subir('.cat');
  subir('.punto');

  /* ---------- Galería horizontal con zoom al pasar por el centro ---------- */
  var drop = $('[data-drop]');
  if (drop) {
    var pista = $('[data-drop-pista]', drop);
    var distancia = function () { return Math.max(0, pista.scrollWidth - innerWidth); };
    var mov = gsap.to(pista, {
      x: function () { return -distancia(); }, ease: 'none',
      scrollTrigger: { trigger: drop, pin: $('.drop__pin', drop), start: 'top top', end: function () { return '+=' + distancia(); }, scrub: 1, invalidateOnRefresh: true }
    });
    $$('.tarjeta-drop', pista).forEach(function (t, i) {
      var esc = $('.tarjeta-drop__escala', t), giro = suave ? 0 : (i % 2 ? 4 : -4);
      gsap.timeline({
        defaults: { ease: IO },
        scrollTrigger: { trigger: t, containerAnimation: mov, start: 'left right', end: 'right left', scrub: true }
      }).fromTo(esc, { scale: .78, rotation: giro, y: 30 }, { scale: 1.04, rotation: 0, y: 0, duration: 1 })
        .to(esc, { scale: .78, rotation: -giro, y: 30, duration: 1 });
    });
  }

  /* ---------- Truco: el marcador tacha el NO y los básicos se abren en abanico ---------- */
  var trazoNo = $('[data-trazo]');
  if (trazoNo) {
    var l = trazoNo.getTotalLength();
    gsap.fromTo(trazoNo, { strokeDasharray: l, strokeDashoffset: l }, {
      strokeDashoffset: 0, ease: IO,
      scrollTrigger: { trigger: '[data-truco]', start: 'top 70%', end: 'bottom 45%', scrub: 1 }
    });
  }
  var abanico = $('[data-abanico]');
  if (abanico) {
    var cartas = $$('.abanico__carta', abanico), n = cartas.length;
    var paso = function () {
      var w = cartas[0].offsetWidth;
      return Math.min(w * 1.08, (abanico.clientWidth - w) / (n - 1));
    };
    cartas.forEach(function (c, i) {
      var k = i - (n - 1) / 2;
      gsap.fromTo(c, { x: 0, y: 0, rotation: k * 3 }, {
        x: function () { return k * paso(); },
        y: Math.abs(k) * 26, rotation: suave ? 0 : k * 6, ease: IO,
        scrollTrigger: { trigger: abanico, start: 'top 85%', end: 'center 50%', scrub: 1, invalidateOnRefresh: true }
      });
    });
  }

  /* ---------- Local: las palabras se acomodan y el sello gira ---------- */
  $$('[data-local] span').forEach(function (s, i) {
    gsap.fromTo(s, { xPercent: [-18, 22, -12][i] || 0 }, {
      xPercent: 0, ease: IO,
      scrollTrigger: { trigger: '[data-local]', start: 'top bottom', end: 'bottom 55%', scrub: 1 }
    });
  });
  var sello = $('[data-sello]');
  if (sello && !suave) gsap.fromTo(sello, { rotation: 0 }, {
    rotation: 300, ease: 'none',
    scrollTrigger: { trigger: sello.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  /* ---------- Nosotros: la foto hace zoom-out hasta quedar como tarjeta ---------- */
  var nos = $('[data-nos]');
  if (nos) {
    var npin = $('.nos-hero__pin', nos), nfoto = $('.nos-hero__foto', nos);
    gsap.timeline({
      defaults: { ease: IO },
      scrollTrigger: { trigger: nos, pin: npin, start: 'top top', end: '+=110%', scrub: 1 }
    }).fromTo(nfoto, { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: function () { return innerWidth < 720 ? 'inset(16% 6% 16% 6% round 24px)' : 'inset(13% 24% 13% 24% round 28px)'; }, duration: 1 }, 0)
      .fromTo($('.nos-hero__tira', nfoto), { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
      .fromTo('.nos-hero__texto', { scale: 1 }, { scale: .8, duration: 1 }, 0);
    if (arriba) gsap.from('.nos-hero__texto h1, .nos-hero__texto p', { y: 60, opacity: 0, duration: 1, stagger: .15, ease: 'power2.inOut' });
  }
  $$('[data-paralaje]').forEach(function (f) {
    var v = parseFloat(f.getAttribute('data-paralaje'));
    gsap.fromTo(f, { y: v * 120 }, {
      y: -v * 120, ease: 'none',
      scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* ---------- Catálogo ---------- */
  if ($('.portada-cat') && arriba) {
    gsap.from('.portada-cat h1 .linea > span', { yPercent: 110, duration: 1, stagger: .12, ease: 'power2.inOut' });
    gsap.from('.portada-cat__nota, .portada-cat .bajada', { opacity: 0, y: 30, duration: .9, delay: .5, ease: 'power2.inOut' });
  }
  var prendas = $$('.prenda');
  if (prendas.length) {
    gsap.set(prendas, { opacity: 0, y: 50 });
    ScrollTrigger.batch(prendas, {
      start: 'top 92%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power2.inOut', overwrite: true }); }
    });
  }

  /* Medidas nuevas cuando terminan las fuentes, las imágenes o cambia el alto */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
