var WBTApp = {};
var IMPEDIMENT_PARTIAL = 1;
var IMPEDIMENT_FULL = 2;
(function ($) {
    var MAX_WIDTH = 1366,
        MIN_WIDTH = 1024,
        MAX_HEIGHT = 800,
        MIN_HEIGHT = 644,
        dftWidth = 1024,
        dftHeight = 644,
        f = false,
        p = false,
        pageNum = 1,
        oldPageNum = pageNum,
        totalPages = 0,
        pages = [{}],
        impediment = 0,
        impedimentMessage = "Please complete all required activities on the page",
        scoXmlUrl, alertOn = false,
        validTracking = true,
        displayPageTitle = true,
        gCourse, currPage, slidemap, 
		isTouch = ("ontouchstart" in document) || (navigator.msMaxTouchPoints > 1),
        isiPad = (navigator.userAgent.match(/(iPad)/gi) ? true : false),
		isWebKit = (navigator.userAgent.match(/(AppleWebKit)/gi) ? true : false),
        configs = {
            displayTopicTitle: false,
            displayPageTitle: false,
            displayMenuTopicTitle: false
        }, isTouchDevice = function () {
            return isTouch;
        }, setWindowSize = function () {
            var w = $(window).width(),
                h = $(window).height();
            w = (w >= MAX_WIDTH) ? MAX_WIDTH : w;
            w = (w <= MIN_WIDTH) ? MIN_WIDTH : w;
            h = (h >= MAX_HEIGHT) ? MAX_HEIGHT : h;
            h = (h <= MIN_HEIGHT) ? MIN_HEIGHT : h;
            dftWidth = w;
            dftHeight = h;
        }, buildCourse = function (data) {
            var courseId;
            var courseTitle;
            var topic;
            var topicId;
            var topicTitle;
            var topicCount = 1;
            var page;
            var pageId;
            var pageTitle;
            var pageUrl;
            var pageCount = 1;
            var indPageCount = 0;
            $(data).find('course').each(function (c) {
                courseId = $(this).attr('id');
                courseTitle = $(this).attr("title");
                gCourse = new Course(courseTitle);
                $(this).find('topic').each(function (t) {
                    topicId = t;
                    topicTitle = $(this).attr('title');
                    topic = new Topic(topicTitle);
                    if (configs.displayMenuTopicTitle) $('#menunav div ul').append('<li class="menu-topic-header">' + topicTitle + '</li>');
                    $(this).find('page').each(function (p) {
                        pageTitle = $(this).attr('label');
                        pageUrl = $(this).attr('url');
                        topic.pages.push(new Page(pageTitle, topicTitle));
                        pages.push({
                            label: pageTitle,
                            topic: topicTitle,
                            data: pageCount,
                            url: pageUrl,
                            y: -indPageCount * dftWidth
                        });
                        $('#wrapper>div').append('<div class="page" id="page' + pageCount + '" style="width:' + dftWidth + 'px;">');
                        $('#menunav div ul').append('<li onclick="WBTApp.loadPage(' + pageCount + ', true)" id="' + pageCount + 'menunav">' + pageTitle + '</li>');
                        totalPages++;
                        pageCount++;
                        indPageCount++;
                    });
                    topicCount++;
                    gCourse.topics.push(topic);
                });
            });
            $('#content').width(totalPages * 101 + '%');
            initCMIObj();
        },         initControls = function () {
            if (isWebKit) {
                slidemap = document.getElementById("content");
                slidemap.addEventListener("webkitTransitionEnd",
                    function () {
                        if (f) {
                            transitionEnd();
                        }
                    }, true);
			}
            if (isTouchDevice()) {
                $('#frame').touchwipe({
                    wipeLeft: function () {
                        if (!window.isDragging) goRight();
                    },
                    wipeRight: function () {
                        if (!window.isDragging) goLeft();
                    },
                    preventDefaultEvents: true
                });
            } else {
                $(document).keydown(function (e) {
                    if (e.keyCode == 37) {
                        goLeft();
                        return false;
                    }
                    if (e.keyCode == 39) {
                        goRight();
                        return false;
                    }
                });
            }
            if (isiPad) {
                $("#global-ui-menu-nav-up, #global-ui-menu-nav-down").removeClass('hidden');
                $(".global-top-menu-content-scroll").css({
                    'height': 500
                });
                $("#global-ui-menu-nav-up").click(function () {
                    var currTop = $('.global-top-menu-content-scroll').scrollTop();
                    var itemH = $('.global-top-menu-content-scroll').children().first().outerHeight();
                    var items = $('.global-top-menu-content-scroll').children().length;
                    var listH = items * itemH;
                    var viewH = $('.global-top-menu-content-scroll').height();
                    var diffH = listH - viewH;
                    if (diffH > 0) {
                        if (currTop > 0) {
                            var availScroll = (viewH <= currTop) ? viewH : currTop;
                            var nextTop = currTop;
                            nextTop -= availScroll;
                            $('.global-top-menu-content-scroll').animate({
                                scrollTop: nextTop
                            }, 500);
                        }
                    }
                });
                $("#global-ui-menu-nav-down").click(function () {
                    //constants
                    var itemH = $('.global-top-menu-content-scroll').children().first().outerHeight();
                    var items = $('.global-top-menu-content-scroll').children().length;
                    var listH = items * itemH + 50;
                    var viewH = $('.global-top-menu-content-scroll').height();
                    var diffH = listH - viewH;
                    var currTop = $(".global-top-menu-content-scroll").scrollTop();
                    if (diffH > 0) {
                        var availScroll = listH - viewH - currTop;
                        var nextTop = currTop;
                        nextTop += (viewH <= availScroll) ? viewH : availScroll;
                        $('.global-top-menu-content-scroll').animate({
                            scrollTop: nextTop
                        }, 500);
                    }
                });
            }

            $('#global-ui-left').click(function () {
                if ($(this).hasClass('ui-active')) {
                    goLeft();
                }
            });
            $('#global-ui-right').click(function () {
                if ($(this).hasClass('ui-active')) {
                    goRight();
                }
            });
            $('#global-ui-menu-tab').click(function () {
                if (!hasImpediment()) {
                    if (!$(this).hasClass('on')) {
                        panelReset();
                        $('#menunav').animate({
                            left: 0
                        }, 500);
                        $('#screen').css('margin-top', 36).fadeIn().animate({
                            opacity: '0.5'
                        }, 250); //IE8 opacity fix
                        $(this).addClass('on');
                    } else {
                        panelReset();
                    }
                }
            });
            $('#global-ui-help').click(function () {
                if (!$(this).hasClass('on')) {
                    panelReset();
                    $('#help-panel').animate({
                        left: 0
                    }, 500);
                    $('#screen').css('margin-top', 36).fadeIn().animate({
                        opacity: '0.5'
                    }, 250);
                    $(this).addClass('on');
                } else {
                    panelReset();
                }
            });
            $('#global-ui-resources').click(function () {
                if (!$(this).hasClass('on')) {
                    panelReset();
                    $('#resources-panel').animate({
                        left: 0
                    }, 500);
                    $('#screen').css('margin-top', 36).fadeIn().animate({
                        opacity: '0.5'
                    }, 250);
                    $(this).addClass('on');
                } else {
                    panelReset();
                }
            });
             $('.global-cpopup-close').click(function () {
                 //trying to stop flash video externally
                if ($('html').has('.me-plugin').length){
                  $('#global-content-content').empty();
                } else {
                      $('video').each(function() {
                      
                          $(this)[0].pause();
                });
                    
                }
                $('#global-content-popup').hide();
                $('#screen').hide();
                alertOn = false;
            });
            $('.global-popup-close').click(function () {
                $('#global-alert-popup').hide();
                $('#screen').hide();
                alertOn = false;
            });
            $('#global-ui-close').click(function () {
                setValues_exitCMI();
            });
            $('#bookmark-alert-btn-ok').click(function () {
                gotoBookmark();
            });
            $('#bookmark-alert-btn-cancel').click(function () {
                hideBM();
            });
            $('#screen').click(function () {
                panelReset();
            });
            $('<div/>').load('global-alerts/global-alerts.htm', function () {
                $('#global-resources-alert').append($(this).find('.resources-alert-content'));
                $('#global-help-alert').append($(this).find('.help-alert-content'));
            });
        }, initPages = function (as, md) {
            setWindowSize();
            initControls();
            $('#frame').css({
                width: dftWidth,
                height: dftHeight
            });
            $('#wrapper').css({
                width: dftWidth,
                height: dftHeight
            });
            if (as) {
                $.extend(configs, as);
                if (md) $.extend(WBTApp.modules, md);
            }
            scoXmlUrl = configs.scoID + '/' + configs.scoID + '.xml';
            $.get(scoXmlUrl, buildCourse, 'xml').fail(function () {
                alert('Load XML Error - ' + scoXmlUrl);
            });
        }, loadPage = function (intPageNum, isMenuClicked) {
            panelReset();
            f = true;
            pageNum = isNaN(intPageNum) ? pageNum : intPageNum;
            if (configs.displayTopicTitle) $('#topic-title').html(pages[pageNum].topic);
            if (configs.displayPageTitle) $('#page-title').html(pages[pageNum].label);
            currPage = $('#page' + pageNum);
            if (!$.trim(currPage.html())) {
                $('#loading').show();
                currPage.load(pages[pageNum].url, loadComplete);
            } else {
                loadComplete();
            } if (pageNum == totalPages) {
                $('#global-ui-right').removeClass('ui-active').addClass('ui-disabled');
            } else {
                $('#global-ui-right').removeClass('ui-disabled').addClass('ui-active');
            } if (pageNum == 1) {
                $('#global-ui-left').removeClass('ui-active').addClass('ui-disabled');
            } else {
                $('#global-ui-left').removeClass('ui-disabled').addClass('ui-active');
            } if (isMenuClicked) {
                $('.global-ui-menu-button').removeClass('on');
            }
        }, loadNextPage = function () {
            var a = pageNum + 1;
            if (a < totalPages) {
                var b = $('#page' + a);
                if (!$.trim(b.html())) {
                    b.load(pages[a].url);
                }
            }
        }, loadComplete = function () {
            if (isWebKit) {
                slidemap.style.webkitTransform = 'translate(' + pages[pageNum].y + 'px, 0px)';
            } else {
                $('#wrapper>div').animate({
                    left: pages[pageNum].y
                }, 500, transitionEnd);
            }
            $('#loading').hide();
            loadNextPage();
        }, transitionEnd = function () {
            if (window["p" + (pageNum) + "_init"]) {
                window["p" + (pageNum) + "_init"].call();
            }
            if (oldPageNum != pageNum) {
                if (window["p" + (oldPageNum) + "_out"]) {
                    window["p" + (oldPageNum) + "_out"].call();
                }
            }
            f = false;
            track();
        }, track = function () {
            var a = (pageNum * 100) / totalPages;
            $('#progress > span').css('width', a + '%');
            $('#pagecount').text(pageNum + ' of ' + totalPages);
            $('.global-top-menu-content-scroll li#' + pageNum + 'menunav').addClass('completed');
            sendData();
        }, showBM = function () {
            $('#global-bookmark-alert, #screen').show();
            alertOn = true;
        }, hideBM = function () {
            $('#global-bookmark-alert, #screen').hide();
            alertOn = false;
            loadPage(1);
        }, initwithCMI = function () {
            doLMSInitialize();
            setBoookmarkToCourse();
            setStatusToCourse();
            setTrackingToCourse();
            init_tracking_fcn();
            validateBookmark();
            validateTracking();
            get_bm_fcn();
        }, initCMIObj = function () {
            getAPI(function (a) {
                api = a;
                initwithCMI();
            });
        }, imgPreload = function () {
            var g = [],
                j = g.length,
                args = imgPreload.arguments;
            for (var i = 0; i < args.length; i++) {
                g[j] = new Image();
                g[j++].src = args[i];
            }
        }, resizeFrame = function (p) {
            $(p).find('.page').css({
                width: dftWidth,
                height: dftHeight
            });
        }, goLeft = function () {
            if (pageNum > 0 && !f && !hasImpediment()) {
                oldPageNum = pageNum;
                pageNum -= 1;
                loadPage();
            }
        }, goRight = function () {
            if (pageNum < totalPages && !f && !hasImpediment()) {
                oldPageNum = pageNum;
                pageNum += 1;
                loadPage();
            }
        }, showCPop = function (p) {
            if (p) {
                alertOn = true;
                $('#screen').fadeIn().animate({
                    opacity: '0.5'
                }, 250);
                $('#global-content-content').empty().html(p);
            }
            $('#global-content-popup').show();
        }, showAlert = function (p) {
            if (p) {
                alertOn = true;
                $('#screen').fadeIn().animate({
                    opacity: '0.5'
                }, 250);
                $('#global-alert-content').empty().html(p);
            }
            $('#global-alert-popup').show();
        }, setImpediment = function (a, b) {
            impedimentMessage = (b) ? b : impedimentMessage;
            impediment = a;
            if (impediment == IMPEDIMENT_FULL) {
                if ($('#global-ui-left').hasClass('ui-active')) {
                    $('#global-ui-left').addClass('ui-impediment');
                }
                if ($('#global-ui-right').hasClass('ui-active')) {
                    $('#global-ui-right').addClass('ui-impediment');
                }
                $('.global-ui-menu-button').removeClass('ui-active');
            }
        }, setImpedimentComplete = function () {
            impediment = 0;
            activateBackNext();
        }, hasImpediment = function () {
            if (impediment) {
                if (impediment == IMPEDIMENT_PARTIAL) {
                    showAlert(impedimentMessage);
                    $('#screen').fadeIn().animate({
                        opacity: '0.5'
                    }, 250);
                    impediment = 0;
                    return true;
                } else if (impediment == IMPEDIMENT_FULL) {
                    showAlert(impedimentMessage);
                    $('#screen').fadeIn().animate({
                        opacity: '0.5'
                    }, 250);
                    return true;
                }
            }
            return false;
        }, activateBackNext = function () {
            $('#global-ui-left').removeClass('ui-impediment');
            $('#global-ui-right').removeClass('ui-impediment');
            $('.global-ui-menu-button').addClass('ui-active');
        }, lockMovement = function (t) {
            f = t;
        }, init_tracking_fcn = function () {
            if (tracking == "") {
                for (var a = 0; a < totalPages; a++) {
                    var b = ",";
                    tracking += b + "0";
                }
            }
        }, updateTracking = function (pnum) {
            var pages = tracking.split(',');
            for (var p in pages) {
                if (p == pnum) {
                    pages[p] = 1;
                    break;
                }
            }
            tracking = pages.toString();
        }, sendData = function () {
            updateTracking(pageNum);
            //handles the iPad Safari webkitTransitionEnd bug
						bookmark = (pageNum == 1 && isWebKit) ? bookmark : pageNum.toString();
            if (tracking.indexOf(0) == -1) {
                user_status = "completed";
            }
            setBookmarkFromCourse(bookmark);
            setStatusFromCourse(user_status);
            setTrackingFromCourse(tracking);
            if (gCourse.isLastTopicPage(pageNum)) {
                doLMSCommit();
            }
            if (pageNum == totalPages) {
                done_eval_fcn();
            }
        }, get_bm_fcn = function () {
            if (bookmark != "" && validTracking) {
                showBM();
            } else {
                loadPage(1);
            }
        }, validateBookmark = function () {
            var n = parseInt(bookmark);
            if (isNaN(n) || n < 1 || n > totalPages) {
                bookmark = "";
            }
        }, validateTracking = function () {
            var tr = tracking.split(',');
            if ((tr.length - 1) != totalPages) {
                init_tracking_fcn();
                validTracking = false;
                return;
            } else {
                var n;
                for (var i = 0; i < tr.length; i++) {
                    n = tr[i];
                    if (isNaN(n) || n < 0 || n > 1) {
                        validTracking = false;
                        init_tracking_fcn();
                        return;
                    }
                }
            }
            parse_tracking_fcn();
        }, gotoBookmark = function () {
            loadPage(parseInt(bookmark));
            $('#global-bookmark-alert, #screen').hide();
            alertOn = false;
        }, parse_tracking_fcn = function () {
            var a = [];
            a = tracking.split(",");
            for (var c = 0; c < a.length; c++) {
                if (a[c] != "0") {
                    $('.global-top-menu-content-scroll li#' + (c) + 'menunav').addClass('completed');
                }
            }
        },isPageTracked = function () {
            var a = pageNum;
            
        }, done_eval_fcn = function () {
            if (user_status != "completed") {
                showAlert("You have reached the last page but have not yet completed this module.<br /><br />Use the drop-down topic menu in the upper left to see which pages you have not completed. Click on a topic to jump right to that page. <br /><br />If you choose to exit this module, your progress will be saved for when you return.");
                alertOn = true;
                $('#screen').fadeIn().animate({
                    opacity: '0.5'
                }, 250);
            }
        }, Course = function (title) {
            this.title = title;
            this.topics = [];
            this.isLastTopicPage = function (pageNum) {
                var found = false;
                var lastPages = [];
                var pagecount = 1;
                for (var t = 0; t < this.topics.length; t++) {
                    pagecount += this.topics[t].pages.length;
                    lastPages.push(pagecount);
                    if (pageNum == pagecount) {
                        found = true;
                        break;
                    }
                }
                return found;
            };
        }, Topic = function (title) {
            this.title = title;
            this.pages = [];
        }, Page = function (pt, tt) {
            this.title = pt;
            this.topicTitle = tt;
        }, panelReset = function () {
            if (!alertOn) {
                $('.ui-active').removeClass('on');
                $('#screen').css('margin-top', 0).hide();
                $('.menu-slideout').animate({
                    left: -320
                }, 500);
            }
        };
    WBTApp = {
        goLeft: goLeft,
        goRight: goRight,
        showBM: showBM,
        hideBM: hideBM,
        showCPop: showCPop,
        showAlert: showAlert,
        loadPage: loadPage,
        setImpediment: setImpediment,
        setImpedimentComplete: setImpedimentComplete,
        hasImpediment: hasImpediment,
        imgPreload: imgPreload,
        lockMovement: lockMovement,
        isTouchDevice: isTouchDevice,
        init: initPages,
        modules: {}
    };
}(jQuery));
window.isDragging=false;
