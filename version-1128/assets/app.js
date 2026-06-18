(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMobileMenu() {
        var button = qs("[data-menu-toggle]");
        var menu = qs("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            button.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
        });
    }

    function setupCategoryFilter() {
        qsa("[data-filter-area]").forEach(function (area) {
            var input = qs("[data-filter-input]", area);
            var year = qs("[data-filter-year]", area);
            var type = qs("[data-filter-type]", area);
            var cards = qsa(".searchable-card", area);
            var empty = qs(".empty-result", area);

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();

                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
                    var ok = matchQuery && matchYear && matchType;

                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, year, type].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", applyFilter);
                    el.addEventListener("change", applyFilter);
                }
            });
        });
    }

    function renderSearchPage() {
        var holder = qs("[data-search-results]");
        var input = qs("[data-search-page-input]");
        if (!holder || !input || !Array.isArray(window.SEARCH_MOVIES)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var firstQuery = params.get("q") || "";
        input.value = firstQuery;

        function cardTemplate(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + "</span>";
            }).join("");

            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + escapeHtml(item.href) + '">',
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="poster-mask"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></span>',
                '</a>',
                '<div class="movie-body">',
                '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>·</span><span>' + escapeHtml(item.genre) + '</span></div>',
                '<h2 class="movie-title"><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h2>',
                '<p class="movie-text">' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + tags + '</div>',
                '</div>',
                '</article>'
            ].join("");
        }

        function render() {
            var query = input.value.trim().toLowerCase();
            var results = window.SEARCH_MOVIES.filter(function (item) {
                if (!query) {
                    return true;
                }

                return [
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.oneLine,
                    (item.tags || []).join(" ")
                ].join(" ").toLowerCase().indexOf(query) !== -1;
            }).slice(0, 96);

            if (!results.length) {
                holder.innerHTML = '<div class="empty-result show">没有找到匹配的影片</div>';
                return;
            }

            holder.innerHTML = results.map(cardTemplate).join("");
        }

        input.addEventListener("input", render);
        render();
    }

    function setupPlayer(videoId, buttonId, coverId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var cover = document.getElementById(coverId);
        var started = false;
        var hlsInstance = null;

        if (!video || !button || !cover || !source) {
            return;
        }

        function load() {
            if (!started) {
                started = true;
                cover.classList.add("is-hidden");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        button.addEventListener("click", load);
        cover.addEventListener("click", load);
        video.addEventListener("click", function () {
            if (video.paused) {
                load();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MoviePlayer = setupPlayer;

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupCategoryFilter();
        renderSearchPage();
    });
})();
