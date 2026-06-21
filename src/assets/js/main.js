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

if (nav) {
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
}

/* ─── Nav: mobile toggle ────────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navList   = document.getElementById('nav-links');

if (navToggle && navList) {
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
}

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
(function () {
  const showreelBanner    = document.getElementById('showreel-banner');
  const showreelModal     = document.getElementById('showreel-modal');
  if (!showreelBanner || !showreelModal) return;

  const showreelFullFrame = document.getElementById('showreel-full');
  const showreelCloseBtn  = showreelModal.querySelector('.showreel-close');
  const showreelBackdrop  = showreelModal.querySelector('.showreel-backdrop');

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
})();

/* ─── Lightbox ──────────────────────────────────────────────── */
(function () {
  const lightbox   = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg      = lightbox.querySelector('.lb-img');
  const lbTitleEl  = lightbox.querySelector('.lb-title');
  const lbMetaEl   = lightbox.querySelector('.lb-meta');
  const lbCloseBtn = lightbox.querySelector('.lb-close');
  const lbPrevBtn  = lightbox.querySelector('.lb-prev');
  const lbNextBtn  = lightbox.querySelector('.lb-next');
  const lbBackdrop = lightbox.querySelector('.lb-backdrop');
  const items      = document.querySelectorAll('.gallery-item');

  let lbIndex = 0;

  function lbVisible() {
    return [...items].filter(item => item.style.display !== 'none');
  }

  function lbShow(index) {
    const visible = lbVisible();
    lbIndex = (index + visible.length) % visible.length;
    const item  = visible[lbIndex];
    const src   = item.querySelector('img').src;
    const alt   = item.querySelector('img').alt;
    const title = item.querySelector('.item-title').textContent;
    const meta  = item.querySelector('.item-meta').textContent;

    if (lightbox.classList.contains('open')) {
      lbImg.classList.add('lb-switching');
      setTimeout(() => {
        lbImg.src = src; lbImg.alt = alt;
        lbTitleEl.textContent = title; lbMetaEl.textContent = meta;
        lbImg.classList.remove('lb-switching');
      }, 150);
    } else {
      lbImg.src = src; lbImg.alt = alt;
      lbTitleEl.textContent = title; lbMetaEl.textContent = meta;
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

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const visible = lbVisible();
      const idx = visible.indexOf(item);
      if (idx !== -1) lbShow(idx);
    });
  });

  lbCloseBtn.addEventListener('click', lbClose);
  lbBackdrop.addEventListener('click', lbClose);
  lbPrevBtn.addEventListener('click',  () => lbShow(lbIndex - 1));
  lbNextBtn.addEventListener('click',  () => lbShow(lbIndex + 1));
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     lbClose();
    if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });
})();

/* ─── Music video banner ────────────────────────────────────── */
(function () {
  const mvBanner = document.getElementById('mv-banner');
  const mvModal  = document.getElementById('mv-modal');
  if (!mvBanner || !mvModal) return;

  const mvFullFrame = document.getElementById('mv-full');
  const mvCloseBtn  = mvModal.querySelector('.showreel-close');
  const mvBackdrop  = mvModal.querySelector('.showreel-backdrop');

  const MV_SRC = 'https://www.youtube.com/embed/qZbKqWqK9gc?autoplay=1&rel=0';

  function openMv() {
    mvFullFrame.src = MV_SRC;
    mvModal.classList.add('open');
    mvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mvCloseBtn.focus();
  }
  function closeMv() {
    mvModal.classList.remove('open');
    mvModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mvFullFrame.src = '';
  }

  mvBanner.addEventListener('click', openMv);
  mvBanner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMv(); }
  });
  mvCloseBtn.addEventListener('click', closeMv);
  mvBackdrop.addEventListener('click', closeMv);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mvModal.classList.contains('open')) closeMv();
  });
})();

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

  const COW_FRONT_FRAMES = [
    { head: 'cow_head_front_normal', body: 'cow_body_front_normal', tail: 'cow_tail_front_normal' },
    { head: 'cow_head_front_nec_01', body: 'cow_body_front_nec_01', tail: 'cow_tail_front_nec_01' },
    { head: 'cow_head_front_nec_02', body: 'cow_body_front_nec_02', tail: 'cow_tail_front_nec_02' },
    { head: 'cow_head_front_nec_3',  body: 'cow_body_front_nec_03', tail: 'cow_tail_front_nec_03' },
    { head: 'cow_head_front_nec_04', body: 'cow_body_front_nec_04', tail: 'cow_tail_front_nec_04' },
    { head: 'cow_head_front_nec_05', body: 'cow_body_front_nec_05', tail: 'cow_tail_front_nec_05' },
    { head: 'cow_head_front_nec_06', body: 'cow_body_front_nec_06', tail: 'cow_tail_front_nec_06' },
  ];

  const COW_BACK_FRAMES = [
    { head: 'cow_head_back_normal', body: 'cow_body_back_normal', tail: 'cow_tail_back_normal' },
    { head: 'cow_head_back_nec_01', body: 'cow_body_back_nec_01', tail: 'cow_tail_back_nec_01' },
    { head: 'cow_head_back_nec_02', body: 'cow_body_back_nec_02', tail: 'cow_tail_back_nec_02' },
    { head: 'cow_head_back_nec_03', body: 'cow_body_back_nec_03', tail: 'cow_tail_back_nec_03' },
    { head: 'cow_head_back_nec_04', body: 'cow_body_back_nec_04', tail: 'cow_tail_back_nec_04' },
    { head: 'cow_head_back_nec_05', body: 'cow_body_back_nec_05', tail: 'cow_tail_back_nec_05' },
    { head: 'cow_head_back_nec_06', body: 'cow_body_back_nec_06', tail: 'cow_tail_back_nec_06' },
  ];

  const SEQS = {
    'nc-fb-ufo':  ['ufo_00','ufo_01','ufo_02','ufo_03','ufo_04','ufo_05','ufo_06','ufo_07','ufo_08','ufo_09','ufo_10'],
    'nc-fb-beam': ['ufo_beam_outline_01','ufo_beam_outline_02','ufo_beam_outline_03','ufo_beam_outline_04','ufo_beam_fill_01'],
    'nc-fb-puff': ['ufo_cow_disappear_puff_01','ufo_cow_disappear_puff_02','ufo_cow_disappear_puff_03','ufo_cow_disappear_puff_04','ufo_cow_disappear_puff_05','ufo_cow_disappear_puff_06'],
  };

  function makeFlipper(el, totalFrames, onTick) {
    let frame = 0;
    setInterval(() => {
      frame = (frame + 1) % totalFrames;
      onTick(frame);
    }, 160);
  }

  // UFO, Beam, Puff — single sprite
  Object.entries(SEQS).forEach(([id, frames]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const img = el.querySelector('.mini-fb-sprite');
    makeFlipper(el, frames.length, (f) => { img.src = src(frames[f]); });
  });

  // Cow front — 3 stacked sprites (head, body, tail)
  const cowFrontEl = document.getElementById('nc-fb-cow-front');
  if (cowFrontEl) {
    const imgs = cowFrontEl.querySelectorAll('.mini-fb-sprite');
    makeFlipper(cowFrontEl, COW_FRONT_FRAMES.length, (f) => {
      const cf = COW_FRONT_FRAMES[f];
      imgs[0].src = src(cf.head);
      imgs[1].src = src(cf.body);
      imgs[2].src = src(cf.tail);
    });
  }

  // Cow back — 3 stacked sprites (head, body, tail)
  const cowBackEl = document.getElementById('nc-fb-cow-back');
  if (cowBackEl) {
    const imgs = cowBackEl.querySelectorAll('.mini-fb-sprite');
    makeFlipper(cowBackEl, COW_BACK_FRAMES.length, (f) => {
      const cf = COW_BACK_FRAMES[f];
      imgs[0].src = src(cf.head);
      imgs[1].src = src(cf.body);
      imgs[2].src = src(cf.tail);
    });
  }
})();

/* ─── ShrimpAway mini-flipbooks ─────────────────────────────── */
(function () {
  const FRAMES = [
    '/assets/images/game jam assets/shrimpaway/crab_flip_01.png',
    '/assets/images/game jam assets/shrimpaway/crab_flip_02.png',
    '/assets/images/game jam assets/shrimpaway/crab_flip_03.png',
    '/assets/images/game jam assets/shrimpaway/crab_flip_04.png',
  ];
  const el = document.getElementById('sa-fb-crab-anim');
  if (!el) return;
  const img = el.querySelector('.mini-fb-sprite');
  let frame = 0;
  setInterval(() => {
    frame = (frame + 1) % FRAMES.length;
    img.src = FRAMES[frame];
  }, 160);
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

/* ─── Culture Gaming Page ────────────────────────────────────── */
(function () {
  const culturePage = document.getElementById('culture-page');
  if (!culturePage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Hero parallax ─────────────────────────────────────────── */
  const heroInner = document.getElementById('cn-hero-inner');
  if (heroInner && !reducedMotion) {
    document.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      heroInner.style.transform =
        `perspective(800px) rotateX(${cy * -2.2}deg) rotateY(${cx * 2.2}deg)`;
    });
  }

  /* ── Mechanics 3D card tilt ────────────────────────────────── */
  function initCardTilt(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      const rx =  cy * -14;
      const ry =  cx *  14;
      card.style.transform =
        `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(14px)`;
      card.style.setProperty('--tilt-cx', cx);
      card.style.setProperty('--tilt-cy', cy);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--tilt-cx');
      card.style.removeProperty('--tilt-cy');
    });
  }

  /* ── Mechanics filter ──────────────────────────────────────── */
  const mechGrid    = document.getElementById('mech-grid');
  const filterBtns  = document.querySelectorAll('.mech-filter-btn');
  const mechCards   = mechGrid ? [...mechGrid.querySelectorAll('.mech-card')] : [];

  if (!reducedMotion) mechCards.forEach(initCardTilt);

  function filterMechs(cat) {
    if (!mechGrid) return;
    mechGrid.classList.add('mech-filtering');
    setTimeout(() => {
      mechCards.forEach((card) => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
      });
      mechGrid.classList.remove('mech-filtering');
    }, 200);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      filterMechs(btn.dataset.cat);
    });
  });

  /* ── Mechanics detail panel ────────────────────────────────── */
  const mechDetail   = document.getElementById('mech-detail');
  const mechBackdrop = document.getElementById('mech-detail-backdrop');
  const mechClose    = document.getElementById('mech-detail-close');

  if (!mechDetail || !mechBackdrop || !mechClose) return;

  const mdCat   = document.getElementById('md-cat');
  const mdTitle = document.getElementById('md-title');
  const mdDesc  = document.getElementById('md-desc');
  const mdWhy   = document.getElementById('md-why');
  const mdGames = document.getElementById('md-games');
  const mdLink  = document.getElementById('md-link');

  let lastFocused = null;

  function openDetail(card) {
    lastFocused = card;
    mdCat.textContent   = card.dataset.cat;
    mdTitle.textContent = card.dataset.title;
    mdDesc.textContent  = card.dataset.summary;
    mdWhy.textContent   = card.dataset.why;

    mdGames.innerHTML = '';
    (card.dataset.games || '').split(',').filter(Boolean).forEach((g) => {
      const tag = document.createElement('span');
      tag.className   = 'mech-detail-game-tag';
      tag.textContent = g.trim();
      mdGames.appendChild(tag);
    });

    const seeUrl = card.dataset.see || '';
    if (seeUrl) {
      mdLink.href = seeUrl;
      mdLink.querySelector('#md-link-label').textContent = 'Watch / Play';
      mdLink.style.display = '';
    } else {
      mdLink.style.display = 'none';
    }

    mechDetail.classList.add('open');
    mechBackdrop.classList.add('open');
    mechDetail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mechClose.focus();
  }

  function closeDetail() {
    mechDetail.classList.remove('open');
    mechBackdrop.classList.remove('open');
    mechDetail.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  mechCards.forEach((card) => {
    card.addEventListener('click', () => openDetail(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(card); }
    });
  });

  mechClose.addEventListener('click', closeDetail);
  mechBackdrop.addEventListener('click', closeDetail);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mechDetail.classList.contains('open')) closeDetail();
  });

  /* Focus trap inside detail panel */
  mechDetail.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...mechDetail.querySelectorAll(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    )].filter((el) => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  /* ── Steam news strips for indie cards ────────────────────── */
  const indieSection = document.getElementById('cn-indie');
  if (indieSection) {
    indieSection.querySelectorAll('.cn-game-card[data-steamid]').forEach(async (card) => {
      const appId = card.dataset.steamid;
      const newsEl = card.querySelector('.cn-game-news');
      if (!appId || !newsEl) return;
      try {
        const res = await fetch(
          `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=1&maxlength=100&format=json`
        );
        const json = await res.json();
        const item = json?.appnews?.newsitems?.[0];
        if (!item) return;

        const tag = document.createElement('span');
        tag.className = 'cn-game-news-tag';
        tag.textContent = 'Steam';

        const title = document.createElement('span');
        title.className = 'cn-game-news-title';
        title.textContent = item.title;

        const date = document.createElement('span');
        date.className = 'cn-game-news-date';
        date.textContent = new Date(item.date * 1000)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        newsEl.append(tag, title, date);

        const newsUrl = item.url;
        newsEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(newsUrl, '_blank', 'noopener,noreferrer');
        });
      } catch {
        /* Steam news is an enhancement — silent fail is fine */
      }
    });
  }
})();


