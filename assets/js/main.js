(function () {
    'use strict';

    function featured() {
        var track = document.querySelector('.featured-feed');
        if (!track) return;

        var prev = document.querySelector('.featured-nav-prev');
        var next = document.querySelector('.featured-nav-next');

        function scrollByCard(direction) {
            var firstCard = track.querySelector('article');
            if (!firstCard) return;
            var gap = parseFloat(getComputedStyle(track).columnGap || '0') || 30;
            var amount = firstCard.getBoundingClientRect().width + gap;
            track.scrollBy({left: direction * amount, behavior: 'smooth'});
        }

        function updateNavState() {
            if (!prev || !next) return;
            var maxScroll = track.scrollWidth - track.clientWidth;
            prev.toggleAttribute('disabled', track.scrollLeft <= 1);
            next.toggleAttribute('disabled', track.scrollLeft >= maxScroll - 1);
        }

        if (prev) prev.addEventListener('click', function () { scrollByCard(-1); });
        if (next) next.addEventListener('click', function () { scrollByCard(1); });
        track.addEventListener('scroll', updateNavState, {passive: true});
        window.addEventListener('resize', updateNavState);
        updateNavState();
    }

    function themeToggle() {
        var toggle = document.querySelector('.gh-theme-toggle');
        if (!toggle) return;
        var html = document.documentElement;

        function isDark() {
            if (html.classList.contains('theme-dark')) return true;
            if (html.classList.contains('theme-light')) return false;
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        function syncAria() {
            var dark = isDark();
            toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
            toggle.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
        }

        toggle.addEventListener('click', function () {
            var goingDark = !isDark();
            html.classList.add('theme-transition');
            html.classList.remove('theme-light', 'theme-dark');
            html.classList.add(goingDark ? 'theme-dark' : 'theme-light');
            try {
                sessionStorage.setItem('theme', goingDark ? 'dark' : 'light');
            } catch (e) {}
            syncAria();
            setTimeout(function () {
                html.classList.remove('theme-transition');
            }, 300);
        });

        syncAria();
    }

    function burgerAria() {
        var burger = document.querySelector('.gh-burger');
        if (!burger) return;
        burger.addEventListener('click', function () {
            var open = document.body.classList.contains('is-head-open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function tableOfContents() {
        var toc = document.querySelector('[data-post-toc]');
        if (!toc) return;
        var content = document.querySelector('.gh-content');
        if (!content) {
            toc.style.display = 'none';
            return;
        }
        var headings = content.querySelectorAll('h2, h3');
        if (headings.length < 2) {
            toc.style.display = 'none';
            return;
        }
        var list = toc.querySelector('.post-toc-list');

        function slugify(s) {
            return s.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
        }

        Array.prototype.forEach.call(headings, function (h) {
            if (!h.id) h.id = slugify(h.textContent);
            var li = document.createElement('li');
            li.className = 'post-toc-item post-toc-' + h.tagName.toLowerCase();
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            list.appendChild(li);
        });
    }

    function readingProgress() {
        var bar = document.querySelector('[data-reading-progress]');
        var content = document.querySelector('.gh-content');
        if (!bar || !content) return;

        var ticking = false;

        function update() {
            var rect = content.getBoundingClientRect();
            var viewportH = window.innerHeight;
            var total = rect.height - viewportH;
            var scrolled = -rect.top;
            var progress = total > 0 ? (scrolled / total) * 100 : 0;
            progress = Math.max(0, Math.min(100, progress));
            bar.style.width = progress + '%';
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, {passive: true});
        window.addEventListener('resize', onScroll, {passive: true});
        update();
    }

    function shareSetup() {
        var shareBtn = document.querySelector('.gh-button-share');
        if (!shareBtn) return;

        var isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (!isTouch || !navigator.share) return;

        document.body.classList.add('is-native-share');

        shareBtn.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.share({
                title: document.title,
                url: location.href
            }).catch(function () {});
        });
    }

    featured();
    themeToggle();
    burgerAria();
    shareSetup();
    tableOfContents();
    readingProgress();
    if (typeof pagination === 'function') pagination(false);
})();
