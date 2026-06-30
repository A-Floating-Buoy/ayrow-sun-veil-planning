# Sun Veil PDP Section Guide

  ## Source Priority

  1. Figma node content/design only
  2. Confirmed CSS tokens in `css/core`
  3. No previous prototype/planning copy unless explicitly re-approved

  ## Global Rules

  - Text color: all BLEU, including headings
  - Figma `Text Style > Display` section headlines use `.sv-pdp-display-title`.
  - `.sv-pdp-display-title` is scoped to `.sv-pdp--v2` and uses `--font-size-display`, `--line-height-display`, `--letter-spacing-display`, and `--font-weight-display`.
  - Scope individual section design updates to `.sv-pdp--v2` while ver-2 is in progress.
  - Apply typography sizes through existing CSS variables or newly registered core tokens only.
  - Set PDP text color through inheritance from section/card containers; avoid long global exclusion selectors.
  - For inverse or media-overlay sections, set the container color and let child text inherit it.
  - Maintainability comes first when coding section styles.
  - Prefer short, explicit component selectors over broad catch-all selectors.
  - Avoid complex selector chains such as long `:not()` exclusions, broad `[class*="..."]` matches, and repeated specificity stacking.
  - If a base rule needs many exceptions, make the base rule simpler and move the exception into the relevant component class.
  - Use container inheritance and CSS custom properties for shared behavior; use explicit component classes for local overrides.
  - Keep naming readable and predictable. Do not solve small styling cases with unnecessarily abstract or deeply nested names.
  - English labels use normal title/sentence case unless they are true acronyms such as `UV`, `UPF`, `SPF`, `FAQ`, or ingredient names.
  - Layout types: full-bleed / container--md only
  - Images/videos: placeholder until Cafe24 asset path confirmed
  - Do not add new claims, FAQ, proof, formula, or copy not visible in Figma
  - Swiper modules should be draggable and use bullet pagination.
  - Swiper pagination: active bullet BLEU, inactive bullet light gray.
  - Element reveal and count-up effects are reversible: entering viewport plays the effect, leaving viewport resets it.

  ## Sidebar TOC (ver-2)

  - Top-level sidebar items: `제품 보기` / `자세히 보기` / `제품 리뷰`
  - `제품 리뷰` is a separate sidebar item outside the numbered detail subitems.
  - Numbered detail subitems under `자세히 보기`:

  1. 제품 소개
  2. 필름과 섬유의 차이
  3. 선베일이 바꾸는 일상의 경험
  4. 선베일이 필요한 순간
  5. 선베일의 작동 원리
  6. 성분 (Reverse AG Code™ 포뮬러)
  7. 데이터로 검증된 기술
  8. 사용 방법
  9. 자주 묻는 질문
  10. 상품정보제공 고시

  ---

  ## 01 Hero

  Figma node: `405:252`
  Nav title: `Intro`
  Layout: `container--md`

  ### Design Notes

  - Section background: BLEU
  - Rounded 24px hero frame
  - CRÈME surface
  - Hero video source: https://smvt.b-cdn.net/ayrow-film-vs-membrane.mp4
  - Video only plays when the hero banner is in viewport
  - Feature grid below hero banner, 3 columns desktop, 3 column mobile

  ### Responsive

  - Hero banner aspect ratio 1:1
  - Desktop: text and badges split left/right
  - Mobile: stacked


  ## 02 Full-bleed Banner
  Figma node: `405:405`
  Nav title: `none`
  Layout: `full-bleed`


  ### Image Source: src/sun-veil/ayrow-sun-veil-banner-wide.jpg

  ### Design Notes

  - Zero Rounded

  ## 03.01 Film vs Membrane Intro
  Figma node: `405:462`
  Nav title: `Film vs Membrane`
  Layout: `container--md`

  ### Copy
  Eyebrow: `Film vs Membrane`
  Heading: `같은 ‘패치’라고 생각했다면,\n완전히 잘못 본 겁니다.`
  Banner: `막는 것 vs 숨 쉬는 것\n당신의 피부는 어떤 쪽을 선택하나요?`
  Compare Table:
  - Columns: label / 기존 선패치 / 에이로우 선베일
  - Rows: 형태 / 구조 / 통기성 / 착용감 / 피부착용 / quote
  - 기존 선패치: 필름 = 막 (막힘) / 피부를 덮는 구조 / 공기 흐름 차단 / 장시간 사용 시 답답함 / 열·수분 정체 / “붙이는 순간, 숨 막히는 필름막”
  - 에이로우 선베일: 나노 섬유 멤브레인 = 선택적 투과 (숨 쉬는 구조) / 섬유 기반 다공성 구조 / 공기 & 수분 흐름 유지 / 장시간 부착 가능 / 피부 호흡 및 컨디션 유지 / “붙여도, 계속 숨 쉬는 나노 섬유”

  ### Design Notes
  - Section title sits above the card
  - Eyebrow: 20px / 28.6px, bold
  - Headline uses `.sv-pdp-display-title`
  - Entire module is wrapped in one neutral subtle card
  - Card max width: 896px
  - Card radius: 24px
  - Card vertical padding: 24px
  - No separate section header outside the card; banner copy acts as the visible heading
  - Rounded 24px image banner inside the card
  - White text overlay on the banner
  - Table-style comparison module
  - Label column width: 80px desktop / 72px mobile
  - Minimum table width for mobile horizontal overflow
  - Horizontal scroll uses scroll snap

  ### Responsive
  - Desktop: full-width comparison table
  - Mobile: horizontal overflow with natural swipe and snap

  ### Image Source: src/sun-veil/ayrow-sun-veil-film-membrane-01.jpg

  ## 03.02 Film vs Membrane (Pain Point)
  Figma node: `684:751`
  Nav title: `none`
  Layout: `full-bleed`

  ### Design Notes
  - Fade-up Text
  - Display headline uses `.sv-pdp-display-title`
  - Bubbles are large 144px height card-like chips
  - Bubble background uses `neutral-bg-subtle`
  - Bubble text uses muted neutral color
  - First row: 3 equal columns
  - Second row: 2 fixed 288px chips centered
  - Slide in text-bubbles__row. 1st row: from left to right, 2nd row: from right to left.

  ### Copy
  Text: `선패치, 불편했던 이유는 단 하나입니다.\n“숨을 못 쉬기 때문입니다.”`
  Bubbles:
  - 땀/열/습기로 답답함
  - 필름 텐션으로 인한 밀폐감, 피부 조임
  - 메이크업 위에서 들뜸
  - 접착 성분으로 인한 뻣뻣함, 잔주름 픽스
  - 오래 붙이면 피부 피로감


  ## 03.03 Film vs Membrane (Our Choice)
  Figma node: `405:411`
  Nav title: `none`
  Layout: `full-bleed`

  ### Design Notes
  - Display-size text, bold.
  - Text highlight effect runs by line, not by character.
  - No character-level wrapping/highlight.
  - Section uses the default section vertical rhythm instead of extended sticky scroll spacing.

  ### Copy
  Text: `그래서 우리는 ‘필름막’을 버리고\n‘나노 섬유’를 선택했습니다.\n\n선베일은 피부를 보호하지만,\n가두지 않습니다.`

 ## 03.04 Film vs Membrane (Video)
  Figma node: `405:353`
  Nav title: `none`
  Layout: `full-bleed`

  ### Design Notes
  - Text reveal is section-specific, not the global fade-up reveal.
  - Text starts blurred and clears while fading in.
  - Video does not loop.
  - Video plays once per viewport entry.

  ### Responsive
  - Desktop: Aspect ratio 2:1, object-fit: contain
  - Mobile: Aspect ratio 1:1, object-fit: contain

  ### Interaction
  - On enter: reset video to the beginning, reveal text with blur-to-clear, then play the video once.
  - On exit: pause video, reset to the beginning, hide text so the reveal can replay on the next entry.
  - Video only plays when placed in viewport.

  ### Copy
  Text: `선베일은 보호하지만, \n피부를 가두지 않습니다.`

  ### Video Source: https://smvt.b-cdn.net/ayrow-film-vs-membrane.mp4

  ## 03.05 Film vs Membrane (Proven Data - A)
  Figma node: `475:1636`
  Nav title: `none`
  Layout: `merged into 13. Proven Data`

  ### Copy
  Title: `"숨 쉼은 느껴질 뿐 아니라, 데이터로 증명됩니다"`
  Cards:
  - 투습도: `12,356 g/m²·24h`
  - 공기 투과도: `1.0 미만 mm/s`
  - 평균 기공 크기: `0.7μm (0.0007mm)`
  Source: `FITI 시험 연구원 · FITI Testing & Research Institute`

  ### Design Notes
  - No longer implemented as a standalone section.
  - Content is merged into `13. Proven Data`.
  - 3 columns card grid
  - info-card__header left align, info-card__body right align
  - Card background: `semantic-bg-subtle`

  ### Interactive
  - Faded in section title
  - Count up each numbers only

  ## 03.05 Film vs Membrane (Proven Data - B)
  Figma node: `475:1640`
  Nav title: `none`
  Layout: `merged into 13. Proven Data`

  ### Copy
  Title: `"숨 쉬면서도, 제대로 차단합니다"`
  Lead: '숨 쉬는 구조 위에, 초박막 차단 레이어를 더했습니다.'
  Badge(Pill style):
  - UVB 99.9% 차단
  - UVA 95.3% 차단
  - UPF 50+
  - UVR 96.3% 차단
  Source: `*원단 기준 시험 결과 · FITI 시험 연구원`

  ### Design Notes
  - No longer implemented as a standalone section.
  - Content is merged into `13. Proven Data`.
  - Badge background: `semantic-bg-inverse`
  - Badge foreground: `semantic-on-surface-inverse`

  ### Interactive
  - Faded in section title
  - Faded in Badges

  ## 03.06 Film vs Membrane (Standard)
  Figma node: `684:636`
  Nav title: `none`
  Layout: `container--md`

  ### Copy
  Title: `숨 쉬는 보호는 \n선택이 아니라, 기준입니다.`
  Intro:
  - `선베일은 기존 선케어와 다르게 작동합니다.`
  - `선크림처럼 덧발라야 하지도, 선패치처럼 필름 형태로 피부를 답답하게 가두지도 않습니다.`
  Creme Card:
  - `덧바름과 답답함의 불편을 \n해결한 숨 쉬는 선베일`
  - `보이지 않을 만큼 얇은 0.004mm 기공구조 \n나노 섬유가 피부 위에 초박막 보호 레이어를 형성해 \n공기 흐름을 유지하는 숨 쉬는 (Aeroflow™) 구조로 \n작동합니다.`
  - `그 결과, \n열·습기·땀은 머무르지 않고 자연스럽게 배출되며, 피부는 답답함 없이 편안한 상태를 유지합니다.`
  - `동시에, \n빛·열·외부 자극이 피부 환경에 미치는 영향을 최소화하고, 나노 섬유가 닿는 피부 표면에서는 피부 컨디션을 정돈하는 케어가 함께 이루어집니다.`
  Chips:
  - `99.9% 자외선 차단`
  - `민감 피부 자극 지수 0.00`
  - `숨 쉬는 멤브레인 (나노 섬유) 적용`
  - `0.004mm 초박막`
  - `비건 포뮬러`
  Note:
  - `*원단 기준 UVB 시험 결과 (측정 조건에 따라 상이할 수 있음)`
  - `*독일 더마테스트(Dermatest®) 민감 피부 대상 첩포·2주 임상 시험 완료`
  - `*영국 비건소사이어티(The Vegan Society) 비건 트레이드마크 인증`

  ### Design Notes
  - Display title centered at top.
  - Intro text sits below title as a centered text block with subtle backdrop blur.
  - Main content uses a 2-column grid: left image, right creme card.
  - Creme card contains header, body copy, and chips as one content unit.
  - Card title uses heading-xl scale, body uses body-l scale.
  - Chips use ciel background / bleu foreground.
  - Certifications appear as a centered logo row below the note.

  ### Responsive
  - Mobile: Stack

  ### Interactive
  - All elements are faded in

  ### Image Source: src/sun-veil/ayrow-sun-veil-standard.jpg


  ## 04.01 Why Sun Veil Exists? (Intro)
  Figma node: `684:621`
  Nav title: `none`
  Layout: `container--md`

  ### Copy
  Title: `이런 순간, 필요합니다.`
  Card 1 title: `보호는 필요하지만, 드러나고 싶지 않을 때`
  Card 1 list:
  - `자외선 차단제를 덧바르기 힘들 때`
  - `메이크업 위에 덧바르면 무너질까 봐 주저하게 될 때`
  - `하루 종일, 흐름을 끊지 않고 자외선 대응을 유지하고 싶을 때`
  - `러닝·골프·테니스 등 야외 활동이 많은 날`
  - `실내에서도 생활 자외선이 계속 신경 쓰일 때`
  - `눈가·광대처럼 특정 부위가 유독 노출될 때`
  - `선케어 및 메이크업이 가장 먼저 무너지는 광대 부위 노출이 불안할 때`
  - `땀이나 유분이 올라온 얼굴에 덧바르기 찝찝할 때`
  - `햇살은 기분 좋은데 피부는 그대로 노출시키고 싶지 않을 때`
  Card 2 title: `피부가 예민해졌을 때는 더더욱`
  Card 2 list:
  - `피부과 시술 후, 자외선 차단은 중요하지만 직접 바르는 것이 부담스러울 때 / 자외선 차단제를 지워야 하지만 세안을 할 수 없을 때`
  - `외부 자극에 붉게 달아올라 떼어내는 순간 피부 자극이 염려될 때`
  - `밀폐감 없이 피부를 보호하고 싶을 때`
  - `기미, 눈가 주름이 신경쓰이지만 복잡한 케어는 부담스러울 때`

  ### Design Notes
  - `.sv-pdp--v2` scoped vertical stack layout
  - Title uses `.sv-pdp-display-title`
  - Image is centered, max width `590px`, radius `24px`
  - List group max width `591px`, centered
  - Group headings use heading-xl-kr scale, bold, centered
  - Each `li` is displayed as an individual rounded box
  - Card 1 list item background: CIEL
  - Card 2 list item background: CRÈME
  - List item text uses body-l-kr scale, centered, BLEU

  ### Responsive
  - Mobile: Stack

  ### Interactive
  - All elements are faded in

  ### Image Source: src/sun-veil/ayrow-sun-veil-at-this-moment.jpg

  ## 04.02 Why Sun Veil Exists? (Highlight)
  Figma node: `747:1810`
  Nav title: `선 베일이 필요한 순간`
  Layout: `full-bleed`

  ### Copy
  - `그래서 우리는,`
  - `보호의 방식을 바꿨습니다.`
  - `보호는 필요하지만, 방식이 달라야 할 때`
  - `이럴 때 필요한 건,`
  - `선케어가 아니라 선베일입니다.`

  ### Design Notes
  - `.sv-pdp--v2` scoped full-width image banner
  - Text overlays the image
  - Top text block is vertically aligned near the top center
  - Bottom text block is vertically aligned near the bottom center
  - Overlay text color: white
  - Body text uses body-xl-kr scale
  - Final emphasis text uses heading-xl-kr scale and bold weight
  - Add subtle dark image overlay for readability

  ### Interactive
  - Section fades in

  ### Responsive
  - Mobile: use a taller vertical banner ratio

  ### Image Source: `/web/src/sun-veil/why-sun-veil-banner.jpg`

  ## 05. Quick FAQ
  Figma node: `684:229`
  Nav title: `none`
  Layout: `inside 15. Full FAQ / container--md`

  ### Placement
  - In ver-2 this is no longer a standalone scroll section.
  - Place the Quick FAQ card swiper inside `sv-pdp-full-faq`, before the Full FAQ accordion list.
  - Keep the Full FAQ section as the single FAQ navigation target.

  ### Copy
  - Source: user-provided FAQ revision, 2026-05-28.
  - Do not include the previous `네, 가능합니다.` / `네, 다릅니다.` style answer labels in Quick FAQ cards.
  - Quick cards:
    1. `메이크업 위에 사용해도 되나요?` / `YES`
    2. `일반 필름형 선패치와 다른가요?` / `YES`
    3. `점착 성분 없이도 잘 붙나요?` / `YES`
    4. `투명한데 자외선 차단이 가능한가요?` / `YES`
    5. `민감한 피부에도 사용할 수 있나요?` / `YES`
    6. `티가 나나요?` / `NO.`
  - Quick copy includes the updated occlusive film explanation, Moisture-Bonding bullet list, transparent UV principle list, sensitive-skin support paragraph, and `0.004mm의 초박막 투명 선베일` wording.

  ### Design Notes
  - Card-style Swiper based on the Figma FAQ card treatment
  - Use the existing original Quick Q&A copy, not the Figma placeholder copy
  - Card background: CIEL soft
  - Card radius: `24px` desktop
  - Card padding: `20px`
  - Desktop `slidesPerView: 2`
  - Mobile `slidesPerView: 1`
  - Show Swiper pagination under the cards

  ### Interactive
  - Draggable/touch Swiper
  - Keyboard enabled
  - No scroll-linked `YES / NO` stage animation in ver-2

  ### Responsive
  - Desktop: 2 cards per view
  - Mobile: 1 card per view

  ## 06. At a glance
  Figma node: `684:662`
  Nav title: `선 베일이 바꾸는 일상의 경험`
  Layout: `container--md`

  ### Copy
  Eyebrow: `At a glance`
  Title: `Sun Veil이 바꾸는 일상의 경험`
  Lead: `붙이는 순간, 일상이 달라집니다.`
  Card 1:
  - Number: `01.`
  - Title: `Invisible & Seamless`
  - `보이지 않는 0.004mm`
  - `붙였는지 잊을 만큼, 얇고 투명한 존재감`
  - `메이크업과 자연스럽게 호환`
  - `경계 없이 매끄럽게 이어지는 피부 표현`
  Card 2:
  - Number: `02`
  - Title: `Effortless Fit`
  - `점착제 없이, 자연스럽게 밀착`
  - `수분에 반응해 피부에 스며들 듯 가볍게 밀착되는 Moisture-Bonding`
  - `헷갈림 없이, 한 번에`
  - `직관적 L/R 구분으로, 거울 없이도 한 번에 부착 No Mirror, One Go`
  Card 3:
  - Number: `03.`
  - Title: `Whereable Beauty™`
  - `일상의 흐름을 끊지 않는 뷰티`
  - `야외 활동에서 다음 일정까지, 끊김 없이 어디서든 이어지는 보호와 케어`
  - `선크림 위에 이어지는 레이어`
  - `덧바르지 않아도 계속 유지되는 보호`

  ### Design Notes
  - `.sv-pdp--v2` scoped card swiper layout
  - Header is centered
  - Title uses `.sv-pdp-display-title`
  - Cards follow Figma `438 x 676`, radius `24px`
  - Card text overlays the image at the bottom
  - Overlay uses gradient + `backdrop-filter: blur(6px)`
  - Default card text shows only number and title
  - Active card reveals the description text
  - Card 1 overlay ends in CIEL
  - Card 2 overlay ends in translucent white
  - Card 3 overlay ends in CRÈME

  ### Interactive
  - Section elements fade in
  - Draggable Swiper
  - Pagination bullets
  - Active slide controls which card description is visible

  ### Responsive
  - Desktop: fixed-width card swiper, next card can remain visible outside the container
  - Mobile: one card per view

  ### Image Source
  - `/web/src/sun-veil/ayrow-sun-veil-at-a-glance-01.jpg`
  - `/web/src/sun-veil/ayrow-sun-veil-at-a-glance-02.jpg`
  - `/web/src/sun-veil/ayrow-sun-veil-at-a-glance-03.jpg`

  ## 07. Problem
  Figma node: `734:770`
  Nav title: `바르는 선케어 만으로 충분할까요?`
  Layout: `full-bleed`

  ### Copy
  Eyebrow: `선케어가 가장 먼저 무너지는 자리`
  Title: `눈가 아래,\n바르는 선케어만으로\n충분할까요?`
  Body:
  - `눈가 아래 광대 부위는`
  - `피부가 얇아 보호막이 약하고`
  - `외부 자극에 가장 먼저 노출되고`
  - `표정 움직임으로 가장 먼저 밀리고`
  - `메이크업이 가장 얇게 올라가는 부위입니다.`
  - `그래서 선케어가 가장 먼저 지워집니다.`
  - `문제는 그 다음입니다.`
  - `덧바르기 번거롭고`
  - `그냥 두기엔 불안한 순간이 생깁니다.`

  ### Design Notes
  - `.sv-pdp--v2` scoped full-width section
  - Section background: CRÈME
  - Container uses full width with no left/right padding on desktop
  - Desktop: text/image split `1fr 1fr`
  - Text area left padding: `5vw`
  - Text block max width follows Figma `744px`
  - Title uses `.sv-pdp-display-title`
  - Body uses body-xl scale
  - Image fills the right half with `object-fit: cover`
  - Text color: BLEU

  ### Interactive
  - Section elements fade in

  ### Responsive
  - Mobile: Stack
  - Mobile: restore default page horizontal padding
  - Mobile: Text card then image

  ### Image Source: /web/src/sun-veil/ayrow-sun-veil-problem.jpg

  ## 08. At this moment
  Status: Removed from ver-2.

  ### Removed Section
  - Class: `sv-pdp-moment`
  - Do not re-add unless explicitly requested.

  ## 09. Use Case
  Status: Removed from ver-2.

  ### Removed Section
  - Class: `sv-pdp-use-case`
  - Do not re-add unless explicitly requested.

  ## 11. How it works
  Figma node: `435:339` *(provided node currently matches 09 Use Case; implement from interaction spec and supplied image assets)*
  Nav title: `How it works`
  Layout: `container--md`

  ### Copy
  Eyebrow: `How it Works`
  Section title: `Unveiling Veil`
  Chapter 1 title: `두 개의 레이어가\n하나의 피부처럼 작동합니다`
  Chapter 1 lead: `Sun Veil은 자외선 차단 필름이 아니라,\nUV 보호층과 스킨케어층이 결합된 나노 파이버 멤브레인입니다.`
  Tooltip 1 title: `Aeroflow™`
  Tooltip 1 body: `숨 쉬는 UV 보호층`
  Tooltip 2 title: `Reverse AG Code™`
  Tooltip 2 body: `스킨케어층`
  Layer 1 title: `Aeroflow™`
  Layer 1 body: `초미세 기공 구조가 공기 흐름을 유지하면서 자외선 보호층으로 작동합니다.`
  Layer 2 title: `Reverse AG Code™`
  Layer 2 body: `스킨케어 포뮬러층이 피부 위에 부드럽게 안착되도록 설계되었습니다.`

  ### Design Notes
  - Section background: CRÈME
  - Add generous top and bottom padding around the section
  - All content is a vertical stack; do not split the intro into desktop columns
  - Interactive image stack is centered below Chapter 1 copy
  - Desktop animation image stack max width: 50% of the container
  - Animation stage stays visually centered while the split animation progresses
  - Sticky animation pin must be constrained inside the animation stage
  - The animation stage must reserve its own scroll height so the layer detail content never overlaps the pinned image
  - `sun-veil-whole`, `sun-veil-fiber`, `sun-veil-particles` overlap in the same stage
  - Tooltips are text only; no background, border, or pill treatment
  - Tooltip indicator uses a single horizontal stroke with a circular cap on the left end
  - Tooltip indicator starts around 60% from the left of the animation image area on desktop
  - Layer detail paragraphs use a 2-column grid on desktop

  ### Interactive
  - GSAP is loaded on `product/detail.html`
  - Uses GSAP + native scroll progress; no ScrollTrigger dependency added
  - Initial state: only `sun-veil-whole` visible
  - On scroll: `sun-veil-whole` fades out
  - On scroll: `sun-veil-fiber` and `sun-veil-particles` fade in and split vertically
  - `sun-veil-fiber` moves upward
  - `sun-veil-particles` moves downward
  - Tooltips appear after the split progress passes the midpoint
  - `prefers-reduced-motion: reduce` shows the final split state directly

  ### Responsive
  - Mobile keeps all How it works content stacked
  - Mobile layer detail grid becomes 1 column

  ### Image Source
  - /web/src/sun-veil/sun-veil-whole.png
  - /web/src/sun-veil/sun-veil-fiber.png
  - /web/src/sun-veil/sun-veil-particles.png

  ## 11.01 How It Bonds · Moisture-Bonding
  Figma node: `707:2710`
  Nav title: `none`
  Layout: `container--md`

  ### Copy
  Eyebrow: `How It Bonds`
  Section title: `Moisture-Bonding`
  Lead: `접착하지 않고 수분으로 안착한다`
  Statement: `화학 점착제 없이 구현한 밀착 구조`
  Bonding 1 title: `Bonding 1 · 구조적 물성`
  Bonding 1 body: `피부를 압박하지 않고, 초박막 기공 구조를 통해 피부 위에 자연스럽게 안착되는 메커니즘`
  Bonding 2 title: `Bonding 2 · 포뮬러 점성 밀착`
  Bonding 2 body: `스킨케어 포뮬러의 점성과 초박막 멤브레인 구조가 만나, 별도의 점착제 없이도 피부에 부드럽게 밀착되는 구조`

  ### Design Notes
  - This section is separated from `sv-pdp-how-work`
  - Scope section-specific design with `.sv-pdp--v2`
  - Center-aligned section header
  - Statement uses a short centered underline
  - Diagram image sits in a centered rounded card, max width 590px
  - Detail copy uses a 2-column grid, max width 590px
  - Text color: BLEU
  - Section background: neutral surface

  ### Responsive
  - Mobile keeps the section stacked
  - Mobile detail grid becomes 1 column
  - Mobile image corner radius uses the smaller token

  ### Image Source
  - /web/src/sun-veil/sun-veil-moisture-bonding.jpg

  ## 12. Reverse AG Code™ Formula
  Figma node: `684:476`
  Nav title: `Reverse AG Code™ 포뮬러`
  Layout: `container--md`

  ### Copy
  Section title: `Reverse AG Code™ 포뮬러`
  Core formula:
  - `NMN + Resveratrol + Pterostilbene`
  - `NMN`: `원료 기준 순도 99.5% 이상의 NMN` / `— 에너지 밸런스 서포트`
  - `Resveratrol`: `외부 자극 환경 대응 폴리페놀` / `— 피부 환경 밸런스 케어`
  - `Pterostilbene`: `안정성을 고려한 차세대 폴리페놀` / `— 포뮬러 안정성 서포트`
  Support card:
  - `서포트 비건 포뮬러`
  - `Synergy Modules`
  - `Vegan PRN: 화이트 트러플 유래 효모 RNA`
  - `Phyto PDRN: 생어린 병풀 유래 DNA`
  - `Quercetin: 다마스크 장미 유래`
  - `OPT-anti UV: 미역 유래 비건 유산균`
  Base card:
  - `포뮬러 베이스`
  - `Eco-LTVE™ 저온진공 추출 블랙사파이어 포도수`
  - `정제수 대신, 블랙사파이어 포도를 저온·진공 방식으로 응축한 Eco-LTVE™를 포뮬러 베이스로 설계했습니다.`

  ### Design Notes
  - Section title centered
  - `.sv-pdp--v2` scoped card grid
  - Desktop grid: 2 columns with 20px gutter
  - Left card: core formula, BLEU background, white text, spans the full height of the two right cards
  - Left card content is stacked vertically; no video
  - Right column: support vegan formula card above formula base card
  - Support vegan formula card background: Merlot soft `#F7EAEA`
  - Formula base card background: Ciel soft `#EBF2FE`
  - Card radius: 24px desktop
  - Note appears below the card grid
  - Add full-bleed image banner below the formula cards

  ### Responsive
  - Mobile stacks all formula cards
  - Mobile card radius uses the smaller token
  - Mobile full-bleed image banner uses a taller crop

  ### Image Source
  - `/web/src/sun-veil/ayrow-sun-veil-clean-formula-standard.jpg`

  ## 13. Proven Data
  Figma node: `707:3225`
  Nav title: `검증된 데이터`
  Layout: `container--md`

  ### Copy
  Title: `데이터로 검증된 기술`
  Patent block:
  - `240개의 기술 위에 완성된 베일`
  - `등록 특허`: `59건`
  - `누적 기술 IP`: `240건`
  Breath data title: `숨 쉼은 느껴질 뿐 아니라, 데이터로 증명됩니다`
  Breath data cards:
  - `투습도`: `12,356 g/m²·24h`
  - `공기 투과도`: `1.0 미만 mm/s`
  - `평균 기공 크기`: `0.7μm (0.0007mm)`
  Breath data source: `FITI 시험 연구원 · FITI Testing & Research Institute`
  UV data title: `숨 쉬면서도, 제대로 차단합니다`
  UV data lead: `숨 쉬는 구조 위에, 초박막 차단 레이어를 더했습니다.`
  UV data cards:
  - `UVB`: `99.9% 차단 (파장범위: 290-315 nm)`
  - `UVA`: `95.3% 차단 (파장범위: 315-400 nm)`
  - `UVR`: `96.3% 차단 (파장범위: 290-400 nm)`
  - `UPF`: `50+ (AS 4399:2020 기준)`
  Detail title: `보이지 않지만, 데이터로 확인됩니다.`
  Detail cards:
  - `자외선 차단 성능`: `UVB 차단율 99.9% CUT` / `UVA 차단율 96.4% CUT` / `UVR 차단율 96.3% CUT` / `UPF 지수 UPF 50+`
  - `피부 적합성`: `피부 자극 지수 0.00 (자극 반응 없음)` / `더마테스트 EXCELLENT 등급` / `피부 친화 소재 Skin-friendly Material 기준 충족`
  - `숨 쉬는 구조 데이터`: `공기 투과도 1.0 미만 mm/s (공기 흐름 유지)` / `투습도 12,356 g/m²·24h (습기 배출 가능)` / `기공 크기 0.7μm (초미세 기공 구조)`
  - `물성 & 설계`: `중량 0.05g (1 piece 기준 초경량)` / `두께 0.004mm (초박막)` / `구조 숨 쉬는 나노 멤브레인`
  Vegan block:
  - `비건 인증 (The Vegan Society)`
  - `동물성 원료 무첨가 비건 포뮬러`

  ### Design Notes
  - This section combines all existing numeric/data sections into one module.
  - Position directly after `sv-pdp-formula-code`.
  - Remove standalone `sv-pdp-proven-data--a` and `sv-pdp-proven-data--b` sections.
  - Remove the `sv-pdp-patent` numeric block from `sv-pdp-how-work`.
  - Cards are implemented as Swipers.
  - Swipers in this section use `overflow-x: hidden` for a clean layout.
  - Swiper slides must resolve to whole visible card counts, not partial preview cards.
  - Desktop: metric cards show 3 per view, detail cards show 2 per view.
  - Tablet: metric cards show 2 per view, detail cards show 1 per view.
  - Mobile: all data Swipers show 1 card per view.
  - Swiper pagination is visible and must use the visible page group count, not raw card count.
  - Icon metric cards use 60px icons.
  - Breath metric card background: CIEL.
  - UV metric card background: CRÈME.
  - Detail cards use neutral subtle background.
  - All cards maintain equal height
  - Vegan certification block removes the `윤리 & 포뮬러 기준 (Clean Formula Standard)` title.
  - Vegan certification block removes the large clean formula image.
  - Vegan certification block keeps only the vegan icon/logo and text.

  ### Interactive
  - Horizontal Swiper, draggable/touch enabled
  - Autoplay enabled, 5 second delay
  - Loop disabled
  - Keyboard enabled
  - Count-up applies to numeric values
  - Swiper pagination bullets shown

  ### Icon Source
  - `/assets/icon-vapor-rate.svg`
  - `/assets/icon-air-flow.svg`
  - `/assets/icon-pore-size.svg`
  - `/assets/icon-uvb.svg`
  - `/assets/icon-uva.svg`
  - `/assets/icon-uvr.svg`
  - `/assets/icon-upf.svg`
  - `/web/src/sun-veil/ayrow-vegan-society-logo.png`

  ## 14. Key Experience
  Status: Removed from ver-2.

  ### Removed Section
  - Class: `sv-pdp-key-experience`
  - Do not re-add unless explicitly requested.

  ## 15. Full FAQ
  Figma node: `459:469`
  Nav title: `FAQ`
  Layout: `container--md`

  ### Copy Source
  - Source: user-provided FAQ revision, 2026-05-28.
  - More FAQ accordion items:
    1. `선베일은 정확히 어떤 제품인가요?`
    2. `왜 점착제를 사용하지 않았나요?`
    3. `UPF와 SPF의 차이는 무엇인가요?`
    4. `촉감이 어떤가요? 붙어 있는 게 느껴지나요?`
    5. `부착 후 표정을 지을 때 어색하거나 불편하지 않나요?`
    6. `거울 없이도 부착 가능한가요?`
    7. `재사용 가능한가요?`
    8. `왜 선베일을 사용해야 하나요?`

  ### Design Notes
  - Quick FAQ card Swiper is placed before the accordion list
  - Quick FAQ cards use the existing original Quick Q&A copy
  - Accordion UI
  - Only one answer can be open at a time
  - First item is open by default
  - Border-only row structure
  - Plus icon changes to minus when open
  - No red text styles

  ### Interactive
  - Button-based accordion
  - `aria-expanded`, `aria-controls`, and panel visibility are managed by JS
  - Keyboard accessible through native button focus/activation
