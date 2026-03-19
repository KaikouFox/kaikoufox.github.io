/* ══════════════════════════════════════
   NAV + SCROLL BEHAVIOURS
══════════════════════════════════════ */
const navbar   = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id], #home');
const links    = document.querySelectorAll('.nav-links a');

// add shadow when nav is pinned to top
const stickyObs = new IntersectionObserver(
  ([entry]) => navbar.classList.toggle('is-sticky', !entry.isIntersecting),
  { threshold: 0 }
);
stickyObs.observe(document.getElementById('home'));

// highlight active nav link based on scroll position
const activeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeObs.observe(s));

// reveal sections as they scroll into view
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('section[id]').forEach(s => revealObs.observe(s));


/* ══════════════════════════════════════
   BINARY RAIN INTRO
══════════════════════════════════════ */
(function () {
  const overlay     = document.getElementById('binary-overlay');
  const canvas      = document.getElementById('binary-canvas');
  const homeContent = document.getElementById('home-content');
  const ctx         = canvas.getContext('2d');

  const FONT_SIZE = 14;
  const CHARS     = '01';
  const INTERVAL  = 15;

  const STOP_AT = 0.2;
  const FADE_MS = 2000;

  let cols, drops, timerId;
  let done = false;

  document.body.style.overflow = 'hidden';

  function setup() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.ceil(canvas.width / FONT_SIZE);
    drops = Array.from({ length: cols }, () =>
      -Math.floor(Math.random() * (canvas.height / FONT_SIZE))
    );
  }

  function finish() {
    done = true;
    homeContent.classList.add('revealed');
    overlay.classList.add('hidden');
    setTimeout(() => {
      clearInterval(timerId);
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, FADE_MS);
  }

  function tick() {
    ctx.fillStyle = 'rgba(2, 15, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let pastCount = 0;

    drops.forEach((y, i) => {
      const x  = i * FONT_SIZE;
      const py = y * FONT_SIZE;

      if (py > -FONT_SIZE && py < canvas.height + FONT_SIZE) {
        ctx.font      = `bold ${FONT_SIZE}px 'DM Mono', monospace`;
        ctx.fillStyle = '#e8f5e4';
        ctx.fillText(CHARS[Math.random() > 0.5 ? 1 : 0], x, py);

        ctx.font      = `${FONT_SIZE}px 'DM Mono', monospace`;
        ctx.fillStyle = '#6EE77A';
        ctx.fillText(CHARS[Math.random() > 0.5 ? 1 : 0], x, py - FONT_SIZE);

        if (Math.random() > 0.88) {
          ctx.fillStyle = '#C084FC';
          ctx.fillText(CHARS[Math.random() > 0.5 ? 1 : 0], x, py - FONT_SIZE * 2);
        }
      }

      drops[i]++;

      if (drops[i] * FONT_SIZE >= canvas.height) {
        pastCount++;
      }
    });

    if (!done && pastCount / cols >= STOP_AT) {
      finish();
    }
  }

  window.addEventListener('load', () => {
    setup();
    timerId = setInterval(tick, INTERVAL);
  });

  window.addEventListener('resize', () => {
    if (done) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const newCols = Math.ceil(canvas.width / FONT_SIZE);
    if (newCols > cols) {
      for (let i = cols; i < newCols; i++) {
        drops.push(-Math.floor(Math.random() * (canvas.height / FONT_SIZE)));
      }
    }
    cols = newCols;
  });
})();


/* ══════════════════════════════════════
   home SLIDESHOW
══════════════════════════════════════ */
(function () {
  const SLIDE_DURATION = 5000;
  const TRANSITION_MS  = 1000;

  const slides = document.querySelectorAll('.home-slide');
  if (slides.length < 2) return;

  let current   = 0;
  let animating = false;

  function nextSlide() {
    if (animating) return;
    animating = true;

    const prev      = current;
    current         = (current + 1) % slides.length;
    const prevSlide = slides[prev];
    const nextSlide = slides[current];

    // reset all slides to a clean off-screen state
    slides.forEach(s => {
      s.style.transform  = 'translateX(100%)';
      s.style.zIndex     = '0';
      s.style.transition = 'none';
    });

    // prev is on screen, sits on top
    prevSlide.style.transform = 'translateX(0)';
    prevSlide.style.zIndex    = '2';

    // next starts off-screen to the right, behind prev
    nextSlide.style.transform = 'translateX(100%)';
    nextSlide.style.zIndex    = '1';

    // force reflow so the starting position is painted before transitioning
    nextSlide.getBoundingClientRect();

    // animate both slides
    prevSlide.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.77, 0, 0.18, 1)`;
    nextSlide.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.77, 0, 0.18, 1)`;
    prevSlide.style.transform  = 'translateX(-100%)';
    nextSlide.style.transform  = 'translateX(0)';

    setTimeout(() => {
      // park all non-current slides off-screen without transition
      slides.forEach((s, i) => {
        s.style.transition = 'none';
        s.style.zIndex     = '0';
        s.style.transform  = i === current ? 'translateX(0)' : 'translateX(100%)';
      });
      animating = false;
    }, TRANSITION_MS);
  }

  // initialise — only first slide visible
  slides.forEach((s, i) => {
    s.style.transform = i === 0 ? 'translateX(0)' : 'translateX(100%)';
    s.style.zIndex    = '0';
  });

  setInterval(nextSlide, SLIDE_DURATION);
})();