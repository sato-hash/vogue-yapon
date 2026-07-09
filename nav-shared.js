/* ═══════════════════════════════════════════════════
   SHARED NAV — Votre Japon sur Mesure
   Include this script in every page.
   It injects the unified masthead and footer.
   ═══════════════════════════════════════════════════ */
(function () {
  /* ── Detect current page ── */
  const path = location.pathname.split('/').pop() || 'index';
  const isTop     = path === 'vogue-japon-toppage.html' || path === '' || path === 'index.html';
  const isFour    = path === 'four-seasons-journey.html';
  const isPlan    = path === 'planification-form.html';
  const isCon     = path === 'concierge-payment.html';
  const isVoyager = path === 'voyager-au-japon.html';
  const isTaiken  = path === 'taiken-japon.html';
  const isActu    = path === 'actualites-japon.html';
  const isCulture = path === 'culture-japon.html';
  const isExp     = path === 'ma-experience-japon.html';

  /* ── Inject shared CSS variables & reset nav colours ── */
  const style = document.createElement('style');
  style.textContent = `
    .snav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 500;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 3rem; height: 58px;
      background: rgba(248,246,241,0.96);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(0,0,0,0.07);
      transition: background 0.4s, box-shadow 0.4s;
      font-family: 'Jost', sans-serif;
    }
    .snav.dark-mode {
      background: rgba(13,22,38,0.96);
      border-bottom-color: rgba(255,255,255,0.07);
    }
    .snav-logo {
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 1.1rem; font-weight: 400;
      color: var(--noir, #0c0c0c);
      text-decoration: none; white-space: nowrap;
    }
    .snav.dark-mode .snav-logo { color: #fff; }
    .snav-logo em { font-style: italic; color: var(--gold, #a8834a); }

    .snav-links {
      display: flex; gap: 0; list-style: none;
      position: absolute; left: 50%; transform: translateX(-50%);
      top: 0; height: 58px; align-items: center;
    }
    .snav-links a {
      display: flex; align-items: center; padding: 0 0.9rem;
      height: 58px;
      font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--charcoal, #2a2a2a); text-decoration: none;
      transition: color 0.2s; position: relative; font-weight: 500;
      white-space: nowrap;
    }
    .snav.dark-mode .snav-links a { color: rgba(255,255,255,0.85); }
    .snav-links a::after {
      content: ''; position: absolute;
      bottom: 0; left: 1rem; right: 1rem; height: 2px;
      background: var(--gold, #a8834a);
      transform: scaleX(0); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
      transform-origin: left;
    }
    .snav-links a:hover,
    .snav-links a.active { color: var(--gold, #a8834a); }
    .snav-links a:hover::after,
    .snav-links a.active::after { transform: scaleX(1); }

    .snav-right { display: flex; align-items: center; gap: 1.4rem; }
    .snav-lang {
      display: flex; gap: 0.3rem; align-items: center;
      font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase;
    }
    .snav-lang a {
      color: var(--silver, #c0bbb1); text-decoration: none; transition: color 0.2s;
      padding: 0.2rem 0.3rem;
    }
    .snav-lang a.active, .snav-lang a:hover { color: var(--gold, #a8834a); }
    .snav-lang-sep { color: rgba(0,0,0,0.15); font-size: 0.65rem; }
    .snav.dark-mode .snav-lang-sep { color: rgba(255,255,255,0.15); }
    .snav-cta {
      padding: 0.55rem 1.4rem;
      background: var(--gold, #a8834a); color: #fff; border: none;
      font-family: 'Jost', sans-serif; font-size: 0.6rem;
      font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
      cursor: pointer; text-decoration: none;
      transition: background 0.2s, transform 0.2s;
      display: inline-block;
    }
    .snav-cta:hover { background: #c9a96e; transform: translateY(-1px); }

    /* Mobile hamburger */
    .snav-burger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 4px;
    }
    .snav-burger span {
      width: 22px; height: 1.5px;
      background: var(--ash, #6e6e6e); display: block;
      transition: all 0.3s;
    }
    .snav.dark-mode .snav-burger span { background: rgba(255,255,255,0.6); }
    .snav-mobile-menu {
      display: none; position: fixed; top: 58px; left: 0; right: 0;
      background: rgba(248,246,241,0.98); backdrop-filter: blur(20px);
      padding: 1.5rem 2rem; z-index: 499;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      flex-direction: column; gap: 0;
    }
    .snav-mobile-menu.open { display: flex; }
    .snav-mobile-menu a {
      font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--ash, #6e6e6e); text-decoration: none;
      padding: 1rem 0; border-bottom: 1px solid rgba(0,0,0,0.06);
      transition: color 0.2s;
    }
    .snav-mobile-menu a:last-child { border-bottom: none; }
    .snav-mobile-menu a:hover,
    .snav-mobile-menu a.active { color: var(--gold, #a8834a); }

    @media (max-width: 900px) {
      .snav-links { display: none; }
      .snav-burger { display: flex; }
      .snav-lang { display: none; }
    }
    @media (max-width: 600px) {
      .snav { padding: 0 1.5rem; }
      .snav-cta { display: none; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build nav HTML ── */
  const nav = document.createElement('header');
  nav.className = 'snav' + (isTop ? ' dark-mode' : '');
  nav.id = 'siteNav';
  nav.innerHTML = `
    <a href="vogue-japon-toppage.html" class="snav-logo"><em>Votre</em> Japon sur Mesure</a>

    <ul class="snav-links">
      <li><a href="four-seasons-journey.html" ${isFour?'class="active"':''}>4 Saisons</a></li>
      <li><a href="planification-form.html" ${isPlan?'class="active"':''}>Planifier</a></li>
      <li><a href="concierge-payment.html" ${isCon?'class="active"':''}>Concierge</a></li>
      <li><a href="actualites-japon.html" ${isActu?'class="active"':''}>Actualités</a></li>
      <li><a href="taiken-japon.html" ${isTaiken?'class="active"':''}>Expériences</a></li>
      <li><a href="ma-experience-japon.html" ${isExp?'class="active"':''}>Mon Voyage</a></li>
    </ul>

    <div class="snav-right">
      <div class="snav-lang">
        <a href="#" class="active">FR</a>
        <span class="snav-lang-sep">|</span>
        <a href="#">JP</a>
      </div>
      <a href="planification-form.html" class="snav-cta">Planifier →</a>
      <button class="snav-burger" id="snavBurger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  /* Mobile menu */
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'snav-mobile-menu';
  mobileMenu.id = 'snavMobile';
  mobileMenu.innerHTML = `
    <a href="vogue-japon-toppage.html" ${isTop?'class="active"':''}>🏠 Accueil</a>
    <a href="four-seasons-journey.html" ${isFour?'class="active"':''}>🌸 4 Saisons</a>
    <a href="planification-form.html" ${isPlan?'class="active"':''}>✦ Planifier mon voyage</a>
    <a href="concierge-payment.html" ${isCon?'class="active"':''}>⊛ Concierge & Tarifs</a>
    <a href="actualites-japon.html" ${isActu?'class="active"':''}>📰 Actualités Japon</a>
    <a href="taiken-japon.html" ${isTaiken?'class="active"':''}>🍵 Expériences</a>
    <a href="ma-experience-japon.html" ${isExp?'class="active"':''}>📸 Mon Voyage</a>
    <a href="mailto:info@progic.jp">✉ info@progic.jp</a>
  `;

  /* Insert before body content */
  document.body.insertBefore(mobileMenu, document.body.firstChild);
  document.body.insertBefore(nav, mobileMenu);

  /* Burger toggle */
  document.getElementById('snavBurger').addEventListener('click', function () {
    document.getElementById('snavMobile').classList.toggle('open');
  });

  /* Scroll behaviour — transparent→solid on top page */
  if (isTop) {
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      const n = document.getElementById('siteNav');
      if (y > 80) {
        n.style.background = 'rgba(13,22,38,0.97)';
        n.style.boxShadow  = '0 2px 20px rgba(0,0,0,0.3)';
      } else {
        n.style.background = 'transparent';
        n.style.boxShadow  = 'none';
        n.style.borderBottom = 'none';
      }
    });
    /* Start transparent on top page */
    const n = document.getElementById('siteNav');
    n.style.background   = 'transparent';
    n.style.borderBottom = 'none';
  }

})();
