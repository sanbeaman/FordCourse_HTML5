/**************************************************************************************************
THIS FILE ADDS CUSTOM FUNCTIONALITY TO MODULE.
**************************************************************************************************/
/**************************************************************************
The code below was added by drew beaman  on 5-24-14
Updated by SCF on 7/2/2014
**************************************************************************/
/********* Global vars **************/
var module_type = "fordcbs";
var ssBtn;
var ssBtn_interval = -1;
var transcriptPath;
var transcriptObj = {};
var uagent=window.navigator.userAgent.toLowerCase()
var mfeat = {};
mfeat.isiPad = uagent.match(/ipad/i) !== null;
mfeat.isiPhone = uagent.match(/iphone/i) !== null;
mfeat.isiOS = mfeat.isiPhone || mfeat.isiPad;
mfeat.isAndroid = uagent.match(/android/i) !== null;
mfeat.isIE = window.navigator.appName.toLowerCase().indexOf("microsoft") != -1;
mfeat.isChrome = uagent.match(/chrome/gi) !== null;
mfeat.isFirefox = uagent.match(/firefox/gi) !== null;
mfeat.isWebkit = uagent.match(/webkit/gi) !== null;
mfeat.isGecko = uagent.match(/gecko/gi) !== null && !mfeat.isWebkit;
mfeat.isOpera = uagent.match(/opera/gi) !== null;
mfeat.isSafari = uagent.match(/safari/gi) !== null;
mfeat.isSvg = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
mfeat.isTouch = ("ontouchstart" in window && window.ontouchstart != null) || ("ontouchstart" in document) || (navigator.msMaxTouchPoints > 1);
var ssBtnShown = false;
//console.log("isiPad="+mfeat.isiPad+" isiPhone="+mfeat.isiPhone+" isTouch="+mfeat.isTouch+" isiOS="+mfeat.isiOS+" isSvg="+mfeat.isSvg+" uagent="+uagent);

/*
function toggle_globalUItext(uiactive) {
	if (uiactive) {
		if ($('#global-ui-text').hasClass('ui-disabled')) {
			$('#global-ui-text').removeClass('ui-disabled').addClass('ui-active');
		}
	} else {
		if ($('#global-ui-text').hasClass('ui-active')) {
			$('#global-ui-text').removeClass('ui-active').addClass('ui-disabled');
		}
	}
}
*/

function setupSlideTranscript(pageCode) {
	window.isDragging=false;
	var currentTxtObj= transcriptObj[pageCode];
	//console.log(">>>>"+currentTxtObj);
	var scrollPaneId = "scroll-pane-"+pageCode;
	var scrollWrapper = $("<div class='scroll-pane-wrapper'></div>");
	var scrollpane = $("<div class='scroll-pane' id="+scrollPaneId+" ></div>");
	$(scrollpane).html(currentTxtObj);
	$(scrollWrapper).append(scrollpane);
	if ($("#global-ui-text").hasClass("text-on") ) {
		$(scrollWrapper).css('visibility', 'visible');
	} else {
		$(scrollWrapper).css('visibility', 'hidden');
	}
	//$(".scroll-pane-wrapper").css('visibility', 'hidden');
	var targetNode = "#"+pageCode;
	$(targetNode).append(scrollWrapper);
	var scrollPaneIdDiv = "#"+scrollPaneId;
	return scrollPaneIdDiv;
}

function isCurrentPageTracked(pagenum, setIMP, customMsg) {
	var trackpages = tracking.split(',');
	var pageTrackStatus = trackpages[pagenum];
	if (pageTrackStatus == 0) {
		// Set impediment. The user cannot continue until he completes the exercise. Required for Drag and Drop
		if (setIMP) {
			if (customMsg != undefined){
				WBTApp.setImpediment(IMPEDIMENT_FULL, customMsg);
			} else {
				WBTApp.setImpediment(IMPEDIMENT_FULL);
			}
		}
		return false;
	} else {
		return true;
	}
}

function stdAudioInit(ap,tl) {
	//console.log("stdAudioInit("+ap+","+tl+")");
	AudioPlayer.resetAudio(ap,tl);
	$(".audio-wrapper").show();
	// if the audio was not previously started, perform the click to continue check
	if (!window.audioStarted && (mfeat.isTouch || mfeat.isiOS)) {
		if (ssBtn_interval>=0) clearInterval(ssBtn_interval);
		ssBtn_interval = setInterval(check_ssBtn,mfeat.isiOS?500:(mfeat.isAndroid?1000:2500));
	}
}

function stdPageInit(pageid) {
	var scrollpaneid = setupSlideTranscript(pageid);
	$(scrollpaneid).jScrollPane({showArrows: true});
}

// play the audio
function mobilePageStart() {
	if (ssBtn_interval>=0) {clearInterval(ssBtn_interval); ssBtn_interval=-1;}
	ssBtn.hide();
	ssBtnShown = false;
	$(".audio-wrapper").show();
	AudioPlayer.player.play();
}

// check the click to continue status of initial play in the module
function check_ssBtn() {
  clearInterval(ssBtn_interval); ssBtn_interval=-1;
	// if the audio player has started, clear the check interval and hide the button (if not already done so)
	if (window.audioStarted) {
	  if (ssBtnShown) {
		  ssBtn.hide();
			$(".audio-wrapper").show();
		  ssBtnShown = false;
		}
	  return;
	}
	// if the audio has not started yet, show the click to continue button if we are on iOS and this is Safari
	if (!ssBtnShown) {
		TweenMax.to(ssBtn, 0, {opacity: .8});
		ssBtn.show();
	  ssBtnShown = true;
	}
	ssBtn_interval = setInterval(check_ssBtn,250);
}

function mod_init(modid) {
	//console.log("mod_init("+modid+")");
	$(document).ready(function () {
		//console.log("mod_init document ready modid="+modid);
		// course framework initialization settings
		var appsettings = {scoID:modid, displayTopicTitle:true, displayPageTitle:false, displayMenuTopicTitle:true};
		// Initialize the Audio Player component
		AudioPlayer.init('#mod-audio-player');
		// Bind Controls
		$('#global-ui-audio').bind("click", function () {AudioPlayer.toggleAudio($(this));});
		$("#global-ui-text").bind("click", function () {AudioPlayer.toggleTranscript($(this));});
		ssBtn = $("#slidestartContainer");
		ssBtn.hide();
		ssBtn.on("click", function () {mobilePageStart();});
		// hide the audio wrapper until we determine if audio is available
		$(".audio-wrapper").hide();
		// transcript setup per module
		transcriptPath = appsettings.scoID + "/assets/data/transcript_obj.json";
		$.getJSON(transcriptPath, function (data) {
			transcriptObj = data;
			//console.log(transcriptObj);
		});
		// global course specific code initalization to go below
		window.setTimeout(function () {
			//console.log("mod_init WBTApp.init modid="+modid);
			WBTApp.init(appsettings);
		}, 500);
	});
}

