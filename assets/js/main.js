$(function () {
    'use strict';
    featured();
    pagination(false);
});

(function () {
    'use strict';
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
        setTimeout(function () {
            html.classList.remove('theme-transition');
        }, 300);
    });
})();

function featured() {
    'use strict';
    $('.featured-feed').owlCarousel({
        dots: false,
        margin: 30,
        nav: true,
        navText: [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="icon"><path d="M20.547 22.107L14.44 16l6.107-6.12L18.667 8l-8 8 8 8 1.88-1.893z"></path></svg>',
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="icon"><path d="M11.453 22.107L17.56 16l-6.107-6.12L13.333 8l8 8-8 8-1.88-1.893z"></path></svg>',
        ],
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 2,
            },
            992: {
                items: 3,
            },
        },
    });
}
