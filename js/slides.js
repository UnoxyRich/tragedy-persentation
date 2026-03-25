(() => {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  const progressBar = document.getElementById('progressBar');
  const counter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;
  let transitioning = false;

  function updateUI() {
    const pct = ((current + 1) / total) * 100;
    progressBar.style.width = pct + '%';
    counter.textContent = (current + 1) + ' / ' + total;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function goTo(index) {
    if (index < 0 || index >= total || index === current || transitioning) return;
    transitioning = true;

    const direction = index > current ? 1 : -1;
    const outgoing = slides[current];
    const incoming = slides[index];

    // Exit current slide
    outgoing.classList.remove('active');
    if (direction > 0) {
      outgoing.classList.add('exit-left');
    } else {
      outgoing.style.transform = 'translateX(60px)';
      outgoing.style.opacity = '0';
    }

    // Enter new slide
    incoming.classList.remove('exit-left');
    incoming.style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
    incoming.style.opacity = '0';

    // Force reflow so the starting position takes effect
    void incoming.offsetWidth;

    incoming.classList.add('active');
    incoming.style.transform = '';
    incoming.style.opacity = '';

    current = index;
    updateUI();

    setTimeout(() => {
      outgoing.classList.remove('exit-left');
      outgoing.style.transform = '';
      outgoing.style.opacity = '';
      transitioning = false;
    }, 450);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      prev();
    }
  });

  // Click / tap on slide area (ignore clicks on nav controls area)
  document.querySelector('.slides-container').addEventListener('click', (e) => {
    // Don't navigate if clicking near the nav buttons (bottom-right corner)
    const rect = document.querySelector('.nav-controls').getBoundingClientRect();
    if (
      e.clientX >= rect.left - 10 &&
      e.clientX <= rect.right + 10 &&
      e.clientY >= rect.top - 10 &&
      e.clientY <= rect.bottom + 10
    ) return;

    const x = e.clientX;
    const w = window.innerWidth;
    if (x > w * 0.35) {
      next();
    } else {
      prev();
    }
  });

  // Nav buttons — direct listeners with highest priority
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    prev();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    next();
  });

  // Touch swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  updateUI();
})();
