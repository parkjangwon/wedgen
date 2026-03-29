(() => {
  const fallbackConfig = {
    template: "elegant-classic",
    locale: "ko",
    sectionOrder: ["hero", "greeting", "gallery", "info", "rsvp", "guestbook"],
    data: {
      groomName: "김민수",
      brideName: "이수진",
      weddingDate: "2026-05-15T14:00:00+09:00",
      greeting: "서로 다른 계절을 걷던 두 사람이 같은 계절의 이름으로 만나게 되었습니다.\n따뜻한 축복으로 함께해 주세요.",
      venue: "그랜드볼룸",
      address: "서울 강남구 테헤란로 1",
      transport: "2호선 역삼역 4번 출구 도보 5분",
      parking: "예식장 지하 주차장 2시간 무료",
      guestbookUrl: "",
      rsvpUrl: "",
    },
    style: {
      colorScheme: "warm-blush",
      fontPair: "pretendard-nanum",
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
  const data = config.data || {};
  const assets = config.assets || {};
  const style = config.style || {};

  const schemeMap = {
    "warm-blush": { primary: "#b97a56", bg: "#f7f0e6" },
    "classic-navy": { primary: "#1d3557", bg: "#eef2f7" },
    "sage-green": { primary: "#5d7052", bg: "#f7f4ea" },
  };

  const scheme = schemeMap[style.colorScheme] || schemeMap["warm-blush"];
  document.documentElement.style.setProperty("--wedgen-primary", scheme.primary);
  document.documentElement.style.setProperty("--wedgen-bg", scheme.bg);
  document.body.dataset.animation = style.animation || "fade";
  document.body.dataset.fontPair = style.fontPair || "pretendard-nanum";

  const orderedSections = config.sectionOrder || fallbackConfig.sectionOrder;
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

  function safeText(value) {
    return value == null || value === "" ? "내용을 입력해 주세요." : String(value);
  }

  function linkButton(url, label) {
    if (!url) {
      return `<p class="placeholder-note">${label} URL을 연결하면 실제 제출 폼이 활성화됩니다.</p>`;
    }

    return `<a class="cta-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  }

  const renderers = {
    hero(node) {
      node.innerHTML = `
        <p class="eyebrow">모바일 청첩장</p>
        <h1 class="headline">${safeText(data.groomName)} <span style="color: var(--wedgen-primary)">&amp;</span> ${safeText(data.brideName)}</h1>
        <p class="subline">${formatter.format(new Date(data.weddingDate || fallbackConfig.data.weddingDate))}</p>
        ${assets.heroImage ? `<img class="hero-image" src="${assets.heroImage}" alt="대표 사진" />` : ""}
      `;
    },
    greeting(node) {
      node.innerHTML = `
        <p class="eyebrow">초대의 글</p>
        <div class="divider"></div>
        <p class="copy">${safeText(data.greeting)}</p>
        ${assets.couplePhoto ? `<img class="portrait-image" src="${assets.couplePhoto}" alt="커플 사진" />` : ""}
      `;
    },
    gallery(node) {
      const photos = Array.isArray(assets.photos) ? assets.photos : [];
      node.innerHTML = `
        <p class="eyebrow">우리의 순간</p>
        <h2 class="headline" style="font-size: 28px">함께 쌓아온 장면들</h2>
        ${
          photos.length
            ? `<div class="gallery-grid">${photos
                .map((photo, index) => `<img src="${photo}" alt="갤러리 사진 ${index + 1}" />`)
                .join("")}</div>`
            : '<p class="placeholder-note">갤러리 사진을 추가하면 이곳에 정렬됩니다.</p>'
        }
      `;
    },
    info(node) {
      node.innerHTML = `
        <p class="eyebrow">예식 안내</p>
        <div class="info-list">
          <div class="info-item">
            <strong>예식 일시</strong>
            <span>${formatter.format(new Date(data.weddingDate || fallbackConfig.data.weddingDate))}</span>
          </div>
          <div class="info-item">
            <strong>예식장</strong>
            <span>${safeText(data.venue)}</span>
          </div>
          <div class="info-item">
            <strong>주소</strong>
            <span>${safeText(data.address)}</span>
          </div>
          <div class="info-item">
            <strong>교통 안내</strong>
            <span>${safeText(data.transport)}</span>
          </div>
          <div class="info-item">
            <strong>주차 안내</strong>
            <span>${safeText(data.parking)}</span>
          </div>
        </div>
      `;
    },
    rsvp(node) {
      node.innerHTML = `
        <p class="eyebrow">참석 의사</p>
        <h2 class="headline" style="font-size: 28px">함께해 주실 수 있나요?</h2>
        <p class="placeholder-note">참석 여부와 동행 인원, 식사 여부를 미리 알려주시면 준비에 큰 도움이 됩니다.</p>
        ${linkButton(data.rsvpUrl, "참석 의사 전달하기")}
      `;
    },
    guestbook(node) {
      node.innerHTML = `
        <p class="eyebrow">방명록</p>
        <h2 class="headline" style="font-size: 28px">축복의 한마디</h2>
        <p class="placeholder-note">따뜻한 메시지를 남겨주시면 두 사람이 오래도록 간직하겠습니다.</p>
        ${linkButton(data.guestbookUrl, "방명록 열기")}
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
})();
