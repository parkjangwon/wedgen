(function () {
  const DEFAULT_SECTION_ORDER = [
    "hero",
    "greeting",
    "family",
    "timeline",
    "gallery",
    "schedule",
    "location",
    "account",
    "guestbook",
    "ending",
  ];

  const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
  const MONTHS_EN = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const config = window.__WEDGEN_CONFIG__ || {};
  const data = config.data || {};
  const style = config.style || {};
  const assets = config.assets || {};

  function toArray(value) {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value.filter(Boolean) : [value];
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toMultilineHtml(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function setText(target, value) {
    if (!target || value === undefined || value === null || value === "") {
      return;
    }

    target.textContent = String(value);
  }

  function setHtml(target, value) {
    if (!target || value === undefined || value === null || value === "") {
      return;
    }

    target.innerHTML = toMultilineHtml(String(value));
  }

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function parseDateTime(value) {
    const input = value || "2026-05-15T14:00:00+09:00";
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return new Date("2026-05-15T14:00:00+09:00");
    }

    return parsed;
  }

  function formatWeddingDate(value) {
    const parsed = parseDateTime(value);
    const year = parsed.getFullYear();
    const month = parsed.getMonth() + 1;
    const day = parsed.getDate();
    const weekday = WEEKDAYS_KO[parsed.getDay()];
    const hours = parsed.getHours();
    const minutes = parsed.getMinutes();
    const hour12 = hours % 12 || 12;
    const meridiemKo = hours < 12 ? "오전" : "오후";

    return {
      parsed,
      year,
      month,
      monthPad: pad(month),
      monthNameEn: MONTHS_EN[month - 1],
      day,
      dayPad: pad(day),
      weekdayKo: weekday,
      hours,
      hoursPad: pad(hours),
      minutes,
      minutesPad: pad(minutes),
      hour12,
      meridiemKo,
      dotDate: `${year}. ${pad(month)}. ${pad(day)}`,
      englishDate: `${MONTHS_EN[month - 1]} ${day}, ${year}`,
      koreanDate: `${year}년 ${month}월 ${day}일 ${weekday}요일`,
      shortKoreanDate: `${year}년 ${month}월 ${day}일`,
      time24: `${pad(hours)}:${pad(minutes)}`,
      timeKo: minutes === 0
        ? `${meridiemKo} ${hour12}시`
        : `${meridiemKo} ${hour12}시 ${minutes}분`,
      timeEn: `${hour12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`,
    };
  }

  function normalizeSectionTokens(element) {
    const tokens = [element.dataset.section || ""]
      .concat((element.dataset.sectionAliases || "").split(/\s+/))
      .map((token) => token.trim())
      .filter(Boolean);

    return [...new Set(tokens)];
  }

  function applySectionOrder(root) {
    const container = root || query("main.invitation") || document.body;
    const footer = container.querySelector("footer");
    const sections = queryAll("[data-section]", container);
    const requestedOrder = toArray(config.sectionOrder);
    const order = [...new Set(requestedOrder.concat(DEFAULT_SECTION_ORDER))];
    const ordered = [];
    const used = new Set();

    for (const sectionId of order) {
      const match = sections.find((section) => {
        if (used.has(section)) {
          return false;
        }

        return normalizeSectionTokens(section).includes(sectionId);
      });

      if (match) {
        ordered.push(match);
        used.add(match);
      }
    }

    sections.forEach((section) => {
      if (!used.has(section)) {
        ordered.push(section);
      }
    });

    ordered.forEach((section) => {
      if (footer) {
        container.insertBefore(section, footer);
      } else {
        container.appendChild(section);
      }
    });
  }

  function ensureFontImport(url) {
    if (!url) {
      return;
    }

    const alreadyLoaded = query(`link[href="${url}"]`);
    if (alreadyLoaded) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }

  function withAlpha(hex, alpha) {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
      return hex;
    }

    const normalized = hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

    const channel = Math.max(0, Math.min(255, Math.round(alpha * 255)))
      .toString(16)
      .padStart(2, "0");

    return `${normalized}${channel}`;
  }

  function applyTheme() {
    const root = document.documentElement;
    const preset = style.fontPreset || {};
    const color = style.resolvedColorScheme || {};

    ensureFontImport(preset.importUrl);

    if (preset.headingFamily) {
      root.style.setProperty("--font-display", preset.headingFamily);
      root.style.setProperty("--font-heading", preset.headingFamily);
      root.style.setProperty("--font-serif", preset.headingFamily);
      root.style.setProperty("--font-traditional", preset.headingFamily);
      root.style.setProperty("--font-ko", preset.headingFamily);
    }

    if (preset.bodyFamily) {
      root.style.setProperty("--font-body", preset.bodyFamily);
    }

    if (color.primary) {
      root.style.setProperty("--wedgen-primary", color.primary);
      root.style.setProperty("--accent", color.primary);
      root.style.setProperty("--color-accent", color.primary);
      root.style.setProperty("--color-accent-light", withAlpha(color.primary, 0.18));
      root.style.setProperty("--border", withAlpha(color.primary, 0.16));
    }

    if (color.bg) {
      root.style.setProperty("--wedgen-bg", color.bg);
      root.style.setProperty("--bg", color.bg);
      root.style.setProperty("--color-bg", color.bg);
      root.style.setProperty("--color-bg-alt", withAlpha(color.primary || color.bg, 0.08));
      document.body.style.background = color.bg;
    }

    if (style.animation) {
      document.body.dataset.wedgenAnimation = style.animation;
    }
  }

  function buildFullVenue(venue, hallDetail) {
    if (venue && hallDetail) {
      return `${venue} ${hallDetail}`;
    }

    return venue || hallDetail || "";
  }

  function buildAddressHtml(address, hallDetail) {
    return [address, hallDetail].filter(Boolean).map(escapeHtml).join("<br>");
  }

  function parseAccount(value) {
    if (!value) {
      return null;
    }

    const parts = String(value).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return null;
    }

    if (parts.length === 1) {
      return {
        bank: "",
        number: parts[0],
        holder: "",
        raw: String(value),
      };
    }

    if (parts.length === 2) {
      return {
        bank: parts[0],
        number: parts[1],
        holder: "",
        raw: String(value),
      };
    }

    return {
      bank: parts[0],
      number: parts.slice(1, -1).join(" "),
      holder: parts[parts.length - 1],
      raw: String(value),
    };
  }

  function getAccounts() {
    return [
      parseAccount(data.groomAccount),
      parseAccount(data.groomFamilyAccount),
      parseAccount(data.brideAccount),
      parseAccount(data.brideFamilyAccount),
    ].filter(Boolean);
  }

  function ensureRuntimeStyles() {
    if (query("#wedgen-runtime-styles")) {
      return;
    }

    const styleTag = document.createElement("style");
    styleTag.id = "wedgen-runtime-styles";
    styleTag.textContent = `
      .wedgen-dynamic-section {
        padding: 72px 30px;
      }

      .wedgen-dynamic-card {
        margin: 0 auto;
        max-width: 360px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.88);
        padding: 28px 24px;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
        color: inherit;
      }

      body[data-wedgen-animation="slide"] .wedgen-dynamic-section,
      body[data-wedgen-animation="reveal"] .wedgen-dynamic-section {
        animation: wedgen-slide-up 0.7s ease-out both;
      }

      body[data-wedgen-animation="fade"] .wedgen-dynamic-section,
      body[data-wedgen-animation="gentle"] .wedgen-dynamic-section,
      body[data-wedgen-animation="petals"] .wedgen-dynamic-section,
      body[data-wedgen-animation="cinematic"] .wedgen-dynamic-section {
        animation: wedgen-fade-in 0.7s ease-out both;
      }

      .wedgen-dynamic-title {
        margin-bottom: 14px;
        font-family: var(--font-display, serif);
        font-size: 1.3rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .wedgen-dynamic-copy {
        line-height: 1.8;
        color: inherit;
        opacity: 0.82;
      }

      .wedgen-cta-grid {
        display: grid;
        gap: 12px;
        margin-top: 22px;
      }

      .wedgen-cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        border-radius: 999px;
        background: var(--wedgen-primary, var(--accent, #c9a96e));
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        letter-spacing: 0.03em;
        padding: 0 20px;
      }

      .wedgen-timeline {
        display: grid;
        gap: 18px;
        margin-top: 18px;
      }

      .wedgen-timeline-item {
        display: grid;
        gap: 6px;
        padding-left: 16px;
        border-left: 2px solid var(--wedgen-primary, var(--accent, #c9a96e));
      }

      .wedgen-timeline-date {
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.58;
      }

      .wedgen-timeline-title {
        font-family: var(--font-display, serif);
        font-size: 1rem;
      }

      .wedgen-timeline-description {
        opacity: 0.78;
        line-height: 1.7;
      }

      @keyframes wedgen-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes wedgen-slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    document.head.appendChild(styleTag);
  }

  function ensureDynamicSection(sectionId, title, copy, root) {
    const container = root || query("main.invitation") || document.body;
    const footer = container.querySelector("footer");
    const existing = query(`[data-section="${sectionId}"]`, container);

    if (existing) {
      return existing;
    }

    const section = document.createElement("section");
    section.className = `wedgen-dynamic-section wedgen-dynamic-${sectionId}`;
    section.dataset.section = sectionId;
    section.innerHTML = `
      <div class="wedgen-dynamic-card">
        <h2 class="wedgen-dynamic-title">${escapeHtml(title)}</h2>
        <div class="wedgen-dynamic-copy">${toMultilineHtml(copy)}</div>
      </div>
    `;

    if (footer) {
      container.insertBefore(section, footer);
    } else {
      container.appendChild(section);
    }

    return section;
  }

  function renderTimelineSection(root) {
    if (!data.timelineEvents) {
      return null;
    }

    let parsed;

    try {
      parsed = JSON.parse(data.timelineEvents);
    } catch (_error) {
      return null;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    ensureRuntimeStyles();

    const title = data.timelineTitle || "우리의 이야기";
    const lead = data.timelineLead || "";
    const section = ensureDynamicSection("timeline", title, lead, root);
    const card = query(".wedgen-dynamic-card", section);
    const existingTimeline = query(".wedgen-timeline", section);

    if (existingTimeline) {
      existingTimeline.remove();
    }

    const timeline = document.createElement("div");
    timeline.className = "wedgen-timeline";
    timeline.innerHTML = parsed
      .map((item) => `
        <article class="wedgen-timeline-item">
          <div class="wedgen-timeline-date">${escapeHtml(item.date || "")}</div>
          <div class="wedgen-timeline-title">${escapeHtml(item.title || "")}</div>
          <div class="wedgen-timeline-description">${toMultilineHtml(item.description || "")}</div>
        </article>
      `)
      .join("");

    card.appendChild(timeline);
    return section;
  }

  function renderGuestbookSection(root) {
    const actions = [
      data.rsvpUrl
        ? { href: data.rsvpUrl, label: data.rsvpLabel || "RSVP 남기기" }
        : null,
      data.guestbookUrl
        ? { href: data.guestbookUrl, label: data.guestbookLabel || "축하 메시지 남기기" }
        : null,
    ].filter(Boolean);

    if (actions.length === 0) {
      return null;
    }

    ensureRuntimeStyles();

    const title = data.guestbookTitle || "함께해 주세요";
    const copy = data.guestbookLead || "축하의 마음을 남겨주시면 오래도록 간직하겠습니다.";
    const section = ensureDynamicSection("guestbook", title, copy, root);
    const card = query(".wedgen-dynamic-card", section);
    const existingGrid = query(".wedgen-cta-grid", section);

    if (existingGrid) {
      existingGrid.remove();
    }

    const grid = document.createElement("div");
    grid.className = "wedgen-cta-grid";
    grid.innerHTML = actions
      .map((action) => `
        <a class="wedgen-cta-button" href="${escapeHtml(action.href)}" target="_blank" rel="noopener">
          ${escapeHtml(action.label)}
        </a>
      `)
      .join("");

    card.appendChild(grid);
    return section;
  }

  function renderEndingSection(root) {
    if (!data.endingTitle && !data.endingQuote) {
      return null;
    }

    ensureRuntimeStyles();
    return ensureDynamicSection(
      "ending",
      data.endingTitle || "감사합니다",
      data.endingQuote || "",
      root,
    );
  }

  function applyDocumentTitle() {
    const groom = data.groomName || "";
    const bride = data.brideName || "";
    if (!groom && !bride) {
      return;
    }

    document.title = `${groom} ${bride ? `& ${bride}` : ""}`.trim();
  }

  function mountCommonEnhancements(root) {
    applyTheme();
    ensureRuntimeStyles();
    renderTimelineSection(root);
    renderGuestbookSection(root);
    renderEndingSection(root);
    applySectionOrder(root);
    applyDocumentTitle();
  }

  window.WedgenTemplateRuntime = {
    config,
    data,
    style,
    assets,
    setText,
    setHtml,
    query,
    queryAll,
    toArray,
    escapeHtml,
    formatWeddingDate,
    applySectionOrder,
    applyTheme,
    buildFullVenue,
    buildAddressHtml,
    parseAccount,
    getAccounts,
    ensureRuntimeStyles,
    ensureDynamicSection,
    renderTimelineSection,
    renderGuestbookSection,
    renderEndingSection,
    mountCommonEnhancements,
  };
})();
