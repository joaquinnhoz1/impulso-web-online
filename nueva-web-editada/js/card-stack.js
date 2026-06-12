/* Card Stack — Vanilla JS
   Fan-stack card layout ported from card-stack.tsx (framer-motion → CSS transitions).
   No dependencies. Drop-in for the #resultados section.
*/
;(function () {
  'use strict';

  var ITEMS = [
    {
      title: 'Turnos Padel PRO',
      description: 'Plataforma de reservas online para canchas de pádel. Sistema de gestión de turnos, panel admin y experiencia mobile-first.',
      tags: ['Sistema de Reservas', 'Deporte', 'App Web'],
      imageSrc: 'img/proyecto-padelpro.jpg',
      href: 'https://turnospadelpro.vercel.app/'
    },
    {
      title: 'Matilde Empanadas',
      description: 'Web para empanadas artesanales al disco, vinos y dips. Pedidos por WhatsApp con doble sucursal: La Plata y Citybell.',
      tags: ['Gastronomía', 'Delivery', 'Landing Page'],
      imageSrc: 'img/proyecto-matilde.jpg',
      href: 'https://matilde-empanadas.vercel.app/'
    },
    {
      title: 'arq.estudio.gr',
      description: 'Sitio para estudio de arquitectura y diseño. Showcase de obras y presentación de la Arq. Giannina Ricci.',
      tags: ['Arquitectura', 'Estudio Profesional', 'Portfolio'],
      imageSrc: 'img/proyecto-arquitectura-gr.jpg',
      href: 'https://arquitectura-gr.vercel.app/'
    },
    {
      title: 'El Chacarero',
      description: 'Web para tienda de productos regionales. Presentación de catálogo y canal de contacto directo con el productor.',
      tags: ['Productos Regionales', 'E-commerce', 'Landing Page'],
      imageSrc: 'img/proyecto-el-chacarero.jpg',
      href: 'https://el-chacarero.vercel.app/'
    },
    {
      title: 'NutriBCG',
      description: 'Sitio para licenciada en nutrición. Reserva de turnos, planes personalizados y acompañamiento nutricional online.',
      tags: ['Salud', 'Profesional', 'Landing Page'],
      imageSrc: 'img/proyecto-nutribcg.jpg',
      href: 'https://nutribcg.vercel.app/'
    }
  ];

  /* ── helpers ──────────────────────────────────────────────── */
  function wrapIdx(n, len) {
    if (len <= 0) return 0;
    return ((n % len) + len) % len;
  }

  /* Signed offset from active → i with loop-aware wrapping */
  function signedOff(i, act, len, loop) {
    var raw = i - act;
    if (!loop || len <= 1) return raw;
    var alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
  }

  /* ── init ─────────────────────────────────────────────────── */
  function init() {
    var wrap = document.getElementById('cstack-root');
    if (!wrap) return;

    var items = ITEMS;
    var len   = items.length;
    if (!len) return;

    /* layout config (mirrors card-stack.tsx defaults) */
    var maxOffset    = 3;          /* Math.floor(7 / 2) */
    var stepDeg      = 48 / maxOffset; /* spreadDeg / maxOffset = 16 deg per step */
    var overlap      = 0.48;
    var depthPx      = 120;
    var tiltXDeg     = 12;
    var activeLiftPx = 22;
    var activeScale  = 1.03;
    var inactiveScale = 0.94;
    var loop         = true;

    var active = 0;

    /* ── build stage ──────────────────────────────────────── */
    var stage = document.createElement('div');
    stage.className = 'cstack-stage';
    stage.setAttribute('tabindex', '0');
    stage.setAttribute('aria-label', 'Proyectos — usá las flechas del teclado para navegar');
    stage.setAttribute('role', 'region');

    /* subtle ambient washes (match TSX spotlight) */
    var washT = document.createElement('div');
    washT.className = 'cstack-wash cstack-wash--top';
    washT.setAttribute('aria-hidden', 'true');
    var washB = document.createElement('div');
    washB.className = 'cstack-wash cstack-wash--bot';
    washB.setAttribute('aria-hidden', 'true');
    stage.appendChild(washT);
    stage.appendChild(washB);

    /* ── build cards ──────────────────────────────────────── */
    var cardEls = items.map(function (item, i) {
      var el = document.createElement('article');
      el.className = 'cstack-card';
      el.setAttribute('aria-label', item.title);

      /* image layer */
      var imgDiv = document.createElement('div');
      imgDiv.className = 'cstack-card__img';
      if (item.imageSrc) {
        var img = document.createElement('img');
        img.src   = item.imageSrc;
        img.alt   = item.title;
        img.loading   = i === 0 ? 'eager' : 'lazy';
        img.draggable = false;
        imgDiv.appendChild(img);
      }

      /* gradient overlay */
      var grad = document.createElement('div');
      grad.className = 'cstack-card__grad';

      /* text content */
      var body = document.createElement('div');
      body.className = 'cstack-card__body';

      var tagsDiv = document.createElement('div');
      tagsDiv.className = 'cstack-card__tags';
      (item.tags || []).forEach(function (t) {
        var s = document.createElement('span');
        s.textContent = t;
        tagsDiv.appendChild(s);
      });

      var titleEl = document.createElement('h3');
      titleEl.className = 'cstack-card__title';
      titleEl.textContent = item.title;

      var descEl = document.createElement('p');
      descEl.className = 'cstack-card__desc';
      descEl.textContent = item.description;

      body.appendChild(tagsDiv);
      body.appendChild(titleEl);
      body.appendChild(descEl);

      if (item.href) {
        var cta = document.createElement('a');
        cta.className = 'cstack-card__cta';
        cta.href      = item.href;
        cta.target    = '_blank';
        cta.rel       = 'noreferrer noopener';
        cta.textContent = 'Ver proyecto →';
        body.appendChild(cta);
      }

      el.appendChild(imgDiv);
      el.appendChild(grad);
      el.appendChild(body);
      stage.appendChild(el);
      return el;
    });

    /* ── build dots ───────────────────────────────────────── */
    var dotsEl = document.createElement('div');
    dotsEl.className = 'cstack-dots';
    var dotBtns = items.map(function (item, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cstack-dot';
      btn.setAttribute('aria-label', 'Ir a ' + item.title);
      btn.addEventListener('click', function () { setActive(idx); });
      dotsEl.appendChild(btn);
      return btn;
    });

    wrap.appendChild(stage);
    wrap.appendChild(dotsEl);

    /* ── render ───────────────────────────────────────────── */
    function render() {
      /* read actual card width (responsive via CSS) */
      var cardW = cardEls[0].offsetWidth;
      if (!cardW) cardW = Math.min(520, window.innerWidth * 0.82);
      var halfW       = cardW / 2;
      var cardSpacing = Math.max(10, Math.round(cardW * (1 - overlap)));

      cardEls.forEach(function (el, i) {
        var off     = signedOff(i, active, len, loop);
        var abs     = Math.abs(off);
        var visible = abs <= maxOffset;

        el.style.opacity      = visible ? '1' : '0';
        el.style.pointerEvents = visible ? '' : 'none';
        el.style.zIndex       = visible ? String(100 - abs) : '0';

        if (!visible) return;

        var isActive = off === 0;
        /* translateX: center card (-halfW) + fan offset */
        var totalX = (off * cardSpacing) - halfW;
        var y      = abs * 10;
        var z      = -abs * depthPx;
        var scale  = isActive ? activeScale : inactiveScale;
        var lift   = isActive ? -activeLiftPx : 0;
        var rotZ   = off * stepDeg;
        var rotX   = isActive ? 0 : tiltXDeg;

        el.style.cursor = isActive ? 'grab' : 'pointer';
        el.style.transform =
          'translateX(' + totalX + 'px) ' +
          'translateY(' + (y + lift) + 'px) ' +
          'translateZ(' + z + 'px) ' +
          'rotateZ(' + rotZ + 'deg) ' +
          'rotateX(' + rotX + 'deg) ' +
          'scale(' + scale + ')';
      });

      dotBtns.forEach(function (btn, idx) {
        btn.classList.toggle('is-active', idx === active);
      });
    }

    function setActive(idx) {
      active = wrapIdx(idx, len);
      render();
    }

    /* ── click inactive card ──────────────────────────────── */
    cardEls.forEach(function (el, i) {
      el.addEventListener('click', function (e) {
        if (i !== active) {
          e.preventDefault();
          setActive(i);
        }
      });
    });

    /* ── mouse drag ───────────────────────────────────────── */
    var dragStartX = 0;
    var dragging   = false;
    var didDrag    = false;

    stage.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      dragging   = true;
      didDrag    = false;
      dragStartX = e.clientX;
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - dragStartX) > 6) didDrag = true;
    });

    window.addEventListener('mouseup', function (e) {
      if (!dragging) return;
      dragging = false;
      if (!didDrag) return;
      var cardW     = cardEls[0].offsetWidth || 520;
      var threshold = Math.min(160, cardW * 0.22);
      var dx        = e.clientX - dragStartX;
      if      (dx >  threshold) setActive(wrapIdx(active - 1, len));
      else if (dx < -threshold) setActive(wrapIdx(active + 1, len));
    });

    /* ── touch swipe ──────────────────────────────────────── */
    var touchStartX = 0;
    var touchStartY = 0;
    var touchLocked = false; /* true once we know direction */

    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLocked = false;
    }, { passive: true });

    /* non-passive so we can call preventDefault on horizontal swipes */
    stage.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - touchStartX;
      var dy = e.touches[0].clientY - touchStartY;
      if (!touchLocked) {
        touchLocked = true;
        /* only hijack clearly horizontal gestures */
        if (Math.abs(dx) <= Math.abs(dy)) return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault(); /* block page scroll while swiping cards */
      }
    }, { passive: false });

    stage.addEventListener('touchend', function (e) {
      var cardW     = cardEls[0].offsetWidth || 320;
      var threshold = Math.min(80, cardW * 0.22);
      var dx        = e.changedTouches[0].clientX - touchStartX;
      if      (dx >  threshold) setActive(wrapIdx(active - 1, len));
      else if (dx < -threshold) setActive(wrapIdx(active + 1, len));
    }, { passive: true });

    /* ── keyboard ─────────────────────────────────────────── */
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  setActive(wrapIdx(active - 1, len));
      if (e.key === 'ArrowRight') setActive(wrapIdx(active + 1, len));
    });

    /* ── resize ───────────────────────────────────────────── */
    window.addEventListener('resize', render, { passive: true });

    /* initial render */
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
