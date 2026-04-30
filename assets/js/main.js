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

        toggle.addEventListener('click', function () {
            var goingDark = !isDark();
            html.classList.add('theme-transition');
            html.classList.remove('theme-light', 'theme-dark');
            html.classList.add(goingDark ? 'theme-dark' : 'theme-light');
            try {
                sessionStorage.setItem('theme', goingDark ? 'dark' : 'light');
            } catch (e) {}
            setTimeout(function () {
                html.classList.remove('theme-transition');
            }, 300);
        });
    }

    featured();
    themeToggle();
    if (typeof pagination === 'function') pagination(false);
})();
