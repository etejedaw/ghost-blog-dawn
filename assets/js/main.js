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
    if (typeof pagination === 'function') pagination(false);
})();
