const config = window.__WEDGEN_CONFIG__ || {};
const data = config.data || {};

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCopyButtons();
  initMap();
});

function initCountdown() {
  const weddingDate = new Date('2026-05-15T14:00:00+09:00');
  ['days', 'hours', 'minutes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const update = () => {
        const diff = weddingDate - new Date();
        const value = id === 'days' ? Math.floor(diff / 86400000) :
                     id === 'hours' ? Math.floor((diff % 86400000) / 3600000) :
                     Math.floor((diff % 3600000) / 60000);
        el.textContent = String(Math.max(0, value)).padStart(2, '0');
      };
      update();
      setInterval(update, 60000);
    }
  });
}

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.account);
        btn.textContent = '복사완료';
        setTimeout(() => btn.textContent = '복사', 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    });
  });
}

function initMap() {
  const container = document.querySelector('.map-container') || document.querySelector('[data-map]');
  if (!container) return;

  const coords = data.mapCoords;
  const venue = data.venue || '예식장';
  const address = data.address || '';
  const query = encodeURIComponent(address || venue);
  const mapType = data.mapType || 'kakao';

  if (mapType === 'google') {
    const googleUrl = coords?.lat && coords?.lng
      ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0!2zNDDCsDEyJzEwLjgiTiAxMjfCsDU5JzE5LjQiRQ!5e0!3m2!1sko!2skr!4v1`
      : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d126.978!3d37.5665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2${query.slice(0, 8)}!2z${query}!5e0!3m2!1sko!2skr!4v1`;

    container.innerHTML = `
      <div class="map-iframe-container">
        <iframe src="${googleUrl}" width="100%" height="300" style="border:0; border-radius: 12px;" allowfullscreen loading="lazy"></iframe>
      </div>
    `;
  } else if (mapType === 'naver') {
    container.innerHTML = `
      <div class="map-link-container">
        <a href="https://map.naver.com/v5/search/${query}" target="_blank" rel="noopener" class="map-link naver">
          <span>🗺️</span> 네이버 지도에서 ${venue} 보기
        </a>
      </div>
    `;
  } else {
    const kakaoUrl = coords?.lat && coords?.lng
      ? `https://map.kakao.com/link/map/${encodeURIComponent(venue)},${coords.lat},${coords.lng}`
      : `https://map.kakao.com/?q=${query}`;
    container.innerHTML = `
      <div class="map-link-container">
        <a href="${kakaoUrl}" target="_blank" rel="noopener" class="map-link kakao">
          <span>📍</span> 카카오맵에서 ${venue} 보기
        </a>
      </div>
    `;
  }
}
