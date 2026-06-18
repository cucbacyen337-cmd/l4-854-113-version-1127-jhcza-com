function initPlayer(url) {
  var video = document.querySelector('[data-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');
  if (!video || !url) {
    return;
  }
  var ready = false;
  var bind = function () {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  };
  var play = function () {
    bind();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };
  if (cover) {
    cover.addEventListener('click', play);
  }
  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
