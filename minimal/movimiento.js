/* Movimiento de la variante minimal: pocas cosas, lentas y continuas.
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
      .from('[data-entra-suave]', { opacity: 0, y: 24, duration: 1, stagger: .08 }, .35)
      .fromTo('[data-entra-foto]', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 }, .1);
  }

  /* Foto de portada: paralaje leve */
  $$('[data-paralaje]').forEach(function (im) {
    gsap.fromTo(im, { yPercent: -4, scale: 1.1 }, {
      yPercent: 6, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: im.parentNode, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  });

  /* Máscaras que se abren con el scroll */
  $$('[data-revela]').forEach(function (m) {
    var im = $('img', m);
    var tl = gsap.timeline({ defaults: { ease: IO }, scrollTrigger: { trigger: m, start: 'top bottom', end: 'top 45%', scrub: 1 } });
    tl.fromTo(m, { clipPath: 'inset(14% 6% 0% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      .fromTo(im, { scale: 1.18 }, { scale: 1 }, 0);
  });

  /* Títulos de sección: los renglones suben una vez */
  $$('[data-titulo]').forEach(function (t) {
    gsap.from($$('.linea > span', t), {
      yPercent: 105, duration: 1.1, stagger: .08, ease: ENTRA,
      scrollTrigger: { trigger: t, start: 'top 88%', once: true }
    });
  });

  /* Prendas */
  var prendas = $$('.prenda');
  if (prendas.length) {
    gsap.set(prendas, { opacity: 0, y: 30 });
    ScrollTrigger.batch(prendas, {
      start: 'top 94%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .9, stagger: .07, ease: ENTRA, overwrite: true }); }
    });
  }

  /* Foto que sigue al cursor en el índice */
  var flot = window.AR_flotante;
  if (flot && matchMedia('(hover: hover)').matches) {
    gsap.set(flot, { xPercent: -50, yPercent: -50 });
    var vx = gsap.quickTo(flot, 'x', { duration: suave ? .2 : .7, ease: 'power3' });
    var vy = gsap.quickTo(flot, 'y', { duration: suave ? .2 : .7, ease: 'power3' });
    addEventListener('mousemove', function (ev) { vx(ev.clientX + 140); vy(ev.clientY); });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
