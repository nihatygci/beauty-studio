/* ==========================================================================
   SIRMA BEAUTY STUDIO — Vanilla JS Interactions v2
   Preloader, scroll progress, cursor glow, navbar scrollspy, mobile menu,
   reveal/image-reveal animations, counters, magnetic buttons, tilt cards,
   hero parallax, reviews carousel, instagram marquee, back-to-top.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setYear();
    initPreloader();
    initScrollHandler();   // single scroll listener driving navbar, progress bar, back-to-top, scrollspy
    initMobileMenu();
    initSmoothAnchors();
    initRevealAnimations();
    initCounters();
    initHeroParallax();
    initCursorGlow();
    initMagneticButtons();
    initTiltCards();
    initBackToTop();
  }

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  function setYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     Preloader: brief, elegant, skipped entirely for reduced-motion users
     --------------------------------------------------------------------- */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    if (reduceMotion) {
      document.body.classList.add('lb-loaded');
      return;
    }

    var minDelay = 900;
    var start = Date.now();

    function reveal() {
      var elapsed = Date.now() - start;
      var wait = Math.max(minDelay - elapsed, 0);
      setTimeout(function () {
        document.body.classList.add('lb-loaded');
      }, wait);
    }

    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal);
    }

    /* Safety net: never let a slow asset trap the visitor behind the curtain */
    setTimeout(function () {
      document.body.classList.add('lb-loaded');
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Single scroll listener: navbar blur/shrink, progress bar,
     back-to-top visibility, active nav link (scrollspy)
     --------------------------------------------------------------------- */
  function initScrollHandler() {
    var navbar = document.getElementById('navbar');
    var progressBar = document.getElementById('progressBar');
    var backTop = document.getElementById('backTop');
    var navLinks = document.querySelectorAll('.lb-nav-link');
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute('data-section');
      var el = document.getElementById(id);
      if (el) sections.push({ id: id, el: el, link: link });
    });

    /* Nav-menu order (Anasayfa, Hizmetler, Galeri, Hakkımızda, İletişim) does not
       match the page's actual top-to-bottom order (About sits before Services).
       Sort by real DOM position so the scroll probe below walks sections in the
       order the visitor actually scrolls through them. */
    sections.sort(function (a, b) {
      var position = a.el.compareDocumentPosition(b.el);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    var ticking = false;

    function update() {
      var scrollY = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (navbar) {
        if (scrollY > 40) navbar.classList.add('is-scrolled');
        else navbar.classList.remove('is-scrolled');
      }

      if (progressBar) {
        var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
      }

      if (backTop) {
        if (scrollY > 700) backTop.classList.add('is-visible');
        else backTop.classList.remove('is-visible');
      }

      if (sections.length) {
        var probe = scrollY + window.innerHeight * 0.3;
        var current = sections[0];
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].el.offsetTop <= probe) current = sections[i];
        }
        sections.forEach(function (s) {
          s.link.classList.toggle('is-active', s === current);
        });
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------------------------------------------------------------------
     Mobile menu toggle
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openMenu() {
      toggle.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('is-open');
      if (isOpen) closeMenu(); else openMenu();
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 991) closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Smooth scroll for in-page anchors, offset for sticky navbar
     --------------------------------------------------------------------- */
  function initSmoothAnchors() {
    var navHeight = getComputedStyle(document.documentElement)
      .getPropertyValue('--lb-nav-h');
    var offset = parseInt(navHeight, 10) || 88;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - (offset - 8);
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
     data-reveal="fade-up|fade-left|fade-right", data-reveal-delay="ms"
     data-reveal-image — clip-path curtain wipe for photography
     --------------------------------------------------------------------- */
  function initRevealAnimations() {
    var items = document.querySelectorAll('[data-reveal], [data-reveal-image]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var delay = el.getAttribute('data-reveal-delay') || 0;

        setTimeout(function () {
          el.classList.add('is-visible');
        }, parseInt(delay, 10));

        observer.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });

    document.querySelectorAll('.lb-section-head').forEach(function (head) {
      if (!head.hasAttribute('data-reveal')) observer.observe(head);
    });
  }

  /* ---------------------------------------------------------------------
     Animated number counters for hero stat cards
     --------------------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll('.lb-count');
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var duration = 1800;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('tr-TR');

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString('tr-TR');
        }
      }

      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window) || reduceMotion) {
      counters.forEach(function (el) {
        el.textContent = (parseInt(el.getAttribute('data-count'), 10) || 0).toLocaleString('tr-TR');
      });
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Subtle hero image parallax tilt on mouse move (desktop only)
     --------------------------------------------------------------------- */
  function initHeroParallax() {
    var wrap = document.getElementById('heroParallax');
    var hero = document.querySelector('.lb-hero');
    if (!wrap || !hero || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var bounds = null;
    var raf = null;

    function updateBounds() {
      bounds = wrap.getBoundingClientRect();
    }

    function onMove(e) {
      if (!bounds) updateBounds();
      var relX = (e.clientX - bounds.left) / bounds.width - 0.5;
      var relY = (e.clientY - bounds.top) / bounds.height - 0.5;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        wrap.style.transform =
          'rotateY(' + (relX * 6) + 'deg) rotateX(' + (relY * -6) + 'deg)';
      });
    }

    function onLeave() {
      wrap.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }

    window.addEventListener('resize', updateBounds);
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
  }

  /* ---------------------------------------------------------------------
     Ambient cursor glow — scoped to hero and CTA band only, so it reads
     as an intentional lighting detail rather than a sitewide gimmick
     --------------------------------------------------------------------- */
  function initCursorGlow() {
    var glow = document.getElementById('cursorGlow');
    var zones = document.querySelectorAll('.lb-glow-zone');
    if (!glow || !zones.length || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    var raf = null;

    function loop() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';
      raf = requestAnimationFrame(loop);
    }

    zones.forEach(function (zone) {
      zone.addEventListener('mouseenter', function (e) {
        targetX = currentX = e.clientX;
        targetY = currentY = e.clientY;
        glow.classList.add('is-active');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      zone.addEventListener('mousemove', function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
      });
      zone.addEventListener('mouseleave', function () {
        glow.classList.remove('is-active');
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons — nudges toward the cursor within a small radius
     --------------------------------------------------------------------- */
  function initMagneticButtons() {
    var buttons = document.querySelectorAll('[data-magnetic]');
    if (!buttons.length || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (relX * 0.18) + 'px, ' + (relY * 0.35) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------------------------------------------------------------------
     3D tilt for cards marked with data-tilt
     --------------------------------------------------------------------- */
  function initTiltCards() {
    var cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length || reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'perspective(800px) rotateY(' + (relX * 7) + 'deg) rotateX(' + (relY * -7) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Back-to-top button
     --------------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('backTop');
    if (!btn) return;

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
