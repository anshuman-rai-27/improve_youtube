/*------------------------------------------------------------------------------
4.5.0 PLAYLIST
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
4.5.1 UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.playlistUpNextAutoplay = function (event) {
	if (
		ImprovedTube.getParam(location.href, 'list') &&
		ImprovedTube.storage.playlist_up_next_autoplay === false
	) {
		if (this.elements.ytd_watch.playlistData)
		{this.elements.ytd_watch.playlistData.currentIndex = this.elements.ytd_watch.playlistData.totalVideos}
			else {var tries = 0; 	var intervalMs = 300;  var maxTries = 5; 		
					var waitForPlaylist = setInterval(() => { 	
					if (this.elements.ytd_watch.playlistData || (++tries >= maxTries) ) {
					this.elements.ytd_watch.playlistData.currentIndex = this.elements.ytd_watch.playlistData.totalVideos; clearInterval(waitForPlaylist );}			
					intervalMs *= 1.4;}, intervalMs);
					}
	}
};    		
/*------------------------------------------------------------------------------
4.5.2 REVERSE
------------------------------------------------------------------------------*/
ImprovedTube.playlistReverse = function () {
	if (this.storage.playlist_reverse === true) {
		function update() {
			var results = ImprovedTube.elements.ytd_watch.data.contents.twoColumnWatchNextResults,
				playlist = results.playlist.playlist,
				autoplay = results.autoplay.autoplay;

			playlist.contents.reverse();

			playlist.currentIndex = playlist.totalVideos - playlist.currentIndex - 1;
			playlist.localCurrentIndex = playlist.contents.length - playlist.localCurrentIndex - 1;

			for (var i = 0, l = autoplay.sets.length; i < l; i++) {
				var item = autoplay.sets[i];

				item.autoplayVideo = item.previousButtonVideo;
				item.previousButtonVideo = item.nextButtonVideo;
				item.nextButtonVideo = item.autoplayVideo;
			}

			ImprovedTube.elements.ytd_watch.updatePageData_(JSON.parse(JSON.stringify(ImprovedTube.elements.ytd_watch.data)));

			setTimeout(function () {
				var playlist_manager = document.querySelector('yt-playlist-manager');

				ImprovedTube.elements.ytd_player.updatePlayerComponents(null, autoplay, null, playlist);
				playlist_manager.autoplayData = autoplay;
				playlist_manager.setPlaylistData(playlist);
				ImprovedTube.elements.ytd_player.updatePlayerPlaylist_(playlist);
			}, 100);
		}

		if (!document.querySelector('#it-reverse-playlist') && ImprovedTube.elements.playlist.actions) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.id = 'it-reverse-playlist';
			button.className = 'style-scope yt-icon-button';
			button.addEventListener('click', function (event) {
				var playlist_manager = document.querySelector('yt-playlist-manager');

				event.preventDefault();
				event.stopPropagation();

				this.classList.toggle('active');

				ImprovedTube.playlistReversed = !ImprovedTube.playlistReversed;

				update();

				return false;
			}, true);

			svg.setAttributeNS(null, 'width', '24');
			svg.setAttributeNS(null, 'height', '24');
			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			path.setAttributeNS(null, 'd', 'M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z');

			svg.appendChild(path);

			button.appendChild(svg);

			ImprovedTube.elements.playlist.actions.appendChild(button);
		}

		if (this.playlistReversed === true) {
			update();
		}
	}
};

/*------------------------------------------------------------------------------
4.5.3 REPEAT
------------------------------------------------------------------------------*/
ImprovedTube.playlistRepeat = function () {
	if ( ImprovedTube.storage.playlist_repeat === true ) { 
	    setTimeout(function (){
		var option = ImprovedTube.storage.playlist_repeat,
		button = document.querySelector("#button.ytd-playlist-loop-button-renderer") || document.querySelector("ytd-playlist-loop-button-renderer button") || document.querySelector("ytd-playlist-loop-button-renderer");
	if (button && (option === true && button.querySelector("path").attributes.d.textContent.split(" ")[0].startsWith('M21')
	) && button.querySelector("#tooltip")?.textContent !== 'Loop video' 
	  && button.firstElementChild?.firstElementChild?.attributes[2]?.textContent !== 'Loop video'  
	  && button.querySelector("#tooltip")?.textContent !== 'Turn off loop' 
	  && button.firstElementChild?.firstElementChild?.attributes[2]?.textContent !== 'Turn off loop' 
	)  
	{ button.click(); } 
		}, 5000);
	}
};

/* https://github.com/code-charity/youtube/issues/1768#issuecomment-1720423923 */

/*------------------------------------------------------------------------------
4.5.4 SHUFFLE
------------------------------------------------------------------------------*/
ImprovedTube.playlistShuffle = function () {
	if ( ImprovedTube.storage.playlist_shuffle === true ) { 
		setTimeout(function (){
		var button = ImprovedTube.elements.playlist.shuffle_button,
		option = ImprovedTube.storage.playlist_shuffle;
		button = document.querySelector('#playlist-actions #playlist-action-menu ytd-toggle-button-renderer');
	if (button && (option === true && button.querySelector("path").attributes.d.textContent.split(" ")[0].startsWith('M18.1')
	) 	)  
	{ button.click(); } 
		}, 5000);
	}
};

/*------------------------------------------------------------------------------
4.5.5 POPUP
------------------------------------------------------------------------------*/
/**
 * ## Creates a playlist popup button (with ID `it-popup-playlist-button`)
 * - used by/in {@linkcode ImprovedTube.playlistPopupUpdate}
 * - checks {@linkcode ImprovedTube.storage.player_autoplay} if to autoplay the popuped playlist/video
 * - checks {@linkcode ImprovedTube.elements.player} to get video ID and current time, if available, otherwise starts first video of playlist
 * - popup has video players width/height or window (inner) width/height when video player is not available
 * - the button has the playlist ID as `list` in its dataset and reads from it to open the popup
 * @param {string | null} playlistID - the playlist ID or `null`
 * @param {boolean} [altButtonStyle] - [optional] changes styling of the playlist popup button - `true` for minplayer and playlist panel and `false` for the playlist page - default `false`
 * @param {boolean} [checkVideo] - [optional] if `true` checks the {@linkcode ImprovedTube.elements.player} to get the video ID, time, and size, if available, otherwise starts first video of playlist - default `false` (starts first video of playlist)
 * @returns {HTMLButtonElement | null} the playlist popup button to insert into the DOM or `null` if the {@linkcode playlistID} is `null`
 */
ImprovedTube.playlistPopupCreateButton = function (playlistID, altButtonStyle, checkVideo) {
	"use strict";
	if (playlistID == null) return null;
	const button = document.createElement('button'),
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

	button.id = 'it-popup-playlist-button';
	button.className = `yt-spec-button-shape-next yt-spec-button-shape-next--${(altButtonStyle ?? false) ? 'text' : 'tonal'} yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-button style-scope ytd-playlist-header-renderer`;
	button.title = 'Popup playlist';
	button.dataset.list = playlistID;
	button.style.opacity = '0.8';
	button.addEventListener(
		'click',
		(checkVideo ?? false) ? function (event) {
			"use strict";
			const videoURL = ImprovedTube.elements.player?.getVideoUrl();
			if (videoURL != null && ImprovedTube.regex.video_id.test(videoURL)) {
				ImprovedTube.elements.player.pauseVideo();
				window.open(`${location.protocol}//www.youtube.com/embed/${videoURL.match(ImprovedTube.regex.video_id)[1]}?autoplay=${(ImprovedTube.storage.player_autoplay ?? true) ? '1' : '0'}&start=${videoURL.match(ImprovedTube.regex.video_time)?.[1] ?? '0'}&list=${this.dataset.list}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${ImprovedTube.elements.player.offsetWidth ?? innerWidth},height=${ImprovedTube.elements.player.offsetHeight ?? innerHeight}`);
				//! If the video is not in the playlist or not within the first 200 entries, then it automatically selects the first video in the list.
				//! But this is okay since this button is mainly for the playlist, not the video (see the video popup button in player.js).
			} else window.open(`${location.protocol}//www.youtube.com/embed/videoseries?autoplay=${(ImprovedTube.storage.player_autoplay ?? true) ? '1' : '0'}&list=${this.dataset.list}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${innerWidth},height=${innerHeight}`);
		} : function (event) {
			"use strict";
			window.open(`${location.protocol}//www.youtube.com/embed/videoseries?autoplay=${(ImprovedTube.storage.player_autoplay ?? true) ? '1' : '0'}&list=${this.dataset.list}`, '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${innerWidth},height=${innerHeight}`);
		},
		true
	);

	svg.style.width = '24px';
	svg.style.height = '24px';
	svg.style.pointerEvents = 'none';
	svg.style.fill = 'currentColor';
	svg.setAttribute('viewBox', '0 0 24 24');
	path.setAttribute('d', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

	svg.append(path);
	button.append(svg);

	return button;
};
/**
 * ## Adds a playlist popup button to each playlist panel found or update the links of existing popup buttons
 * - buttons will be added on the playlist page (next to the share button), in the playlist panel (after the loop and shuffle buttons), and/or the mini playlist section of the mini player (after the loop and shuffle buttons)
 * - uses {@linkcode ImprovedTube.playlistPopupCreateButton} to create each button
 * - saves each button in {@linkcode ImprovedTube.elements.buttons} as `it-popup-playlist-button-playlist`, `it-popup-playlist-button-mini`, and `it-popup-playlist-button-panel`
 * - called from {@linkcode ImprovedTube.ytElementsHandler} and {@linkcode ImprovedTube.hrefObserver} when DOM changes (somewhat related to playlist renderers)
 */
ImprovedTube.playlistPopupUpdate = function () {
	"use strict";
	if (!(this.storage.playlist_popup ?? false)) return;

	const playlistID = location.search.match(this.regex.playlist_id)?.[1],
		playlistIDMini = this.elements.player?.getPlaylistId?.();

	if (!document.contains(this.elements.buttons['it-popup-playlist-button-playlist'])) {
		const playlistShareButton = document.body.querySelector('ytd-app>div#content>ytd-page-manager>ytd-browse>ytd-playlist-header-renderer ytd-button-renderer.ytd-playlist-header-renderer:has(button[title])');
		if (playlistShareButton == null) this.elements.buttons['it-popup-playlist-button-playlist'] = null;
		else playlistShareButton.insertAdjacentElement('afterend', this.elements.buttons['it-popup-playlist-button-playlist'] = this.playlistPopupCreateButton(playlistID));
	} else if (playlistID != null && this.elements.buttons['it-popup-playlist-button-playlist'].dataset.list !== playlistID) this.elements.buttons['it-popup-playlist-button-playlist'].dataset.list = playlistID;

	if (!document.contains(this.elements.buttons['it-popup-playlist-button-mini'])) {
		const miniItemButtons = document.body.querySelector('ytd-app>ytd-miniplayer ytd-playlist-panel-renderer div#top-level-buttons-computed');
		if (miniItemButtons == null) this.elements.buttons['it-popup-playlist-button-mini'] = null;
		else miniItemButtons.appendChild(this.elements.buttons['it-popup-playlist-button-mini'] = this.playlistPopupCreateButton(playlistIDMini, true, true));
	} else if (playlistIDMini != null && this.elements.buttons['it-popup-playlist-button-mini'].dataset.list !== playlistIDMini) this.elements.buttons['it-popup-playlist-button-mini'].dataset.list = playlistIDMini;

	if (!document.contains(this.elements.buttons['it-popup-playlist-button-panel'])) {
		const panelItemButtons = document.body.querySelector('ytd-app>div#content>ytd-page-manager>ytd-watch-flexy ytd-playlist-panel-renderer div#top-level-buttons-computed');
		if (panelItemButtons == null) this.elements.buttons['it-popup-playlist-button-panel'] = null;
		else panelItemButtons.appendChild(this.elements.buttons['it-popup-playlist-button-panel'] = this.playlistPopupCreateButton(playlistID, true, true));
	} else if (playlistID != null && this.elements.buttons['it-popup-playlist-button-panel'].dataset.list !== playlistID) this.elements.buttons['it-popup-playlist-button-panel'].dataset.list = playlistID;
};