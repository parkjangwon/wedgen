const runtime = window.WedgenTemplateRuntime;
const data = runtime.data;
const assets = runtime.assets;

document.addEventListener("DOMContentLoaded", () => {
  const root = runtime.query("main.invitation");
  hydrateTemplate();
  runtime.mountCommonEnhancements(root);
  initCountdown();
  initCopyButtons();
  initMap();
});

function hydrateTemplate() {
  const wedding = runtime.formatWeddingDate(data.weddingDate);
  const fullVenue = runtime.buildFullVenue(data.venue, data.hallDetail);
  const accounts = runtime.getAccounts();

  runtime.setText(runtime.query(".hero-eyebrow"), data.heroEyebrow || "Wedding Invitation");
  runtime.setText(runtime.query(".name-groom"), data.groomName);
  runtime.setText(runtime.query(".name-bride"), data.brideName);
  runtime.setText(runtime.query(".hero-date"), wedding.dotDate);
  runtime.setText(runtime.query(".hero-venue"), data.venue);

  runtime.setText(runtime.query(".greeting .section-title"), data.greetingTitle || "소중한 분들께");
  runtime.setHtml(runtime.query(".greeting-text"), data.greeting);
  runtime.setText(
    runtime.query(".family-groom p"),
    [data.groomName, data.groomFather, data.groomMother].filter(Boolean).join(" · "),
  );
  runtime.setText(
    runtime.query(".family-bride p"),
    [data.brideName, data.brideFather, data.brideMother].filter(Boolean).join(" · "),
  );

  runtime.setText(runtime.query(".schedule .section-title"), data.scheduleTitle || "예식 안내");
  const scheduleValues = runtime.queryAll(".schedule-value");
  runtime.setText(
    scheduleValues[0],
    `${wedding.year}년 ${wedding.month}월 ${wedding.day}일 ${wedding.weekdayKo}요일`,
  );
  runtime.setText(scheduleValues[1], wedding.timeKo);
  runtime.setText(scheduleValues[2], fullVenue);
  runtime.setText(runtime.query(".countdown-text"), data.countdownLabel || "결혼식까지");

  runtime.setText(runtime.query(".gallery .section-title"), data.galleryTitle || "우리의 순간");
  const galleryGrid = runtime.query(".gallery-grid");
  const galleryPhotos = runtime.toArray(assets.photos);
  if (galleryGrid && galleryPhotos.length > 0) {
    galleryGrid.innerHTML = galleryPhotos
      .map((photo, index) => `<img src="${runtime.escapeHtml(photo)}" alt="사진 ${index + 1}">`)
      .join("");
  }

  runtime.setText(runtime.query(".location .section-title"), data.locationTitle || "오시는 길");
  runtime.setText(runtime.query(".location-name"), data.venue);
  runtime.setHtml(runtime.query(".location-address"), runtime.buildAddressHtml(data.address, data.hallDetail));
  const locationValues = runtime.queryAll(".location .info-value");
  runtime.setText(locationValues[0], data.transport);
  runtime.setText(locationValues[1], data.parking);

  runtime.setText(runtime.query(".account .section-title"), data.accountTitle || "마음 전하실 곳");
  runtime.setHtml(runtime.query(".account-message"), data.accountIntro);

  const accountList = runtime.query(".account-list");
  if (accountList && accounts.length > 0) {
    accountList.innerHTML = accounts
      .map((account) => `
        <div class="account-item">
          <span class="account-bank">${runtime.escapeHtml(account.bank || "")}</span>
          <p class="account-number">${runtime.escapeHtml(account.number || account.raw)}</p>
          <p class="account-holder">${runtime.escapeHtml(account.holder || "")}</p>
          <button class="copy-btn" data-account="${runtime.escapeHtml(account.number || account.raw)}">복사</button>
        </div>
      `)
      .join("");
  }

  runtime.setText(runtime.query(".footer-message"), data.endingTitle || "함께해 주셔서 감사합니다");
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
        <iframe
          src="${googleUrl}"
          width="100%"
          height="300"
          style="border:0; border-radius: 12px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    `;
    return;
  }

  if (mapType === "naver") {
    container.innerHTML = `
      <div class="map-link-container">
        <a href="https://map.naver.com/v5/search/${query}" target="_blank" rel="noopener" class="map-link naver">
          <span class="map-icon">🗺️</span>
          <span>네이버 지도에서 ${runtime.escapeHtml(venue)} 보기</span>
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
        <span class="map-icon">📍</span>
        <span>카카오맵에서 ${runtime.escapeHtml(venue)} 보기</span>
      </a>
    </div>
  `;
}

function initCopyButtons() {
  runtime.queryAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const account = button.dataset.account;

      try {
        await navigator.clipboard.writeText(account || "");
        button.textContent = "복사됨";
        button.classList.add("copied");

        window.setTimeout(() => {
          button.textContent = "복사";
          button.classList.remove("copied");
        }, 2000);
      } catch (_error) {
        button.textContent = "실패";
      }
    });
  });
}
