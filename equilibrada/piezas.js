/* Arma las listas que salen del catálogo. Corre antes que movimiento.js. */
(function () {
  var P = window.AR_PRODUCTOS, foto = window.AR.foto, buscar = window.AR.buscar;
  function $(s) { return document.querySelector(s); }
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }
  function img(f, alt, extra) { return '<img src="' + foto(f) + '" alt="' + (alt || '') + '" loading="lazy" width="853" height="1280"' + (extra || '') + '>'; }

  function tarjeta(p, h) {
    h = h || 'h3';
    return '<article class="prenda"><a class="prenda__in" href="#" data-producto="' + p.id + '" aria-label="' + p.nombre + ', ' + AR_precio(p.precio) + '">' +
      '<div class="prenda__foto">' + (p.etiqueta ? '<span class="etiqueta etiqueta--' + slug(p.etiqueta) + '">' + p.etiqueta + '</span>' : '') +
      img(p.fotos[0], p.nombre) + (p.fotos[1] ? img(p.fotos[1], '', ' aria-hidden="true"') : '') +
      '<span class="prenda__agregar" aria-hidden="true">Elegir talle <span>+</span></span></div>' +
      '<div class="prenda__datos"><' + h + ' class="prenda__nombre">' + p.nombre + '</' + h + '><p class="prenda__precio">' + AR_precio(p.precio) + '</p></div>' +
      '<div class="prenda__colores">' + p.colores.map(function (c) { return '<span class="muestra" style="--muestra:' + c + '"></span>'; }).join('') + '</div>' +
      '</a></article>';
  }
  function lista(sel, ids) {
    var el = $(sel);
    if (el) el.innerHTML = ids.map(function (id) { return tarjeta(buscar(id)); }).join('');
  }
  lista('[data-nuevo]', ['crepe-cruda', 'leon', 'drift-club', 'baggy-celeste']);
  lista('[data-basicos]', ['morley-arena', 'basica-blanca', 'rib']);

  /* Categorías: una baldosa de color suave por familia */
  var CATS = {
    remeras: { c: 'var(--cielo)', foto: 'f20' },
    camisas: { c: 'var(--oliva)', foto: 'f17' },
    musculosas: { c: 'var(--arena)', foto: 'f07' },
    jeans: { c: 'var(--tinta)', t: 'var(--crema)', foto: 'f11' }
  };
  var cats = $('[data-cats]');
  if (cats) cats.innerHTML = AR_CATEGORIAS.map(function (c) {
    var n = P.filter(function (p) { return p.cat === c.id; }).length, d = CATS[c.id];
    return '<div class="cat"><a class="cat__in" href="catalogo.html?cat=' + c.id + '" style="--c:' + d.c + (d.t ? ';--t:' + d.t : '') + '">' +
      '<div class="cat__cabeza"><div><h3 class="cat__nombre">' + c.nombre + '</h3><span class="cat__cuenta">' + n + ' modelos</span></div>' +
      '<span class="cat__flecha" aria-hidden="true">→</span></div>' +
      '<span class="cat__foto">' + img(d.foto) + '</span></a></div>';
  }).join('');

  /* Catálogo */
  var grilla = $('[data-grilla]');
  if (grilla) {
    var pest = $('[data-pestanas]'), orden = $('[data-orden]'), cuenta = $('[data-cuenta]');
    var pedida = new URLSearchParams(location.search).get('cat');
    var activa = AR_CATEGORIAS.some(function (c) { return c.id === pedida; }) ? pedida : 'todo';
    pest.innerHTML = [{ id: 'todo', nombre: 'Todo' }].concat(AR_CATEGORIAS).map(function (c) {
      var n = c.id === 'todo' ? P.length : P.filter(function (p) { return p.cat === c.id; }).length;
      return '<button class="pestana" type="button" data-filtro="' + c.id + '" aria-pressed="' + (c.id === activa) + '">' + c.nombre + ' <small>' + n + '</small></button>';
    }).join('');

    var pintar = function () {
      var l = P.filter(function (p) { return activa === 'todo' || p.cat === activa; }).slice();
      if (orden.value === 'menor') l.sort(function (a, b) { return a.precio - b.precio; });
      if (orden.value === 'mayor') l.sort(function (a, b) { return b.precio - a.precio; });
      grilla.innerHTML = l.map(function (p) { return tarjeta(p, 'h2'); }).join('');
      cuenta.textContent = l.length + (l.length === 1 ? ' prenda' : ' prendas') + ' · en el local hay más de 300 modelos';
    };
    pintar();

    var ocupado = false;
    var cambiar = function () {
      if (ocupado) return;
      ocupado = true;
      grilla.classList.add('cambiando');
      var reserva;
      var listo = function (ev) {
        if (ev && ev.target !== grilla) return;
        grilla.removeEventListener('transitionend', listo);
        clearTimeout(reserva);
        pintar();
        requestAnimationFrame(function () {
          grilla.classList.remove('cambiando');
          ocupado = false;
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
      };
      reserva = setTimeout(listo, 600);
      grilla.addEventListener('transitionend', listo);
    };
    pest.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filtro]');
      if (!b || ocupado || b.getAttribute('data-filtro') === activa) return;
      activa = b.getAttribute('data-filtro');
      pest.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      try { history.replaceState(null, '', activa === 'todo' ? 'catalogo.html' : 'catalogo.html?cat=' + activa); } catch (err) {}
      cambiar();
    });
    orden.addEventListener('change', cambiar);
  }

  /* El contador del carrito avisa con un pulso */
  document.addEventListener('ar:agregado', function () {
    var b = $('.cabeza__carrito');
    if (!b) return;
    b.classList.add('salto');
    setTimeout(function () { b.classList.remove('salto'); }, 500);
  });
})();
