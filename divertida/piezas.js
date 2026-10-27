/* Arma las partes que salen del catálogo (categorías, drop, abanico, quiz, grilla).
   Corre antes que movimiento.js para que las escenas encuentren el DOM armado. */
(function () {
  var P = window.AR_PRODUCTOS, foto = window.AR.foto, buscar = window.AR.buscar;
  function $(s) { return document.querySelector(s); }
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }
  function etiqueta(p) { return p.etiqueta ? '<span class="etiqueta etiqueta--' + slug(p.etiqueta) + '">' + p.etiqueta + '</span>' : ''; }
  function img(f, alt, extra) { return '<img src="' + foto(f) + '" alt="' + (alt || '') + '" loading="lazy" width="853" height="1280"' + (extra || '') + '>'; }

  var CATS = {
    remeras: { c: 'var(--cielo)', foto: 'f20' },
    camisas: { c: 'var(--oliva)', foto: 'f17' },
    musculosas: { c: 'var(--naranja)', foto: 'f07' },
    jeans: { c: 'var(--cobalto)', t: 'var(--crema)', foto: 'f11' }
  };

  var cats = $('[data-cats]');
  if (cats) cats.innerHTML = AR_CATEGORIAS.map(function (c) {
    var n = P.filter(function (p) { return p.cat === c.id; }).length, d = CATS[c.id];
    return '<div class="cat"><a class="cat__in" href="catalogo.html?cat=' + c.id + '" style="--c:' + d.c + (d.t ? ';--t:' + d.t : '') + '">' +
      '<h3 class="cat__nombre">' + c.nombre + '</h3><span class="cat__cuenta">' + n + ' modelos para ver</span>' +
      '<span class="cat__flecha" aria-hidden="true">→</span>' +
      '<span class="cat__foto">' + img(d.foto) + '</span></a></div>';
  }).join('');

  var pista = $('[data-drop-pista]');
  if (pista) {
    pista.innerHTML = ['drift-club', 'leon', 'crepe-cruda', 'baggy-celeste', 'three-time', 'calada-oliva'].map(function (id) {
      var p = buscar(id);
      return '<div class="tarjeta-drop"><div class="tarjeta-drop__escala"><a class="tarjeta-drop__in" href="#" data-producto="' + p.id + '">' +
        '<div class="tarjeta-drop__foto">' + etiqueta(p) + img(p.fotos[0], p.nombre) + '</div>' +
        '<div class="tarjeta-drop__datos"><span>' + p.nombre + '</span><strong>' + AR_precio(p.precio) + '</strong></div></a></div></div>';
    }).join('') +
      '<div class="tarjeta-drop__fin"><p>Hay +300 más en el local</p><a class="boton" href="catalogo.html">Ver el catálogo</a></div>';
  }

  var abanico = $('[data-abanico]');
  if (abanico) abanico.innerHTML = ['morley-arena', 'basica-blanca', 'emblema', 'rib'].map(function (id) {
    var p = buscar(id);
    return '<div class="abanico__carta"><a class="abanico__in" href="#" data-producto="' + p.id + '">' + img(p.fotos[0], p.nombre) +
      '<p><span>' + p.nombre + '</span><strong>' + AR_precio(p.precio) + '</strong></p></a></div>';
  }).join('');

  /* Quiz: las tres fotos están superpuestas y se cruzan con un fundido. */
  var vitrina = $('[data-vitrina]');
  if (vitrina) {
    var elegidas = ['three-time', 'concept-celeste', 'leon'], fondos = ['var(--naranja)', 'var(--cielo)', 'var(--oliva)'];
    vitrina.innerHTML = elegidas.map(function (id, i) {
      var p = buscar(id);
      return '<figure class="quiz__foto' + (i === 0 ? ' activa' : '') + '">' + img(p.fotos[0], p.nombre) +
        '<figcaption><span>' + p.nombre + ' · ' + AR_precio(p.precio) + '</span><a class="boton" href="#" data-producto="' + p.id + '" tabindex="' + (i === 0 ? 0 : -1) + '">La quiero</a></figcaption></figure>';
    }).join('');
    var quiz = $('[data-quiz]');
    quiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-op]');
      if (!b) return;
      var i = +b.getAttribute('data-op');
      quiz.style.setProperty('--q', fondos[i]);
      quiz.querySelectorAll('[data-op]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      vitrina.querySelectorAll('.quiz__foto').forEach(function (f, j) {
        f.classList.toggle('activa', j === i);
        f.querySelector('[data-producto]').tabIndex = j === i ? 0 : -1;
      });
    });
  }

  /* Grilla del catálogo */
  var grilla = $('[data-grilla]');
  if (grilla) {
    var filtros = $('[data-filtros]');
    var COLORES = { todo: ['var(--tinta)', 'var(--crema)'], remeras: ['var(--cielo)', 'var(--tinta)'], camisas: ['var(--oliva)', 'var(--tinta)'], musculosas: ['var(--naranja)', 'var(--tinta)'], jeans: ['var(--cobalto)', 'var(--crema)'] };
    var pedida = new URLSearchParams(location.search).get('cat');
    var activa = COLORES[pedida] ? pedida : 'todo';
    var lista = [{ id: 'todo', nombre: 'Todo' }].concat(AR_CATEGORIAS);
    filtros.innerHTML = lista.map(function (c) {
      var n = c.id === 'todo' ? P.length : P.filter(function (p) { return p.cat === c.id; }).length;
      return '<button class="filtro" type="button" data-filtro="' + c.id + '" aria-pressed="' + (c.id === activa) + '" style="--f:' + COLORES[c.id][0] + ';--ft:' + COLORES[c.id][1] + '">' + c.nombre + ' <small>' + n + '</small></button>';
    }).join('');

    var pintar = function () {
      grilla.innerHTML = P.filter(function (p) { return activa === 'todo' || p.cat === activa; }).map(function (p) {
        return '<article class="prenda"><a class="prenda__in" href="#" data-producto="' + p.id + '" aria-label="' + p.nombre + ', ' + AR_precio(p.precio) + '">' +
          '<div class="prenda__foto">' + etiqueta(p) + img(p.fotos[0], p.nombre) + (p.fotos[1] ? img(p.fotos[1], '', ' aria-hidden="true"') : '') +
          '<span class="prenda__mas" aria-hidden="true">+</span></div>' +
          '<div class="prenda__datos"><h2 class="prenda__nombre">' + p.nombre + '</h2><p class="prenda__precio">' + AR_precio(p.precio) + '</p></div>' +
          '<div class="prenda__colores">' + p.colores.map(function (c) { return '<span class="muestra" style="--muestra:' + c + '"></span>'; }).join('') + '</div>' +
          '</a></article>';
      }).join('');
    };
    pintar();

    var ocupado = false;
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filtro]');
      if (!b || ocupado || b.getAttribute('data-filtro') === activa) return;
      activa = b.getAttribute('data-filtro');
      filtros.querySelectorAll('[data-filtro]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      try { history.replaceState(null, '', activa === 'todo' ? 'catalogo.html' : 'catalogo.html?cat=' + activa); } catch (err) {}
      ocupado = true;
      grilla.classList.add('cambiando');
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
      var reserva = setTimeout(listo, 600);
      grilla.addEventListener('transitionend', listo);
    });
  }

  /* El carrito avisa con un saltito del contador. */
  document.addEventListener('ar:agregado', function () {
    var b = $('.cabeza__carrito');
    if (!b) return;
    b.classList.add('salto');
    setTimeout(function () { b.classList.remove('salto'); }, 500);
  });
})();
