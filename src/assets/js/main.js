/* ─── Intersection Observer: fade-in + gallery stagger ─────── */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('gallery-item')) {
        const siblings = [...el.closest('.gallery-grid').children];
        const idx = siblings.filter((s) => !s.matches('[style*="display: none"]')).indexOf(el);
        setTimeout(() => el.classList.add('visible'), Math.max(0, idx * 65));
      } else {
        el.classList.add('visible');
      }

      io.unobserve(el);
    });
  },
  { threshold: 0.07, rootMargin: '0px 0px -36px 0px' }
);

document.querySelectorAll('.fade-in, .gallery-item').forEach((el) => io.observe(el));

/* ─── Nav: scroll state + active link ──────────────────────── */
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateNav() {
  nav.classList.toggle('scrolled', window.scrollY > 56);

  const viewMid = window.scrollY + window.innerHeight * 0.38;
  sections.forEach((sec) => {
    const id   = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    link.classList.toggle(
      'active',
      viewMid >= sec.offsetTop && viewMid < sec.offsetTop + sec.offsetHeight
    );
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ─── Nav: mobile toggle ────────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navList   = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navList.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

navList.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Gallery filter ────────────────────────────────────────── */
const filterBtns   = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

function applyFilter(filter) {
  galleryItems.forEach((item) => {
    item.style.display = item.dataset.category === filter ? '' : 'none';
  });
  galleryItems.forEach((item) => {
    if (item.style.display !== 'none') {
      item.classList.remove('visible');
      io.observe(item);
    }
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

applyFilter('illustrations');

/* ─── Lightbox ──────────────────────────────────────────────── */
const lightbox    = document.getElementById('lightbox');
const lbImg       = lightbox.querySelector('.lb-img');
const lbTitleEl   = lightbox.querySelector('.lb-title');
const lbMetaEl    = lightbox.querySelector('.lb-meta');
const lbCloseBtn  = lightbox.querySelector('.lb-close');
const lbPrevBtn   = lightbox.querySelector('.lb-prev');
const lbNextBtn   = lightbox.querySelector('.lb-next');
const lbBackdrop  = lightbox.querySelector('.lb-backdrop');

let lbIndex = 0;

function lbVisible() {
  return [...galleryItems].filter(item => item.style.display !== 'none');
}

function lbShow(index) {
  const items = lbVisible();
  lbIndex = (index + items.length) % items.length;
  const item  = items[lbIndex];
  const src   = item.querySelector('img').src;
  const alt   = item.querySelector('img').alt;
  const title = item.querySelector('.item-title').textContent;
  const meta  = item.querySelector('.item-meta').textContent;

  if (lightbox.classList.contains('open')) {
    lbImg.classList.add('lb-switching');
    setTimeout(() => {
      lbImg.src = src;
      lbImg.alt = alt;
      lbTitleEl.textContent = title;
      lbMetaEl.textContent  = meta;
      lbImg.classList.remove('lb-switching');
    }, 150);
  } else {
    lbImg.src = src;
    lbImg.alt = alt;
    lbTitleEl.textContent = title;
    lbMetaEl.textContent  = meta;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbCloseBtn.focus();
  }
}

function lbClose() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const visible = lbVisible();
    const idx = visible.indexOf(item);
    if (idx !== -1) lbShow(idx);
  });
});

lbCloseBtn.addEventListener('click', lbClose);
lbBackdrop.addEventListener('click', lbClose);
lbPrevBtn.addEventListener('click', () => lbShow(lbIndex - 1));
lbNextBtn.addEventListener('click', () => lbShow(lbIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     lbClose();
  if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
  if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
});

/* ─── Smooth scroll with nav offset ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id     = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    ) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
