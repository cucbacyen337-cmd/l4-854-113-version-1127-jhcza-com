(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    function setupGlobalSearchPage() {
        var input = document.querySelector('[data-search-input]');
        var grid = document.querySelector('[data-search-grid]');
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));
        var count = document.querySelector('[data-search-result-count]');
        var regionFilter = document.querySelector('[data-region-filter]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var reset = document.querySelector('[data-search-reset]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function apply() {
            var keyword = normalize(input.value);
            var region = normalize(regionFilter && regionFilter.value);
            var type = normalize(typeFilter && typeFilter.value);
            var visible = 0;
            cards.forEach(function (card) {
                var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
                var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
                var isVisible = matchesKeyword && matchesRegion && matchesType;
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        input.addEventListener('input', apply);
        if (regionFilter) {
            regionFilter.addEventListener('change', apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', apply);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                input.value = '';
                if (regionFilter) {
                    regionFilter.value = '';
                }
                if (typeFilter) {
                    typeFilter.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function setupLocalFilter() {
        var input = document.querySelector('[data-page-filter]');
        var grid = document.querySelector('[data-filter-grid]');
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));
        var count = document.querySelector('[data-page-count]');

        function apply() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var isVisible = !keyword || cardText(card).indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        input.addEventListener('input', apply);
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.play-overlay');
            var src = shell.getAttribute('data-src');
            var started = false;
            var hls = null;

            if (!video || !overlay || !src) {
                return;
            }

            function startVideo() {
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                overlay.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }

                video.play().catch(function () {
                    overlay.classList.remove('is-hidden');
                    started = false;
                });
            }

            overlay.addEventListener('click', startVideo);
            shell.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    startVideo();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearchPage();
        setupLocalFilter();
        setupPlayers();
    });
})();
