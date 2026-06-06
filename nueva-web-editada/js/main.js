/* ============================================================
   IMPULSO WEB — main.js
   Scroll effects, parallax, animations, form handling
============================================================ */

'use strict';

/* ── CURSOR ──────────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
  });

  function animateFollower() {
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  }

  animateFollower();
})();

/* ── NAVBAR ──────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ── MOBILE MENU ─────────────────────────────────────────── */
(function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');

    if (isOpen) {
      closeMenu();
    } else {
      menu.classList.add('open');
      menu.removeAttribute('aria-hidden');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  menu.addEventListener('click', (e) => {
    if (e.target === menu) closeMenu();
  });
})();

/* ── REVEAL ON SCROLL ────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── PARALLAX BACKGROUND ─────────────────────────────────── */
(function initParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function onScroll() {
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.parentElement.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── HERO PARALLAX ORBS ──────────────────────────────────── */
(function initHeroParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const speeds = [0.04, 0.07, 0.05];

  function onScroll() {
    const scrollY = window.scrollY;

    orbs.forEach((orb, i) => {
      const speed = speeds[i] || 0.05;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── COUNTER ANIMATION ───────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── SMOOTH ACTIVE NAV LINKS ─────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          link.removeAttribute('aria-current');

          if (link.getAttribute('href') === `#${id}`) {
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

/* ── BACK TO TOP ─────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── CONTACT FORM ────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const inputs = form.querySelectorAll('[required]');
    let valid = true;

    inputs.forEach(input => {
      input.classList.remove('error');

      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      }
    });

    const emailInput = form.querySelector('#email');

    if (
      emailInput &&
      emailInput.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)
    ) {
      emailInput.classList.add('error');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
    }
  });

  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
    });
  });
})();

/* ── CURRENT YEAR ────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ── ERROR STYLE ─────────────────────────────────────────── */
(function addErrorStyle() {
  const style = document.createElement('style');

  style.textContent = `
    .form-group input.error,
    .form-group textarea.error,
    .form-group select.error {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
    }
  `;

  document.head.appendChild(style);
})();

/* ── SERVICE CARD TILT ───────────────────────────────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.service-card, .pricing-card, .testimonial').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * -6;
      const tiltY = x * 6;

      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s, border-color 0.3s, box-shadow 0.3s';
    });
  });
})();



/* ── STAGGERED HERO REVEAL ───────────────────────────────── */
(function heroEntrance() {
  const heroItems = document.querySelectorAll('.hero-content .reveal');

  heroItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 200 + i * 150);
  });
})();
/* ── SUCCESS MESSAGE ─────────────────────────────────────── */
(function successMessage() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('enviado') === 'true') {
    alert('¡Consulta enviada correctamente!');

    window.history.replaceState({}, document.title, window.location.pathname);
  }
})();
