const runtime = window.WedgenTemplateRuntime;
const data = runtime.data;
const assets = runtime.assets;

document.addEventListener("DOMContentLoaded", () => {
  const root = runtime.query("main.invitation");
  hydrateTemplate(root);
  runtime.mountCommonEnhancements(root);
  renderAccountSection(root);
  runtime.applySectionOrder(root);
  initCountdown();
  initScrollAnimations();
  initMap();
});

function getTitleLines(value) {
  const fallback = ["THE", "BEGINNING", "OF US"];
  if (!value) {
    return fallback;
  }

  const lines = String(value)
    .split(/\n|[|/]/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return lines.slice(0, 3);
  }

  const words = String(value).trim().split(/\s+/);
  if (words.length <= 2) {
    return [String(value).trim()];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function hydrateTemplate(root) {
  const wedding = runtime.formatWeddingDate(data.weddingDate);
  const photos = runtime.toArray(assets.photos);
  const title = runtime.query(".title");

  runtime.setText(runtime.query(".studio"), data.heroEyebrow || "A WEDDING FILM");
  if (title) {
    title.innerHTML = getTitleLines(data.heroTagline).map((line) => (
      `<span class="line">${runtime.escapeHtml(line)}</span>`
    )).join("");
  }

  const heroImage = runtime.query(".hero-image img");
  if (heroImage && photos[0]) {
    heroImage.src = photos[0];
  }

  runtime.setText(runtime.query(".credits .names"), [data.groomName, data.brideName].filter(Boolean).join(" & "));
  runtime.setText(runtime.query(".credits .date"), wedding.dotDate);

  runtime.setText(runtime.query(".scene-1 h2"), data.greetingTitle || "INTRODUCTION");
  runtime.setHtml(runtime.query(".scene-1 .dialogue"), data.greeting);
  const families = runtime.queryAll(".scene-1 .family");
  if (families[0]) {
    runtime.setText(runtime.query(".name", families[0]), data.groomName);
    runtime.setText(
      runtime.query(".parent", families[0]),
      [data.groomFather, data.groomMother].filter(Boolean).join(" · "),
    );
  }
  if (families[1]) {
    runtime.setText(runtime.query(".name", families[1]), data.brideName);
    runtime.setText(
      runtime.query(".parent", families[1]),
      [data.brideFather, data.brideMother].filter(Boolean).join(" · "),
    );
  }

  runtime.setText(runtime.query(".scene-2 h2"), data.scheduleTitle || "THE DATE");
  runtime.setText(runtime.query(".date-display .day"), wedding.dayPad);
  runtime.setText(runtime.query(".month-year .month"), wedding.monthNameEn);
  runtime.setText(runtime.query(".month-year .year"), String(wedding.year));
  const timeLocation = runtime.queryAll(".time-location p");
  runtime.setText(timeLocation[0], `${wedding.time24} @ ${(data.venue || "").toUpperCase()}`);
  runtime.setText(timeLocation[1], [data.hallDetail, data.address].filter(Boolean).join(", ").toUpperCase());

  runtime.setText(runtime.query(".gallery-section .section-title"), data.galleryTitle || "STILL CUTS");
  const gallery = runtime.query(".gallery");
  if (gallery && photos.length > 0) {
    gallery.innerHTML = photos
      .map((photo, index) => `
        <div class="gallery-item ${index === 0 ? "large" : ""}">
          <img src="${runtime.escapeHtml(photo)}" alt="${index + 1}">
        </div>
      `)
      .join("");
  }

  runtime.setText(runtime.query(".location h2"), data.locationTitle || "LOCATION");
  runtime.setText(runtime.query(".location .venue h3"), data.venue);
  runtime.setText(runtime.query(".location .address"), [data.address, data.hallDetail].filter(Boolean).join(", "));
  const transportLines = runtime.queryAll(".location .transport p");
  runtime.setHtml(transportLines[0], `<strong>지하철</strong> ${data.transport || ""}`);
  runtime.setHtml(transportLines[1], `<strong>주차</strong> ${data.parking || ""}`);

  runtime.setText(runtime.query(".credits-end .names"), [data.groomName, data.brideName].filter(Boolean).join(" & "));
  runtime.setText(
    runtime.query(".credits-end .parents"),
    [data.groomFather, data.groomMother, data.brideFather, data.brideMother].filter(Boolean).join(" · "),
  );
  runtime.setText(runtime.query(".credits-end .the-end"), data.endingTitle || "THE END");
  runtime.setText(runtime.query(".footer .copyright"), `© ${wedding.year} ${data.groomName || ""} & ${data.brideName || ""}`.trim());
}

function renderAccountSection(root) {
  const accounts = runtime.getAccounts();
  if (accounts.length === 0) {
    return;
  }

  runtime.ensureRuntimeStyles();

  let section = runtime.query('[data-section="account"]', root);
  if (!section) {
    section = document.createElement("section");
    section.className = "wedgen-dynamic-section wedgen-cinematic-account";
    section.dataset.section = "account";
    section.innerHTML = `
      <div class="wedgen-dynamic-card">
        <h2 class="wedgen-dynamic-title"></h2>
        <div class="wedgen-dynamic-copy"></div>
        <div class="wedgen-cta-grid wedgen-account-grid"></div>
      </div>
    `;

    const footer = root.querySelector("footer");
    if (footer) {
      root.insertBefore(section, footer);
    } else {
      root.appendChild(section);
    }
  }

  runtime.setText(runtime.query(".wedgen-dynamic-title", section), data.accountTitle || "SPECIAL THANKS");
  runtime.setHtml(runtime.query(".wedgen-dynamic-copy", section), data.accountIntro || "");
  const grid = runtime.query(".wedgen-account-grid", section);
  grid.innerHTML = accounts
    .map((account) => `
      <button type="button" class="wedgen-cta-button wedgen-copy-account" data-account="${runtime.escapeHtml(account.number || account.raw)}">
        ${runtime.escapeHtml([account.bank, account.number, account.holder].filter(Boolean).join(" "))}
      </button>
    `)
    .join("");

  runtime.queryAll(".wedgen-copy-account", section).forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.account || "");
        button.textContent = "COPIED";
      } catch (_error) {
        button.textContent = "FAILED";
      }
    });
  });
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

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  runtime.queryAll(".scene, .gallery-section, .location, .wedgen-dynamic-section").forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(element);
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
