/* ============================================================
   PAGE LOADER — hidden once every resource (images, fonts, etc.)
   has actually finished loading, not just on DOM-ready. Capped with
   a fallback timeout so a single slow asset can't strand it forever.
============================================================ */
const pageLoader = document.getElementById('pageLoader');
if (pageLoader) {
    const hideLoader = () => pageLoader.classList.add('is-hidden');
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 4000);
}

/* ============================================================
   NAVBAR — scroll shadow + burger toggle
============================================================ */
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');

if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
}

if (burger && navMobile) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        navMobile.classList.toggle('open');
    });

    navMobile.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
            burger.classList.remove('open');
            navMobile.classList.remove('open');
        })
    );

    document.addEventListener('click', (e) => {
        if (!navMobile.classList.contains('open')) return;
        if (nav.contains(e.target)) return;
        burger.classList.remove('open');
        navMobile.classList.remove('open');
    });
}

/* ============================================================
   ACTIVE NAV LINK — based on current page filename
============================================================ */
(function setActiveNavLink() {
    let path = window.location.pathname.split('/').pop();
    if (path === '') path = 'index.html';

    document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === path) a.classList.add('active');
    });
})();

/* ============================================================
   SMOOTH SCROLL — for same-page anchor links only
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    });
});

/* ============================================================
   REVEAL ON SCROLL
============================================================ */
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('visible'), i * 55);
        revealObs.unobserve(entry.target);
    });
}, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ============================================================
   HERO STAT COUNTER (home page only)
============================================================ */
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = +el.dataset.target;
        const dur = 1600;
        let t0 = null;
        (function step(ts) {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / dur, 1);
            el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * end);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = end + '+';
        })(performance.now());
        counterObs.unobserve(el);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.hero__stat-n[data-target]').forEach(el => counterObs.observe(el));

/* ============================================================
   CAROUSEL — used on about (committee), branches, places
============================================================ */
function initCarousel(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    let index = 0;

    // Cards have variable widths (text-driven), so we snap to each card's own
    // offsetLeft rather than assuming a fixed step — a constant step drifts
    // out of alignment after a few clicks once card widths differ.
    const max = () => Math.max(0, track.scrollWidth - track.parentElement.offsetWidth);
    const applyOffset = () => {
        const cards = track.children;
        index = Math.max(0, Math.min(index, cards.length - 1));
        const target = cards[index];
        const offset = target ? Math.min(target.offsetLeft, max()) : 0;
        track.style.transform = `translateX(-${offset}px)`;
    };
    const move = delta => {
        index += delta;
        applyOffset();
    };

    document.querySelectorAll(`[data-track="${trackId}"]`).forEach(btn => {
        btn.addEventListener('click', () => move(+btn.dataset.dir));
    });

    let x0 = 0;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const dx = x0 - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 44) move(dx > 0 ? 1 : -1);
    });

    window.addEventListener('resize', applyOffset, { passive: true });
    applyOffset();
}

['committee-track', 'places-track'].forEach(initCarousel);

/* ============================================================
   MENU TABS (menu page)
============================================================ */
document.querySelectorAll('.menu__btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.menu__btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.menu__panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(btn.dataset.target);
        if (!panel) return;
        panel.classList.add('active');
        panel.querySelectorAll('.menu__item').forEach((el, i) => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), i * 25);
        });
    });
});

/* ============================================================
   BRANCH TABS (branches page)
============================================================ */
document.querySelectorAll('.branch__tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.branch__tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.branch__panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(tab.dataset.target);
        if (panel) panel.classList.add('active');
    });
});

/* ============================================================
   REVEAL-A-NUMBER BUTTONS (rooms & bookings page)
============================================================ */
document.querySelectorAll('.reveal-call').forEach(btn => {
    btn.addEventListener('click', () => {
        const number = btn.dataset.number;
        if (!number || btn.classList.contains('revealed')) return;
        btn.classList.add('revealed');
        btn.innerHTML = `<i class="fa-solid fa-phone"></i> ${number}`;
        btn.setAttribute('href', `tel:${number.replace(/\s+/g, '')}`);
    });
});

/* ============================================================
   HERO SCROLL-DRIVEN ANIMATION (home page only)
   Desktop + motion-safe: pins the hero for 200vh of scroll and drives
   --hero-progress / --hero-reveal custom properties read by style.css.
   Mobile (<861px) and prefers-reduced-motion: listener never attaches;
   style.css alone forces the static two-column layout in both cases.
============================================================ */
const hero = document.getElementById('home');

if (hero) {
    const heroContentEl = hero.querySelector('.hero__content');
    const heroLeftEl = hero.querySelector('.hero__left');
    const desktopMq = window.matchMedia('(min-width: 861px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Cached once on load/resize — never read inside the scroll handler.
    let heroTop = 0;
    let scrollRange = 0;
    let ticking = false;

    function measure() {
        const rect = hero.getBoundingClientRect();
        heroTop = rect.top + window.scrollY;
        scrollRange = Math.max(1, hero.offsetHeight - window.innerHeight);

        // How far --hero-left needs to shift right (from its resting left-edge
        // position) to look centered over the full content width at scroll
        // start. Measured once here, never inside the scroll/rAF loop.
        if (heroContentEl && heroLeftEl) {
            const centerOffset = Math.max(0, (heroContentEl.clientWidth - heroLeftEl.offsetWidth) / 2);
            hero.style.setProperty('--hero-center-offset', centerOffset + 'px');
        }
    }

    // Runs inside rAF: only WRITES custom properties, no layout reads.
    function applyProgress() {
        const progress = Math.min(Math.max((window.scrollY - heroTop) / scrollRange, 0), 1);

        // 3-card crossfade with a hold in between each transition, so cards
        // don't fade the instant they finish sliding in — quick crossfade,
        // long hold, quick crossfade, long hold to the end. The text column
        // shares card 1's entrance window (t0 -> t1) so it finishes settling
        // into its left-aligned resting spot exactly as card 1 finishes
        // sliding in — only then does the animation move on to card 2.
        const clamp01 = v => Math.min(Math.max(v, 0), 1);
        const t0 = 0, t1 = 0.18, t2 = 0.68, t3 = 0.95;
        const rise1 = clamp01((progress - t0) / (t1 - t0));
        hero.style.setProperty('--hero-progress', progress);
        hero.style.setProperty('--hero-reveal', rise1);

        const fall1 = clamp01((t3 - progress) / (t3 - t2));
        const c0 = clamp01((t1 - progress) / (t1 - t0));
        const c1 = Math.min(rise1, fall1);
        const c2 = clamp01((progress - t2) / (t3 - t2));
        hero.style.setProperty('--card0-opacity', c0);
        hero.style.setProperty('--card1-opacity', c1);
        hero.style.setProperty('--card2-opacity', c2);
        hero.style.setProperty('--card1-y', (70 * (1 - rise1)).toFixed(2));
        hero.style.setProperty('--card2-y', (70 * (1 - c2)).toFixed(2));

        ticking = false;
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(applyProgress);
    }

    function onResize() {
        if (desktopMq.matches && !motionMq.matches) measure();
    }

    function syncMode() {
        const active = desktopMq.matches && !motionMq.matches;
        hero.classList.toggle('hero--static', !active);

        if (active) {
            measure();
            window.addEventListener('scroll', onScroll, { passive: true });
            applyProgress();
        } else {
            window.removeEventListener('scroll', onScroll);
            ticking = false;
            hero.style.removeProperty('--hero-progress');
            hero.style.removeProperty('--hero-reveal');
            hero.style.removeProperty('--card0-opacity');
            hero.style.removeProperty('--card1-opacity');
            hero.style.removeProperty('--card2-opacity');
            hero.style.removeProperty('--card1-y');
            hero.style.removeProperty('--card2-y');
        }
    }

    syncMode();
    desktopMq.addEventListener('change', syncMode);
    motionMq.addEventListener('change', syncMode);
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize);

    // Web font swap can change hero__title's measured width after first paint —
    // re-measure once (not a scroll-loop read) so the center offset stays accurate.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(onResize);
    }

}
