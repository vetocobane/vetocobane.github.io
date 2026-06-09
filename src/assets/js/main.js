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

/* ─── Showreel ──────────────────────────────────────────────── */
const showreelBanner   = document.getElementById('showreel-banner');
const showreelModal    = document.getElementById('showreel-modal');
const showreelFullFrame = document.getElementById('showreel-full');
const showreelCloseBtn = showreelModal.querySelector('.showreel-close');
const showreelBackdrop = showreelModal.querySelector('.showreel-backdrop');

const SHOWREEL_SRC = 'https://player.vimeo.com/video/1144147388?autoplay=1&color=c4b49a&byline=0&title=0&portrait=0&dnt=1';

function openShowreel() {
  showreelFullFrame.src = SHOWREEL_SRC;
  showreelModal.classList.add('open');
  showreelModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showreelCloseBtn.focus();
}

function closeShowreel() {
  showreelModal.classList.remove('open');
  showreelModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  showreelFullFrame.src = '';
}

showreelBanner.addEventListener('click', openShowreel);
showreelBanner.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openShowreel(); }
});
showreelCloseBtn.addEventListener('click', closeShowreel);
showreelBackdrop.addEventListener('click', closeShowreel);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && showreelModal.classList.contains('open')) closeShowreel();
});

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

/* ─── Sprite gallery panel ──────────────────────────────────── */
document.querySelectorAll('.gamejam-card-wrapper').forEach((wrapper) => {
  const bookmark = wrapper.querySelector('.sprite-bookmark');
  const panel    = wrapper.querySelector('.sprite-panel');
  if (!bookmark || !panel) return;

  let closeTimer = null;

  function openPanel() {
    clearTimeout(closeTimer);
    wrapper.classList.add('sprites-open');
    bookmark.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      wrapper.classList.remove('sprites-open');
      bookmark.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }, 110);
  }

  bookmark.addEventListener('mouseenter', openPanel);
  bookmark.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseenter', openPanel);
  panel.addEventListener('mouseleave', scheduleClose);
});

/* ─── Necrocure mini-flipbooks ───────────────────────────────── */
(function () {
  const BASE = '/assets/images/game jam assets/necrocure/';
  const src  = (n) => BASE + n + '.png';

  const COW_FRAMES = [
    { head: 'cow_head_front_normal', body: 'cow_body_front_normal', tail: 'cow_tail_front_normal' },
    { head: 'cow_head_front_nec_01', body: 'cow_body_front_nec_01', tail: 'cow_tail_front_nec_01' },
    { head: 'cow_head_front_nec_02', body: 'cow_body_front_nec_02', tail: 'cow_tail_front_nec_02' },
    { head: 'cow_head_front_nec_3',  body: 'cow_body_front_nec_03', tail: 'cow_tail_front_nec_03' },
    { head: 'cow_head_front_nec_04', body: 'cow_body_front_nec_04', tail: 'cow_tail_front_nec_04' },
    { head: 'cow_head_front_nec_05', body: 'cow_body_front_nec_05', tail: 'cow_tail_front_nec_05' },
    { head: 'cow_head_front_nec_06', body: 'cow_body_front_nec_06', tail: 'cow_tail_front_nec_06' },
  ];

  const SEQS = {
    'nc-fb-ufo':  ['ufo_00','ufo_01','ufo_02','ufo_03','ufo_04','ufo_05','ufo_06','ufo_07','ufo_08','ufo_09','ufo_10'],
    'nc-fb-beam': ['ufo_beam_outline_01','ufo_beam_outline_02','ufo_beam_outline_03','ufo_beam_outline_04','ufo_beam_fill_01'],
    'nc-fb-puff': ['ufo_cow_disappear_puff_01','ufo_cow_disappear_puff_02','ufo_cow_disappear_puff_03','ufo_cow_disappear_puff_04','ufo_cow_disappear_puff_05','ufo_cow_disappear_puff_06'],
  };

  function makeFlipper(el, totalFrames, onTick) {
    const playBtn = el.querySelector('.mini-fb-play');
    const counter = el.querySelector('.mini-fb-counter');
    let frame   = 0;
    let playing = true;
    let timer   = setInterval(tick, 160);

    function tick() {
      frame = (frame + 1) % totalFrames;
      onTick(frame);
      counter.textContent = (frame + 1) + '/' + totalFrames;
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playing = !playing;
      playBtn.textContent = playing ? '⏸' : '▶';
      playing ? (timer = setInterval(tick, 160)) : clearInterval(timer);
    });
  }

  // UFO, Beam, Puff — single sprite
  Object.entries(SEQS).forEach(([id, frames]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const img = el.querySelector('.mini-fb-sprite');
    makeFlipper(el, frames.length, (f) => { img.src = src(frames[f]); });
  });

  // Cow — 3 stacked sprites (head, body, tail)
  const cowEl = document.getElementById('nc-fb-cow');
  if (cowEl) {
    const imgs = cowEl.querySelectorAll('.mini-fb-sprite');
    makeFlipper(cowEl, COW_FRAMES.length, (f) => {
      const cf = COW_FRAMES[f];
      imgs[0].src = src(cf.head);
      imgs[1].src = src(cf.body);
      imgs[2].src = src(cf.tail);
    });
  }
})();

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


