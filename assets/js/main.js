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

    function seriesShuffle() {
        var section = document.querySelector('[data-series]');
        if (!section) return;

        var items = Array.prototype.slice.call(section.querySelectorAll('[data-series-item]'));
        if (items.length < 3) {
            section.style.display = 'none';
            return;
        }

        for (var i = items.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = items[i];
            items[i] = items[j];
            items[j] = tmp;
        }

        items.slice(0, 3).forEach(function (item) {
            item.classList.add('is-visible');
        });
    }

    function codeCopy() {
        if (!navigator.clipboard) return;

        var blocks = document.querySelectorAll('.gh-content pre');
        if (!blocks.length) return;

        var clipboardSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>';
        var checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

        Array.prototype.forEach.call(blocks, function (pre) {
            if (pre.parentElement && pre.parentElement.classList.contains('code-wrapper')) return;

            var wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-copy-btn';
            btn.setAttribute('aria-label', 'Copiar código');
            btn.setAttribute('title', 'Copiar código');
            btn.innerHTML = clipboardSvg;
            wrapper.appendChild(btn);

            btn.addEventListener('click', function () {
                navigator.clipboard.writeText(pre.innerText).then(function () {
                    btn.innerHTML = checkSvg;
                    btn.classList.add('is-copied');
                    setTimeout(function () {
                        btn.innerHTML = clipboardSvg;
                        btn.classList.remove('is-copied');
                    }, 2000);
                }).catch(function () {});
            });
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

        var linkMap = {};

        Array.prototype.forEach.call(headings, function (h) {
            if (!h.id) h.id = slugify(h.textContent);
            var li = document.createElement('li');
            li.className = 'post-toc-item post-toc-' + h.tagName.toLowerCase();
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            list.appendChild(li);
            linkMap[h.id] = li;
        });

        if (window.matchMedia('(min-width: 1400px)').matches) {
            toc.open = true;
        }

        if (!('IntersectionObserver' in window)) return;

        var visible = new Set();
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            var activeId = null;
            Array.prototype.forEach.call(headings, function (h) {
                if (visible.has(h.id)) activeId = h.id;
            });

            Object.keys(linkMap).forEach(function (id) {
                linkMap[id].classList.toggle('is-active', id === activeId);
            });
        }, {
            rootMargin: '-80px 0px -70% 0px',
            threshold: 0
        });

        Array.prototype.forEach.call(headings, function (h) {
            observer.observe(h);
        });
    }

    function readingProgress() {
        var bar = document.querySelector('[data-reading-progress]');
        var content = document.querySelector('.gh-content');
        if (!bar || !content) return;

        var toc = document.querySelector('[data-post-toc]');
        var ticking = false;

        function update() {
            var rect = content.getBoundingClientRect();
            var viewportH = window.innerHeight;
            var total = rect.height - viewportH;
            var scrolled = -rect.top;
            var progress = total > 0 ? (scrolled / total) * 100 : 0;
            progress = Math.max(0, Math.min(100, progress));
            bar.style.width = progress + '%';
            if (toc) toc.classList.toggle('is-toc-visible', progress > 0 && progress < 100);
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
    codeCopy();
    seriesShuffle();
    readingProgress();
    if (typeof pagination === 'function') pagination(false);
})();
