/* =============================================================================
   Shopping donde EMSA — Comportamiento de la landing page
   Sin dependencias. Cada bloque es independiente: si uno falla, el resto sigue.
   ============================================================================= */
(function () {
  'use strict';

  /** Número de WhatsApp del negocio en formato internacional (Colombia +57). */
  var WHATSAPP = '573127661561';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Enlaces de WhatsApp ───────────────────────────────────────────────────
     Cada botón con [data-wa-product] arma su propio mensaje. Si el botón vive
     dentro de una ficha de producto, se anexan las opciones elegidas (estilo,
     talla, color) para que el chat llegue con todo el contexto.
     ------------------------------------------------------------------------ */

  /** Devuelve "Estilo: Manga corta · Talla: M" con lo seleccionado en la ficha. */
  function selectedOptions(card) {
    if (!card) return '';

    return Array.prototype.map
      .call(card.querySelectorAll('[data-option]'), function (group) {
        var active = group.querySelector('.is-active');
        return active ? group.dataset.option + ': ' + active.dataset.value : '';
      })
      .filter(Boolean)
      .join(' · ');
  }

  function whatsappUrl(link) {
    var product = link.dataset.waProduct || 'los productos de la tienda';
    var options = selectedOptions(link.closest('[data-wa-card]'));

    var text = '¡Hola! 👋 Vengo de la página web y quiero información sobre: ' + product + '.';
    if (options) text += '\n' + options + '.';
    text += '\n¿Me confirman precio y disponibilidad?';

    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  /* El href se resuelve en el momento del clic para respetar la última
     selección del usuario, pero también se precarga para que el enlace sea
     válido si se abre en pestaña nueva o se copia. */
  var waLinks = document.querySelectorAll('[data-wa-product]');

  Array.prototype.forEach.call(waLinks, function (link) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.href = whatsappUrl(link);

    link.addEventListener('click', function () {
      link.href = whatsappUrl(link);
    });
  });

  function refreshWaLinks(card) {
    Array.prototype.forEach.call(
      (card || document).querySelectorAll('[data-wa-product]'),
      function (link) { link.href = whatsappUrl(link); }
    );
  }

  /* ── Selectores de opción (chips y muestras de color) ─────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-option]'), function (group) {
    group.addEventListener('click', function (event) {
      var option = event.target.closest('.chip, .swatch');
      if (!option || !group.contains(option)) return;

      Array.prototype.forEach.call(group.children, function (sibling) {
        var isTarget = sibling === option;
        sibling.classList.toggle('is-active', isTarget);
        sibling.setAttribute('aria-checked', String(isTarget));
      });

      refreshWaLinks(group.closest('[data-wa-card]'));
    });
  });

  /* ── Galerías de producto ─────────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (gallery) {
    var stage = gallery.querySelector('.gallery__stage');
    var image = gallery.querySelector('[data-gallery-img]');
    var webpSource = gallery.querySelector('[data-src-webp]');

    gallery.addEventListener('click', function (event) {
      var thumb = event.target.closest('.thumb');
      if (!thumb || thumb.classList.contains('is-active')) return;

      Array.prototype.forEach.call(gallery.querySelectorAll('.thumb'), function (other) {
        other.classList.toggle('is-active', other === thumb);
      });

      var apply = function () {
        if (webpSource) webpSource.srcset = thumb.dataset.webp;
        image.src = thumb.dataset.jpg;
        image.alt = thumb.dataset.alt || '';
        stage.classList.remove('is-swapping');
      };

      if (reduceMotion) { apply(); return; }

      // Fundido corto: se oculta la imagen, se cambia y se vuelve a mostrar.
      stage.classList.add('is-swapping');
      window.setTimeout(apply, 180);
    });
  });

  /* ── Menú móvil ───────────────────────────────────────────────────────────── */
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Al elegir un destino el menú se cierra solo.
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    // Si la pantalla crece hasta escritorio, el menú vuelve a su estado normal.
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (mql) {
      if (mql.matches) setMenu(false);
    });
  }

  /* ── Aparición progresiva al hacer scroll ─────────────────────────────────── */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var pending = revealables.slice();
  var observer = null;

  revealables.forEach(function (el) {
    if (el.dataset.revealDelay) el.style.setProperty('--d', el.dataset.revealDelay);
  });

  function reveal(el) {
    el.classList.add('is-visible');
    if (observer) observer.unobserve(el);

    var index = pending.indexOf(el);
    if (index > -1) pending.splice(index, 1);
  }

  /* Red de seguridad para lo que el observador nunca llega a ver: si el usuario
     entra con un ancla (#preguntas), arrastra la barra de scroll de un tirón o
     recarga conservando la posición, hay elementos que pasan de estar bajo el
     viewport a estar encima sin intersectarlo en ningún fotograma. Sin esto se
     quedarían invisibles para siempre. */
  function revealPassed() {
    for (var i = pending.length - 1; i >= 0; i--) {
      if (pending[i].getBoundingClientRect().top < 0) reveal(pending[i]);
    }
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(reveal);
  } else {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ── Barra superior y botón flotante según el scroll ──────────────────────── */
  var nav = document.getElementById('nav');
  var fab = document.querySelector('.fab');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    // El botón flotante aparece cuando el hero deja de ser lo único visible.
    if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.55);
    if (pending.length) revealPassed();
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  // El salto a un ancla puede ocurrir después de este script; se repasa al cargar.
  window.addEventListener('load', onScroll);
  onScroll();

  /* ── Año del pie de página ────────────────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
