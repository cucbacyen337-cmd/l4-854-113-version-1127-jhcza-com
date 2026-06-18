(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play-cover]");
            var message = player.querySelector("[data-player-message]");
            var stream = video ? video.getAttribute("data-stream") : "";
            var loaded = false;
            var hlsInstance = null;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add("show");
            }

            function loadVideo() {
                if (!video || !stream || loaded) {
                    return;
                }

                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            showMessage("播放暂时不可用");
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function startVideo() {
                loadVideo();
                if (cover) {
                    cover.classList.add("hidden");
                }
                if (video) {
                    video.controls = true;
                    var request = video.play();
                    if (request && typeof request.catch === "function") {
                        request.catch(function () {
                            showMessage("点击画面继续播放");
                        });
                    }
                }
            }

            if (cover) {
                cover.addEventListener("click", startVideo);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        startVideo();
                    } else {
                        video.pause();
                    }
                });

                video.addEventListener("play", function () {
                    if (cover) {
                        cover.classList.add("hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    });
})();
