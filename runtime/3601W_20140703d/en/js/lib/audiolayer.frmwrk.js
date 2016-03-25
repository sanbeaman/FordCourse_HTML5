/*
 * AudioPlayer.js
 * Custom audio component developed for Ford RE&T HTML Framework
 *
 * AudioPlayer requires:
 * MediaElementPlayer (http://mediaelementjs.com/)
 * jQuery library (jquery.com)
 */
window.audioStarted = false;
var AudioPlayer = (function () {
	return {
		player: {},
		globalTextOn: false,
		globalAudioOn: true,
		mediaPlayer: {},
		//added Drew
		hasTL: false,
		mediaTL: {},
		mediaEventHandler: function (type, data) {
			// if there is a timeline animation, sync it to the audio/media
			if (this.hasTL) {
				switch (type) {
					case 'pause':
						this.mediaTL.pause();
						break;
					case 'play':
						this.mediaTL.play();
						break;
					case 'seeked':
						//console.log('data='+ data + "---totalDur="+ this.mediaTL.totalDuration());
						if (data < this.mediaTL.totalDuration()) {
							this.mediaTL.seek(data);
						} else {
							this.mediaTL.seek(this.mediaTL.totalDuration());
						}
						break;
					case 'ended':
						this.mediaTL.progress(1);
						break;
				}
				//console.log('mediaEventHandler'+ type);
			}
		},
		//end added Drew
		init: function (el) {
			this.player = new MediaElementPlayer(el, {
				//added Drew
				//stop autorewind
				autoRewind: false,
				//flash plugin
				//end added Drew
				plugins: ['flash'],
				//added Drew
				success: function (mediaElement, domObject) {
					//console.log('media success');
					// add event listeners for media events
					mediaElement.addEventListener('loadeddata', function(e) {
						//console.log('media loadeddata mediaTL-->'+domObject);
					}, false);
					mediaElement.addEventListener('timeupdate', function(e) {
						//console.log('media timeupdate-->'+mediaElement.currentTime + "->" + domObject);
						// if we get an audioStarted message, it means that the audio has started
						if (mediaElement.currentTime>0) window.audioStarted=true;
					}, false);
					//mediaElement.addEventListener('progress', function(e) {
							//console.log('media progress-->'+mediaElement.currentTime + "->" + domObject);
							//// if we get an audioStarted message, it means that the audio has started
							//if (mediaElement.currentTime>0) window.audioStarted=true;
					//}, false);
					mediaElement.addEventListener('play', function(e) {
						//console.log('media played');
						AudioPlayer.mediaEventHandler('play');
					}, false);
					mediaElement.addEventListener('pause', function(e) {
						//console.log('media paused');
						AudioPlayer.mediaEventHandler('pause');
					}, false);
					mediaElement.addEventListener('ended', function(e) {
						//console.log('media ended');
						AudioPlayer.mediaEventHandler('ended');
					}, false);
					mediaElement.addEventListener('seeked', function(e) {
						//console.log('media seeked to '+mediaElement.currentTime);
						AudioPlayer.mediaEventHandler('seeked', mediaElement.currentTime);
					}, false);
					mediaPlayer = mediaElement;
				}
				//end added Drew
			});
		},
		toggleAudio: function (el) {
			if (this.globalAudioOn) {
				$(el).addClass('aud-off');
				//this.pauseAudio(); //Drew removed this so audio mutes but animations play
				this.player.setMuted(true);
			} else {
				$(el).removeClass('aud-off');
				this.player.setMuted(false);
				//this.playAudio() //Drew removed this so audio mutes but animations play
			}
			this.globalAudioOn = !this.globalAudioOn;
		},
		toggleTranscript: function (el) {
			if (this.globalTextOn) {
				$(el).removeClass('text-on');
			  $(".scroll-pane-wrapper").css('visibility', 'hidden');
			} else {
				$(el).addClass('text-on');
				$(".scroll-pane-wrapper").css('visibility', 'visible');
			}
			this.globalTextOn = !this.globalTextOn;
		},
		pauseAudio: function () {
			// IE 9 bug fix
			setTimeout(function () {
				AudioPlayer.player.pause();
			}, 100);
		},
		playAudio: function () {
			// IE 9 bug fix
			setTimeout(function () {
				AudioPlayer.player.play();
			}, 200);
		},
		//added Drew
		stopAudio: function () {
			if (this.hasTL) {
				this.mediaTL.seek(0);
			}
			// IE 9 bug fix
			setTimeout(function () {
				AudioPlayer.player.pause();
			}, 200);
		},
		//end added Drew
		resetAudio: function (audioSrc, mtl) {
			//console.log("AudioPlayer.resetAudio("+audioSrc+","+mtl+")");
			this.player.pause();
			//added Drew
			if (audioSrc != undefined) {
				if (mtl != undefined) {
					this.hasTL = true;
					this.mediaTL = mtl;
					//console.log('resetAudio->'+ this.mediaTL);
					this.mediaTL.progress(0).pause();
				} else {
					this.hasTL = false;
				}
				//end added Drew
				this.player.setSrc(audioSrc);
				if (this.globalAudioOn) {
					this.playAudio();
				}
			//added Drew
			} else {
				this.player.setCurrentTime(0);
				this.player.pause();
			}
			//end added Drew
		}
	};
}());
