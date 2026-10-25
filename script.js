/* ============================================================
   PAGE LOADER — hidden once every resource (images, fonts, etc.)
   has actually finished loading, not just on DOM-ready. Capped with
   a fallback timeout so a single slow asset can't strand it forever.
============================================================ */
const pageLoader = document.getElementById('pageLoader');
if (pageLoader) {
    const hideLoader = () => pageLoader.classList.add('is-hidden');
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 2000);
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
   HERO HOVER MASK (home page only)
   A sharp photo is revealed through a feathered mask that eases
   after the pointer over a muted base photo. Fine pointers: follows the
   cursor and grows on enter / shrinks on leave. Touch: the mask drifts
   on its own. prefers-reduced-motion: style.css hides the reveal layer
   and this block never attaches.
============================================================ */
const hero = document.getElementById('home');

if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const lerp = (a, b, t) => a + (b - a) * t;

    let maskSize = 0;
    let tx = 0, ty = 0, x = 0, y = 0, r = 0, tr = 0;
    let running = false;
    let visible = true;
    let drift = !finePointer;

    function measure() {
        const rect = hero.getBoundingClientRect();
        maskSize = Math.max(130, Math.min(rect.width, rect.height) * 0.34);
        if (drift) tr = maskSize * 0.9;
    }

    function paint() {
        hero.style.setProperty('--mx', x.toFixed(1) + 'px');
        hero.style.setProperty('--my', y.toFixed(1) + 'px');
        hero.style.setProperty('--mask-r', r.toFixed(1) + 'px');
    }

    function frame(now) {
        if (drift) {
            const t = now / 1000;
            const rect = hero.getBoundingClientRect();
            tx = rect.width * (0.5 + 0.28 * Math.sin(t * 0.45));
            ty = rect.height * (0.45 + 0.22 * Math.sin(t * 0.62 + 1.2));
        }
        x = lerp(x, tx, 0.14);
        y = lerp(y, ty, 0.14);
        r = lerp(r, tr, 0.12);
        paint();

        const settled = !drift && Math.abs(x - tx) < 0.2 && Math.abs(y - ty) < 0.2 && Math.abs(r - tr) < 0.2;
        if (settled || !visible) {
            running = false;
            return;
        }
        requestAnimationFrame(frame);
    }

    function kick() {
        if (running || !visible) return;
        running = true;
        requestAnimationFrame(frame);
    }

    if (finePointer) {
        hero.addEventListener('pointermove', e => {
            const rect = hero.getBoundingClientRect();
            tx = e.clientX - rect.left;
            ty = e.clientY - rect.top;
            if (r < 1) { x = tx; y = ty; }
            tr = maskSize;
            kick();
        }, { passive: true });

        hero.addEventListener('pointerleave', () => {
            tr = 0;
            kick();
        });
    }

    measure();
    window.addEventListener('resize', () => { measure(); kick(); }, { passive: true });

    // Pause the loop while the hero is scrolled out of view.
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
    }).observe(hero);

    if (drift) {
        x = tx = hero.clientWidth / 2;
        y = ty = hero.clientHeight / 2;
        kick();
    }
}

