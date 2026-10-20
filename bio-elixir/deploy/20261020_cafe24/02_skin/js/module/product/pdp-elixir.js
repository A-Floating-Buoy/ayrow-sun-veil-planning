/**
 * PDP — BIO Elixir story interactions
 * Product-specific behaviour layered on top of the shared `.pdp` framework (pdp.js).
 * pdp.js already handles scroll reveal · videos · FAQ accordion; this file adds:
 *
 *   [data-pdp-tabs]       clinical timepoint tabs (NOW · 24H · 4 WEEKS)
 *   [data-pdp-results]    result cards → matching visual (chart / before·after)
 *   [data-pdp-compare]    draggable before/after comparison
 *   [data-pdp-hotspots]   ingredient spheres with hover/tap popups
 *   [data-pdp-steps]      usage steps without a video (hover / click to highlight)
 *   [data-pdp-ritual]     daily ritual scenes (active widens in place · swipe on mobile · optional autoplay)
 *   .pdp-concentrate__title-swap  MIST → CONCENTRATE crossfade driven by scroll position
 */
(function (window, document) {
  'use strict';

  var ROOT_SELECTOR = '.pdp--elixir[data-pdp]';
  var HOVER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function canHover() {
    return !!(HOVER && HOVER.matches);
  }

  /* ---- Tabs (roving tabindex, arrow keys) ---- */
  function initTabs(root) {
    qsa('[data-pdp-tabs]', root).forEach(function (group, groupIndex) {
      if (group.__pdpTabs) return;
      group.__pdpTabs = true;

      var tabs = qsa('[role="tab"]', group);
      var scope = group.closest('[data-pdp-section]') || root;
      var panels = tabs.map(function (tab) {
        return scope.querySelector('#' + tab.getAttribute('aria-controls'));
      });

      function select(index, focus) {
        tabs.forEach(function (tab, i) {
          var active = i === index;
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
          tab.tabIndex = active ? 0 : -1;
          tab.classList.toggle('is-active', active);
          if (panels[i]) panels[i].hidden = !active;
        });
        if (focus) tabs[index].focus();
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { select(index, false); });
        tab.addEventListener('keydown', function (event) {
          var next = null;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next === null) return;
          event.preventDefault();
          select(next, true);
        });
      });

      var initial = tabs.findIndex(function (tab) { return tab.getAttribute('aria-selected') === 'true'; });
      select(initial < 0 ? 0 : initial, false);
      group.setAttribute('data-pdp-tabs-index', String(groupIndex));
    });
  }

  /* ---- Result cards → visual ---- */
  function initResults(root) {
    qsa('[data-pdp-results]', root).forEach(function (group) {
      if (group.__pdpResults) return;
      group.__pdpResults = true;

      var cards = qsa('[data-pdp-result]', group);
      var visuals = qsa('[data-pdp-result-visual]', group);

      function select(key) {
        cards.forEach(function (card) {
          var active = card.getAttribute('data-pdp-result') === key;
          card.classList.toggle('is-active', active);
          card.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        visuals.forEach(function (visual) {
          var active = visual.getAttribute('data-pdp-result-visual') === key;
          visual.hidden = !active;
          visual.classList.toggle('is-active', active);
        });
      }

      cards.forEach(function (card) {
        card.addEventListener('click', function () { select(card.getAttribute('data-pdp-result')); });
      });

      var initial = cards.filter(function (card) { return card.classList.contains('is-active'); })[0] || cards[0];
      if (initial) select(initial.getAttribute('data-pdp-result'));
    });
  }

  /* ---- Before / after comparison ---- */
  function initCompare(root) {
    qsa('[data-pdp-compare]', root).forEach(function (frame) {
      if (frame.__pdpCompare) return;
      frame.__pdpCompare = true;

      var range = frame.querySelector('[data-pdp-compare-range]');
      var dragging = false;

      function set(percent) {
        var value = Math.max(0, Math.min(100, percent));
        frame.style.setProperty('--pdp-compare', value + '%');
        if (range && Number(range.value) !== value) range.value = String(value);
      }

      function fromPointer(event) {
        var rect = frame.getBoundingClientRect();
        if (!rect.width) return;
        set(((event.clientX - rect.left) / rect.width) * 100);
      }

      frame.addEventListener('pointerdown', function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        dragging = true;
        frame.classList.add('is-dragging');
        if (frame.setPointerCapture) frame.setPointerCapture(event.pointerId);
        fromPointer(event);
      });
      frame.addEventListener('pointermove', function (event) {
        if (dragging) fromPointer(event);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
        frame.addEventListener(type, function () {
          dragging = false;
          frame.classList.remove('is-dragging');
        });
      });

      if (range) {
        range.addEventListener('input', function () { set(Number(range.value)); });
        set(Number(range.value));
      }
    });
  }

  /* ---- Ingredient hotspots ---- */
  function initHotspots(root) {
    qsa('[data-pdp-hotspots]', root).forEach(function (stage) {
      if (stage.__pdpHotspots) return;
      stage.__pdpHotspots = true;

      var spots = qsa('[data-pdp-hotspot]', stage);
      var active = null;

      function setActive(spot) {
        active = spot;
        spots.forEach(function (item) {
          var on = item === spot;
          var button = item.querySelector('[data-pdp-hotspot-button]');
          var popup = item.querySelector('[data-pdp-hotspot-popup]');
          item.classList.toggle('is-active', on);
          if (button) button.setAttribute('aria-expanded', on ? 'true' : 'false');
          if (popup) popup.hidden = !on;
        });
        stage.classList.toggle('has-active', !!spot);
      }

      spots.forEach(function (spot) {
        var button = spot.querySelector('[data-pdp-hotspot-button]');
        if (!button) return;

        button.addEventListener('click', function () {
          setActive(active === spot && !canHover() ? null : spot);
        });
        spot.addEventListener('mouseenter', function () {
          if (canHover()) setActive(spot);
        });
        button.addEventListener('focus', function () { setActive(spot); });
      });

      stage.addEventListener('mouseleave', function () {
        if (canHover()) setActive(null);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && active) setActive(null);
      });
      document.addEventListener('click', function (event) {
        if (active && !stage.contains(event.target)) setActive(null);
      });

      setActive(null);

      // Mobile: the canvas scrolls horizontally — start centred on the spheres
      if (stage.scrollWidth > stage.clientWidth) {
        stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      }
    });
  }

  /* ---- Usage steps (no video) ---- */
  function initSteps(root) {
    qsa('[data-pdp-steps]', root).forEach(function (group) {
      if (group.__pdpSteps) return;
      group.__pdpSteps = true;

      var steps = qsa('[data-pdp-step]', group);

      function setActive(index) {
        steps.forEach(function (step, i) {
          var on = i === index;
          step.classList.toggle('is-active', on);
          step.setAttribute('aria-current', on ? 'step' : 'false');
        });
      }

      steps.forEach(function (step, index) {
        step.addEventListener('click', function () { setActive(index); });
        step.addEventListener('mouseenter', function () { if (canHover()) setActive(index); });
        step.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          setActive(index);
        });
      });

      setActive(0);
    });
  }

  /* ---- Daily ritual: fixed time order, active scene widens in place (desktop) · swipe (≤1024px) ----
   * hover / focus / click selects a scene; [data-pdp-ritual-autoplay="ms"] advances while visible.
   * Autoplay pauses on hover · focus · hidden tab and stops for good once the visitor clicks or swipes. */
  function initRitual(root) {
    var SWIPE = window.matchMedia && window.matchMedia('(max-width: 1024px)');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    qsa('[data-pdp-ritual]', root).forEach(function (carousel) {
      if (carousel.__pdpRitual) return;
      carousel.__pdpRitual = true;

      var list = carousel.querySelector('.pdp-ritual__list');
      var items = qsa('[data-pdp-ritual-item]', carousel);
      var dots = qsa('[data-pdp-ritual-dot]', carousel);
      var count = items.length;
      var current = 0;

      function isSwipe() { return !!(SWIPE && SWIPE.matches); }

      function setActive(index, scroll) {
        current = (index + count) % count;
        items.forEach(function (item, i) {
          var on = i === current;
          item.classList.toggle('is-active', on);
          if (on) item.setAttribute('aria-current', 'true');
          else item.removeAttribute('aria-current');
        });
        dots.forEach(function (dot, i) {
          if (i === current) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        if (scroll && isSwipe() && list) {
          // 첫 카드 기준 — 모바일 full-bleed에서 목록 좌측 여백(padding)이 있어도 카드가 여백 선에 맞는다
          list.scrollTo({ left: items[current].offsetLeft - items[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
        }
      }

      /* Autoplay */
      var delay = parseInt(carousel.getAttribute('data-pdp-ritual-autoplay'), 10);
      var enabled = delay > 0 && !reduce;
      var timer = null;
      var visible = false;
      var paused = false;

      function clear() {
        if (timer) window.clearTimeout(timer);
        timer = null;
      }

      function schedule() {
        clear();
        if (!enabled || !visible || paused || document.hidden) return;
        timer = window.setTimeout(function () {
          setActive(current + 1, true);
          schedule();
        }, delay);
      }

      function stop() {
        enabled = false;
        clear();
      }

      /* Desktop: click (or Enter / Space) widens the scene in place */
      items.forEach(function (item, index) {
        item.addEventListener('click', function () {
          stop();
          if (!isSwipe()) setActive(index, false);
        });
        item.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          stop();
          setActive(index, true);
        });
      });

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          stop();
          setActive(index, true);
        });
      });

      /* Swipe: the card snapped to the left edge becomes active */
      if (list) {
        var ticking = false;
        list.addEventListener('scroll', function () {
          if (!isSwipe() || ticking) return;
          ticking = true;
          window.requestAnimationFrame(function () {
            ticking = false;
            var left = list.scrollLeft;
            var nearest = 0;
            items.forEach(function (item, i) {
              var offset = item.offsetLeft - list.offsetLeft;
              if (Math.abs(offset - left) < Math.abs(items[nearest].offsetLeft - list.offsetLeft - left)) nearest = i;
            });
            if (nearest !== current) setActive(nearest, false);
          });
        }, { passive: true });
        list.addEventListener('touchstart', stop, { passive: true });
      }

      carousel.addEventListener('mouseenter', function () { paused = true; clear(); });
      carousel.addEventListener('mouseleave', function () { paused = false; schedule(); });
      carousel.addEventListener('focusin', function () { paused = true; clear(); });
      carousel.addEventListener('focusout', function (event) {
        if (carousel.contains(event.relatedTarget)) return;
        paused = false;
        schedule();
      });
      document.addEventListener('visibilitychange', schedule);

      if (enabled && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) schedule();
          else clear();
        }, { threshold: 0.4 }).observe(carousel);
      }

      var initial = items.findIndex(function (item) { return item.classList.contains('is-active'); });
      setActive(initial < 0 ? 0 : initial, false);
    });
  }

  /* ---- Concentrate title: MIST fades out with scroll, CONCENTRATE remains ---- */
  function initConcentrateSwap(root) {
    if (root.__pdpConcentrateSwap) return;
    root.__pdpConcentrateSwap = true;

    var swaps = qsa('.pdp-concentrate__title-swap', root);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!swaps.length || reduce) return;

    var START = 0.85; // title top at 85% of the viewport → MIST fully visible
    var END = 0.4;    // title top at 40% of the viewport → only CONCENTRATE
    var ticking = false;

    function clamp(value) { return Math.min(1, Math.max(0, value)); }

    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      swaps.forEach(function (swap) {
        var top = swap.getBoundingClientRect().top;
        var progress = clamp((vh * START - top) / (vh * (START - END)));
        // CONCENTRATE starts emerging once MIST is a third of the way gone
        var main = clamp((progress - 0.3) / 0.7);
        swap.style.setProperty('--pdp-mist-progress', progress.toFixed(3));
        swap.style.setProperty('--pdp-concentrate-progress', main.toFixed(3));
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    swaps.forEach(function (swap) { swap.classList.add('is-scroll-linked'); });
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ---- Parallax: layer drifts slower than the page while its frame crosses the viewport ---- */
  function initParallax(root) {
    if (root.__pdpParallax) return;
    root.__pdpParallax = true;

    var frames = qsa('[data-pdp-parallax]', root);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!frames.length || reduce) return;

    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      frames.forEach(function (frame) {
        var rect = frame.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        // -1: frame just below the viewport → 0: centred → 1: frame just above it
        var progress = ((vh - rect.top) / (vh + rect.height)) * 2 - 1;
        // 프레임에 넘겨 이미지 레이어와 프레임 안 다른 요소(D: 문구)가 같은 값을 물려받는다
        frame.style.setProperty('--pdp-parallax', (-progress).toFixed(4));
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ---- Chart line draw (once each chart enters the viewport) ---- */
  function initChartDraw(root) {
    if (root.__pdpChartDraw) return;
    root.__pdpChartDraw = true;

    var charts = qsa('.pdp-chart', root);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw(chart) { chart.classList.add('is-drawn'); }

    if (reduce || !('IntersectionObserver' in window)) {
      charts.forEach(draw);
      return;
    }

    // Charts in hidden tabs/visuals only intersect once they are shown
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        draw(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    charts.forEach(function (chart) { observer.observe(chart); });
    root.classList.add('is-chart-draw');
  }

  /* ---- Boot ---- */
  function init(root) {
    if (!root) return;
    initChartDraw(root);
    initConcentrateSwap(root);
    initParallax(root);
    initTabs(root);
    initResults(root);
    initCompare(root);
    initHotspots(root);
    initSteps(root);
    initRitual(root);
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
