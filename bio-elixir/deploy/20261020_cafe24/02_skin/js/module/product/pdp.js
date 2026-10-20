/**
 * PDP — sequence product detail interactions
 * Self-contained behaviour for the `.pdp` admin story content.
 * Reuses shared infra (Swiper, accordion-ui, media-fullscreen CSS) but no story engine.
 *
 * Handles: scroll reveal · in-view video · card swipers (data-ps-*) · count-ups ·
 * choice scroll highlight · formula scroll-pan · usage step↔video · FAQ accordion ·
 * at-a-glance overlay height · standard card height · media fullscreen.
 *
 * Note: section navigation (sidebar / TOC) is built by the page engine
 * (product/detail.html → product-story.js) and is intentionally out of scope here.
 */
(function (window, document) {
  'use strict';

  var ROOT_SELECTOR = '[data-pdp]';
  var SECTION_SELECTOR = '[data-pdp-section]';
  var REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var MOBILE = window.matchMedia && window.matchMedia('(max-width: 767px)');

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function reduceMotion() {
    return !!(REDUCE_MOTION && REDUCE_MOTION.matches);
  }

  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        fn();
      });
    };
  }

  function viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 0;
  }

  /* ---- Scroll reveal ---- */
  function initReveal(root) {
    var items = qsa('[data-scroll-reveal]', root).filter(function (el) {
      return !el.__pdpReveal;
    });
    if (!items.length) return;

    items.forEach(function (el) {
      el.__pdpReveal = true;
      var delay = el.getAttribute('data-scroll-delay');
      var distance = el.getAttribute('data-scroll-distance');
      if (delay) el.style.transitionDelay = delay + 'ms';
      if (distance) el.style.setProperty('--pdp-reveal-x', distance + 'px');
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.24 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---- In-view videos ---- */
  function prepareVideo(video) {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (!video.hasAttribute('preload')) video.setAttribute('preload', 'metadata');
  }

  function playVideo(video) {
    if (!video) return;
    var attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function initVideos(root) {
    var sections = qsa('[data-pdp-video-section]', root).filter(function (el) {
      return !el.__pdpVideo;
    });
    if (!sections.length) return;

    sections.forEach(function (section) {
      section.__pdpVideo = true;
      prepareVideo(section.querySelector('[data-pdp-video]'));
    });

    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (section) { playVideo(section.querySelector('[data-pdp-video]')); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target.querySelector('[data-pdp-video]');
        if (!video) return;
        if (entry.isIntersecting) playVideo(video);
        else if (!video.paused) video.pause();
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.35 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---- Media fullscreen ---- */
  function fullscreenTarget(trigger) {
    var explicit = trigger.getAttribute('data-media-fullscreen-target');
    if (explicit) {
      try {
        var found = document.querySelector(explicit);
        if (found) return found;
      } catch (e) {}
    }
    var scope = trigger.closest('.media-fullscreen, [data-media-fullscreen]') || trigger.parentElement;
    return (scope && (scope.querySelector('[data-media-fullscreen-target]') || scope.querySelector('video, img, iframe'))) || scope;
  }

  function requestFullscreen(target) {
    if (!target) return;
    var active = document.fullscreenElement || document.webkitFullscreenElement;
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (active && exit) { exit.call(document); return; }

    var video = target.tagName === 'VIDEO' ? target : (target.querySelector && target.querySelector('video'));
    var request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (request) {
      var attempt = request.call(target);
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        });
      }
      return;
    }
    if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  }

  function initFullscreen(root) {
    qsa('[data-media-fullscreen-trigger]', root).forEach(function (trigger) {
      if (trigger.__pdpFullscreen) return;
      trigger.__pdpFullscreen = true;
      if (!trigger.hasAttribute('type')) trigger.setAttribute('type', 'button');
      trigger.addEventListener('click', function () {
        requestFullscreen(fullscreenTarget(trigger));
      });
    });
  }

  /* ---- Swipers (data-ps-* driven) ---- */
  var SWIPER_BREAKPOINTS = { compact: 541, sm: 576, md: 768, tablet: 768, desktop: 768, lg: 1024, xl: 1280, wide: 1381, xxl: 1536 };
  var SWIPER_OPTIONS = [
    { attr: 'slides-per-view', key: 'slidesPerView', slides: true },
    { attr: 'slides-per-group', key: 'slidesPerGroup' },
    { attr: 'space-between', key: 'spaceBetween' },
    { attr: 'speed', key: 'speed' }
  ];

  function parseSlides(value) {
    if (String(value).trim().toLowerCase() === 'auto') return 'auto';
    var n = Number(value);
    return isFinite(n) ? n : undefined;
  }

  function readSwiperOptions(el) {
    var options = {};
    SWIPER_OPTIONS.forEach(function (def) {
      var base = el.getAttribute('data-ps-' + def.attr);
      if (base !== null && base !== '') {
        var v = def.slides ? parseSlides(base) : Number(base);
        if (typeof v !== 'undefined' && !(typeof v === 'number' && isNaN(v))) options[def.key] = v;
      }
      Object.keys(SWIPER_BREAKPOINTS).forEach(function (name) {
        var raw = el.getAttribute('data-ps-' + def.attr + '-' + name);
        if (raw === null || raw === '') return;
        var val = def.slides ? parseSlides(raw) : Number(raw);
        if (typeof val === 'undefined' || (typeof val === 'number' && isNaN(val))) return;
        var bp = SWIPER_BREAKPOINTS[name];
        options.breakpoints = options.breakpoints || {};
        options.breakpoints[bp] = options.breakpoints[bp] || {};
        options.breakpoints[bp][def.key] = val;
      });
    });
    return options;
  }

  function syncDots(swiper) {
    var dots = swiper.pagination && swiper.pagination.el;
    if (!dots) return;
    var bullets = dots.querySelectorAll('.swiper-pagination-bullet');
    dots.classList.toggle('is-single-dot', bullets.length <= 1);
  }

  function initSwipers(root) {
    if (typeof window.Swiper === 'undefined') return;

    qsa('[data-pdp-swiper]', root).forEach(function (el) {
      if (el.__pdpSwiper) return;
      el.__pdpSwiper = true;

      var dots = el.querySelector('[data-pdp-dots]');
      var options = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 16,
        speed: 560,
        grabCursor: true,
        threshold: 3,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        a11y: { enabled: true, containerMessage: el.getAttribute('aria-label') || 'Slider' },
        on: {
          init: syncDots,
          slideChange: syncDots,
          resize: syncDots,
          update: syncDots
        }
      };

      if (dots) {
        options.pagination = {
          el: dots,
          clickable: true,
          bulletClass: 'swiper-pagination-bullet pdp__dot',
          bulletActiveClass: 'swiper-pagination-bullet-active is-active'
        };
      }

      var data = readSwiperOptions(el);
      Object.keys(data).forEach(function (key) {
        if (key === 'breakpoints') {
          options.breakpoints = options.breakpoints || {};
          Object.keys(data.breakpoints).forEach(function (bp) {
            options.breakpoints[bp] = Object.assign({}, options.breakpoints[bp], data.breakpoints[bp]);
          });
        } else {
          options[key] = data[key];
        }
      });

      el.__pdpSwiperInstance = new window.Swiper(el, options);
    });
  }

  /* ---- Count-ups ---- */
  function countConfig(el) {
    var target = Number(el.getAttribute('data-count-to'));
    if (!isFinite(target)) return null;
    return {
      target: target,
      from: Number(el.getAttribute('data-count-from') || 0) || 0,
      decimals: Number(el.getAttribute('data-count-decimals') || 0) || 0,
      duration: Number(el.getAttribute('data-count-duration') || 1800) || 1800,
      grouping: el.getAttribute('data-count-grouping') === 'true'
    };
  }

  function formatCount(value, decimals, grouping) {
    var parts = value.toFixed(decimals).split('.');
    if (grouping) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function animateCount(el) {
    if (el.__pdpCounting) return;
    var config = countConfig(el);
    if (!config) return;
    el.__pdpCounting = true;

    if (reduceMotion() || config.duration <= 0) {
      el.textContent = formatCount(config.target, config.decimals, config.grouping);
      return;
    }

    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var progress = Math.min(1, (now - start) / config.duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(config.from + (config.target - config.from) * eased, config.decimals, config.grouping);
      if (progress < 1) window.requestAnimationFrame(tick);
      else el.textContent = formatCount(config.target, config.decimals, config.grouping);
    }
    window.requestAnimationFrame(tick);
  }

  function initCounts(root) {
    var items = qsa('[data-pdp-count]', root).filter(function (el) { return !el.__pdpCountBound; });
    if (!items.length) return;

    items.forEach(function (el) {
      el.__pdpCountBound = true;
      var config = countConfig(el);
      if (config) el.textContent = formatCount(config.from, config.decimals, config.grouping);
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(animateCount);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) animateCount(entry.target);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.01 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Choice scroll highlight ---- */
  function splitLines(el) {
    if (el.__pdpLines) return;
    var nodes = Array.prototype.slice.call(el.childNodes);
    var fragment = document.createDocumentFragment();
    var line = document.createElement('span');
    line.className = 'pdp-choice__line';

    function commit() {
      if (!line.textContent.trim()) return;
      fragment.appendChild(line);
      line = document.createElement('span');
      line.className = 'pdp-choice__line';
    }

    nodes.forEach(function (node, index) {
      if (node.nodeType === 3) {
        line.appendChild(document.createTextNode(node.textContent));
        if (index === nodes.length - 1) commit();
      } else if (node.nodeName === 'BR') {
        commit();
      } else if (node.nodeType === 1) {
        line.appendChild(node);
        if (index === nodes.length - 1) commit();
      }
    });
    commit();

    el.innerHTML = '';
    el.appendChild(fragment);
    el.__pdpLines = true;
  }

  function initHighlights(root) {
    var items = qsa('[data-pdp-highlight]', root).filter(function (el) { return !el.__pdpHighlight; });
    if (!items.length && !root.__pdpHighlightInit) return;

    items.forEach(function (el) {
      el.__pdpHighlight = true;
      splitLines(el);
    });

    if (root.__pdpHighlightInit) return;
    root.__pdpHighlightInit = true;

    var update = rafThrottle(function () {
      var vh = viewportHeight();
      qsa('[data-pdp-highlight]', root).forEach(function (el) {
        var section = el.closest(SECTION_SELECTOR) || el;
        var rect = section.getBoundingClientRect();
        var startPoint = vh * 0.78;
        var endPoint = vh * 0.38;
        var progress = Math.max(0, Math.min(1, (startPoint - rect.top) / Math.max(1, startPoint - endPoint)));
        var lines = qsa('.pdp-choice__line', el);
        var active = Math.round(progress * lines.length);
        lines.forEach(function (line, index) {
          line.classList.toggle('is-active', index < active);
        });
      });
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---- Formula scroll-pan (mobile) ---- */
  function initScrollPan(root) {
    var frames = qsa('[data-pdp-pan]', root).filter(function (el) { return !el.__pdpPan; });
    if (!frames.length && !root.__pdpPanInit) return;

    frames.forEach(function (frame) {
      frame.__pdpPan = true;
      frame.__pdpPanImage = frame.querySelector('[data-pdp-pan-image]') || frame.querySelector('img');
    });

    if (root.__pdpPanInit) return;
    root.__pdpPanInit = true;

    function overflow(frame) {
      var image = frame.__pdpPanImage;
      if (!image) return 0;
      var rect = frame.getBoundingClientRect();
      var rendered = image.getBoundingClientRect().width || image.offsetWidth;
      if (!rendered && image.naturalWidth && image.naturalHeight) {
        rendered = rect.height * (image.naturalWidth / image.naturalHeight);
      }
      return Math.max(0, rendered - rect.width);
    }

    var update = rafThrottle(function () {
      var mobile = MOBILE && MOBILE.matches;
      qsa('[data-pdp-pan]', root).forEach(function (frame) {
        var rect = frame.getBoundingClientRect();
        var distance = overflow(frame);
        if (!mobile || reduceMotion() || !distance) {
          frame.__pdpPanDone = false;
          frame.classList.remove('is-pan-complete');
          frame.style.setProperty('--pdp-pan-x', '0px');
          frame.style.setProperty('--pdp-pan-end-x', '0px');
          return;
        }
        frame.style.setProperty('--pdp-pan-x', '0px');
        frame.style.setProperty('--pdp-pan-end-x', (distance * -1).toFixed(2) + 'px');
        if (!frame.__pdpPanDone && rect.top <= viewportHeight() && rect.bottom >= 0) {
          frame.__pdpPanDone = true;
        }
        frame.classList.toggle('is-pan-complete', !!frame.__pdpPanDone);
      });
    });

    qsa('[data-pdp-pan]', root).forEach(function (frame) {
      var image = frame.__pdpPanImage;
      if (image && !(image.complete && image.naturalWidth)) {
        image.addEventListener('load', update, { once: true });
      }
    });

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (MOBILE && MOBILE.addEventListener) MOBILE.addEventListener('change', update);
  }

  /* ---- Usage step ↔ video ---- */
  function initUsage(root) {
    qsa('[data-pdp-usage-steps]', root).forEach(function (group) {
      if (group.__pdpUsage) return;
      var section = group.closest(SECTION_SELECTOR) || root;
      var video = section.querySelector('[data-pdp-video]');
      var steps = qsa('[data-pdp-usage-step]', group)
        .map(function (step) { return { step: step, time: Number(step.getAttribute('data-pdp-usage-time') || 0) }; })
        .filter(function (item) { return isFinite(item.time); })
        .sort(function (a, b) { return a.time - b.time; });

      if (!video || !steps.length) return;
      group.__pdpUsage = true;

      function setActive(index) {
        steps.forEach(function (item, i) {
          var active = i === index;
          item.step.classList.toggle('is-active', active);
          item.step.setAttribute('aria-current', active ? 'step' : 'false');
        });
      }

      function syncActive() {
        var time = video.currentTime || 0;
        var index = 0;
        steps.forEach(function (item, i) { if (time >= item.time) index = i; });
        setActive(index);
      }

      function seek(item, index) {
        prepareVideo(video);
        try { video.currentTime = item.time; } catch (e) {}
        setActive(index);
        playVideo(video);
      }

      steps.forEach(function (item, index) {
        item.step.addEventListener('click', function () { seek(item, index); });
        item.step.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          seek(item, index);
        });
      });

      setActive(0);
      video.addEventListener('timeupdate', syncActive);
      video.addEventListener('seeking', syncActive);
      video.addEventListener('loadedmetadata', syncActive);
    });
  }

  /* ---- FAQ accordion ---- */
  function initFaq(root) {
    qsa('[data-pdp-faq]', root).forEach(function (accordion, accordionIndex) {
      if (accordion.__pdpFaq) return;
      accordion.__pdpFaq = true;

      var items = qsa('[data-pdp-faq-item]', accordion);

      function setOpen(activeItem) {
        var shouldOpen = !activeItem.classList.contains('is-open');
        items.forEach(function (item) {
          var button = item.querySelector('[data-pdp-faq-button]');
          var panel = item.querySelector('[data-pdp-faq-panel]');
          var open = item === activeItem && shouldOpen;
          item.classList.toggle('is-open', open);
          if (button) button.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (panel) panel.hidden = !open;
        });
      }

      items.forEach(function (item, itemIndex) {
        var button = item.querySelector('[data-pdp-faq-button]');
        var panel = item.querySelector('[data-pdp-faq-panel]');
        if (!button || !panel) return;

        var baseId = 'pdp-faq-' + (accordionIndex + 1) + '-' + (itemIndex + 1);
        if (!button.id) button.id = baseId + '-button';
        if (!panel.id) panel.id = baseId + '-panel';
        button.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', button.id);

        var open = item.classList.contains('is-open');
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;

        button.addEventListener('click', function () { setOpen(item); });
      });
    });
  }

  /* ---- At-a-glance overlay height (equalise gradient overlay) ---- */
  function initGlanceHeights(root) {
    if (root.__pdpGlanceInit) {
      root.__pdpGlanceMeasure();
      return;
    }

    var contents = qsa('.pdp-glance__content', root);
    if (!contents.length) return;
    root.__pdpGlanceInit = true;

    var measure = rafThrottle(function () {
      root.classList.add('is-measuring-glance');
      var max = 0;
      contents.forEach(function (content) {
        content.style.height = 'auto';
        max = Math.max(max, content.getBoundingClientRect().height);
      });
      var value = max ? Math.ceil(max) + 'px' : '';
      contents.forEach(function (content) {
        content.style.height = value;
        var card = content.parentElement;
        if (card) {
          if (value) card.style.setProperty('--pdp-glance-overlay-h', value);
          else card.style.removeProperty('--pdp-glance-overlay-h');
        }
      });
      root.classList.remove('is-measuring-glance');
    });

    root.__pdpGlanceMeasure = measure;
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ---- Standard card height (prevent jump on details toggle) ---- */
  function initStandardHeights(root) {
    var cards = qsa('.pdp-standard__card', root).filter(function (card) {
      return card.querySelector('.pdp-standard__detail');
    });
    if (!cards.length) return;

    if (root.__pdpStandardInit) {
      root.__pdpStandardMeasure();
      return;
    }
    root.__pdpStandardInit = true;

    var measure = rafThrottle(function () {
      cards.forEach(function (card) {
        var detail = card.querySelector('.pdp-standard__detail');
        if (!detail) return;
        var wasOpen = detail.open;
        card.style.minHeight = '';
        detail.open = false;
        var closed = Math.ceil(card.getBoundingClientRect().height);
        detail.open = true;
        var open = Math.ceil(card.getBoundingClientRect().height);
        detail.open = wasOpen;
        card.style.minHeight = Math.max(closed, open) + 'px';
      });
    });

    root.__pdpStandardMeasure = measure;
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ---- Boot ---- */
  function init(root) {
    if (!root) return;
    initReveal(root);
    initVideos(root);
    initFullscreen(root);
    initSwipers(root);
    initCounts(root);
    initHighlights(root);
    initScrollPan(root);
    initUsage(root);
    initFaq(root);
    initGlanceHeights(root);
    initStandardHeights(root);
  }

  function boot() {
    qsa(ROOT_SELECTOR).forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);
})(window, document);
