(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
            }
            startHero();
        });
    });

    startHero();

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter(form) {
        var input = form.querySelector("input[name='keyword']");
        var query = normalize(input ? input.value : "");
        var section = form.closest("section") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
        if (!cards.length) {
            cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        }
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-filter-text"));
            card.classList.toggle("is-hidden", Boolean(query) && haystack.indexOf(query) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-filter")).forEach(function (form) {
        var input = form.querySelector("input[name='keyword']");
        var clear = form.querySelector("[data-filter-clear]");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(form);
        });

        if (input) {
            input.addEventListener("input", function () {
                applyFilter(form);
            });
        }

        if (clear) {
            clear.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                applyFilter(form);
            });
        }

        Array.prototype.slice.call(form.querySelectorAll("[data-filter-keyword]")).forEach(function (button) {
            button.addEventListener("click", function () {
                if (input) {
                    input.value = button.getAttribute("data-filter-keyword") || "";
                }
                applyFilter(form);
            });
        });
    });

    if (document.body.classList.contains("search-page")) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var searchForm = document.querySelector(".site-filter");
        var searchInput = searchForm ? searchForm.querySelector("input[name='keyword']") : null;
        if (q && searchInput) {
            searchInput.value = q;
            applyFilter(searchForm);
        }
    }
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    var attached = false;
    var hls = null;

    if (!video || !cover || !source) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            attached = true;
            return;
        }

        video.src = source;
        attached = true;
    }

    function play() {
        attach();
        video.controls = true;
        cover.classList.add("is-hidden");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                cover.classList.remove("is-hidden");
            });
        }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
}
