/**************************************************************************************************
THIS FILE COMMUNICATES WITH THE API IN THE LAUNCH PAGE.
**************************************************************************************************/
/**************************************************************************
The code below was added by Mike Stocke on 6-22-05 for the
RE&T Course Development Shell
**************************************************************************/
/********* Global vars **************/
var user_status = "incomplete";
var tracking = "";
var bookmark = "";
var exit_btn_flag = 0; //initialize the exit check variable
var api = null;
/****************************************************************************************
Function: checkAPI()
Parameter: None
Return: None
Check for the ability to communicate with API. Right Now we only check
if it was launched from the Launch Window.
****************************************************************************************/

function checkAPI() {
	if (opener) {
		if (opener.API && opener.API.LMSSetValue && opener.API.LMSGetValue) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}
// These functions get variable values from Flash
// **********************************************

function setBookmarkFromCourse(bookmark_fromFlash) {
	document.frm_main.bookmark.value = bookmark_fromFlash;
	CMI_theloc = bookmark_fromFlash;
}

function setStatusFromCourse(status_fromFlash) {
	document.frm_main.status.value = status_fromFlash;
	CMI_thestatus = status_fromFlash;
}

function setTrackingFromCourse(suspenddata_fromFlash) {
	document.frm_main.suspenddata.value = suspenddata_fromFlash;
	CMI_thesuspenddata = suspenddata_fromFlash;
}

function setScoreFromCourse(score_fromFlash) {
	document.frm_main.score.value = score_fromFlash;
	CMI_thescore = score_fromFlash;
}
// These functions send variable values to Flash
// **********************************************

function setBoookmarkToCourse() {
	bookmark = getLoc_fcn();
	//bookmark = "4"
}
// suspenddata_toFlash is to get the value of the cmi.suspend_data string from CMI

function setTrackingToCourse() {
	tracking = getSuspendData_fcn();
	//var suspenddata_toFlash="1,1,1,1,1";
	//var suspenddata_toFlash="1|1,0|1,0,0|1,0,0,0|1,0,0,0,0"; // example value for single AU
	//var suspenddata_toFlash="1|1,1|1,1,1|1,1,1,1|1,1,1,1,1"; // example value for single AU
	//var suspenddata_toFlash="1,1,1,1,1,0,1,1,1,1"; // example value for multiple AU
	//tracking = ",1,0,0,1,0";

}
// status_toFlash is to get the value of the cmi.core.lesson_status string from CMI

function setStatusToCourse() {

	user_status = getStatus_fcn();

	if (user_status.toLowerCase() == "na" || user_status == "not attempted" || user_status == undefined) { user_status = "incomplete"; }//SCF mod

	//var status_toFlash="incomplete"; // example value
}
// score_toFlash is to get the value of the cmi.core.score.raw string from CMI

function setScoreToCourse() {
	score = getScore_fcn();
}
/**************************************************************************
End supplemental code block for RE&T Course Development Shell
**************************************************************************/
/****************************************************************************************
Function: FindAPI()
Parameter: None
Return: Object or null
Check for the ability to communicate with API.
****************************************************************************************/
// returns the LMS API object (may be null if not found)

function findAPI(win) {
	var theAPI = null;
	var findAPITries = 0;
	if ((win.parent != null) && (win.parent != win)) {
		while (theAPI == null) {
			findAPITries++;
			// Note: 7 is an arbitrary number, but should be more than sufficient
			if (findAPITries > 7) {
				return null;
			}
			theAPI = win.parent.API;
		}
	} else {
		theAPI = win.API;
	}
	return theAPI;
}
/*******************************************************************************
 **
 ** Function getAPI()
 ** Inputs:  none
 ** Return:  If an API object is found, it's returned, otherwise null is returned
 **
 ** Description:
 ** This function looks for an object named API, first in the current window's
 ** frame hierarchy and then, if necessary, in the current window's opener window
 ** hierarchy (if there is an opener window).
 **
 *******************************************************************************/

function getAPI(f) {
	var theAPI = findAPI(window);
	if ((theAPI == null) && (window.opener != null) && (typeof (window.opener) != "undefined")) {
		theAPI = findAPI(window.opener);
	}
	if (theAPI == null) {
		//alert("Error loading API");
		//alert("Attention :\r\rLearning Management System communication is currently disabled.\r\rYour progress will not be saved.\r\rYou may continue reviewing this course without receiving credit. If you think you are receiving this message in error, please try again later, or contact your Administrator. \r\r Error - API object not found.");
		f(null)
	} else {
		f(theAPI)
	}
}

//init
var CMI_theloc = ""; //The actual html name of the page, init value is 0
var CMI_thestatus = "incomplete";
var CMI_thescore = "";
var CMI_CurrDate = new Date(); //This will hold the Time Stamp.
var CMI_isLastPage = ""; //This variable is set tto true are false depending on if it is a last page
var CMI_thesuspenddata = ""; //get The suspend data
var CMI_navigate = "false"; //This will help track if we have to display the next page
// obtain the LMS API

/**************************************************************************
The functions below were modified by Mike Stocke on 6-22-05 for the
RE&T Course Development Shell
**************************************************************************/

function getLoc_fcn() {
	if (api) {
		CMI_theloc = api.LMSGetValue("cmi.core.lesson_location"); //get module location
	}
	return CMI_theloc;
}

function getStatus_fcn() {
	if (api) {
		CMI_thestatus = api.LMSGetValue("cmi.core.lesson_status"); //get module status
	}
	return CMI_thestatus;
}

function getSuspendData_fcn() {
	if (api) {
		CMI_thesuspenddata = api.LMSGetValue("cmi.suspend_data"); //get suspend data
	}
	return CMI_thesuspenddata;
}

function getScore_fcn() {
	if (api) {
		CMI_thescore = api.LMSGetValue("cmi.core.score.raw"); //get module score
	}
	return CMI_thescore;
}
/**************************************************************************
End edited functions for RE&T Course Development Shell
**************************************************************************/
/*********************************************************************************************
Function:
setValues_exitCMI()- Called by the exit button in the course, sets the Values in the Launch Page, calls LMSFinish, and closes the module
Parameter: None
Return: None
This function sets the:
  bookmark - the Flash frame label
  status - the status for the module completed or  incomplete
  timespent in module - the amount of time spent by the student in the module (return function value)
  score - the score for the module (if any)
  suspend_data - additional course data sent through suspend_data (if any)
*********************************************************************************************/

function setValues_exitCMI() {
	if (api) {
		api.LMSSetValue("cmi.core.lesson_location", CMI_theloc); //ex: seven or nine etc...
		api.LMSSetValue("cmi.core.lesson_status", CMI_thestatus); //ex: //completed, incomplete,
		api.LMSSetValue("cmi.core.time", CMI_GetTime()); //ex: 60 Sec
		api.LMSSetValue("cmi.core.score.raw", CMI_thescore); //ex: 20
		api.LMSSetValue("cmi.suspend_data", CMI_thesuspenddata); // Suspend Data
		api.LMSFinish("");
	}
	exit_btn_flag = 1;
	window.self.close();
}
/*********************************************************************************************
Function:
setValues_in_CMI()- Called by the onUnload function when the browser is closed, sets the Values in the Launch Page and calls LMSFinish only if the course exit button was not used
Parameter: None
Return: None
This function sets the:
  bookmark - the Flash frame label
  status - the status for the module completed or  incomplete
  timespent in module - the amount of time spent by the student in the module (return function value)
  score - the score for the module (if any)
  suspend_data - additional course data sent through suspend_data (if any)
*********************************************************************************************/

function setValues_in_CMI() {
	//alert('setValues_in_CMI');
	if (exit_btn_flag != 1) {
		if (api) {
			api.LMSSetValue("cmi.core.lesson_location", CMI_theloc); //ex: seven or nine etc...
			api.LMSSetValue("cmi.core.lesson_status", CMI_thestatus); //ex: //completed, incomplete,
			api.LMSSetValue("cmi.core.time", CMI_GetTime()); //ex: 60 Sec
			api.LMSSetValue("cmi.core.score.raw", CMI_thescore); //ex: 20
			api.LMSSetValue("cmi.suspend_data", CMI_thesuspenddata); // Suspend Data
			api.LMSCommit("");
			api.LMSFinish("");
		}
	}
}

function doLMSInitialize(){
	if (api) {
		api.LMSInitialize("");
	}
}
/* ***********
RCHOUKAI 12.19.07
function : doLMSCommit
params: none
description: issues an api lmsCommit; purpose - to issue lmscommit from specific pages in Flash.
*********** */

function doLMSCommit() {

	if (api != null && api != undefined) {
	//alert("cmiscript - doLMSCommit - api found");
		api.LMSSetValue("cmi.core.lesson_location", CMI_theloc); //ex: seven or nine etc...
		api.LMSSetValue("cmi.core.lesson_status", CMI_thestatus); //ex: //completed, incomplete,
		api.LMSSetValue("cmi.core.time", CMI_GetTime()); //ex: 60 Sec
		api.LMSSetValue("cmi.core.score.raw", CMI_thescore); //ex: 20
		api.LMSSetValue("cmi.suspend_data", CMI_thesuspenddata); // Suspend Data
		api.LMSCommit(""); // SCORM 1.2 - quotes required
		// re-initialize timestamp to address mutliple time updates to CMI.
		CMI_CurrDate = new Date();
	}
}
/*********************************************************************************************
Function: CMI_GetTime()
Parameter: None
Return: The total time taken since the Launch of the Module.
*********************************************************************************************/

function CMI_GetTime() {
	var CMI_OpenTime = new Date(CMI_CurrDate);
	var CMI_CloseTime = new Date();
	var CMI_HoursDiff = ((CMI_CloseTime - CMI_OpenTime) / 3600000);
	var CMI_SecondsDiff = Math.round((CMI_HoursDiff * 3600));
	//CMI_loc_val =api.LMSGetValue("cmi.core.time"); //Previous time if any
	//CMI_SecondsDiff=parseInt(CMI_SecondsDiff)+parseInt(CMI_loc_val);
	CMI_SecondsDiff = parseInt(CMI_SecondsDiff)
	return CMI_SecondsDiff;
}
/****************************************************************************************
Function: initPageValues(CMI_isLastPage_arg,CMI_theloc_arg)
Parameter:
a) CMI_isLastPage_arg: Is this the Last Page "true" or "false"
b) CMI_theloc_arg:	//This would be the page name of the Module, ex: page1.htm, page2.htm etc...
Return: None
****************************************************************************************/

function initPageValues(CMI_isLastPage_arg, CMI_theloc_arg) {
	CMI_isLastPage = CMI_isLastPage_arg; //if Last Page of Module Indicate true
	CMI_theloc = CMI_theloc_arg;
	isLastPageStatus(CMI_isLastPage_arg); //set the status of the Module.
}
/*********************************************************************************************
Function: isLastPageStatus()
Parameter: CMI_isLastPage_arg: Is this the Last Page "true" or "false"
Return: None
if the user status is not already completed
this may happen if he went to the last page
and came back to this.
we do not want to reset it to incomplete
**********************************************************************************************/

function isLastPageStatus(CMI_isLastPage_arg) {
	if (CMI_isLastPage == "false") {
		if (CMI_thestatus != "completed") {
			CMI_thestatus = "incomplete";
		}
	} else {
		CMI_thestatus = "completed";
	}
}
/***********************************************************************************************
Author: vbandaru
This .js file lets suspend data to be stored. This is a simple implemention
***********************************************************************************************/

function setSuspendData(valueChosen) {
	CMI_thesuspenddata = valueChosen; //Set the suspend data value
}

function getSuspendData() {
	return(CMI_thesuspenddata) ////get the suspend data value
}
/****************************************************************************************
Function:  displayError(errCode_arg)
Parameter: errCode_arg
Return: None
alert the user of nature of error.
Right Now we check for error code 0
****************************************************************************************/

function displayError(errCode_arg) {
	if (errCode_arg == 0) {
		//alert ("CMI ERROR: Unable to Intialize Javascript API");
	}
}
