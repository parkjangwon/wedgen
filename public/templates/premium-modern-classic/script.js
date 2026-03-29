document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCopyButtons();
});

function initCountdown() {
  const weddingDate = new Date('2026-05-15T14:00:00+09:00');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  
  if (!daysEl || !hoursEl || !minutesEl) return;
  
  function update() {
    const diff = weddingDate - new Date();
    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      return;
    }
    daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    minutesEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  }
  
  update();
  setInterval(update, 60000);
}

function initCopyButtons() {
  document.querySelectorAll('.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.account);
        btn.textContent = 'COPIED';
        setTimeout(() => btn.textContent = 'COPY', 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
    });
  });
}
