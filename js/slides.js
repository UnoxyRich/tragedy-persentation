(() => {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  const progressBar = document.getElementById('progressBar');
  const counter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;
  let transitioning = false;

  /* ── anime.js safety check ──────────────────────────── */
  const A = typeof anime !== 'undefined' ? anime : null;

  /* ── helpers ────────────────────────────────────────── */
  function updateUI() {
    const pct = ((current + 1) / total) * 100 + '%';
    if (A) {
      A({ targets: progressBar, width: pct, easing: 'easeOutExpo', duration: 600 });
    } else {
      progressBar.style.width = pct;
    }
    counter.textContent = (current + 1) + ' / ' + total;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  /* Reset stagger children to initial hidden state */
  function resetStagger(slide) {
    slide.querySelectorAll('.stagger').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });
  }

  /* Animate stagger children in */
  function animateStaggerIn(slide) {
    const els = slide.querySelectorAll('.stagger');
    if (!els.length) return;
    if (!A) {
      // CSS fallback handles it via .slide.active .stagger animation
      return;
    }
    A({
      targets: Array.from(els),
      opacity: [0, 1],
      translateY: [24, 0],
      easing: 'easeOutCubic',
      duration: 500,
      delay: A.stagger(70, { start: 150 })
    });
  }

  /* Animate special per-slide elements */
  function animateSlideSpecials(slide) {
    if (!A) return; // CSS fallback handles visibility
    const idx = parseInt(slide.dataset.slide, 10);

    // Pyramid slide — draw the line, pop dots, fade labels
    if (idx === 2) {
      const line = slide.querySelector('.pyramid-line');
      const area = slide.querySelector('.pyramid-area');
      const dots = slide.querySelectorAll('.pyramid-dot');
      const labels = slide.querySelectorAll('.pyramid-label');
      const sublabels = slide.querySelectorAll('.pyramid-sublabel');

      if (line) {
        const len = line.getTotalLength ? line.getTotalLength() : 1000;
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;

        A.timeline({ easing: 'easeOutCubic' })
          .add({ targets: area, opacity: [0, 1], duration: 600, delay: 200 })
          .add({ targets: line, strokeDashoffset: [len, 0], duration: 900, easing: 'easeInOutQuad' }, 100)
          .add({ targets: Array.from(dots), opacity: [0, 1], scale: [0, 1], duration: 400, delay: A.stagger(100) }, 600)
          .add({ targets: Array.from(labels), opacity: [0, 1], translateY: [-10, 0], duration: 350, delay: A.stagger(80) }, 800)
          .add({ targets: Array.from(sublabels), opacity: [0, 1], duration: 300, delay: A.stagger(80) }, 950);
      }
    }

    // Hamartia bars
    if (idx === 5) {
      const fills = slide.querySelectorAll('.trait-fill');
      if (fills.length) {
        A({ targets: Array.from(fills), scaleX: [0, 1], easing: 'easeOutExpo', duration: 800, delay: A.stagger(120, { start: 400 }) });
      }
    }

    // Cards entrance (slides 3, 6, 7)
    if ([3, 6, 7].includes(idx)) {
      const cards = slide.querySelectorAll('.card');
      if (cards.length) {
        A({ targets: Array.from(cards), opacity: [0, 1], translateY: [30, 0], scale: [0.95, 1], easing: 'easeOutCubic', duration: 500, delay: A.stagger(80, { start: 250 }) });
      }
    }

    // Timeline items (slide 4)
    if (idx === 4) {
      const items = slide.querySelectorAll('.timeline-item');
      if (items.length) {
        A({ targets: Array.from(items), opacity: [0, 1], translateX: [-30, 0], easing: 'easeOutCubic', duration: 450, delay: A.stagger(90, { start: 300 }) });
      }
    }

    // Title slide
    if (idx === 0) {
      const icon = slide.querySelector('.greek-icon');
      if (icon) A({ targets: icon, opacity: [0, 0.15], rotate: ['-15deg', '0deg'], scale: [0.7, 1], easing: 'easeOutBack', duration: 800, delay: 100 });
      const h1 = slide.querySelector('h1');
      if (h1) A({ targets: h1, opacity: [0, 1], translateY: [40, 0], easing: 'easeOutExpo', duration: 900, delay: 200 });
      const divider = slide.querySelector('.divider');
      if (divider) A({ targets: divider, width: [0, 48], opacity: [0, 1], easing: 'easeOutExpo', duration: 700, delay: 500 });
    }

    // End slide
    if (idx === 8) {
      const icon = slide.querySelector('.greek-icon');
      if (icon) A({ targets: icon, opacity: [0, 0.15], rotate: ['15deg', '0deg'], scale: [0.7, 1], easing: 'easeOutBack', duration: 800, delay: 100 });
      const bq = slide.querySelector('blockquote');
      if (bq) A({ targets: bq, opacity: [0, 1], translateY: [20, 0], easing: 'easeOutCubic', duration: 700, delay: 400 });
    }

    // Divider grow for content slides
    if (idx > 0 && idx < 8) {
      const divider = slide.querySelector('.divider');
      if (divider) A({ targets: divider, width: [0, 48], opacity: [0, 1], easing: 'easeOutExpo', duration: 600, delay: 200 });
    }
  }

  /* Reset special elements to hidden state */
  function resetSlideSpecials(slide) {
    const idx = parseInt(slide.dataset.slide, 10);

    if (idx === 2) {
      const line = slide.querySelector('.pyramid-line');
      const area = slide.querySelector('.pyramid-area');
      const dots = slide.querySelectorAll('.pyramid-dot');
      const labels = slide.querySelectorAll('.pyramid-label');
      const sublabels = slide.querySelectorAll('.pyramid-sublabel');
      if (line) {
        const len = line.getTotalLength ? line.getTotalLength() : 1000;
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
      }
      if (area) area.style.opacity = '0';
      dots.forEach(d => { d.style.opacity = '0'; d.style.transform = 'scale(0)'; });
      labels.forEach(l => { l.style.opacity = '0'; });
      sublabels.forEach(s => { s.style.opacity = '0'; });
    }

    if (idx === 5) {
      slide.querySelectorAll('.trait-fill').forEach(f => { f.style.transform = 'scaleX(0)'; });
    }

    const divider = slide.querySelector('.divider');
    if (divider) { divider.style.width = '0'; divider.style.opacity = '0'; }
  }

  /* ── Slide transition ───────────────────────────────── */
  function goTo(index) {
    if (index < 0 || index >= total || index === current || transitioning) return;
    transitioning = true;

    const direction = index > current ? 1 : -1;
    const outgoing = slides[current];
    const incoming = slides[index];
    const outX = direction > 0 ? -80 : 80;
    const inX = direction > 0 ? 80 : -80;

    if (typeof window.triggerParticleBurst === 'function') {
      window.triggerParticleBurst(direction);
    }

    if (A) {
      A.remove(outgoing);
      A.remove(incoming);

      // Animate outgoing
      A({
        targets: outgoing,
        translateX: [0, outX],
        opacity: [1, 0],
        easing: 'easeInCubic',
        duration: 350,
        complete: () => {
          outgoing.classList.remove('active');
          outgoing.style.transform = '';
          outgoing.style.opacity = '0';
          resetStagger(outgoing);
          resetSlideSpecials(outgoing);
        }
      });

      // Animate incoming
      setTimeout(() => {
        incoming.style.opacity = '0';
        incoming.style.transform = 'translateX(' + inX + 'px)';
        incoming.classList.add('active');

        A({
          targets: incoming,
          translateX: [inX, 0],
          opacity: [0, 1],
          easing: 'easeOutCubic',
          duration: 500,
          complete: () => {
            incoming.style.transform = '';
            transitioning = false;
          }
        });

        animateStaggerIn(incoming);
        animateSlideSpecials(incoming);
      }, 150);
    } else {
      // No anime — simple swap
      outgoing.classList.remove('active');
      outgoing.style.opacity = '0';
      resetStagger(outgoing);
      resetSlideSpecials(outgoing);

      incoming.classList.add('active');
      incoming.style.opacity = '1';
      incoming.style.transform = '';
      transitioning = false;
    }

    current = index;
    updateUI();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ── Input handlers ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
  });

  document.querySelector('.slides-container').addEventListener('click', (e) => {
    const rect = document.querySelector('.nav-controls').getBoundingClientRect();
    if (e.clientX >= rect.left - 10 && e.clientX <= rect.right + 10 &&
        e.clientY >= rect.top - 10 && e.clientY <= rect.bottom + 10) return;
    if (e.clientX > window.innerWidth * 0.35) next(); else prev();
  });

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); next(); });

  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ── Initial state ──────────────────────────────────── */
  slides[0].classList.add('active');
  slides[0].style.opacity = '1';

  if (A) {
    A({ targets: slides[0], opacity: [0, 1], easing: 'easeOutCubic', duration: 600 });
  }

  animateStaggerIn(slides[0]);
  animateSlideSpecials(slides[0]);
  updateUI();
})();
