/**
 * PDP — BIO Elixir · Clinical section UX test (PROTOTYPE)
 * 테스트 상품 2개(A/B)에서만 로드. pdp-elixir.js 다음에 로드한다.
 *
 *   A  [data-pdp-autorotate]  기존 탭(pdp-elixir.js)을 자동 회전 — 무한 반복, 5초
 *   B  [data-pdp-timepoints]      요약 스트립 탭 — 섹션 진입 시 1회 재생 후 4주에서 정지, 7초
 *                                  (모바일: 탭은 가로 슬라이더 · 근거는 아래로 쌓기 · 자동 재생 없음)
 *                                  (D는 완료한 단계의 진행선을 채운 채로 유지, 끝나면 전부 채워진 상태)
 *
 * 공통: 화면 밖·탭 비활성 시 정지, 마우스 올리면 일시정지, 탭을 직접 누르면 정지
 *       (A는 일시정지 — Resume 버튼으로 그 탭부터 다시 회전),
 *       prefers-reduced-motion이면 자동 재생 안 함. A(무한 반복)만 일시정지 버튼(WCAG 2.2.2).
 *
 * 노출 측정 배지: URL에 ?proto 또는 #proto를 붙이면 화면 우하단에
 * "본 수치 n/7 · 본 근거 n/7"을 표시 (요소가 50% 이상 화면에 0.8초 이상 보였을 때 카운트).
 */
(function (window, document) {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var MOBILE = window.matchMedia && window.matchMedia('(max-width: 767px)');
  var HOVER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  // 진행값은 탭에 쓰고, 탭 밖 페이지네이션 바(D: .pdp-timepoints__pager-bar)가 있으면 같은 값을 복사한다
  function setTabVar(tab, name, value) {
    tab.style.setProperty(name, value);
    if (tab.__pdpPagerBar) tab.__pdpPagerBar.style.setProperty(name, value);
  }

  /* ---- Autoplay engine ---- */
  function createAutoplay(options) {
    var tabs = options.tabs;
    var duration = options.duration;
    var state = { index: options.start || 0, elapsed: 0, stopped: false, paused: false, hover: false, inView: false };
    var last = 0;
    var button = options.pauseButton;

    // fillCompleted: 지난 단계는 꽉 찬 채로 두고, 처음(0)으로 돌아오면 자연히 초기화된다
    function progress(value) {
      tabs.forEach(function (tab, i) {
        var v = i === state.index ? value : (options.fillCompleted && i < state.index ? 1 : 0);
        setTabVar(tab, '--pdp-progress', String(v));
      });
    }

    function running() {
      return !state.stopped && !state.paused && !state.hover && state.inView && !document.hidden &&
        !(options.disableOn && options.disableOn.matches);
    }

    function stop() {
      if (state.stopped) return;
      state.stopped = true;
      progress(0);
      if (button) button.hidden = true;
    }

    function tick(now) {
      if (state.stopped) return;
      var dt = last ? now - last : 0;
      last = now;
      if (running()) {
        state.elapsed += dt;
        if (state.elapsed >= duration) {
          var next = state.index + 1;
          if (next >= tabs.length) {
            if (!options.loop) {
              if (options.fillCompleted) {
                // 마지막 단계까지 완료 — 모든 진행선을 채운 채로 정지
                progress(1);
                state.stopped = true;
                return;
              }
              stop();
              return;
            }
            next = 0;
          }
          state.index = next;
          state.elapsed = 0;
          options.select(next);
        }
        progress(Math.min(1, state.elapsed / duration));
      }
      window.requestAnimationFrame(tick);
    }

    if (REDUCED && REDUCED.matches) {
      if (button) button.hidden = true;
      return { stop: function () {}, sync: function () {}, pauseAt: function () {} };
    }

    // 보이는 문구가 곧 버튼 이름 — Pause(재생 중) ↔ Resume(일시정지됨). 아이콘은 .is-paused로 전환
    function setPaused(paused) {
      state.paused = paused;
      if (!button) return;
      button.classList.toggle('is-paused', paused);
      var text = button.querySelector('.pdp-autoplay-pause__text');
      if (text) text.textContent = paused ? 'Resume' : 'Pause';
    }

    // 사용자가 탭을 직접 고르면: 그 탭에서 일시정지(버튼은 Resume으로 남는다) → Resume 시 그 탭부터 다시 회전
    function pauseAt(index) {
      state.index = index;
      state.elapsed = 0;
      progress(0);
      setPaused(true);
    }

    if (button) {
      button.hidden = false;
      button.addEventListener('click', function () { setPaused(!state.paused); });
    }

    if (options.hoverTarget && HOVER && HOVER.matches) {
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

    return {
      stop: stop,
      pauseAt: pauseAt,
      sync: function (index) { state.index = index; state.elapsed = 0; }
    };
  }

  // 탭 그룹과 같은 줄 오른쪽에 일시정지 버튼 — 탭 그룹을 bar로 감싼다
  function makePauseButton(group) {
    var bar = document.createElement('div');
    bar.className = 'pdp-autoplay-bar';
    group.parentNode.insertBefore(bar, group);
    bar.appendChild(group);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pdp-autoplay-pause body-s';
    button.innerHTML = '<span class="pdp-autoplay-pause__text">Pause</span>';
    button.hidden = true;
    bar.appendChild(button);
    return button;
  }

  /* ---- Chart draw: 활성 패널이 화면에 들어올 때 선을 그리고 점·값을 띄운다 ---- */
  function drawCharts(panel) {
    if (!panel) return;
    panel.classList.remove('is-drawn');
    void panel.offsetWidth; // restart animation
    panel.classList.add('is-drawn');
  }

  /* ---- A: original tabs + infinite auto-rotate ---- */
  function initAutorotate(group) {
    if (group.__pdpAutorotate) return;
    group.__pdpAutorotate = true;

    var tabs = qsa('[role="tab"]', group);
    var section = group.closest('[data-pdp-section]');
    var auto = false;

    tabs.forEach(function (tab) {
      var bar = document.createElement('span');
      bar.className = 'pdp-clinical__tab-progress';
      bar.setAttribute('aria-hidden', 'true');
      tab.appendChild(bar);
    });

    var panelsWrap = qsa('[role="tabpanel"]', section);
    var button = makePauseButton(group);

    var player = createAutoplay({
      tabs: tabs,
      duration: Number(group.getAttribute('data-pdp-autorotate')) || 5000,
      loop: true,
      pauseButton: button,
      hoverTarget: section.querySelector('.container'),
      observe: panelsWrap[0] ? panelsWrap[0].parentNode : section,
      select: function (index) {
        auto = true;
        tabs[index].click(); // pdp-elixir.js handles the actual switch
        auto = false;
      }
    });

    function selectedIndex() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('aria-selected') === 'true') return i;
      }
      return 0;
    }

    // 탭을 직접 고르면 영구 정지 대신 일시정지 — 버튼은 Resume으로 남아 다시 회전시킬 수 있다
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { if (!auto) player.pauseAt(index); });
      tab.addEventListener('keydown', function (event) {
        if (!/^(Arrow(Left|Right)|Home|End)$/.test(event.key)) return;
        // 방향키 이동은 pdp-elixir.js가 처리 — 바뀐 선택을 다음 틱에 읽는다
        window.setTimeout(function () { player.pauseAt(selectedIndex()); }, 0);
      });
    });
  }

  /* ---- B: timepoints tabs (summary strip) + play once ---- */
  function initTimepoints(timepoints) {
    if (timepoints.__pdpTimepoints) return;
    timepoints.__pdpTimepoints = true;

    var tabs = qsa('[role="tab"]', timepoints);
    var panels = tabs.map(function (tab) {
      return timepoints.querySelector('#' + tab.getAttribute('aria-controls'));
    });
    var player = null;
    var seen = false;
    var pagerBars = qsa('.pdp-timepoints__pager-bar', timepoints);
    tabs.forEach(function (tab, i) { if (pagerBars[i]) tab.__pdpPagerBar = pagerBars[i]; });

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

    // 사용자가 직접 고르면 자동 재생을 멈추고, 고른 시점까지(앞 단계 포함) 진행선을 100% 채운다.
    // 직접 고른 뒤에는(.is-manual) 진행선이 트랜지션으로 차오른다 — 채울 땐 앞 단계부터, 비울 땐 뒤에서부터 차례로
    var FILL_STEP = 450; // 한 단계 채우는 시간(ms) — CSS 트랜지션 길이와 같게

    function fillUpTo(index) {
      var filling = [];
      var emptying = [];
      tabs.forEach(function (tab, i) {
        var from = parseFloat(tab.style.getPropertyValue('--pdp-progress')) || 0;
        var to = i <= index ? 1 : 0;
        if (to > from) filling.push(tab);
        else if (to < from) emptying.push(tab);
        setTabVar(tab, '--pdp-progress', String(to));
      });
      filling.forEach(function (tab, n) { setTabVar(tab, '--pdp-fill-delay', n * FILL_STEP + 'ms'); });
      emptying.reverse().forEach(function (tab, n) { setTabVar(tab, '--pdp-fill-delay', n * FILL_STEP + 'ms'); });
    }

    function choose(index, focus) {
      if (player) player.stop();
      timepoints.classList.add('is-manual');
      select(index, focus);
      fillUpTo(index);
    }

    function selectedIndex() {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('aria-selected') === 'true') return i;
      }
      return 0;
    }

    // 모바일: 탭 줄은 가로 슬라이더 — 넘겨서 멈춘(스냅된) 탭이 선택되고, 누른 탭은 앞으로 당겨온다
    var strip = timepoints.querySelector('.pdp-timepoints__tabs');
    var stuck = timepoints.querySelector('.pdp-timepoints__nav') || strip; // 고정되는 요소 (D: 탭 + 페이지네이션 묶음)

    function scrollToTab(index) {
      if (!strip || !(MOBILE && MOBILE.matches)) return;
      var reduce = REDUCED && REDUCED.matches;
      strip.scrollTo({ left: tabs[index].offsetLeft - tabs[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    }

    // 모바일: 탭을 눌러 시점을 바꾸면 새 콘텐츠의 시작이 고정된 탭 줄 바로 아래 오도록 부드럽게 올린다
    // (콘텐츠 시작이 이미 보이면 움직이지 않음 · 스와이프 선택에는 적용하지 않음)
    function revealPanel(index) {
      if (!strip || !(MOBILE && MOBILE.matches) || !panels[index]) return;
      // 위로 올리면 숨었던 헤더 · toc-bar가 다시 내려와 탭 줄도 내려간다 — 지금 위치가 아니라
      // 헤더 + toc-bar가 모두 보이는 상태를 기준으로 계산해야 콘텐츠 시작이 가려지지 않는다
      var header = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--offset-header')) || 0;
      var toc = document.querySelector('[data-toc-bar]');
      var tocHeight = toc && window.getComputedStyle(toc).display !== 'none' ? toc.offsetHeight : 0;
      var stuckBottom = Math.max((parseFloat(window.getComputedStyle(stuck).top) || 0), header + tocHeight) + stuck.offsetHeight;
      var target = stuckBottom + 12;
      var top = panels[index].getBoundingClientRect().top;
      if (top >= target - 1) return;
      var reduce = REDUCED && REDUCED.matches;
      window.scrollTo({ top: window.pageYOffset + top - target, behavior: reduce ? 'auto' : 'smooth' });
    }

    if (strip) {
      var settle = null;
      strip.addEventListener('scroll', function () {
        if (!(MOBILE && MOBILE.matches)) return;
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

    // 모바일은 자동 재생 없음 — 선택된 시점까지 진행선을 채워 둔다
    function syncMobile() {
      if (MOBILE && MOBILE.matches) fillUpTo(selectedIndex());
    }
    syncMobile();
    if (MOBILE && MOBILE.addEventListener) MOBILE.addEventListener('change', syncMobile);

    var panelsWrap = timepoints.querySelector('.pdp-timepoints__panels');

    // NOW 카드 줄 높이를 변수로 — 다른 탭 콘텐츠(D: 24H 블록)가 이 높이에 맞춘다
    var nowRow = panels[0] && panels[0].querySelector('.pdp-timepoints__row');
    if (nowRow && 'ResizeObserver' in window) {
      new ResizeObserver(function () {
        // D: 숨은 시점은 display:none이라 NOW가 숨으면 높이가 0 — 마지막으로 보였을 때 높이를 유지한다
        var height = nowRow.getBoundingClientRect().height;
        if (height) panelsWrap.style.setProperty('--pdp-now-row-h', height + 'px');
      }).observe(nowRow);
    }
    // 근거 카드를 만지면(슬라이더 드래그·스와이프) 자동 재생을 멈춘다
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
      tabs: tabs,
      duration: Number(timepoints.getAttribute('data-pdp-timepoints')) || 7000,
      loop: false,
      // D: 완료한 단계의 진행선은 채운 채로 유지
      fillCompleted: !!timepoints.closest('.pdp--proto-d'),
      // 1회 재생이라 별도 일시정지 버튼 없음 — 탭·카드 조작 시 정지, hover 시 일시정지로 충분
      hoverTarget: timepoints,
      observe: panelsWrap,
      // 모바일: 근거가 아래로 쌓여 길어지므로 읽는 도중 시점이 바뀌지 않게 자동 재생을 끈다
      disableOn: MOBILE,
      select: function (index) { select(index, false); }
    });
  }

  /* ---- Exposure badge (?proto / #proto) ---- */
  function initExposure(root) {
    if (!/proto/.test(window.location.search + window.location.hash)) return;
    if (document.querySelector('.pdp-proto-badge')) return;

    var groups = {
      metric: uniqueKeys(qsa('[data-proto-metric]', root), 'data-proto-metric'),
      visual: uniqueKeys(qsa('[data-proto-visual]', root), 'data-proto-visual')
    };
    var seen = { metric: {}, visual: {} };
    var timers = new WeakMap();

    var badge = document.createElement('div');
    badge.className = 'pdp-proto-badge';
    badge.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;padding:10px 14px;border-radius:12px;background:rgba(17,24,39,.88);color:#fff;font:600 12px/1.5 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2);pointer-events:none';
    document.body.appendChild(badge);

    function uniqueKeys(elements, attr) {
      var keys = {};
      elements.forEach(function (el) { keys[el.getAttribute(attr)] = true; });
      return { elements: elements, attr: attr, total: Object.keys(keys).length };
    }

    function visible(el) {
      if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return false;
      if (!el.getClientRects().length) return false;
      var r = el.getBoundingClientRect();
      var h = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      var w = Math.min(r.right, window.innerWidth) - Math.max(r.left, 0);
      return h > 0 && w > 0 && (h * w) / (r.width * r.height || 1) >= 0.5;
    }

    function render() {
      badge.innerHTML = '본 수치 ' + Object.keys(seen.metric).length + '/' + groups.metric.total +
        '<br>본 근거(차트·비교) ' + Object.keys(seen.visual).length + '/' + groups.visual.total;
    }

    window.setInterval(function () {
      ['metric', 'visual'].forEach(function (type) {
        groups[type].elements.forEach(function (el) {
          var key = el.getAttribute(groups[type].attr);
          if (seen[type][key]) return;
          if (visible(el)) {
            var t = (timers.get(el) || 0) + 200;
            timers.set(el, t);
            if (t >= 800) seen[type][key] = true;
          } else {
            timers.set(el, 0);
          }
        });
      });
      render();
    }, 200);
    render();
  }

  /* D: 히어로 문구 흐림 — 히어로 상단이 화면 위를 지난 거리(px)를 --pdp-hero-y로 넘긴다.
     이미지는 움직이지 않는다: 와이드 화면에서는 CSS가 사진을 히어로 높이에 맞춰 통째로 보여 준다 */
  function initHeroParallax(root) {
    var hero = root.querySelector('.pdp-elixir-hero');
    if (!hero || hero.hasAttribute('data-proto-parallax')) return;
    hero.setAttribute('data-proto-parallax', '');
    if (REDUCED && REDUCED.matches) return;
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

  /* ---- D: Harmony 모눈 — 소개 블록 높이를 칸(--u) 단위로 올리고 행 수를 --hg-intro-rows로 넘긴다 ---- */
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
    if ((REDUCED && REDUCED.matches) || !('IntersectionObserver' in window)) return;
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

  /* ---- D: 차트 수치 라벨 · 선 · 점을 화면 px 기준으로 통일 ----
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
      var width = svg.getBoundingClientRect().width;
      if (!vb || !vb.width || !width) return; // 숨은 패널(모바일 display: none)은 보일 때 다시 계산
      // 화면에 그려지는 글자 크기를 모든 차트에서 같게: 수치 14 · 축 라벨 12 · 눈금/단위 11 (모바일 12 · 11 · 10)
      var mobile = MOBILE && MOBILE.matches;
      var target = mobile ? 12 : 14;
      var scale = width / vb.width;
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

    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { fit(entry.target); });
    });
    charts.forEach(function (svg) { observer.observe(svg); });
  }

  /* D 모바일: 시점별 연구 개요(VIEW THE STUDY)는 기본 접힘 — 펼쳐 두면 시점마다 표가 길게 붙는다(데스크톱은 펼침) */
  function initMobileStudy(root) {
    if (root.__pdpMobileStudy || !(MOBILE && MOBILE.matches)) return;
    root.__pdpMobileStudy = true;
    qsa('.pdp-study-card[open]', root).forEach(function (d) { d.removeAttribute('open'); });
  }

  function boot() {
    qsa('.pdp--proto-d[data-pdp]').forEach(initMobileStudy);
    qsa('.pdp--proto-d[data-pdp]').forEach(initHeroParallax);
    qsa('.pdp--proto-d[data-pdp]').forEach(initChartValueSize);
    qsa('.pdp-harmony--grid').forEach(initHarmonyGrid);
    qsa('.pdp--elixir[data-pdp]').forEach(function (root) {
      qsa('[data-pdp-autorotate]', root).forEach(initAutorotate);
      qsa('[data-pdp-timepoints]', root).forEach(initTimepoints);
      initExposure(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);
})(window, document);
