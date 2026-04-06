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
  const accounts = runtime.getAccounts();
  const fullVenue = runtime.buildFullVenue(data.venue, data.hallDetail);

  runtime.setText(runtime.query(".subtitle"), data.heroEyebrow || "결혼식에 초대합니다");
  const heroNames = runtime.queryAll(".hero .name");
  runtime.setText(heroNames[0], data.groomName);
  runtime.setText(heroNames[1], data.brideName);
  runtime.setText(
    runtime.query(".hero .date"),
    data.weddingDateLunar || wedding.shortKoreanDate,
  );
  runtime.setText(runtime.query(".hero .time"), `${wedding.weekdayKo}요일 ${wedding.timeKo}`);
  runtime.setText(runtime.query(".hero .venue"), fullVenue);

  const mainPhoto = runtime.query(".main-photo img");
  const photos = runtime.toArray(assets.photos);
  if (mainPhoto && photos[0]) {
    mainPhoto.src = photos[0];
  }

  runtime.setHtml(runtime.query(".poem"), data.greeting);

  const familySections = runtime.queryAll(".families .family");
  if (familySections[0]) {
    runtime.setText(runtime.query(".relation .name", familySections[0]), data.groomName);
    const parents = runtime.queryAll(".parents strong", familySections[0]);
    runtime.setText(parents[0], data.groomFather);
    runtime.setText(parents[1], data.groomMother);
  }
  if (familySections[1]) {
    runtime.setText(runtime.query(".relation .name", familySections[1]), data.brideName);
    const parents = runtime.queryAll(".parents strong", familySections[1]);
    runtime.setText(parents[0], data.brideFather);
    runtime.setText(parents[1], data.brideMother);
  }

  runtime.setText(runtime.query(".schedule .section-title"), data.scheduleTitle || "예식 안내");
  runtime.setText(runtime.query(".lunar-date .date"), data.weddingDateLunar || wedding.shortKoreanDate);
  runtime.setText(runtime.query(".solar-date .year"), `${wedding.year}년`);
  runtime.setText(runtime.query(".solar-date .month"), `${wedding.month}월`);
  runtime.setText(runtime.query(".solar-date .day"), `${wedding.day}일`);
  runtime.setText(runtime.query(".detail-row .weekday"), `${wedding.weekdayKo}요일`);
  runtime.setText(runtime.query(".detail-row .time"), wedding.timeKo);
  runtime.setText(runtime.query(".venue-info .name"), data.venue);
  runtime.setText(runtime.query(".venue-info .floor"), data.hallDetail);
  runtime.setText(runtime.query(".countdown-label"), data.countdownLabel || "결혼식까지");

  const galleryGrid = runtime.query(".gallery-grid");
  if (galleryGrid && photos.length > 0) {
    galleryGrid.innerHTML = photos
      .map((photo, index) => `<img src="${runtime.escapeHtml(photo)}" alt="${index + 1}">`)
      .join("");
  }

  runtime.setText(runtime.query(".location .section-title"), data.locationTitle || "오시는 길");
  runtime.setText(runtime.query(".venue-card h3"), data.venue);
  runtime.setText(runtime.query(".venue-card .address"), data.address);
  runtime.setText(runtime.query(".venue-card .floor"), data.hallDetail);
  const transportItems = runtime.queryAll(".transport-item .text");
  runtime.setText(transportItems[0], data.transport);
  runtime.setText(transportItems[1], data.parking);

  runtime.setText(runtime.query(".account .section-title"), data.accountTitle || "마음 전하실 곳");
  runtime.setText(runtime.query(".account-message"), data.accountIntro);
  const accountList = runtime.query(".accounts");
  if (accountList && accounts.length > 0) {
    accountList.innerHTML = accounts
      .map((account) => `
        <div class="account-item">
          <div class="bank-row">
            <span class="bank">${runtime.escapeHtml(account.bank || "")}</span>
            <button type="button" class="copy-btn" data-account="${runtime.escapeHtml(account.number || account.raw)}">복사</button>
          </div>
          <p class="number">${runtime.escapeHtml(account.number || account.raw)}</p>
          <p class="holder">${runtime.escapeHtml(account.holder || "")}</p>
        </div>
      `)
      .join("");
  }

  runtime.setText(runtime.query(".footer .thanks"), data.endingTitle || "감사합니다");
  runtime.setText(
    runtime.query(".footer .names"),
    [data.groomName, data.brideName].filter(Boolean).join(" · "),
  );
}

function initCountdown() {
  const weddingDate = runtime.formatWeddingDate(data.weddingDate).parsed;
  ["days", "hours", "minutes"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    const update = () => {
      const diff = weddingDate - new Date();
      const value = id === "days"
        ? Math.floor(diff / 86400000)
        : id === "hours"
          ? Math.floor((diff % 86400000) / 3600000)
          : Math.floor((diff % 3600000) / 60000);

      element.textContent = String(Math.max(0, value)).padStart(2, "0");
    };

    update();
    window.setInterval(update, 60000);
  });
}

function initCopyButtons() {
  runtime.queryAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.account || "");
        button.textContent = "복사완료";
        window.setTimeout(() => {
          button.textContent = "복사";
        }, 2000);
      } catch {
        button.textContent = "실패";
      }
    });
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
