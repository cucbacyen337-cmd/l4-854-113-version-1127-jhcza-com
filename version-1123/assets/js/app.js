(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function openGlobalSearch(query) {
    var target = './movies.html';
    if (query) {
      target += '?q=' + encodeURIComponent(query);
    }
    window.location.href = target;
  }

  function initMenu() {
    var button = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function filterCards(query) {
    var scope = select('[data-search-scope]');
    if (!scope) {
      return false;
    }
    var cards = selectAll('[data-search-text]', scope);
    var needle = normalize(query);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search-text'));
      var matched = !needle || haystack.indexOf(needle) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    var empty = select('[data-no-results]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
    return true;
  }

  function initSearch() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      selectAll('[data-search-input]').forEach(function (input) {
        input.value = initialQuery;
      });
      filterCards(initialQuery);
    }
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = select('[data-search-input]', form);
        var query = input ? input.value : '';
        if (!filterCards(query)) {
          openGlobalSearch(query);
        }
      });
      var input = select('[data-search-input]', form);
      if (input && select('[data-search-scope]')) {
        input.addEventListener('input', function () {
          filterCards(input.value);
        });
      }
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function initPlayer() {
    var video = select('[data-player-video]');
    var cover = select('[data-player-cover]');
    var button = select('[data-player-start]');
    var config = select('#movie-player-config');
    if (!video || !config) {
      return;
    }
    var source = '';
    try {
      source = JSON.parse(config.textContent || '{}').src || '';
    } catch (error) {
      source = '';
    }
    var ready = false;
    var hlsInstance = null;
    function bind() {
      if (ready || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play(event) {
      if (event) {
        event.preventDefault();
      }
      bind();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', play);
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearch();
    initHero();
    initPlayer();
  });
})();
