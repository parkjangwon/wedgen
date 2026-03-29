(() => {
  const fallbackConfig = {
    template: "blank-canvas",
    locale: "ko",
    sectionOrder: [
      "hero",
      "greeting",
      "family",
      "gallery",
      "schedule",
      "location",
      "account",
      "guestbook",
      "ending",
    ],
    data: {
      groomName: "",
      brideName: "",
      weddingDate: "",
      heroEyebrow: "",
      heroTagline: "",
      greetingTitle: "",
      greeting: "",
      groomFather: "",
      groomMother: "",
      brideFather: "",
      brideMother: "",
      groomContact: "",
      brideContact: "",
      familyNote: "",
      galleryTitle: "",
      galleryLead: "",
      scheduleTitle: "",
      scheduleNote: "",
      countdownLabel: "",
      venue: "",
      hallDetail: "",
      address: "",
      venuePhone: "",
      navigationNote: "",
      transport: "",
      parking: "",
      accountTitle: "",
      accountIntro: "",
      groomAccount: "",
      groomFamilyAccount: "",
      brideAccount: "",
      brideFamilyAccount: "",
      guestbookTitle: "",
      guestbookLead: "",
      guestbookLabel: "",
      rsvpLabel: "",
      guestbookUrl: "",
      rsvpUrl: "",
      endingTitle: "",
      endingQuote: "",
      mapCoords: { lat: 37.5012, lng: 127.0396 },
    },
    style: {
      colorScheme: "graphite",
      fontSourceMode: "preset",
      headingFont: "gowun-dodum",
      bodyFont: "noto-sans-kr",
      fontPreset: {
        mode: "preset",
        provider: "google",
        importUrl:
          "https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;500;700&display=swap",
        headingFamily: '"Gowun Dodum", "Noto Sans KR", sans-serif',
        bodyFamily: '"Noto Sans KR", sans-serif',
        headingValue: "gowun-dodum",
        bodyValue: "noto-sans-kr",
      },
      animation: "fade",
    },
    assets: {
      heroImage:
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      couplePhoto:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      photos: [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      ],
    },
  };

  const config = window.__WEDGEN_CONFIG__ || fallbackConfig;
  const data = { ...fallbackConfig.data, ...(config.data || {}) };
  const assets = { ...fallbackConfig.assets, ...(config.assets || {}) };
  const style = { ...fallbackConfig.style, ...(config.style || {}) };

  const schemeMap = {
    graphite: { primary: "#111111", bg: "#f6f6f3" },
    "silver-mist": { primary: "#545454", bg: "#f1f1ef" },
  };

  function applyFontPreset(fontPreset) {
    if (!fontPreset || fontPreset.provider !== "google") {
      return;
    }

    let fontLink = document.querySelector('link[data-wedgen-fonts="google"]');
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.dataset.wedgenFonts = "google";
      document.head.appendChild(fontLink);
    }

    fontLink.href = fontPreset.importUrl;
    document.documentElement.style.setProperty("--wedgen-font-heading", fontPreset.headingFamily);
    document.documentElement.style.setProperty("--wedgen-font-body", fontPreset.bodyFamily);
  }

  const scheme = schemeMap[style.colorScheme] || schemeMap.graphite;
  document.documentElement.style.setProperty("--wedgen-primary", scheme.primary);
  document.documentElement.style.setProperty("--wedgen-bg", scheme.bg);
  document.body.dataset.animation = style.animation || "fade";
  const px = (value) => String(value).match(/px$/) ? String(value) : `${value}px`;
  if (data.heroTitleSize) document.documentElement.style.setProperty("--wedgen-hero-title-size", px(data.heroTitleSize));
  if (data.heroMetaSize) document.documentElement.style.setProperty("--wedgen-hero-meta-size", px(data.heroMetaSize));
  if (data.sectionTitleSize) document.documentElement.style.setProperty("--wedgen-section-title-size", px(data.sectionTitleSize));
  if (data.bodyCopySize) document.documentElement.style.setProperty("--wedgen-body-copy-size", px(data.bodyCopySize));
  applyFontPreset(style.fontPreset || fallbackConfig.style.fontPreset);

  const orderedSections = [
    ...new Set([...(config.sectionOrder || []), ...fallbackConfig.sectionOrder]),
  ];
  const sectionNodes = new Map(
    Array.from(document.querySelectorAll("[data-section]")).map((node) => [
      node.dataset.section,
      node,
    ]),
  );

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  function safeText(value, fallback = "내용을 입력해 주세요.") {
    return value == null || value === "" ? fallback : String(value);
  }

  function parseAccountLine(line) {
    if (!line) return null;
    const parts = String(line).split(" ");
    const name = parts.at(-1);
    return {
      name,
      bankAndNumber: parts.slice(0, -1).join(" "),
    };
  }

  function buildActionButton(url, label) {
    if (!url) {
      return `<span class="contact-link">${label}</span>`;
    }

    return `<a class="contact-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  }

  function buildContactButton(phone, label) {
    if (!phone) return "";
    return `<a class="contact-link" href="tel:${phone.replaceAll("-", "")}">${label}</a>`;
  }

  function buildNavLinks() {
    const coords = data.mapCoords || fallbackConfig.data.mapCoords;
    if (!coords || !coords.lat || !coords.lng) {
      return "";
    }

    const venueName = encodeURIComponent(data.venue || "예식장");
    const address = encodeURIComponent(data.address || "");
    return `
      <div class="nav-links">
        <a class="nav-link" href="https://map.naver.com/v5/search/${address}" target="_blank" rel="noreferrer">네이버지도</a>
        <a class="nav-link" href="https://map.kakao.com/link/to/${venueName},${coords.lat},${coords.lng}" target="_blank" rel="noreferrer">카카오맵</a>
        <a class="nav-link" href="https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}" target="_blank" rel="noreferrer">Google Maps</a>
      </div>
    `;
  }

  function calculateCountdown(dateValue) {
    const diff = new Date(dateValue).getTime() - Date.now();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  }

  const eventDate = new Date(data.weddingDate || fallbackConfig.data.weddingDate);
  const countdown = calculateCountdown(eventDate);

  const renderers = {
    hero(node) {
      node.innerHTML = `
        <p class="eyebrow">${safeText(data.heroEyebrow, "Wedding day")}</p>
        <h1 class="headline">${safeText(data.groomName)} <span style="color: var(--wedgen-primary)">&amp;</span> ${safeText(data.brideName)}</h1>
        <p class="subline">${safeText(data.heroTagline)}</p>
        <div class="hero-meta">
          <p class="hero-meta-line">${formatter.format(eventDate)}</p>
          <p class="hero-meta-line">${safeText(data.venue)} ${data.hallDetail ? `· ${data.hallDetail}` : ""}</p>
        </div>
        ${assets.heroImage ? `<img class="hero-image" src="${assets.heroImage}" alt="대표 사진" />` : ""}
      `;
    },
    greeting(node) {
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Invitation</p>
          <h2 class="section-title">${safeText(data.greetingTitle, "소중한 분들을 초대합니다")}</h2>
        </div>
        <p class="copy">${safeText(data.greeting)}</p>
        ${assets.couplePhoto ? `<img class="portrait-image" src="${assets.couplePhoto}" alt="커플 사진" />` : ""}
      `;
    },
    family(node) {
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Family</p>
          <h2 class="section-title">혼주와 인사</h2>
          <p class="section-lead">${safeText(data.familyNote, "양가 부모님과 함께 감사한 마음으로 초대의 말씀을 전합니다.")}</p>
        </div>
        <div class="family-grid">
          <div class="family-card">
            <span class="family-role">신랑측</span>
            <span class="family-name">${safeText(data.groomName)}</span>
            <span class="family-sub">${safeText(data.groomFather, "")} · ${safeText(data.groomMother, "")}</span>
            ${buildContactButton(data.groomContact, "신랑에게 연락하기")}
          </div>
          <div class="family-card">
            <span class="family-role">신부측</span>
            <span class="family-name">${safeText(data.brideName)}</span>
            <span class="family-sub">${safeText(data.brideFather, "")} · ${safeText(data.brideMother, "")}</span>
            ${buildContactButton(data.brideContact, "신부에게 연락하기")}
          </div>
        </div>
      `;
    },
    gallery(node) {
      const photos = Array.isArray(assets.photos) ? assets.photos : [];
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Gallery</p>
          <h2 class="section-title">${safeText(data.galleryTitle, "우리의 순간")}</h2>
          <p class="section-lead">${safeText(data.galleryLead, "함께 웃고 머물렀던 장면들을 한 장씩 모았습니다.")}</p>
        </div>
        ${
          photos.length
            ? `<div class="gallery-grid">${photos
                .map((photo, index) => `<img src="${photo}" alt="갤러리 사진 ${index + 1}" />`)
                .join("")}</div>`
            : '<p class="placeholder-note">갤러리 사진을 추가하면 이곳에 정렬됩니다.</p>'
        }
      `;
    },
    schedule(node) {
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Schedule</p>
          <h2 class="section-title">${safeText(data.scheduleTitle, "예식 일정")}</h2>
          <p class="section-lead">${safeText(data.scheduleNote, "예식 종료 후 같은 층 연회장에서 식사가 이어집니다.")}</p>
        </div>
        <div class="schedule-grid">
          <div class="calendar-box">
            <span class="calendar-date">${formatter.format(eventDate)}</span>
            <span class="timeline-sub">${safeText(data.venue)} ${data.hallDetail ? `· ${data.hallDetail}` : ""}</span>
          </div>
          <div class="countdown-grid">
            <div class="countdown-item"><span class="countdown-value">${countdown.days}</span><span class="countdown-label">일</span></div>
            <div class="countdown-item"><span class="countdown-value">${String(countdown.hours).padStart(2, "0")}</span><span class="countdown-label">시간</span></div>
            <div class="countdown-item"><span class="countdown-value">${String(countdown.minutes).padStart(2, "0")}</span><span class="countdown-label">분</span></div>
            <div class="countdown-item"><span class="countdown-value">${String(countdown.seconds).padStart(2, "0")}</span><span class="countdown-label">초</span></div>
          </div>
          <p class="section-lead">${safeText(data.countdownLabel, "저희의 결혼식이")} ${countdown.days}일 남았습니다.</p>
        </div>
      `;
    },
    location(node) {
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Location</p>
          <h2 class="section-title">${safeText(data.locationTitle, "오시는 길")}</h2>
          <p class="section-lead">${safeText(data.navigationNote, "아래 버튼으로 길안내를 바로 시작할 수 있습니다.")}</p>
        </div>
        <div class="location-meta">
          <div class="info-card">
            <span class="timeline-label">Venue</span>
            <span class="timeline-value">${safeText(data.venue)}</span>
            <span class="timeline-sub">${safeText(data.hallDetail, "")}\n${safeText(data.address)}</span>
            ${data.venuePhone ? `<a class="contact-link" href="tel:${String(data.venuePhone).replaceAll("-", "")}">${data.venuePhone}</a>` : ""}
          </div>
          <div class="info-card">
            <span class="timeline-label">교통 안내</span>
            <span class="timeline-sub">${safeText(data.transport, "교통 안내를 입력해 주세요.")}</span>
          </div>
          <div class="info-card">
            <span class="timeline-label">주차 안내</span>
            <span class="timeline-sub">${safeText(data.parking, "주차 안내를 입력해 주세요.")}</span>
          </div>
          ${buildNavLinks()}
        </div>
      `;
    },
    account(node) {
      const accounts = [
        { role: "신랑", value: data.groomAccount },
        { role: "신랑측 부모", value: data.groomFamilyAccount },
        { role: "신부", value: data.brideAccount },
        { role: "신부측 부모", value: data.brideFamilyAccount },
      ]
        .map((item) => ({ ...item, parsed: parseAccountLine(item.value) }))
        .filter((item) => item.parsed);

      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Account</p>
          <h2 class="section-title">${safeText(data.accountTitle, "마음 전하실 곳")}</h2>
          <p class="section-lead">${safeText(data.accountIntro, "참석이 어려우신 분들을 위해 계좌번호를 함께 남깁니다.")}</p>
        </div>
        ${
          accounts.length
            ? `<div class="account-list">${accounts
                .map(
                  (item) => `
                    <div class="account-item">
                      <span class="account-role">${item.role}</span>
                      <span class="account-name">${item.parsed.name}</span>
                      <span class="account-number">${item.parsed.bankAndNumber}</span>
                    </div>`,
                )
                .join("")}</div>`
            : '<p class="placeholder-note">계좌 정보를 입력하면 이곳에 정리됩니다.</p>'
        }
      `;
    },
    guestbook(node) {
      node.innerHTML = `
        <div class="section-header">
          <p class="section-kicker">Guestbook & RSVP</p>
          <h2 class="section-title">${safeText(data.guestbookTitle, "축복의 한마디")}</h2>
          <p class="section-lead">${safeText(data.guestbookLead, "멀리서 전해주시는 축하도 오래도록 소중히 간직하겠습니다.")}</p>
        </div>
        <div class="action-grid">
          <div class="timeline-card">
            <span class="timeline-label">RSVP</span>
            <span class="timeline-sub">참석 여부와 동행 인원을 미리 알려주시면 준비에 큰 도움이 됩니다.</span>
            ${buildActionButton(data.rsvpUrl, safeText(data.rsvpLabel, "참석 의사 전달하기"))}
          </div>
          <div class="timeline-card">
            <span class="timeline-label">Guestbook</span>
            <span class="timeline-sub">따뜻한 한마디를 남겨주시면 오래도록 소중히 간직하겠습니다.</span>
            ${buildActionButton(data.guestbookUrl, safeText(data.guestbookLabel, "방명록 남기기"))}
          </div>
        </div>
      `;
    },
    ending(node) {
      node.innerHTML = `
        <div class="ending-card">
          <p class="section-kicker">With Love</p>
          <h2 class="section-title">${safeText(data.endingTitle, "저희의 첫 장면을 함께해 주세요")}</h2>
          <p class="copy">${safeText(data.endingQuote, "함께해 주시는 마음 오래도록 기억하겠습니다.")}</p>
        </div>
      `;
    },
  };

  orderedSections.forEach((sectionName, index) => {
    const node = sectionNodes.get(sectionName);
    if (!node || !renderers[sectionName]) {
      return;
    }

    renderers[sectionName](node);
    node.style.animationDelay = `${index * 90}ms`;
  });

  function setupPageDeck() {
    const shell = document.querySelector(".invitation-shell");
    if (!shell) return;

    const pages = orderedSections
      .map((sectionName) => sectionNodes.get(sectionName))
      .filter(Boolean);

    shell.classList.add("page-deck");

    let activeIndex = 0;
    const nav = document.createElement("div");
    nav.className = "page-nav";
    nav.innerHTML = `
      <button type="button" data-page-action="prev">이전</button>
      <div class="page-dots"></div>
      <button type="button" data-page-action="next">다음</button>
    `;

    const dots = nav.querySelector(".page-dots");
    pages.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "page-dot";
      dot.setAttribute("aria-label", `${index + 1} 페이지`);
      dot.addEventListener("click", () => setActive(index));
      dots.appendChild(dot);
    });

    function setActive(index) {
      activeIndex = Math.max(0, Math.min(index, pages.length - 1));
      pages.forEach((page, pageIndex) => {
        page.classList.toggle("is-active", pageIndex === activeIndex);
      });
      Array.from(dots.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
      nav.querySelector('[data-page-action="prev"]').disabled = activeIndex === 0;
      nav.querySelector('[data-page-action="next"]').disabled =
        activeIndex === pages.length - 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    nav.querySelector('[data-page-action="prev"]').addEventListener("click", () => {
      setActive(activeIndex - 1);
    });
    nav.querySelector('[data-page-action="next"]').addEventListener("click", () => {
      setActive(activeIndex + 1);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        setActive(activeIndex + 1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        setActive(activeIndex - 1);
      }
    });

    document.body.appendChild(nav);
    setActive(0);
  }

  setupPageDeck();
})();
