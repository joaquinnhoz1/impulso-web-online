/* Card Stack — Vanilla JS
   Fan-stack with live iframe previews + static-image placeholder.
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

    var maxOffset     = 3;
    var stepDeg       = 48 / maxOffset;
    var overlap       = 0.48;
    var depthPx       = 120;
    var tiltXDeg      = 12;
    var activeLiftPx  = 22;
    var activeScale   = 1.03;
    var inactiveScale = 0.94;
    var loop          = true;
    var VIRTUAL_W     = 1280; /* desktop viewport width for iframe scaling */

    var active       = 0;
    var iframeActive = false; /* true only after user clicks the active card */

    /* ── build stage ──────────────────────────────────────── */
    var stage = document.createElement('div');
    stage.className = 'cstack-stage';
    stage.setAttribute('tabindex', '0');
    stage.setAttribute('aria-label', 'Proyectos — usá las flechas del teclado para navegar');
    stage.setAttribute('role', 'region');

    var washT = document.createElement('div');
    washT.className = 'cstack-wash cstack-wash--top';
    washT.setAttribute('aria-hidden', 'true');
    var washB = document.createElement('div');
    washB.className = 'cstack-wash cstack-wash--bot';
    washB.setAttribute('aria-hidden', 'true');
    stage.appendChild(washT);
    stage.appendChild(washB);

    /* ── build cards ──────────────────────────────────────── */
    var iframeEls   = [];
    var placeholder = [];

    var cardEls = items.map(function (item, i) {
      var el = document.createElement('article');
      el.className = 'cstack-card';
      el.setAttribute('aria-label', item.title);

      /* ── preview area ── */
      var previewDiv = document.createElement('div');
      previewDiv.className = 'cstack-card__img';

      /* static image placeholder — shown until iframe loads */
      if (item.imageSrc) {
        var ph = document.createElement('img');
        ph.className   = 'cstack-iframe-placeholder';
        ph.src         = item.imageSrc;
        ph.alt         = item.title;
        ph.loading     = i === 0 ? 'eager' : 'lazy';
        ph.draggable   = false;
        previewDiv.appendChild(ph);
        placeholder.push(ph);
      } else {
        placeholder.push(null);
      }

      /* browser chrome bar */
      var bar = document.createElement('div');
      bar.className = 'cstack-browser-bar';
      bar.setAttribute('aria-hidden', 'true');

      var dots = document.createElement('div');
      dots.className = 'cstack-browser-dots';
      ['#ff5f56', '#ffbd2e', '#27c93f'].forEach(function (color) {
        var d = document.createElement('span');
        d.style.background = color;
        dots.appendChild(d);
      });

      var urlLabel = document.createElement('div');
      urlLabel.className = 'cstack-browser-url';
      urlLabel.textContent = item.href.replace(/^https?:\/\//, '').replace(/\/$/, '');

      bar.appendChild(dots);
      bar.appendChild(urlLabel);

      /* iframe scaling wrapper */
      var iframeWrap = document.createElement('div');
      iframeWrap.className = 'cstack-iframe-wrap';

      var iframe = document.createElement('iframe');
      iframe.className = 'cstack-iframe';
      iframe.title     = item.title;
      iframe.setAttribute('scrolling', 'yes');
      /* set data-src — actual src assigned lazily when stack enters viewport */
      iframe.dataset.src = item.href;

      /* fade in iframe over placeholder once the real URL loads
         (ignore the initial about:blank load — no src attr yet) */
      iframe.addEventListener('load', (function (idx) {
        return function () {
          if (!this.getAttribute('src')) return;
          var ph = placeholder[idx];
          if (ph) {
            ph.style.transition = 'opacity 0.45s ease';
            ph.style.opacity    = '0';
          }
          iframeEls[idx].parentElement.style.opacity = '1';
        };
      })(i));

      iframeWrap.appendChild(iframe);
      iframeEls.push(iframe);

      /* invisible overlay — blocks pointer events on inactive cards */
      var overlay = document.createElement('div');
      overlay.className = 'cstack-iframe-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      previewDiv.appendChild(bar);
      previewDiv.appendChild(iframeWrap);
      previewDiv.appendChild(overlay);

      /* ── info panel ── */
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
      titleEl.className   = 'cstack-card__title';
      titleEl.textContent = item.title;

      var descEl = document.createElement('p');
      descEl.className   = 'cstack-card__desc';
      descEl.textContent = item.description;

      body.appendChild(tagsDiv);
      body.appendChild(titleEl);
      body.appendChild(descEl);

      if (item.href) {
        var cta = document.createElement('a');
        cta.className   = 'cstack-card__cta';
        cta.href        = item.href;
        cta.target      = '_blank';
        cta.rel         = 'noreferrer noopener';
        cta.textContent = 'Ver proyecto →';
        body.appendChild(cta);
      }

      el.appendChild(previewDiv);
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

    /* ── iframe scale ─────────────────────────────────────── */
    var BAR_H = 30; /* browser chrome height in px */

    function updateIframeScales() {
      var cardW = cardEls[0].offsetWidth;
      if (!cardW) return;
      var scale = cardW / VIRTUAL_W;

      cardEls.forEach(function (el) {
        var iframeWrap = el.querySelector('.cstack-iframe-wrap');
        var previewDiv = el.querySelector('.cstack-card__img');
        if (!iframeWrap || !previewDiv) return;

        var availH    = previewDiv.offsetHeight - BAR_H;
        var virtualH  = Math.max(Math.ceil(availH / scale), 768);
        var iframe    = iframeWrap.querySelector('iframe');

        if (iframe) {
          iframe.style.width  = VIRTUAL_W + 'px';
          iframe.style.height = virtualH  + 'px';
        }
        iframeWrap.style.width     = VIRTUAL_W + 'px';
        iframeWrap.style.height    = virtualH  + 'px';
        iframeWrap.style.transform = 'scale(' + scale + ')';
      });
    }

    /* ── lazy load iframes ────────────────────────────────── */
    var loaded = items.map(function () { return false; });

    function loadIframe(idx) {
      if (loaded[idx]) return;
      loaded[idx] = true;
      var iframe = iframeEls[idx];
      if (iframe && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
      }
    }

    var loadTriggered = false;
    function triggerLoad() {
      if (loadTriggered) return;
      loadTriggered = true;
      loadIframe(active);
      var delay = 700;
      for (var j = 0; j < len; j++) {
        if (j !== active) {
          (function (idx, d) {
            setTimeout(function () { loadIframe(idx); }, d);
          })(j, delay);
          delay += 700;
        }
      }
    }

    /* Primary: IntersectionObserver */
    if ('IntersectionObserver' in window) {
      var stackObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        stackObserver.disconnect();
        triggerLoad();
      }, { threshold: 0.01, rootMargin: '150px' });
      stackObserver.observe(stage);
    }

    /* Fallback: scroll event + immediate check */
    function scrollCheck() {
      var rect = stage.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150) {
        window.removeEventListener('scroll', scrollCheck);
        triggerLoad();
      }
    }
    window.addEventListener('scroll', scrollCheck, { passive: true });
    scrollCheck(); /* fire immediately in case already in viewport */

    /* ── render ───────────────────────────────────────────── */
    function render() {
      var cardW = cardEls[0].offsetWidth;
      if (!cardW) cardW = Math.min(520, window.innerWidth * 0.82);
      var halfW       = cardW / 2;
      var cardSpacing = Math.max(10, Math.round(cardW * (1 - overlap)));

      cardEls.forEach(function (el, i) {
        var off     = signedOff(i, active, len, loop);
        var abs     = Math.abs(off);
        var visible = abs <= maxOffset;

        el.style.opacity       = visible ? '1' : '0';
        el.style.pointerEvents = visible ? '' : 'none';
        el.style.zIndex        = visible ? String(100 - abs) : '0';

        if (!visible) return;

        var isActive = off === 0;
        var totalX   = (off * cardSpacing) - halfW;
        var y        = abs * 10;
        var z        = -abs * depthPx;
        var sc       = isActive ? activeScale : inactiveScale;
        var lift     = isActive ? -activeLiftPx : 0;
        var rotZ     = off * stepDeg;
        var rotX     = isActive ? 0 : tiltXDeg;

        el.style.cursor    = isActive ? 'default' : 'pointer';
        el.style.transform =
          'translateX(' + totalX   + 'px) ' +
          'translateY(' + (y+lift) + 'px) ' +
          'translateZ(' + z        + 'px) ' +
          'rotateZ('    + rotZ     + 'deg) ' +
          'rotateX('    + rotX     + 'deg) ' +
          'scale('      + sc       + ')';

        /* iframe: interactive only on active card AND after user clicked */
        var overlay    = el.querySelector('.cstack-iframe-overlay');
        var iframeWrap = el.querySelector('.cstack-iframe-wrap');
        var interactive = isActive && iframeActive;
        if (overlay)    overlay.style.display          = interactive ? 'none' : 'block';
        if (iframeWrap) iframeWrap.style.pointerEvents = interactive ? 'auto' : 'none';
      });

      dotBtns.forEach(function (btn, idx) {
        btn.classList.toggle('is-active', idx === active);
      });

      updateIframeScales();
    }

    function setActive(idx) {
      active       = wrapIdx(idx, len);
      iframeActive = false; /* reset — must click to re-enable on new card */
      render();
    }

    /* ── card interaction ─────────────────────────────────── */
    cardEls.forEach(function (el, i) {
      /* click inactive card → activate it */
      el.addEventListener('click', function (e) {
        if (i !== active) {
          e.preventDefault();
          setActive(i);
        }
      });

      /* click on overlay of active card → enable iframe interaction */
      var ov = el.querySelector('.cstack-iframe-overlay');
      if (ov) {
        ov.addEventListener('click', function (e) {
          if (i === active && !iframeActive) {
            iframeActive = true;
            render();
          }
        });
      }

      /* mouse leaves active card → restore page scroll (disable iframe) */
      el.addEventListener('mouseleave', function () {
        if (i === active && iframeActive) {
          iframeActive = false;
          render();
        }
      });
    });

    /* ── mouse drag ───────────────────────────────────────── */
    var dragStartX = 0;
    var dragging   = false;
    var didDrag    = false;

    /* Only start drag from the card body panel or browser bar,
       not from the iframe itself (cross-origin events don't bubble anyway) */
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
    var touchLocked = false;

    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLocked = false;
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - touchStartX;
      var dy = e.touches[0].clientY - touchStartY;
      if (!touchLocked) {
        touchLocked = true;
        if (Math.abs(dx) <= Math.abs(dy)) return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
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

    /* initial */
    updateIframeScales();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
