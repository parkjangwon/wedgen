document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCopyButtons();
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
