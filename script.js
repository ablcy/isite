/* ============================================================
   Yan — Personal Site v2.0.0
   ============================================================ */

const html = document.documentElement;
let lang = localStorage.getItem('lang') || 'zh';

/* ===== Theme ===== */
let theme = localStorage.getItem('theme') || 'light';

function setTheme(t) {
    theme = t;
    localStorage.setItem('theme', t);
    html.setAttribute('data-theme', t);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = t === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
}

(function () {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}';
})();

document.getElementById('themeToggle').addEventListener('click', () =>
    setTheme(theme === 'dark' ? 'light' : 'dark')
);

/* ===== Language ===== */
function setLang(l) {
    lang = l;
    localStorage.setItem('lang', l);
    html.setAttribute('lang', l === 'zh' ? 'zh-CN' : 'en');
    document.querySelectorAll('[data-zh]').forEach(el => {
        el.textContent = el.getAttribute('data-' + l);
    });
    document.getElementById('langToggle').textContent = l === 'zh' ? 'EN' : '\u4E2D';
    if (window.walineInstance) {
        walineInstance.update({ lang: l === 'zh' ? 'zh-CN' : 'en' });
    }
}

document.getElementById('langToggle').addEventListener('click', () =>
    setLang(lang === 'zh' ? 'en' : 'zh')
);
setLang(lang);

/* ===== Hero Entrance ===== */
function animateHero() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.querySelector('.hero-name')?.classList.add('visible');
            document.querySelector('.hero-stats')?.classList.add('visible');
            document.querySelector('.hero-avatar-block')?.classList.add('visible');
        });
    });
}

if (document.readyState === 'complete') {
    animateHero();
} else {
    window.addEventListener('DOMContentLoaded', animateHero);
}

/* ===== Counter Animation ===== */
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count);
            if (isNaN(target)) return;
            let current = 0;
            const duration = 800;
            const start = performance.now();
            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                current = Math.round(progress * target);
                el.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }
            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.4 });
counters.forEach(c => counterObserver.observe(c));

/* ===== Scroll Entrance ===== */
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const section = entry.target;
            /* Animate section label & title */
            section.querySelector('.section-label')?.classList.add('visible');
            section.querySelector('.section-title')?.classList.add('visible');
            /* Animate about paragraphs */
            section.querySelectorAll('.about-text p').forEach((p, i) => {
                setTimeout(() => p.classList.add('visible'), 120 * i);
            });
            /* Animate work items */
            section.querySelectorAll('.work-item').forEach((item, i) => {
                const el = item;
                el.style.opacity = '0';
                el.style.transform = 'translateY(16px)';
                el.style.transition = 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 60 * i);
            });
            /* Animate contact links */
            section.querySelectorAll('.contact-link').forEach((link, i) => {
                const el = link;
                el.style.opacity = '0';
                el.style.transform = 'translateY(10px)';
                el.style.transition = 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 50 * i);
            });
            sectionObserver.unobserve(section);
        }
    });
}, { threshold: 0.06 });

document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

/* ===== Edge Nav Dots ===== */
const edgeDots = document.querySelectorAll('.edge-dot');
const topbarLinks = document.querySelectorAll('.topbar-link');
const allSections = document.querySelectorAll('.hero, .section');

function updateEdgeNav() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let current = 'hero';
    allSections.forEach(sec => {
        const top = sec.offsetTop;
        if (scrollY >= top) current = sec.id;
    });
    edgeDots.forEach(dot => {
        const href = dot.getAttribute('href');
        dot.classList.toggle('active', href === '#' + current);
    });
    topbarLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === '#' + current);
    });
}

/* ===== Topbar Scroll State ===== */
function updateTopbar() {
    const topbar = document.querySelector('.topbar');
    if (topbar) {
        topbar.classList.toggle('scrolled', window.scrollY > 40);
    }
}

function onScroll() {
    updateTopbar();
    updateEdgeNav();
}

window.addEventListener('scroll', onScroll, { passive: true });
/* Initial call */
updateEdgeNav();
updateTopbar();

/* ===== Waline ===== */
let walineLoaded = false;
window.initWaline = function (Waline) {
    window.walineInstance = Waline.init({
        el: '#waline',
        serverURL: 'https://waline.luckyan.dpdns.org',
        lang: lang === 'zh' ? 'zh-CN' : 'en',
        dark: 'html[data-theme="dark"]',
        meta: ['nick', 'mail'],
        requiredMeta: [],
        login: 'disable',
        wordLimit: [0, 500],
        pageSize: 10,
    });
};

const guestbookTrigger = document.getElementById('guestbookTrigger');
if (guestbookTrigger) {
    guestbookTrigger.addEventListener('click', function loadWalineOnce() {
        if (!walineLoaded) {
            walineLoaded = true;
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';
                window.initWaline({ init });
            `;
            document.body.appendChild(script);
            guestbookTrigger.removeEventListener('click', loadWalineOnce);
        }
    });
}

/* ===== Busuanzi ===== */
setTimeout(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    document.body.appendChild(script);
}, 1500);

/* ===== Site Runtime ===== */
(function () {
    const LAUNCH_DATE = new Date('2026-04-16T19:35:00+08:00');

    function formatRuntime() {
        const now = new Date();
        const diff = now - LAUNCH_DATE;
        if (diff < 0) return '0天';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const l = window.__yan_lang || localStorage.getItem('lang') || 'zh';
        if (l === 'en') {
            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        return `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
    }

    const el = document.getElementById('siteRuntime');
    if (el) {
        el.textContent = formatRuntime();
        setInterval(() => {
            el.textContent = formatRuntime();
        }, 1000);
    }

    /* Hook into setLang for runtime format */
    const origSetLang = window.setLang;
    if (typeof origSetLang === 'function') {
        window.setLang = function (l) {
            origSetLang(l);
            window.__yan_lang = l;
        };
    }
})();

/* ===== Collapse Logic ===== */
function setupCollapse(trigger, content, openByDefault) {
    if (!trigger || !content) return;
    content.style.display = openByDefault ? 'block' : 'none';
    trigger.addEventListener('click', () => {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
    });
}

setupCollapse(
    document.getElementById('guestbookTrigger'),
    document.getElementById('guestbookContent'),
    false
);

setupCollapse(
    document.getElementById('changelogTrigger'),
    document.getElementById('changelogContent'),
    false
);

/* ===== WeChat Modal ===== */
(function () {
    const wechatCard = document.getElementById('wechatCard');
    const modal = document.getElementById('wechatModal');
    const closeBtn = document.getElementById('wechatModalClose');
    const bg = document.getElementById('wechatModalBg');
    if (!wechatCard || !modal) return;

    wechatCard.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('active');
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    closeBtn.addEventListener('click', closeModal);
    bg.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
})();
