const runtime = window.WedgenTemplateRuntime;
const data = runtime.data;
const assets = runtime.assets;

document.addEventListener("DOMContentLoaded", () => {
  const root = runtime.query("main.invitation");
  hydrateTemplate();
  runtime.mountCommonEnhancements(root);
  initCountdown();
  initCopyButtons();
  initScrollAnimations();
  initPetals();
  initMap();
});

function hydrateTemplate() {
  const wedding = runtime.formatWeddingDate(data.weddingDate);
  const photos = runtime.toArray(assets.photos);
  const accounts = runtime.getAccounts();
  const fullVenue = runtime.buildFullVenue(data.venue, data.hallDetail);

  runtime.setText(runtime.query(".hero-subtitle"), data.heroEyebrow || "봄날의 소중한 약속");
  const heroNames = runtime.queryAll(".hero-names .name");
  runtime.setText(heroNames[0], data.groomName);
  runtime.setText(heroNames[1], data.brideName);
  runtime.setText(runtime.query(".hero-date"), wedding.dotDate);
  runtime.setText(runtime.query(".hero-venue"), data.venue);

  const heroImage = runtime.query(".hero-image");
  if (heroImage && photos[0]) {
    heroImage.src = photos[0];
  }

  runtime.setText(runtime.query(".greeting .section-title"), data.greetingTitle || "초대합니다");
  runtime.setHtml(runtime.query(".greeting-poem"), data.greeting);
  const families = runtime.queryAll(".greeting .family");
  if (families[0]) {
    runtime.setText(runtime.query(".names strong", families[0]), data.groomName);
    runtime.setText(
      runtime.query(".parents", families[0]),
      [data.groomFather, data.groomMother].filter(Boolean).join(" · "),
    );
  }
  if (families[1]) {
    runtime.setText(runtime.query(".names strong", families[1]), data.brideName);
    runtime.setText(
      runtime.query(".parents", families[1]),
      [data.brideFather, data.brideMother].filter(Boolean).join(" · "),
    );
  }

  runtime.setText(runtime.query(".schedule .section-title"), data.scheduleTitle || "예식 안내");
  runtime.setText(runtime.query(".date-display .year"), String(wedding.year));
  runtime.setText(runtime.query(".date-main .month"), wedding.monthPad);
  runtime.setText(runtime.query(".date-main .day"), wedding.dayPad);
  runtime.setText(runtime.query(".date-display .weekday"), `${wedding.weekdayKo}요일`);
  const timeVenue = runtime.queryAll(".time-venue .value");
  runtime.setText(timeVenue[0], wedding.timeKo);
  runtime.setText(timeVenue[1], fullVenue);
  runtime.setText(runtime.query(".countdown-text"), data.countdownLabel || "결혼식까지");

  runtime.setText(runtime.query(".gallery .section-title"), data.galleryTitle || "우리의 순간");
  const galleryMain = runtime.query(".gallery-main img");
  if (galleryMain && photos[0]) {
    galleryMain.src = photos[0];
  }
  const galleryGrid = runtime.query(".gallery-grid");
  if (galleryGrid && photos.length > 1) {
    galleryGrid.innerHTML = photos
      .slice(1)
      .map((photo, index) => `<img src="${runtime.escapeHtml(photo)}" alt="사진 ${index + 1}">`)
      .join("");
  }

  runtime.setText(runtime.query(".location .section-title"), data.locationTitle || "오시는 길");
  runtime.setText(runtime.query(".venue-name"), data.venue);
  runtime.setHtml(runtime.query(".venue-address"), runtime.buildAddressHtml(data.address, data.hallDetail));
  const transportItems = runtime.queryAll(".transport-item .text");
  runtime.setText(transportItems[0], data.transport);
  runtime.setText(transportItems[1], data.parking);

  runtime.setText(runtime.query(".account .section-title"), data.accountTitle || "마음 전하실 곳");
  runtime.setHtml(runtime.query(".account-message"), data.accountIntro);
  const accountCards = runtime.query(".account-cards");
  if (accountCards && accounts.length > 0) {
    accountCards.innerHTML = accounts
      .map((account, index) => `
        <div class="account-card ${index % 2 === 0 ? "groom" : "bride"}">
          <div class="card-flower">${index % 2 === 0 ? "🌸" : "🌺"}</div>
          <span class="bank">${runtime.escapeHtml(account.bank || "")}</span>
          <p class="number">${runtime.escapeHtml(account.number || account.raw)}</p>
          <p class="holder">${runtime.escapeHtml(account.holder || "")}</p>
          <button type="button" class="copy-btn" data-account="${runtime.escapeHtml(account.number || account.raw)}">복사하기</button>
        </div>
      `)
      .join("");
  }

  runtime.setText(runtime.query(".footer-text"), data.endingQuote || "봄날의 향기를 담아");
  runtime.setText(
    runtime.query(".footer-names"),
    [data.groomName, data.brideName].filter(Boolean).join(" & "),
  );
}

function initCountdown() {
  const weddingDate = runtime.formatWeddingDate(data.weddingDate).parsed;
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");

  if (!daysEl || !hoursEl || !minutesEl) {
    return;
  }

  function updateCountdown() {
    const diff = weddingDate - new Date();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      return;
    }

    daysEl.textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
    hoursEl.textContent = String(
      Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    ).padStart(2, "0");
    minutesEl.textContent = String(
      Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    ).padStart(2, "0");
  }

  updateCountdown();
  window.setInterval(updateCountdown, 60000);
}

function initCopyButtons() {
  runtime.queryAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.account || "");
        button.textContent = "복사완료";
        button.classList.add("copied");

        window.setTimeout(() => {
          button.textContent = "복사하기";
          button.classList.remove("copied");
        }, 2000);
      } catch (_error) {
        button.textContent = "실패";
      }
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  runtime.queryAll("section").forEach((section) => {
    observer.observe(section);
  });
}

function initPetals() {
  runtime.queryAll(".petal").forEach((petal, index) => {
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${index * 2}s`;
  });
}

function initMap() {
  const container = runtime.query(".map-container") || runtime.query("[data-map]");
  if (!container) {
    return;
  }

  const coords = data.mapCoords;
  const venue = data.venue || "예식장";
  const address = data.address || "";
  const query = encodeURIComponent(address || venue);
  const mapType = data.mapType || "kakao";

  if (mapType === "google") {
    const googleUrl = coords?.lat && coords?.lng
      ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2zNDDCsDEyJzEwLjgiTiAxMjfCsDU5JzE5LjQiRQ!5e0!3m2!1sko!2skr!4v1`
      : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d126.978!3d37.5665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2${query.slice(0, 8)}!2z${query}!5e0!3m2!1sko!2skr!4v1`;

    container.innerHTML = `
      <div class="map-iframe-container">
        <iframe src="${googleUrl}" width="100%" height="300" style="border:0; border-radius: 12px;" allowfullscreen loading="lazy"></iframe>
      </div>
    `;
    return;
  }

  if (mapType === "naver") {
    container.innerHTML = `
      <div class="map-link-container">
        <a href="https://map.naver.com/v5/search/${query}" target="_blank" rel="noopener" class="map-link naver">
          <span>🗺️</span> 네이버 지도에서 ${runtime.escapeHtml(venue)} 보기
        </a>
      </div>
    `;
    return;
  }

  const kakaoUrl = coords?.lat && coords?.lng
    ? `https://map.kakao.com/link/map/${encodeURIComponent(venue)},${coords.lat},${coords.lng}`
    : `https://map.kakao.com/?q=${query}`;

  container.innerHTML = `
    <div class="map-link-container">
      <a href="${kakaoUrl}" target="_blank" rel="noopener" class="map-link kakao">
        <span>📍</span> 카카오맵에서 ${runtime.escapeHtml(venue)} 보기
      </a>
    </div>
  `;
}
