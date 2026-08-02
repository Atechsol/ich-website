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
    let offset = 0;

    const step = () => {
        const first = track.firstElementChild;
        if (!first) return 240;
        const gap = parseInt(getComputedStyle(track).gap) || 24;
        return first.offsetWidth + gap;
    };
    const max = () => Math.max(0, track.scrollWidth - track.parentElement.offsetWidth);
    const clamp = v => Math.max(0, Math.min(v, max()));
    const move = delta => {
        offset = clamp(offset + delta * step());
        track.style.transform = `translateX(-${offset}px)`;
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

    window.addEventListener('resize', () => {
        offset = clamp(offset);
        track.style.transform = `translateX(-${offset}px)`;
    });
}

['committee-track', 'branch-track', 'places-track'].forEach(initCarousel);

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
   CONTACT FORM
============================================================ */
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Message Sent <i class="fa-solid fa-check"></i>';
        btn.style.background = '#2d6a4f';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
        }, 3500);
    });
}