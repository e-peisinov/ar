/* Carrito visual compartido por las dos variantes.
   Arma la ficha rápida y el cajón del carrito; cada variante los viste con su CSS.
   No hay pago: «Finalizar compra» solo avisa que es una maqueta. */
(function () {
  var base = document.documentElement.getAttribute('data-base') || '../';
  var productos = window.AR_PRODUCTOS || [];
  var CLAVE = 'ar-carrito';
  var items = leer();

  function leer() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE)) || []; } catch (e) { return []; }
  }
  function guardar() {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(items)); } catch (e) {}
  }
  function buscar(id) {
    for (var i = 0; i < productos.length; i++) if (productos[i].id === id) return productos[i];
    return null;
  }
  function foto(f) { return base + 'assets/fotos/' + f + '.webp'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Markup ---------- */
  var capa = document.createElement('div');
  capa.className = 'ar-capa';
  capa.innerHTML =
    '<div class="ficha" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo" hidden>' +
      '<div class="ficha__caja">' +
        '<button class="ficha__cerrar" type="button" aria-label="Cerrar">×</button>' +
        '<div class="ficha__galeria"><div class="ficha__foto"></div><div class="ficha__miniaturas"></div></div>' +
        '<div class="ficha__info">' +
          '<p class="ficha__cat"></p>' +
          '<h2 class="ficha__titulo" id="ficha-titulo"></h2>' +
          '<p class="ficha__precio"></p>' +
          '<p class="ficha__nota"></p>' +
          '<fieldset class="ficha__grupo"><legend>Color</legend><div class="ficha__colores"></div></fieldset>' +
          '<fieldset class="ficha__grupo"><legend>Talle</legend><div class="ficha__talles"></div></fieldset>' +
          '<button class="ficha__agregar boton" type="button">Agregar al carrito</button>' +
          '<p class="ficha__envio">Envíos a todo el país · Retiro en el local, calle 25 N° 621</p>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<aside class="cajon" aria-label="Carrito" hidden>' +
      '<div class="cajon__cabeza"><h2 class="cajon__titulo">Tu carrito</h2><button class="cajon__cerrar" type="button" aria-label="Cerrar carrito">×</button></div>' +
      '<ul class="cajon__lista"></ul>' +
      '<div class="cajon__vacio"><p>Todavía no elegiste nada.</p><a class="boton boton--linea" href="catalogo.html">Ver el catálogo</a></div>' +
      '<div class="cajon__pie">' +
        '<div class="cajon__fila"><span>Subtotal</span><strong class="cajon__subtotal"></strong></div>' +
        '<p class="cajon__aviso">El envío se calcula en el siguiente paso.</p>' +
        '<button class="cajon__finalizar boton" type="button">Finalizar compra</button>' +
      '</div>' +
    '</aside>' +
    '<div class="ar-velo" hidden></div>' +
    '<div class="ar-aviso" role="status" aria-live="polite"></div>';
  document.body.appendChild(capa);

  var ficha = capa.querySelector('.ficha');
  var cajon = capa.querySelector('.cajon');
  var velo = capa.querySelector('.ar-velo');
  var aviso = capa.querySelector('.ar-aviso');
  var actual = null, talle = null, color = 0, ultimoFoco = null;

  /* ---------- Abrir / cerrar con transición ---------- */
  function mostrar(el) {
    el.hidden = false; velo.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      el.classList.add('abierto'); velo.classList.add('abierto');
    }); });
    document.documentElement.classList.add('ar-bloqueado');
  }
  function ocultar(el) {
    if (el.hidden) return;
    el.classList.remove('abierto');
    var otro = el === ficha ? cajon : ficha;
    if (otro.hidden) velo.classList.remove('abierto');
    var fin = function (e) {
      if (e && e.target !== el) return;
      el.removeEventListener('transitionend', fin);
      if (el.classList.contains('abierto')) return;
      el.hidden = true;
      if (ficha.hidden && cajon.hidden) { velo.hidden = true; document.documentElement.classList.remove('ar-bloqueado'); }
    };
    el.addEventListener('transitionend', fin);
    setTimeout(function () { fin(); }, 700);
    if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
  }

  /* ---------- Ficha rápida ---------- */
  function abrirProducto(id, origen) {
    var p = buscar(id);
    if (!p) return;
    actual = p; talle = null; color = 0; ultimoFoco = document.activeElement;
    var cat = (window.AR_CATEGORIAS || []).filter(function (c) { return c.id === p.cat; })[0];
    ficha.querySelector('.ficha__cat').textContent = cat ? cat.nombre : '';
    ficha.querySelector('.ficha__titulo').textContent = p.nombre;
    ficha.querySelector('.ficha__precio').textContent = AR_precio(p.precio);
    ficha.querySelector('.ficha__nota').textContent = p.nota;
    ficha.querySelector('.ficha__foto').innerHTML = '<img src="' + foto(p.fotos[0]) + '" alt="' + esc(p.nombre) + '">';
    ficha.querySelector('.ficha__miniaturas').innerHTML = p.fotos.length > 1 ? p.fotos.map(function (f, i) {
      return '<button type="button" class="' + (i === 0 ? 'activa' : '') + '" data-foto="' + f + '" aria-label="Foto ' + (i + 1) + '"><img src="' + foto(f) + '" alt=""></button>';
    }).join('') : '';
    ficha.querySelector('.ficha__colores').innerHTML = p.colores.map(function (c, i) {
      return '<button type="button" class="muestra' + (i === 0 ? ' activa' : '') + '" data-color="' + i + '" style="--muestra:' + c + '" aria-label="Color ' + (i + 1) + '" aria-pressed="' + (i === 0) + '"></button>';
    }).join('');
    ficha.querySelector('.ficha__talles').innerHTML = AR_TALLES.map(function (t) {
      return '<button type="button" class="talle" data-talle="' + t + '" aria-pressed="false">' + t + '</button>';
    }).join('');
    var btn = ficha.querySelector('.ficha__agregar');
    btn.textContent = 'Elegí un talle'; btn.disabled = true;

    /* La ficha nace desde la tarjeta que se tocó (la variante decide si lo usa). */
    if (origen && origen.getBoundingClientRect) {
      var r = origen.getBoundingClientRect();
      ficha.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
      ficha.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
    } else {
      ficha.style.setProperty('--ox', '50vw'); ficha.style.setProperty('--oy', '50vh');
    }
    ocultar(cajon);
    mostrar(ficha);
    setTimeout(function () { ficha.querySelector('.ficha__cerrar').focus({ preventScroll: true }); }, 50);
  }

  ficha.addEventListener('click', function (e) {
    var t;
    if (e.target === ficha) return ocultar(ficha);
    if ((t = e.target.closest('[data-foto]'))) {
      ficha.querySelector('.ficha__foto img').src = foto(t.getAttribute('data-foto'));
      ficha.querySelectorAll('[data-foto]').forEach(function (b) { b.classList.toggle('activa', b === t); });
    } else if ((t = e.target.closest('[data-color]'))) {
      color = +t.getAttribute('data-color');
      ficha.querySelectorAll('[data-color]').forEach(function (b) { b.classList.toggle('activa', b === t); b.setAttribute('aria-pressed', b === t); });
    } else if ((t = e.target.closest('[data-talle]'))) {
      talle = t.getAttribute('data-talle');
      ficha.querySelectorAll('[data-talle]').forEach(function (b) { b.classList.toggle('activa', b === t); b.setAttribute('aria-pressed', b === t); });
      var btn = ficha.querySelector('.ficha__agregar');
      btn.disabled = false; btn.textContent = 'Agregar al carrito';
    } else if (e.target.closest('.ficha__agregar')) {
      agregar(actual.id, talle, color);
      ocultar(ficha);
      setTimeout(function () { abrirCarrito(); }, 260);
    } else if (e.target.closest('.ficha__cerrar')) {
      ocultar(ficha);
    }
  });

  /* ---------- Carrito ---------- */
  function agregar(id, t, c) {
    var clave = id + '|' + t + '|' + c;
    var it = items.filter(function (x) { return x.clave === clave; })[0];
    if (it) it.cant++; else items.push({ clave: clave, id: id, talle: t, color: c, cant: 1 });
    guardar(); pintar();
    document.dispatchEvent(new CustomEvent('ar:agregado', { detail: { id: id } }));
  }

  function pintar() {
    var total = 0, cant = 0;
    cajon.querySelector('.cajon__lista').innerHTML = items.map(function (it) {
      var p = buscar(it.id);
      if (!p) return '';
      total += p.precio * it.cant; cant += it.cant;
      return '<li class="cajon__item" data-clave="' + esc(it.clave) + '">' +
        '<img src="' + foto(p.fotos[0]) + '" alt="">' +
        '<div class="cajon__datos"><p class="cajon__nombre">' + esc(p.nombre) + '</p>' +
        '<p class="cajon__detalle"><span class="muestra muestra--chica" style="--muestra:' + p.colores[it.color] + '"></span> Talle ' + esc(it.talle) + '</p>' +
        '<div class="cajon__cantidad"><button type="button" data-menos aria-label="Uno menos">−</button><span>' + it.cant + '</span><button type="button" data-mas aria-label="Uno más">+</button></div></div>' +
        '<div class="cajon__derecha"><p class="cajon__precio">' + AR_precio(p.precio * it.cant) + '</p><button type="button" class="cajon__quitar" data-quitar>Quitar</button></div>' +
      '</li>';
    }).join('');
    cajon.querySelector('.cajon__subtotal').textContent = AR_precio(total);
    cajon.classList.toggle('vacio', !items.length);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = cant;
      el.classList.toggle('hay', cant > 0);
    });
  }

  cajon.addEventListener('click', function (e) {
    var li = e.target.closest('.cajon__item');
    if (e.target.closest('.cajon__cerrar')) return ocultar(cajon);
    if (e.target.closest('.cajon__finalizar')) return avisar('Esto es una maqueta: acá seguiría el pago y el envío.');
    if (!li) return;
    var it = items.filter(function (x) { return x.clave === li.getAttribute('data-clave'); })[0];
    if (!it) return;
    if (e.target.closest('[data-mas]')) it.cant++;
    else if (e.target.closest('[data-menos]')) it.cant = Math.max(1, it.cant - 1);
    else if (e.target.closest('[data-quitar]')) items.splice(items.indexOf(it), 1);
    guardar(); pintar();
  });

  function abrirCarrito() { ultimoFoco = document.activeElement; ocultar(ficha); mostrar(cajon); }

  var avisoT;
  function avisar(txt) {
    aviso.textContent = txt;
    aviso.classList.add('visible');
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { aviso.classList.remove('visible'); }, 3200);
  }

  velo.addEventListener('click', function () { ocultar(ficha); ocultar(cajon); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { ocultar(ficha); ocultar(cajon); }
  });
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-cart-open]'))) { e.preventDefault(); abrirCarrito(); }
    else if ((t = e.target.closest('[data-producto]'))) { e.preventDefault(); abrirProducto(t.getAttribute('data-producto'), t); }
    else if ((t = e.target.closest('[data-maqueta]'))) { e.preventDefault(); avisar(t.getAttribute('data-maqueta') || 'Es una maqueta: este enlace todavía no lleva a ningún lado.'); }
  });

  pintar();
  window.AR = { abrirProducto: abrirProducto, abrirCarrito: abrirCarrito, avisar: avisar, foto: foto, buscar: buscar };
})();
