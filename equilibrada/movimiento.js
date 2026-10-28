/* Movimiento de la variante equilibrada: la calma de la minimal más tres gestos
   de la divertida (sello que gira, banda que corre, collage con profundidad).
   La entrada y el scroll siempre van en elementos distintos. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var suave = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var arriba = window.scrollY < 40;
  var IO = 'sine.inOut', ENTRA = 'power3.inOut';
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  if (!suave && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    new MutationObserver(function () {
      if (document.documentElement.classList.contains('ar-bloqueado')) lenis.stop(); else lenis.start();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* Entrada de la página (solo si carga arriba) */
  if (arriba) {
    var e = gsap.timeline({ defaults: { ease: ENTRA } });
    e.from('[data-entra] .linea > span', { yPercent: 105, duration: 1.2, stagger: .1 })
      .from('[data-entra-suave]', { opacity: 0, y: 24, duration: 1, stagger: .08 }, .35);
    if ($('[data-entra-foto]')) e.fromTo('[data-entra-foto]', { clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.4 }, .1);
    if ($('[data-entra-chica]')) e.from('[data-entra-chica]', { y: 80, rotation: 6, opacity: 0, duration: 1.1 }, .7);
    if ($('[data-entra-chip]')) e.from('[data-entra-chip]', { y: 16, opacity: 0, duration: .8 }, 1.1);
    if ($('[data-entra-sello]')) e.from('[data-entra-sello]', { scale: .6, opacity: 0, duration: 1 }, .9);
  }

  /* Collage: la foto grande y la chica se mueven a distinto ritmo */
  $$('[data-paralaje]').forEach(function (im) {
    gsap.fromTo(im, { yPercent: -4, scale: 1.1 }, {
      yPercent: 6, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: im.parentNode, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  });
  var chica = $('[data-collage-chica]');
  if (chica) gsap.fromTo(chica, { y: 0 }, {
    y: -90, ease: 'none',
    scrollTrigger: { trigger: chica.parentNode, start: 'top top', end: 'bottom top', scrub: 1 }
  });

  /* Sellos: giran con el scroll, despacio */
  if (!suave) $$('[data-sello]').forEach(function (s) {
    gsap.fromTo(s, { rotation: 0 }, {
      rotation: 220, ease: 'none',
      scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });

  /* Banda: avanza con el scroll */
  var banda = $('[data-banda]');
  if (banda) gsap.fromTo(banda, { xPercent: 0 }, {
    xPercent: -20, ease: 'none',
    scrollTrigger: { trigger: banda.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  /* Máscaras que se abren con el scroll */
  $$('[data-revela]').forEach(function (m) {
    var im = $('img', m);
    var tl = gsap.timeline({ defaults: { ease: IO }, scrollTrigger: { trigger: m, start: 'top bottom', end: 'top 45%', scrub: 1 } });
    tl.fromTo(m, { clipPath: 'inset(14% 6% 0% 6% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)' }, 0)
      .fromTo(im, { scale: 1.18 }, { scale: 1 }, 0);
  });

  /* Títulos de sección: los renglones suben una vez */
  $$('[data-titulo]').forEach(function (t) {
    gsap.from($$('.linea > span', t), {
      yPercent: 105, duration: 1.1, stagger: .08, ease: ENTRA,
      scrollTrigger: { trigger: t, start: 'top 88%', once: true }
    });
  });

  /* Truco: una sola raya tacha el «no» */
  var trazo = $('[data-trazo]');
  if (trazo) {
    var largo = trazo.getTotalLength();
    gsap.fromTo(trazo, { strokeDasharray: largo, strokeDashoffset: largo }, {
      strokeDashoffset: 0, ease: IO,
      scrollTrigger: { trigger: '[data-truco]', start: 'top 80%', end: 'top 45%', scrub: 1 }
    });
  }

  /* Categorías: suben con un leve escalonado */
  var cats = $$('.cat');
  if (cats.length) {
    gsap.set(cats, { opacity: 0, y: 50 });
    ScrollTrigger.batch(cats, {
      start: 'top 92%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .09, ease: ENTRA, overwrite: true }); }
    });
  }

  /* Prendas */
  var prendas = $$('.prenda');
  if (prendas.length) {
    gsap.set(prendas, { opacity: 0, y: 30 });
    ScrollTrigger.batch(prendas, {
      start: 'top 94%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .9, stagger: .07, ease: ENTRA, overwrite: true }); }
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
