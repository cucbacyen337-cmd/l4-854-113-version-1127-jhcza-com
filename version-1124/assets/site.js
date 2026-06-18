(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs(".menu-toggle");
        var nav = qs(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = qs(".hero");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa(".hero-dots button", hero);
        if (!slides.length) {
            return;
        }
        var active = 0;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === active);
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
            });
        });

        setInterval(function () {
            show(active + 1);
        }, 5600);
    }

    function initFilters() {
        qsa(".filter-panel").forEach(function (panel) {
            var input = qs("[data-filter-text]", panel);
            var year = qs("[data-filter-year]", panel);
            var type = qs("[data-filter-type]", panel);
            var empty = qs(".empty-state", panel.parentElement);
            var cards = qsa("[data-card]", panel.parentElement);

            function run() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.tags
                    ].join(" ").toLowerCase();

                    var okTerm = !term || haystack.indexOf(term) !== -1;
                    var okYear = !yearValue || card.dataset.year === yearValue;
                    var okType = !typeValue || card.dataset.type === typeValue;
                    var ok = okTerm && okYear && okType;

                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", run);
                    control.addEventListener("change", run);
                }
            });
        });
    }

    function safeText(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initGlobalSearch() {
        var input = qs("#global-search");
        var results = qs("#global-search-results");
        if (!input || !results || typeof SEARCH_ITEMS === "undefined") {
            return;
        }

        function render(items) {
            if (!items.length) {
                results.classList.remove("active");
                results.innerHTML = "";
                return;
            }

            results.innerHTML = items.slice(0, 8).map(function (item) {
                var title = safeText(item.title);
                var year = safeText(item.year);
                var type = safeText(item.type);
                var region = safeText(item.region);
                var link = safeText(item.link);
                var cover = safeText(item.cover);

                return [
                    '<a href="' + link + '">',
                    '<img src="' + cover + '" alt="' + title + '">',
                    '<span><strong>' + title + '</strong><span>' + year + ' · ' + type + ' · ' + region + '</span></span>',
                    '</a>'
                ].join("");
            }).join("");

            results.classList.add("active");
        }

        input.addEventListener("input", function () {
            var term = input.value.trim().toLowerCase();
            if (!term) {
                render([]);
                return;
            }

            var matches = SEARCH_ITEMS.filter(function (item) {
                return [
                    item.title,
                    item.year,
                    item.type,
                    item.region,
                    item.category
                ].join(" ").toLowerCase().indexOf(term) !== -1;
            });

            render(matches);
        });

        document.addEventListener("click", function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove("active");
            }
        });
    }

    function initPlayers() {
        qsa(".movie-player").forEach(function (player) {
            var video = qs("video", player);
            var overlay = qs(".play-overlay", player);
            var started = false;

            if (!video || !overlay) {
                return;
            }

            function attach() {
                var url = video.getAttribute("data-video");
                if (!url) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.src) {
                        video.src = url;
                    }
                } else if (window.Hls && window.Hls.isSupported()) {
                    if (!video.hlsInstance) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video.hlsInstance = hls;
                    }
                } else if (!video.src) {
                    video.src = url;
                }
            }

            function start() {
                if (!started) {
                    attach();
                    started = true;
                }
                overlay.classList.add("hidden");
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initGlobalSearch();
        initPlayers();
    });
})();
