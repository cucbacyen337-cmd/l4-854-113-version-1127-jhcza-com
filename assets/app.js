(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function next() {
            show(current + 1);
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(next, 5200);
            });
        });
        if (slides.length > 1) {
            timer = setInterval(next, 5200);
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilter(root) {
        var input = root.querySelector('[data-filter-input]');
        var year = root.querySelector('[data-filter-year]');
        var genre = root.querySelector('[data-filter-genre]');
        var scope = root.parentElement;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        function apply() {
            var keyword = normalize(input && input.value);
            var selectedYear = normalize(year && year.value);
            var selectedGenre = normalize(genre && genre.value);
            cards.forEach(function(card) {
                var text = normalize(card.getAttribute('data-keywords'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || cardYear === selectedYear;
                var matchGenre = !selectedGenre || cardGenre.indexOf(selectedGenre) !== -1;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchGenre));
            });
        }
        [input, year, genre].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
            apply();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(setupFilter);
}());
