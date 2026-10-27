/* Arma las listas que salen del catálogo. Corre antes que movimiento.js. */
(function () {
  var P = window.AR_PRODUCTOS, foto = window.AR.foto, buscar = window.AR.buscar;
  function $(s) { return document.querySelector(s); }
  function img(f, alt, extra) { return '<img src="' + foto(f) + '" alt="' + (alt || '') + '" loading="lazy" width="853" height="1280"' + (extra || '') + '>'; }

  function tarjeta(p, h) {
    h = h || 'h3';
    return '<article class="prenda"><a class="prenda__in" href="#" data-producto="' + p.id + '" aria-label="' + p.nombre + ', ' + AR_precio(p.precio) + '">' +
      '<div class="prenda__foto">' + (p.etiqueta ? '<span class="prenda__etiqueta">' + p.etiqueta + '</span>' : '') +
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
  lista('[data-basicos]', ['morley-arena', 'basica-blanca', 'emblema']);

  /* Índice de categorías con foto que sigue al cursor */
  var FOTOS = { remeras: 'f05', camisas: 'f04', musculosas: 'f02', jeans: 'f13' };
  var indice = $('[data-indice]');
  if (indice) {
    indice.innerHTML = AR_CATEGORIAS.map(function (c, i) {
      var n = P.filter(function (p) { return p.cat === c.id; }).length;
      return '<li><a href="catalogo.html?cat=' + c.id + '" data-cat="' + c.id + '">' +
        '<span class="indice__n">0' + (i + 1) + '</span>' + img(FOTOS[c.id], '', ' class="indice__mini"') +
        '<span class="indice__nombre">' + c.nombre + '</span><span class="indice__cuenta">' + n + ' modelos</span>' +
        '<span class="indice__flecha" aria-hidden="true">→</span></a></li>';
    }).join('');
    var flot = document.createElement('div');
    flot.className = 'flotante'; flot.setAttribute('aria-hidden', 'true');
    flot.innerHTML = AR_CATEGORIAS.map(function (c) { return '<img src="' + foto(FOTOS[c.id]) + '" alt="" data-f="' + c.id + '">'; }).join('');
    document.body.appendChild(flot);
    window.AR_flotante = flot;
    indice.addEventListener('mouseover', function (e) {
      var a = e.target.closest('[data-cat]');
      if (!a) return;
      flot.classList.add('visible');
      flot.querySelectorAll('img').forEach(function (im) { im.classList.toggle('activa', im.getAttribute('data-f') === a.getAttribute('data-cat')); });
    });
    indice.addEventListener('mouseleave', function () { flot.classList.remove('visible'); });
  }

  /* Catálogo */
  var grilla = $('[data-grilla]');
  if (grilla) {
    var pest = $('[data-pestanas]'), orden = $('[data-orden]'), cuenta = $('[data-cuenta]');
    var pedida = new URLSearchParams(location.search).get('cat');
    var activa = AR_CATEGORIAS.some(function (c) { return c.id === pedida; }) ? pedida : 'todo';
    pest.innerHTML = [{ id: 'todo', nombre: 'Todo' }].concat(AR_CATEGORIAS).map(function (c) {
      var n = c.id === 'todo' ? P.length : P.filter(function (p) { return p.cat === c.id; }).length;
      return '<button class="pestana" type="button" data-filtro="' + c.id + '" aria-pressed="' + (c.id === activa) + '">' + c.nombre + '<sup>' + n + '</sup></button>';
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
})();
