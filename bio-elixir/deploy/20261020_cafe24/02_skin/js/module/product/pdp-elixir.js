/**
 * PDP — BIO Elixir story interactions
 * Product-specific behaviour layered on top of the shared `.pdp` framework (pdp.js).
 * pdp.js already handles scroll reveal · videos · FAQ accordion; this file adds:
 *
 *   .pdp-elixir-hero          문구 흐림(스크롤) · 반복 영상(loop)
 *   .pdp-concentrate__title-swap  MIST → CONCENTRATE crossfade driven by scroll position
 *   [data-pdp-timepoints]     임상 시점 탭(NOW · 24H · 4 WEEKS) — 1회 자동 재생 · 모바일 가로 슬라이더
 *   svg.pdp-chart             차트 그리기 · 화면 px 기준 글자 · 선 크기 · 통계 주석 · 24H 구분선 정렬
 *   [data-pdp-compare]        draggable before/after comparison
 *   [data-pdp-parallax]       STECHA 들판 패럴렉스
 *   .pdp-botanical__bottle    병 애니메이션 — 섹션에 들어올 때마다 처음부터
 *   .pdp-harmony--grid        Harmony 모눈 — 소개 블록 높이를 칸 단위로 · 경계선 그리기
 *   [data-pdp-hotspots]       ingredient spheres with hover/tap popups
 *   [data-pdp-ritual]         daily ritual scenes (active widens in place · swipe on mobile · optional autoplay)
 *   [data-pdp-slogan]         Ritual 마무리 문구 순서 등장
 *   [data-pdp-steps]          usage steps without a video (hover / click to highlight)
 *
 * 2026-10-26: 테스트안(A–D) 스크립트 pdp-elixir-proto.js를 이 파일로 합침 — 실제 상세(D안) 동작만 남김
 */
(function (window, document) {
  'use strict';

  var ROOT_SELECTOR = '.pdp--elixir[data-pdp]';
  var HOVER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var MOBILE = window.matchMedia && window.matchMedia('(max-width: 767px)');

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function canHover() {
    return !!(HOVER && HOVER.matches);
  }

  function reduceMotion() {
    return !!(REDUCED && REDUCED.matches);
  }

  function isMobile() {
    return !!(MOBILE && MOBILE.matches);
  }

  /* ---- Before / after comparison ---- */
  function initCompare(root) {
    qsa('[data-pdp-compare]', root).forEach(function (frame) {
      if (frame.__pdpCompare) return;
      frame.__pdpCompare = true;

      var range = frame.querySelector('[data-pdp-compare-range]');
      var beforeImg = frame.querySelector(':scope > .pdp-compare__img');
      var afterImg = frame.querySelector('.pdp-compare__after .pdp-compare__img');
      var beforeLabel = frame.querySelector('.pdp-timepoints__ba--before');
      var afterLabel = frame.querySelector('.pdp-timepoints__ba--after');
      var dragging = false;

      // 이동 범위: 경계선이 BEFORE/AFTER 라벨을 침범하지 않고(라벨에서 8px), 두 사진이 덮지 못하는
      // 가장자리(흰 여백 · 뒤쪽 사진)가 드러나지 않는 구간으로 제한 (2026-10-21 수정안 1안)
      function limits() {
        var rect = frame.getBoundingClientRect();
        var lo = 0;
        var hi = 100;
        if (!rect.width) return [lo, hi];
        function pct(x) { return ((x - rect.left) / rect.width) * 100; }
        if (afterImg) lo = Math.max(lo, pct(afterImg.getBoundingClientRect().left));
        if (beforeImg) hi = Math.min(hi, pct(beforeImg.getBoundingClientRect().right));
        if (beforeLabel && beforeLabel.offsetWidth) lo = Math.max(lo, pct(beforeLabel.getBoundingClientRect().right + 8));
        if (afterLabel && afterLabel.offsetWidth) hi = Math.min(hi, pct(afterLabel.getBoundingClientRect().left - 8));
        return lo < hi ? [lo, hi] : [0, 100];
      }

      function set(percent) {
        var bounds = limits();
        var value = Math.max(bounds[0], Math.min(bounds[1], percent));
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

        // 터치 시 focus가 click보다 먼저 와서 열자마자 click이 닫아 버리던 문제(두 번 탭해야 열림) —
        //   포인터로 생긴 focus는 무시하고 키보드 focus만 연다
        var pointerFocus = false;
        button.addEventListener('pointerdown', function () { pointerFocus = true; });
        button.addEventListener('click', function () {
          pointerFocus = false;
          setActive(active === spot && !canHover() ? null : spot);
        });
        spot.addEventListener('mouseenter', function () {
          if (canHover()) setActive(spot);
        });
        button.addEventListener('focus', function () {
          if (!pointerFocus) setActive(spot);
        });
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
    var reduce = reduceMotion();

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
    var reduce = reduceMotion();
    if (!swaps.length || reduce) return;

    var START = 0.85; // title top at 85% of the viewport → MIST fully visible
    var END = 0.6;    // title top at 60% of the viewport → only CONCENTRATE (2026-10-21: 40% → 60%, 블러 해제를 약 1초 앞당김)
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
    var reduce = reduceMotion();
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
        // 프레임에 넘겨 이미지 레이어와 프레임 안 문구가 같은 값을 물려받는다
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
    var reduce = reduceMotion();

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

  /* ---- Ritual slogan: 국문 첫 줄 → 「스킨 롱제비티」 → 영문 순서로 등장 (지연은 CSS) ---- */
  function initSlogan(root) {
    if (root.__pdpSlogan) return;
    root.__pdpSlogan = true;

    var slogans = qsa('[data-pdp-slogan]', root);
    var reduce = reduceMotion();
    if (!slogans.length || reduce || !('IntersectionObserver' in window)) return;

    // JS가 붙은 뒤에만 숨김 상태로 시작 — 스크립트가 없으면 처음부터 보인다
    slogans.forEach(function (el) { el.classList.add('is-staged'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    slogans.forEach(function (el) { observer.observe(el); });
  }

  /* ---- Botanical 병 애니메이션: 섹션에 들어올 때마다 처음부터 재생 ----
     병이 화면에 40% 이상 보이면 .is-revealed(정제수 → 추출물 → 확산 · 수치 등장이 모두 이 클래스 기준)를 붙이고,
     섹션이 화면 밖으로 완전히 나가면 떼어 초기 상태로 되돌린다. 다시 들어오면 처음부터 재생된다 */
  function initBotanicalReplay(root) {
    if (root.__pdpBotanicalReplay) return;
    root.__pdpBotanicalReplay = true;
    if (!('IntersectionObserver' in window)) return;

    qsa('[data-pdp-section="botanical"]', root).forEach(function (section) {
      var bottle = section.querySelector('.pdp-botanical__bottle');
      if (!bottle) return;

      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.intersectionRatio >= 0.4) bottle.classList.add('is-revealed');
        });
      }, { threshold: [0, 0.4] }).observe(bottle);

      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) bottle.classList.remove('is-revealed');
        });
      }, { threshold: 0 }).observe(section);
    });
  }

  /* ---- Clinical timepoints (NOW · 24H · 4 WEEKS) ----
     섹션에 들어오면 한 번 자동 재생(시점마다 data-pdp-timepoints ms) 후 마지막 시점에서 멈춘다.
     화면 밖 · 탭 비활성 · 마우스를 올린 동안은 멈추고, 탭 · 카드를 직접 만지면 끝낸다.
     모바일(≤767px)은 근거가 아래로 쌓여 길어지므로 자동 재생 없음 · 동작 줄이기면 자동 재생 없음 */
  function createAutoplay(options) {
    var state = { index: 0, elapsed: 0, stopped: false, hover: false, inView: false };
    var last = 0;

    if (reduceMotion()) return { stop: function () {} };

    function running() {
      return !state.stopped && !state.hover && state.inView && !document.hidden &&
        !(options.disableOn && options.disableOn.matches);
    }

    function tick(now) {
      if (state.stopped) return;
      var dt = last ? now - last : 0;
      last = now;
      if (running()) {
        state.elapsed += dt;
        if (state.elapsed >= options.duration) {
          state.index += 1;
          state.elapsed = 0;
          if (state.index >= options.count) {
            state.stopped = true;
            return;
          }
          options.select(state.index);
        }
      }
      window.requestAnimationFrame(tick);
    }

    if (canHover()) {
      options.hoverTarget.addEventListener('mouseenter', function () { state.hover = true; });
      options.hoverTarget.addEventListener('mouseleave', function () { state.hover = false; });
    }

    if ('IntersectionObserver' in window) {
      // 화면 세로 중앙 40% 띠에 걸쳐 있으면 재생 — 요소가 화면보다 커도(모바일) 동작
      new IntersectionObserver(function (entries) {
        state.inView = entries[0].isIntersecting;
      }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 }).observe(options.observe);
    } else {
      state.inView = true;
    }

    window.requestAnimationFrame(tick);
    return { stop: function () { state.stopped = true; } };
  }

  /* 차트 그리기: 보이는 시점 패널이 화면에 들어오거나 시점이 바뀔 때마다 선 · 점 · 값을 다시 그린다 */
  function drawCharts(panel) {
    if (!panel) return;
    panel.classList.remove('is-drawn');
    void panel.offsetWidth; // restart animation
    panel.classList.add('is-drawn');
  }

  function initTimepoints(timepoints) {
    if (timepoints.__pdpTimepoints) return;
    timepoints.__pdpTimepoints = true;

    var tabs = qsa('[role="tab"]', timepoints);
    var panels = tabs.map(function (tab) {
      return timepoints.querySelector('#' + tab.getAttribute('aria-controls'));
    });
    var panelsWrap = timepoints.querySelector('.pdp-timepoints__panels');
    var strip = timepoints.querySelector('.pdp-timepoints__tabs');
    var stuck = timepoints.querySelector('.pdp-timepoints__nav') || strip; // 모바일에서 상단에 고정되는 탭 묶음
    var player = null;
    var seen = false;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle('is-active', active);
        if (panels[i]) panels[i].hidden = !active;
      });
      if (focus) tabs[index].focus();
      if (seen) drawCharts(panels[index]);
    }

    function choose(index, focus) {
      if (player) player.stop();
      select(index, focus);
    }

    function selectedIndex() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('aria-selected') === 'true') return i;
      }
      return 0;
    }

    // 모바일: 탭 줄은 가로 슬라이더 — 넘겨서 멈춘(스냅된) 탭이 선택되고, 누른 탭은 앞으로 당겨온다
    function scrollToTab(index) {
      if (!strip || !isMobile()) return;
      strip.scrollTo({ left: tabs[index].offsetLeft - tabs[0].offsetLeft, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }

    // 모바일: 탭을 눌러 시점을 바꾸면 새 콘텐츠의 시작이 고정된 탭 줄 바로 아래 오도록 부드럽게 올린다
    // (콘텐츠 시작이 이미 보이면 움직이지 않음 · 스와이프 선택에는 적용하지 않음)
    function revealPanel(index) {
      if (!strip || !isMobile() || !panels[index]) return;
      // 위로 올리면 숨었던 헤더 · toc-bar가 다시 내려와 탭 줄도 내려간다 — 지금 위치가 아니라
      // 헤더 + toc-bar가 모두 보이는 상태를 기준으로 계산해야 콘텐츠 시작이 가려지지 않는다
      var header = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--offset-header')) || 0;
      var toc = document.querySelector('[data-toc-bar]');
      var tocHeight = toc && window.getComputedStyle(toc).display !== 'none' ? toc.offsetHeight : 0;
      var stuckBottom = Math.max((parseFloat(window.getComputedStyle(stuck).top) || 0), header + tocHeight) + stuck.offsetHeight;
      var target = stuckBottom + 12;
      var top = panels[index].getBoundingClientRect().top;
      if (top >= target - 1) return;
      window.scrollTo({ top: window.pageYOffset + top - target, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }

    if (strip) {
      var settle = null;
      strip.addEventListener('scroll', function () {
        if (!isMobile()) return;
        window.clearTimeout(settle);
        settle = window.setTimeout(function () {
          var nearest = 0;
          var best = Infinity;
          tabs.forEach(function (tab, i) {
            var d = Math.abs(tab.offsetLeft - tabs[0].offsetLeft - strip.scrollLeft);
            if (d < best) { best = d; nearest = i; }
          });
          if (nearest !== selectedIndex()) choose(nearest, false);
        }, 120);
      }, { passive: true });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { choose(index, false); scrollToTab(index); revealPanel(index); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        choose(next, true);
        scrollToTab(next);
        revealPanel(next);
      });
    });

    select(0, false);

    // NOW 카드 줄 높이를 변수로 — 24H 블록이 이 높이에 맞춘다.
    // 숨은 시점은 display: none이라 NOW가 숨으면 높이가 0 — 마지막으로 보였을 때 높이를 유지한다
    var nowRow = panels[0] && panels[0].querySelector('.pdp-timepoints__row');
    if (nowRow && 'ResizeObserver' in window) {
      new ResizeObserver(function () {
        var height = nowRow.getBoundingClientRect().height;
        if (height) panelsWrap.style.setProperty('--pdp-now-row-h', height + 'px');
      }).observe(nowRow);
    }
    // 근거 카드를 만지면(슬라이더 드래그 · 스와이프) 자동 재생을 멈춘다
    panelsWrap.addEventListener('pointerdown', function () { if (player) player.stop(); });

    if ('IntersectionObserver' in window) {
      var drawObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        seen = true;
        drawObserver.disconnect();
        drawCharts(panels.filter(function (panel) { return !panel.hidden; })[0]);
      }, { threshold: 0.3 });
      drawObserver.observe(panelsWrap);
    } else {
      seen = true;
      drawCharts(panels[0]);
    }

    player = createAutoplay({
      count: tabs.length,
      duration: Number(timepoints.getAttribute('data-pdp-timepoints')) || 7000,
      hoverTarget: timepoints,
      observe: panelsWrap,
      disableOn: MOBILE,
      select: function (index) { select(index, false); }
    });
  }

  /* ---- 차트 수치 라벨 · 선 · 점을 화면 px 기준으로 통일 ----
     SVG는 차트가 그려지는 배율(렌더 너비 / viewBox 너비)만큼 글자 · 선 · 점이 커지고 작아져 차트마다 달랐다.
     배율을 되돌린 user unit으로 넣는다: 수치 라벨 14px(모바일 12px) · 선 2px · 점 지름 8px.
     (선의 vector-effect: non-scaling-stroke는 pathLength 그리기 애니메이션과 충돌해 쓰지 않는다) */
  function initChartValueSize(root) {
    if (root.__pdpChartValueSize) return;
    root.__pdpChartValueSize = true;

    var charts = qsa('svg.pdp-chart', root);
    if (!charts.length || !('ResizeObserver' in window)) return;

    function fit(svg) {
      var vb = svg.viewBox && svg.viewBox.baseVal;
      var box = svg.getBoundingClientRect();
      if (!vb || !vb.width || !box.width) return; // 숨은 패널(모바일 display: none)은 보일 때 다시 계산
      // 화면에 그려지는 글자 크기를 모든 차트에서 같게: 수치 14 · 축 라벨 12 · 눈금/단위 11 (모바일 12 · 11 · 10)
      var mobile = isMobile();
      var target = mobile ? 12 : 14;
      // SVG가 영역을 채우며 비율을 지키면(meet) 너비 · 높이 중 작은 쪽 배율로 그려진다(24H · NOW 쿨링)
      var scale = Math.min(box.width / vb.width, box.height ? box.height / vb.height : Infinity);
      var units = target / scale;
      qsa('.pdp-chart__label', svg).forEach(function (text) {
        text.style.fontSize = ((mobile ? 11 : 12) / scale).toFixed(2) + 'px';
      });
      qsa('.pdp-chart__tick', svg).forEach(function (text) {
        text.style.fontSize = ((mobile ? 10 : 11) / scale).toFixed(2) + 'px';
      });
      var gap = 6 / scale; // 점과 글자 사이 화면 6px
      var stroke = 2 / scale;
      qsa('.pdp-chart__line', svg).forEach(function (line) {
        line.style.strokeWidth = stroke.toFixed(3);
      });
      // 점: 바깥 지름 8px — 속 빈 점은 테두리(2px) 포함, 채운 점은 반지름 4px
      qsa('.pdp-chart__dot', svg).forEach(function (dot) {
        var open = dot.classList.contains('pdp-chart__dot--open');
        dot.setAttribute('r', ((open ? 3 : 4) / scale).toFixed(2));
        if (open) dot.style.strokeWidth = stroke.toFixed(3);
      });
      qsa('.pdp-chart__value', svg).forEach(function (text) {
        text.style.fontSize = units.toFixed(2) + 'px';
        // 글자가 커지거나 작아져도 점과 겹치지 않게: 바로 앞 점 기준 위(아랫선) · 아래(윗선)로 다시 놓는다
        var dot = text.previousElementSibling;
        if (!dot || dot.tagName.toLowerCase() !== 'circle') return;
        if (!text.hasAttribute('data-y')) text.setAttribute('data-y', text.getAttribute('y'));
        var cy = parseFloat(dot.getAttribute('cy'));
        var r = parseFloat(dot.getAttribute('r')) || 0;
        var below = parseFloat(text.getAttribute('data-y')) > cy;
        var y = below ? cy + r + gap + units * 0.74 : cy - r - gap; // 0.74 ≈ 숫자 높이(대문자 높이) 비율
        text.setAttribute('y', y.toFixed(1));
      });
    }

    // 통계 주석(Ŧ · ** · * · #)의 시작을 Y축 숫자 왼쪽 끝에 맞춘다(2026-10-24 수정안 — 10-23엔 첫 눈금선 x1) —
    //   숫자는 오른쪽 정렬이라 가장 긴 숫자(예: 0.675)의 왼쪽 끝. 맨 위 단위(°C · SAI · A.U. …)는 제외.
    //   SVG가 비율을 지키며 가운데 놓이는 폭이 있어 CSS 패딩으로는 맞출 수 없다
    function alignSig(svg) {
      var box = svg.closest('.pdp-timepoints__card, .pdp-clinical__hydration-chart');
      var sig = box && box.querySelector('.pdp-timepoints__sig');
      var ticks = qsa('.pdp-chart__tick', svg);
      if (!sig || ticks.length < 2) return;
      sig.style.paddingLeft = '';
      var unit = ticks.reduce(function (top, t) {
        return parseFloat(t.getAttribute('y')) < parseFloat(top.getAttribute('y')) ? t : top;
      });
      var axisLeft = Infinity;
      ticks.forEach(function (t) {
        if (t !== unit) axisLeft = Math.min(axisLeft, t.getBoundingClientRect().left);
      });
      if (!axisLeft || axisLeft === Infinity) return; // 숨은 패널은 보일 때 다시 계산
      var indent = axisLeft - sig.getBoundingClientRect().left;
      if (indent >= 0) sig.style.paddingLeft = indent.toFixed(1) + 'px'; // 숫자가 길면(0.675) 카드 기본 여백보다 안쪽으로도
    }

    // 24H(2026-10-24 수정안): 왼쪽 문구의 구분선을 그래프 눈금선에 맞춘다 —
    //   제목 묶음 아래선 = 80 눈금선, 24시간 후 개선율 아래선 = 60 눈금선.
    //   두 열이 나란한 데스크톱에서만. 글자가 칸보다 크면(좁은 화면) 맞추지 않고 원래 간격으로 둔다
    function alignHydration(svg) {
      var block = svg.closest('.pdp-clinical__hydration');
      var head = block && block.querySelector('.pdp-hydration__head');
      var stat = block && block.querySelector('.pdp-hydration__stat');
      var grids = qsa('.pdp-chart__grid', svg);
      if (!head || !stat || grids.length < 2) return;
      head.style.paddingBottom = '';
      stat.style.paddingTop = '';
      stat.style.paddingBottom = '';
      var lines = grids.map(function (g) { return g.getBoundingClientRect().top; })
        .sort(function (a, b) { return a - b; });
      var copy = head.parentElement.getBoundingClientRect();
      if (!lines[0] || copy.right > svg.getBoundingClientRect().left) return; // 숨김 · 위아래로 쌓인 배치
      // 칸 높이는 위아래 여백으로 맞춘다: 제목 묶음은 위에 붙이고 아래 여백으로, 24시간 후 개선율은 칸 가운데에
      function inner(el) {
        var cs = getComputedStyle(el);
        return el.offsetHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0) - (parseFloat(cs.borderBottomWidth) || 0);
      }
      var headTop = head.getBoundingClientRect().top + (parseFloat(getComputedStyle(head).paddingTop) || 0);
      var headPad = lines[0] - 0.5 - headTop - inner(head); // 아래선(1px)의 가운데가 눈금선에
      var statPad = (lines[1] - lines[0] - 1 - inner(stat)) / 2;
      if (headPad < 8 || statPad < 8) return; // 글자 위아래 최소 8px — 모자라면(좁은 화면) 원래 간격
      head.style.paddingBottom = headPad.toFixed(1) + 'px';
      stat.style.paddingTop = statPad.toFixed(1) + 'px';
      stat.style.paddingBottom = statPad.toFixed(1) + 'px';
    }

    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        fit(entry.target);
        alignSig(entry.target);
        alignHydration(entry.target);
      });
    });
    charts.forEach(function (svg) { observer.observe(svg); });
  }

  /* ---- Hero: 문구 흐림 — 히어로 상단이 화면 위를 지난 거리(px)를 --pdp-hero-y로 넘긴다.
     이미지는 움직이지 않는다: 와이드 화면에서는 CSS가 사진을 히어로 높이에 맞춰 통째로 보여 준다 */
  function initHeroParallax(root) {
    var hero = root.querySelector('.pdp-elixir-hero');
    if (!hero || hero.__pdpHeroParallax) return;
    hero.__pdpHeroParallax = true;
    if (reduceMotion()) return;
    var queued = false;

    function update() {
      queued = false;
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty('--pdp-hero-y', Math.min(rect.height, Math.max(0, -rect.top)).toFixed(1));
    }

    function request() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* ---- Hero: 반복 영상(2026-10-26 loop로 확정) — 히어로 포스터(영상 첫 프레임 <picture>) 위에 영상을 얹는다.
     재생이 시작되면(.is-hero-video) 포스터를 숨긴다 — 같은 장면이라 이어진다.
     배치 · 문구 색 · 등장 순서는 섹션의 [data-pdp-hero-video](상세 HTML) 기준(CSS). 동작 줄이기 설정이면 영상 없이 포스터만 */
  var HERO_VIDEO_SRC = 'https://smvt.b-cdn.net/BIO-ELIXIR_hero_loop_4k.mp4';

  function initHeroVideo(root) {
    var hero = root.querySelector('.pdp-elixir-hero');
    if (!hero || hero.__pdpHeroVideo || reduceMotion()) return;
    hero.__pdpHeroVideo = true;
    hero.setAttribute('data-pdp-hero-video', ''); // 예전 상세 HTML(속성 없음)에서도 같은 배치로

    var media = document.createElement('div');
    media.className = 'pdp-elixir-hero__media';
    var video = document.createElement('video');
    video.className = 'pdp-elixir-hero__bg pdp-elixir-hero__video';
    // iOS 자동 재생: src보다 먼저 muted · playsinline
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.autoplay = true;
    video.loop = true;
    video.preload = 'auto';
    video.src = HERO_VIDEO_SRC;
    media.appendChild(video);

    var picture = hero.querySelector('picture') || hero.querySelector('.pdp-elixir-hero__bg');
    hero.insertBefore(media, picture ? picture.nextSibling : hero.firstChild);

    video.addEventListener('playing', function () { hero.classList.add('is-hero-video'); });
    // 영상을 못 띄우면 영상만 걷어 낸다 — 포스터가 정지 화면으로 남는다(자동 재생 차단 시에도 포스터)
    video.addEventListener('error', function () {
      media.remove();
      hero.classList.remove('is-hero-video');
    });
    var played = video.play();
    if (played && played.catch) played.catch(function () {});
  }

  /* ---- Harmony 모눈 — 소개 블록 높이를 칸(--u) 단위로 올리고 행 수를 --hg-intro-rows로 넘긴다 ---- */
  function initHarmonyGrid(section) {
    if (section.__pdpHarmonyGrid) return;
    section.__pdpHarmonyGrid = true;

    var stage = section.querySelector('.pdp-harmony__stage');
    var intro = section.querySelector('.pdp-harmony__intro');
    if (!stage || !intro) return;

    function snap() {
      var u = parseFloat(window.getComputedStyle(stage).gridTemplateColumns);
      if (!u) return;
      intro.style.minHeight = '';
      var rows = Math.max(1, Math.ceil(intro.offsetHeight / u - 0.01));
      intro.style.minHeight = (rows * u) + 'px';
      stage.style.setProperty('--hg-intro-rows', rows);
    }

    if (window.ResizeObserver) new window.ResizeObserver(snap).observe(stage);
    window.addEventListener('resize', snap);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(snap);
    snap();

    // 진입 효과: 경계선이 그려진 뒤 박스가 차오른다(1회). 동작 줄이기 · IO 미지원이면 생략
    if (reduceMotion() || !('IntersectionObserver' in window)) return;
    stage.classList.add('is-drawing');
    var io = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        stage.classList.add('is-drawn');
        io.disconnect();
      });
    }, { threshold: 0.25 });
    io.observe(stage);
  }

  /* ---- 모바일: 시점별 연구 개요(VIEW THE STUDY)는 기본 접힘 — 펼쳐 두면 시점마다 표가 길게 붙는다(데스크톱은 펼침)  ---- */
  function initMobileStudy(root) {
    if (root.__pdpMobileStudy || !isMobile()) return;
    root.__pdpMobileStudy = true;
    qsa('.pdp-study-card[open]', root).forEach(function (d) { d.removeAttribute('open'); });
  }

  /* ---- Boot ---- */
  function init(root) {
    if (!root) return;
    initChartDraw(root);
    initSlogan(root);
    initBotanicalReplay(root);
    initConcentrateSwap(root);
    initParallax(root);
    initCompare(root);
    initHotspots(root);
    initSteps(root);
    initRitual(root);
    initMobileStudy(root);
    initHeroVideo(root);
    initHeroParallax(root);
    initChartValueSize(root);
    qsa('.pdp-harmony--grid', root).forEach(initHarmonyGrid);
    qsa('[data-pdp-timepoints]', root).forEach(initTimepoints);
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
