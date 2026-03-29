document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCopyButtons();
  initAnimations();
});

function initCountdown() {
  const weddingDate = new Date('2026-05-15T14:00:00+09:00');
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
