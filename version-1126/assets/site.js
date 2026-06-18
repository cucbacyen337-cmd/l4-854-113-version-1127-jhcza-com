(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            window.addEventListener("scroll", function () {
                backTop.classList.toggle("show", window.scrollY > 360);
            });
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-movie-filter]");
        var sortSelect = document.querySelector("[data-movie-sort]");
        var grid = document.querySelector("[data-movie-grid]");
        var emptyState = document.querySelector("[data-empty-state]");

        function applyListTools() {
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var query = filterInput ? normalize(filterInput.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        function applySort() {
            if (!grid || !sortSelect) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var value = sortSelect.value;

            cards.sort(function (a, b) {
                if (value === "hot") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (value === "year") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }
                return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-CN");
            });

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
            applyListTools();
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyListTools);
        }
        if (sortSelect) {
            sortSelect.addEventListener("change", applySort);
        }

        var searchForm = document.querySelector("[data-search-form]");
        var searchInput = document.querySelector("[data-search-input]");
        var searchResults = document.querySelector("[data-search-results]");

        function renderSearch(query) {
            if (!searchResults || !window.SEARCH_INDEX) {
                return;
            }

            var words = normalize(query);
            var items = window.SEARCH_INDEX.filter(function (item) {
                if (!words) {
                    return item.featured;
                }
                return normalize([
                    item.title,
                    item.description,
                    item.genre,
                    item.region,
                    item.year,
                    item.type,
                    item.tags
                ].join(" ")).indexOf(words) !== -1;
            }).slice(0, 80);

            searchResults.innerHTML = "";
            if (!items.length) {
                searchResults.innerHTML = '<div class="empty-state show">没有找到相关影片</div>';
                return;
            }

            items.forEach(function (item) {
                var article = document.createElement("article");
                article.className = "movie-card";
                article.setAttribute("data-title", item.title);
                article.setAttribute("data-year", item.year);
                article.setAttribute("data-region", item.region);
                article.setAttribute("data-genre", item.genre);
                article.setAttribute("data-views", item.views);
                article.innerHTML = [
                    '<a class="poster-link" href="' + item.url + '">',
                    '<img class="movie-poster" src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
                    '<span class="movie-year">' + item.year + '</span>',
                    '<span class="movie-heat">热度 ' + item.views + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<p class="eyebrow">' + item.region + ' · ' + item.type + '</p>',
                    '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
                    '<p class="movie-desc">' + item.description + '</p>',
                    '<div class="mini-tags"><span>' + item.genre + '</span></div>',
                    '<a class="card-link" href="' + item.url + '">查看详情</a>',
                    '</div>'
                ].join("");
                searchResults.appendChild(article);
            });
        }

        if (searchForm && searchInput && searchResults) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            searchInput.value = initialQuery;
            renderSearch(initialQuery);

            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = searchInput.value.trim();
                var nextUrl = query ? window.location.pathname + "?q=" + encodeURIComponent(query) : window.location.pathname;
                window.history.replaceState(null, "", nextUrl);
                renderSearch(query);
            });
        }
    });
})();
