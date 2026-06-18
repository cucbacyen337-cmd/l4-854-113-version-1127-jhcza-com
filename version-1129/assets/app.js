
(function(){
var q=function(s,c){return(c||document).querySelector(s)};
var qa=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var menu=q('[data-mobile-menu]');
var toggle=q('[data-menu-toggle]');
if(toggle&&menu){toggle.addEventListener('click',function(){menu.classList.toggle('is-open')})}
var slides=qa('[data-hero-slide]');
if(slides.length){var dots=qa('[data-hero-dot]');var active=0;var show=function(i){active=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('is-active',n===active)});dots.forEach(function(d,n){d.classList.toggle('is-active',n===active)})};dots.forEach(function(d,n){d.addEventListener('click',function(){show(n)})});setInterval(function(){show(active+1)},5200)}
qa('[data-local-filter]').forEach(function(input){var cards=qa('[data-title]');input.addEventListener('input',function(){var v=input.value.trim().toLowerCase();cards.forEach(function(card){var text=((card.getAttribute('data-title')||'')+' '+(card.getAttribute('data-meta')||'')).toLowerCase();card.classList.toggle('hidden-by-search',v&&text.indexOf(v)===-1)})})});
var searchInput=q('[data-search-input]');
if(searchInput){var params=new URLSearchParams(location.search);var initial=params.get('q')||'';searchInput.value=initial;var cards=qa('[data-search-card]');var status=q('[data-search-status]');var run=function(){var v=searchInput.value.trim().toLowerCase();var any=false;cards.forEach(function(card){var text=((card.getAttribute('data-title')||'')+' '+(card.getAttribute('data-meta')||'')).toLowerCase();var ok=!v||text.indexOf(v)>-1;card.classList.toggle('hidden-by-search',!ok);if(ok){any=true}});if(status){status.textContent=any?'正在浏览相关作品':'换个关键词继续发现'}};searchInput.addEventListener('input',run);run()}
qa('[data-player]').forEach(function(box){var video=q('video',box);var layer=q('.play-layer',box);var url=box.getAttribute('data-stream');var ready=false;var hls=null;var attach=function(){if(ready||!video||!url)return;if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;ready=true;return}if(window.Hls&&window.Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(url);hls.attachMedia(video);ready=true;return}video.src=url;ready=true};var start=function(){attach();if(layer){layer.classList.add('is-hidden')}var p=video.play();if(p&&p.catch){p.catch(function(){})}};if(layer){layer.addEventListener('click',start)}if(video){video.addEventListener('click',function(){if(video.paused){start()}});video.addEventListener('play',function(){if(layer){layer.classList.add('is-hidden')}})}});
})();
