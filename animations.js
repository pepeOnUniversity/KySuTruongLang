// Reveal elements with data-animate
(function() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.getAttribute('data-delay') || 0);
        setTimeout(() => entry.target.classList.add('in'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// Apply vertical parallax to [data-parallax-y]
(function() {
  const els = document.querySelectorAll('[data-parallax-y]');
  if (!els.length) return;
  const update = () => {
    const y = window.scrollY;
    els.forEach(el => {
      const speed = Number(el.getAttribute('data-parallax-y')) || 12;
      el.style.setProperty('--py', `${y / speed}px`);
      el.classList.add('use-parallax');
    });
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

// Button ripple
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const circle = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  circle.className = 'ripple';
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${e.clientX - rect.left - size / 2}px`;
  circle.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
});

// Hero buttons smooth scroll when they have href hash
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-hero');
  if (!btn) return;
  const hash = btn.getAttribute('href');
  if (hash && hash.startsWith('#')) {
    const el = document.querySelector(hash);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

