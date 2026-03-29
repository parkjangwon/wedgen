const config = window.__WEDGEN_CONFIG__ || {};
const data = config.data || {};

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCopyButtons();
  initMap();
  initAnimations();
});

function initCountdown() {
  const weddingDate = data.weddingDate ? new Date(data.weddingDate) : new Date('2026-05-15T14:00:00+09:00');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  
  if (!daysEl || !hoursEl || !minutesEl) return;
  
  function updateCountdown() {
    const now = new Date();
    const diff = weddingDate - now;
    
    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 60000);
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
  } else if (mapType === 'naver') {
    const naverUrl = `https://map.naver.com/v5/search/${query}`;
    container.innerHTML = `
      <div class="map-link-container">
        <a href="${naverUrl}" target="_blank" rel="noopener" class="map-link naver">
          <span class="map-icon">🗺️</span>
          <span>네이버 지도에서 ${venue} 보기</span>
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
          <span class="map-icon">📍</span>
          <span>카카오맵에서 ${venue} 보기</span>
        </a>
      </div>
    `;
  }
}

function initCopyButtons() {
  const buttons = document.querySelectorAll('.copy-btn');
  
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const account = button.dataset.account;
      
      try {
        await navigator.clipboard.writeText(account);
        button.textContent = '복사됨';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = '복사';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  });
}

function initAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
  });
}
