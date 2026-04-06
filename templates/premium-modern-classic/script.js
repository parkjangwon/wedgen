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

  runtime.setText(runtime.query(".hero-label"), data.heroEyebrow || "THE WEDDING OF");
  const heroNames = runtime.queryAll(".hero-names .name");
  runtime.setText(heroNames[0], data.groomName);
  runtime.setText(heroNames[1], data.brideName);
  runtime.setText(runtime.query(".hero-date"), wedding.englishDate);
  runtime.setText(runtime.query(".hero-venue"), (data.venue || "").toUpperCase());

  runtime.setText(runtime.query(".greeting .section-title"), data.greetingTitle || "Invitation");
  runtime.setHtml(runtime.query(".greeting-text"), data.greeting);
  const families = runtime.queryAll(".families .family");
  if (families[0]) {
    runtime.setText(runtime.query(".name", families[0]), data.groomName);
    runtime.setText(
      runtime.query(".parents", families[0]),
      [data.groomFather, data.groomMother].filter(Boolean).join(" · "),
    );
  }
  if (families[1]) {
    runtime.setText(runtime.query(".name", families[1]), data.brideName);
    runtime.setText(
      runtime.query(".parents", families[1]),
      [data.brideFather, data.brideMother].filter(Boolean).join(" · "),
    );
  }

  runtime.setText(runtime.query(".schedule .section-title"), data.scheduleTitle || "Schedule");
  runtime.setText(runtime.query(".date .month"), wedding.monthPad);
  runtime.setText(runtime.query(".date .day"), wedding.dayPad);
  runtime.setText(runtime.query(".date .year"), String(wedding.year));
  const scheduleItems = runtime.queryAll(".schedule .details .item");
  runtime.setText(runtime.query(".value", scheduleItems[0]), wedding.timeEn);
  runtime.setText(runtime.query(".value", scheduleItems[1]), fullVenue);

  runtime.setText(runtime.query(".gallery .section-title"), data.galleryTitle || "Gallery");
  const galleryGrid = runtime.query(".gallery-grid");
  const photos = runtime.toArray(assets.photos);
  if (galleryGrid && photos.length > 0) {
    galleryGrid.innerHTML = photos
      .map((photo, index) => `<img src="${runtime.escapeHtml(photo)}" alt="${index + 1}">`)
      .join("");
  }

  runtime.setText(runtime.query(".location .section-title"), data.locationTitle || "Location");
  runtime.setText(runtime.query(".location h3"), fullVenue || data.venue);
  runtime.setText(runtime.query(".location .address"), [data.address, data.hallDetail].filter(Boolean).join(", "));
  const transportLines = runtime.queryAll(".location .transport p");
  runtime.setText(transportLines[0], data.transport);
  runtime.setText(transportLines[1], data.parking);

  runtime.setText(runtime.query(".account .section-title"), data.accountTitle || "Account");
  runtime.setHtml(runtime.query(".account-note"), data.accountIntro);
  const accountList = runtime.query(".accounts");
  if (accountList && accounts.length > 0) {
    accountList.innerHTML = accounts
      .map((account) => `
        <div class="account-item">
          <span class="bank">${runtime.escapeHtml(account.bank || "")}</span>
          <p class="number">${runtime.escapeHtml(account.number || account.raw)}</p>
          <p class="holder">${runtime.escapeHtml(account.holder || "")}</p>
          <button type="button" class="copy" data-account="${runtime.escapeHtml(account.number || account.raw)}">COPY</button>
        </div>
      `)
      .join("");
  }

  runtime.setText(runtime.query(".footer .thanks"), data.endingTitle || "THANK YOU");
  runtime.setText(
    runtime.query(".footer .names"),
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

  function update() {
    const diff = weddingDate - new Date();
    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      return;
    }

    daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
    hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
    minutesEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  }

  update();
  window.setInterval(update, 60000);
}

function initCopyButtons() {
  runtime.queryAll(".copy").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.account || "");
        button.textContent = "COPIED";
        window.setTimeout(() => {
          button.textContent = "COPY";
        }, 2000);
      } catch (_error) {
        button.textContent = "FAILED";
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
