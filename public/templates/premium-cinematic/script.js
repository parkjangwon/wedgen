document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initScrollAnimations();
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

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scene, .gallery-section, .location').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
}
