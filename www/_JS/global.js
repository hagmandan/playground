/// <reference path="~/layouts/Sublayouts/Global/Destination Page/DestinationPageHero.ascx" />
/// <reference path="~/layouts/Default Layout.aspx" />
/// <reference path="~/js/lib/jquery-1.8.3.js" />
/// <reference path="~/js/lib/jwplayer/jwplayer.js" />

// make it safe to use console.log always (From HTML5 Boilerplate)
(function (a) { function b() { } for (var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !!(d = c.pop()); ) { a[d] = a[d] || b; } })
(function () { try { console.log(); return window.console; } catch (a) { return (window.console = {}); } } ());

/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
* http://benalman.com/
* Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL *
* Modified at GCC by KAW: Added $.subscribeOnce() to wrap $.fn.one() */
(function ($) {
    var o = $('<b/>');
    $.subscribe = function () {
        o.on.apply(o, arguments);
    };
    $.subscribeOnce = function () {
        o.one.apply(o, arguments);
    };
    $.unsubscribe = function () {
        o.off.apply(o, arguments);
    };
    $.publish = function () {
        o.trigger.apply(o, arguments);
    };
} (jQuery));

// Get our global object
var gcc = gcc || {};



/* ----------------------------------------------------------------------------
 BEGIN extending JQuery
 */
$j.extend({
    exists: function(obj) {
        return obj.length > 0 ? true : false;
    },
    reverse: function() {
        return this.pushStack(this.get().reverse(), arguments);
    },
    first: function() {
        return this.pushStack(this.get(0));
    },
    sort: function(fnComparable) {
        return this.pushStack(this.get().sort(fnComparable), arguments);
    }
});
// A convenience function for parsing string namespaces and
// automatically generating nested namespaces (this function
// courtesy of http://addyosmani.com/blog/essential-js-namespacing/)
gcc.extend = function(ns, ns_string) {
    var parts = ns_string.split('.'),
        parent = ns,
        pl,
        i;
    // Check to see if the first element in our namespace string
    // is 'gcc', which is the global namespace for our website
    if (parts[0] == "gcc") {
        parts = parts.slice(1);
    }
    pl = parts.length;
    for (i = 0; i < pl; i++) {
        //create a property if it doesnt exist
        if (typeof parent[parts[i]] == 'undefined') {
            parent[parts[i]] = { };
        }
        parent = parent[parts[i]];
    }
    return parent;
};
gcc.extend(gcc, 'gcc.utils');
/**
 * Function to return a specific GCC brand string based on an input tripType
 * @param {string} tripType The name of the trip type item assigned to the trip within SiteCore
 * @returns {string} 'gccl', 'gct' or 'oat', depending on input
 */
gcc.utils.getBrand = function (tripType) {
    var brand = 'unknown';
    switch (tripType) {
        case 'River Cruise':
        case 'Small Ship Cruise Tour':
        case 'Land Tour':
            brand = 'gccl';
            break;
        case 'Small Ship Adventure':
        case 'Land Adventure':
            brand = 'oat';
            break;
    }
    return brand;
};




$j.fn.mousehold = function(timeout, f) {
    if (timeout && typeof timeout == 'function') {
        f = timeout;
        timeout = 100;
    }
    if (f && typeof f == 'function') {
        var timer = 0;
        var fireStep = 0;
        return this.each(function() {
            $j(this).mousedown(function() {
                fireStep = 1;
                var ctr = 0;
                var t = this;
                timer = setInterval(function() {
                    ctr++;
                    f.call(t, ctr);
                    fireStep = 2;
                }, timeout);
            });

            var clearMouseHold = function() {
                clearInterval(timer);
                if (fireStep == 1) f.call(this, 1);
                fireStep = 0;
            };

            $j(this).mouseout(clearMouseHold);
            $j(this).mouseup(clearMouseHold);
        });
    }
};
/*
 END extending JQuery
 ---------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 BEGIN Configuring jQuery Plugins (simplemodal.js must be loaded)
 */
if ($j.modal) {
    $j.extend($j.modal.defaults, {
        closeHTML: '<div class="simplemodal-close-pad"><a href="#" class="simplemodal-close">Close</a></div>',
        opacity: 70,
        overlayClose: true
    });
}
/*
 END Configuring jQuery Plugins
 ---------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 BEGIN Set global variables
 */
// Leave undefined, value is defined at the page level
var pageGuidTracking;

// Custom scroll bar (virtual tour) variables
var scrollBarPtr = '';
if ($j.exists($j('#modal_wrap .scrollThumbs'))) {
    scrollBarPtr = $j('#modal_wrap .scrollThumbs');
}
var scrollTopNum = 0;
var scrollLimit = 0;

/*
 END Set global variables
 */

/* ----------------------
Omniture Analytics 
-------------------------
*/

function publishTpc1minEvent(pageSource) {
    //console.log('publishing:' + pageSource + ' ' + new Date());
    window.parent.jQuery.publish('/gcc/tpc/event/oneMinBrowsing/', [pageSource]);    
}

function publishTpc1minEventAndClearSessionTime(pageSource, sessionKey) {
    //console.log('publish and clear:' + pageSource + ' ' + new Date());
    publishTpc1minEvent(pageSource); 
    
    //clear session time
    SaveBrowsingTimeForTpcCollection(sessionKey, '0');
}

function SaveBrowsingTimeForTpcCollection(sessionKey, elapsedTime) {
    var urlMethod = '/app_webservices/public/services.asmx/SetBrowsingTime';
    var jsonData = JSON.stringify({ 'sessionkey': sessionKey, 'time': elapsedTime });
    $j.ajax({
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        url: urlMethod,
        data: jsonData,
        dataType: 'json',
        success: function(xhr) {

        },
        error: function(xhr) {

        }
    });
}

function SaveBrowseTimeOnUnload() {

    //console.log('SaveBrowseTime -------------');

    var endTime = new Date();

    if (gcc.browseproduct !== undefined) {
        var prodpageElapsedTime = endTime - gcc.browseproduct.productpagestarttime;
        
        //console.log('leaving page - time browsed on product page:' + prodpageElapsedTime);
        //console.log('leaving page - product key:' + gcc.browseproduct.productpagekey);

        SaveBrowsingTimeForTpcCollection(gcc.browseproduct.productpagekey, prodpageElapsedTime);
    }

    if (gcc.browsedandp !== undefined) {
        var dpElapsedTime = endTime - gcc.browsedandp.dppagestarttime;

        //console.log('leaving page - time browsed on dp page:' + dpElapsedTime);
        //console.log('leaving page - dp key:' + gcc.browsedandp.dppagekey);

        SaveBrowsingTimeForTpcCollection(gcc.browsedandp.dppagekey, dpElapsedTime);
    }
};

/*---------------------------------------------------------------------------- */

// AW 6/18/12: TopNav fourth-level menu removal moved to /gcc/nav/topnav.js

// -------------------------------------------------------------------------
// Begin "initialize analtyics push"
function pushAnalytics(where, linktext, url, ptg) {
    // AW: Encoded linktext value for cookie use, and groomed data to remove characters (line return, multiple spaces) that could result in invalid cookies
    // AW: TODO: Refactor to use jQuery.cookie
    linktext = encodeURIComponent(linktext).replace(/%0A/g, '');
    document.cookie = "GccPageTracking=" + encodeURIComponent(where) + "|" + encodeURIComponent(linktext) + "|" + encodeURIComponent(url) + "|" + encodeURIComponent(ptg) + "; path=/"; //JH: added "path=/" to setting the cookie to avoid multiple cookies being set up with the same name
}
// End "initialize analtyics push"

// -------------------------------------------------------------------------
// Begin "initialize analytics binding"
function analyticDump() {
    try {
        var _this,
            _option1,
            _option2,
            _option3,
            _trackValue,
            _recordHitTracking,
            _trackByAjax,
            _eventName,
            _data,
            _text;

        var fireEvent = function () {
            pushAnalytics(_option1, _option2, _option3, _trackValue);
        };

        var recordHit = function () {
            if (_recordHitTracking.EventName !== '') {
                RecordHit(_recordHitTracking, _trackByAjax);
            }
        };

        var attrCheck = function () {
            return _this.attr("href") != "#" ? true : false;
        };

        return {
            attachAnchor: function (elm, opt1, opt3, trackVal) {
                _this = $j(elm);
                _option1 = opt1;
                _option3 = opt3;
                _trackValue = trackVal;
                _this.click(function () {
                    _option2 = $j(this).text();
                    if (attrCheck() === true) fireEvent();
                });
            },
            attachPush: function (opt1, opt2, opt3, trackVal) {
                _option1 = opt1;
                _option2 = opt2;
                _option3 = opt3;
                _trackValue = trackVal;
                fireEvent();
            },
            attachElementRecordHit: function (elmAncestor, elm, clientEvent, elmRecordHitTracking, trackByAjax) {
                $j(elmAncestor).delegate(
                    elm,
                    clientEvent,
                    function (e) {
                        var _this = $j(this);

                        e.preventDefault();
                        _trackByAjax = trackByAjax;

                        var eventName = '';

                        if (typeof (elmRecordHitTracking.eventAttribute) != 'undefined' && elmRecordHitTracking.eventAttribute != null) {
                            eventName = _this.attr(elmRecordHitTracking.eventAttribute);
                        }
                        else if (typeof (elmRecordHitTracking.eventName) != 'undefined' && elmRecordHitTracking.eventName != null) {
                            eventName = elmRecordHitTracking.eventName;
                        }

                        _recordHitTracking = {
                            EventName: eventName,
                            Data: typeof (elmRecordHitTracking.dataAttribute) == 'undefined' || elmRecordHitTracking.dataAttribute == null ? '' : _this.attr(elmRecordHitTracking.dataAttribute),
                            Text: typeof (elmRecordHitTracking.textAttribute) == 'undefined' || elmRecordHitTracking.textAttribute == null ? '' : _this.attr(elmRecordHitTracking.textAttribute)
                        };

                        recordHit();
                    }
                );
            }
        };
    }
    catch (e) {
        // fail silently
    }
}
// End "initialize analtyics binding"

// -------------------------------------------------------------------------
// Begin "initialize font resize"
function fontResize() {
    try {
        //Public vars
        var _cookieVal;

        //Private vars
        var _target = $j("#right");
        var _targetText = $j(".rightCol .destination_content");
        var _icon = $j('#fontsize-print-panel div.icon');
        var _text = $j('dd.fontresize a');

        var getCookie = function() {
            return $j.cookie('font-size');
        };

        var setCookie = function(size) {
            $j.cookie("font-size", size, { expires: 999999 });
        };

        var reset = function() {
            _icon.each(function() {
                var _this = $j(this);
                var val = _this.get(0).style.backgroundPosition.split(' ');
                _this.css('background-position', val[0] + ' 0px');
            });
        };

        var setStyle = function() {
            //Reset print panel box sprites
            $j('div.normal').css('background-position', '0px -19px');
            $j('div.large').css('background-position', '-19px 0px');
            $j('div.larger').css('background-position', '-38px 0px');
        };

        var resize = function (obj, cookieVal) {
            var _this,
                config = '',
                position;
            reset();
            if (obj != null) {
                _this = $j(obj);
            }
            else {
                _this = $j('#fontsize-print-panel .' + cookieVal);
            }
            if (_this.hasClass('normal')) {
                config = '0,-19,normal,100%';
            } else if (_this.hasClass('large')) {
                config = '-19,-19,large,120%';
            } else if (_this.hasClass('larger')) {
                config = '-38,-19,larger,140%';
            }
            config = config.split(',');
            position = config[0] + 'px ' + config[1] + 'px';
            _this.css('background-position', position);
            _target.css('font-size', config[3]);
            setCookie(config[2]);
        };

        var resizeText = function (obj, cookieVal) {
            var _this,
                config = '';
            if (obj != null) {
                _this = $j(obj);
            }
            else {
                _this = $j('dd.fontresize .' + cookieVal);
            }
            if (_this.hasClass('normal')) {
                config = 'normal,100%';
            } else if (_this.hasClass('large')) {
                config = 'large,120%';
            } else if (_this.hasClass('larger')) {
                config = 'larger,140%';
            }
            _this.siblings('a').removeClass('selected');
            _this.addClass('selected');
            config = config.split(',');
            _targetText.css('font-size', config[1]);
            setCookie(config[0]);
        };

        return {
            clickResize: function() {
                _icon.click(function() {
                    reset();
                    resize(this);
                });
            },
            autoResize: function() {
                setStyle();
                _cookieVal = getCookie();
                if (_cookieVal != null && _cookieVal != 'normal') {
                    resize(null, _cookieVal);
                }
            },
            textAutoResize: function() {
                _cookieVal = getCookie();
                if (_cookieVal != null && _cookieVal != 'normal') {
                    resizeText(null, _cookieVal);
                }
            },
            textResize: function() {
                _cookieVal = getCookie();
                _text.click(function(e) {
                    e.preventDefault();
                    resizeText(this);
                });
            }
        };
    } catch(e) {
        // fail silently
    }
}
// End "initialize font resize"


// -------------------------------------------------------------------------
// Begin "get/set cookie functions"
//Temp fix while I update all areas that reference the forked cookie code.
function getCookie(name) {
    return $j.cookie(name);
}
//Temp fix while I update all areas that reference the forked cookie code.
function setCookie(name, value, val1, val2, val3, val4) {
    return $j.cookie(name, value, {expires: val1, path: val2, domain: val3, secure: val4});
}
function setSessionCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}
function getSessionCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
// End "get/set cookie functions"

// -------------------------------------------------------------------------
// Begin "print window"
function printWindow(obj) {
    $j(obj).click(function(e) {
        e.preventDefault();
        window.print();
    });
}
// End "print window"

// KAW 10-19: Moved to gcc/trip.js: Virtual Tour Load/Close

// -------------------------------------------------------------------------
// Begin "temporary global logout"
function logout() {
    var thisurl = window.location.toString();
    var serviceurlhere = "/app_webservices/public/services.asmx/Logout";
//    if (thisurl.match("oat") != null) {
//        serviceurlhere = "http://www.oattravel.com/app_webservices/public/services.asmx/Logout";
//    }
//    else { serviceurlhere = "http://www.gct.com/app_webservices/public/services.asmx/Logout"; }
    $j.ajax({
        type: "POST",
        url: serviceurlhere,
        //url: "/App_Helpers/Logout.ashx",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(xhr) {
            window.location.href = thisurl;
        },
        error: function(xhr) {
            //alert(xhr.responseText);
        }
    });
}
// End "temporary global logout"

// -------------------------------------------------------------------------
// Begin "close modal"
function closeWindow() {
    $j.modal.close();
}
// End "close modal"

// -------------------------------------------------------------------------
// Begin "initialize Send To A Friend modal functionality"
function iniSendToFriend() {
    var self = this;
    this._form = 'form[name=send-to-friend-form]:last';

    this._submit = function() {
        self._reset();
        var form = $j(self._form);
        $j.post(form.attr('action'), form.serialize(), self._callback, 'json');
        return false;
    };

    this._callback = function(json, status, request) {
        $j('.final-message').remove();
        if (json.status == 'error') {
            $j('div.modal-center h3').hide();
            $j('div.modal-center div.fsection').hide();
            $j('.stf_form_wrap').addClass('confirm');
            $j('div.modal-center .stf_form_wrap .stf_form').append('<div class="final-message">' + json.errors.message + '</div>');
            return false;
        }
        if (json.status == 'failed') {
            for (var key in json.errors) {
                $j(self._form + ' #' + key).addClass('field-error');
                $j(self._form + ' .fsection > div.' + key).html(json.errors[key]);
            }
            return false;
        }
        self._show_success();
        return false;
    };

    this._show_success = function() {
        // runs after a successful submit of the form
        $j('div.modal-center h3').hide();
        $j('div.modal-center div.fsection').hide();
        $j('.stf_form_wrap').addClass('confirm');
        $j('div.modal-center .stf_form_wrap .stf_form').append('<div class="final-message">Thank you! Your page has been sent to your friend.</div>');
    };

    this._reset = function() {
        // clears errors or success message
        $j('div.modal-center h3').show();
        $j('div.modal-center div.fsection').show();
        $j('.stf_form_wrap').removeClass('confirm');
        $j('div.final-message').remove();

        $j(self._form + ' input').removeClass('field-error');
        $j(self._form + ' textarea').removeClass('field-error');
        $j(self._form + ' .fsection > div.text-error').html('');
    };

    var sendToFriendModal = function(obj) {
        $j(obj).click(function(e) {
            e.preventDefault();
            var _this = $j(this);
            if (_this.attr('postcardMode') != null) $j("input[name=txtPostcardMode]").val(_this.attr('postcardMode'));
            if (_this.attr('postcardPageID') != null) $j("input[name=txtPostcardPageID]").val(_this.attr('postcardPageID'));
            if (_this.attr('referingPageID') != null) $j("input[name=txtReferingPageID]").val(_this.attr('referingPageID'));

            $j("<div id='modal-content-message' class='modal'></div>").modal({
                overlayId: 'modal-overlay',
                containerId: 'modal_wrap',
                minWidth: 780,
                maxWidth: 780,
                minHeight: 487,
                onShow: function() {
                    /* do a quick browser check JUST for IE */
                    if ($j.browser.msie) { // Is this a version of IE?
                        $j(".modal").addClass("IE");
                        $j(".modal").addClass("IE" + jQuery.browser.version.substring(0, 1));
                    }
                    var actionURL = '/layouts/SendToFriend.aspx';
                    if (document.location.protocol == 'https:') actionURL = '/Secured/SendToFriend.aspx';

                    //$j('#simplemodal-container').css("margin-top", "15px");
                    $j("#modal-content-message").append("<form name='send-to-friend-form' action='" + actionURL + "'>" + $j(".send-to-friend").html() + "</form>");
                    var stf = new iniSendToFriend();
                    stf.bind_callbacks();
                }
            });
        });
    };

    return {
        autoPopup: function() {
            $j.modal.close();
            $j('.send-to-friend-btn').click();
        },
        bind_callbacks: function() {
            self._reset();
            $j(self._form).submit(self._submit);
        },
        ini_sendToFriendModal: function(obj) {
            sendToFriendModal(obj);
        }
    };
}
// End "initialize Send To A Friend modal functionality"

// -------------------------------------------------------------------------
// Begin "initialize generic modals"
function iniGenericModals() {
    var templateOne = function(obj, parent) {
        $j(obj).live("click", function(e) {
            e.preventDefault();
            var self = this;
            $j("<div id='modal-container-inner'>" + $j(self).parents(parent).next().html() + "</div>").modal({
                overlayId: 'modal-overlay',
                containerId: 'modal-container-trip',
                closeHTML: '<div class="close"><a href="#" class="simplemodal-close">Close</a></div>',
                minWidth: 516,
                minHeight: 374
            });
        });
    };
    var templateTwo = function(obj) {
        $j(obj).click(function(e) {
            e.preventDefault();
            $j("<div id='modal-content-message'></div>").modal({
                overlayId: 'modal-overlay',
                containerId: 'free-gift-modal',
                closeHTML: '<div class="close sendfriend-close"><a href="#" class="simplemodal-close">Close</a></div>',
                minWidth: 516,
                minHeight: 374,
                onShow: function() {
                    $j('#simplemodal-container').css("margin-top", "15px");
                    $j("#modal-content-message").append("<form name='send-to-friend-form' action='/layouts/SendToFriend.aspx'>" + $j(".send-to-friend").html() + "<script>function Redirect() { " + $j(".online-store-window").text() + " $j('.simplemodal-close').click(); }</script></form>");
                }
            });
        });
    };
    //Not sure what the goal with this modal was, so leaving it as a one-off.
    var homePageModal = function (cookieName, modalItemId, contextItemId) {
        $j("#modal-content").modal({
            closeHTML: '<div class="close"><a href="#" class="simplemodal-close">Close</a></div>',
            minWidth: 740,
            minHeight: 374,
            onShow: function (dialog) {
                $j('iframe', dialog.data).attr('src', function() {
                    return $j(this).data('src');
                });
                HomePageModalServiceHandler('shown|' + cookieName + '|' + modalItemId + '|' + contextItemId);
            },
            onClose: function (dialog) {
                $j('iframe', dialog.data).attr('src', '');
                HomePageModalServiceHandler('closed|' + cookieName + '|' + modalItemId + '|' + contextItemId);
                $j.modal.close();
            }
        });
    };

    var welcomeModal = function (cookieName, modalItemId, contextItemId) {
        $j("#modal-content").modal({
            minWidth: 480,
            onShow: function (dialog) {
                $j('iframe', dialog.data).attr('src', function() {
                    return $j(this).data('src');
                });
                $j.publish('/gcc/homepage/modal/show');
                HomePageModalServiceHandler('shown|' + cookieName + '|' + modalItemId + '|' + contextItemId);
            },
            onClose: function (dialog) {
                $j('iframe', dialog.data).attr('src', '');
                HomePageModalServiceHandler('closed|' + cookieName + '|' + modalItemId + '|' + contextItemId);
                $j.modal.close();
            }
        });
    };

    return {
        modalTemplateOne: function (obj, parent) {
            templateOne(obj, parent);
        },
        modalTemplateTwo: function (obj) {
            templateTwo(obj);
        },
        homePageModal: function (cookieName, modalItemId, contextItemId) {
            homePageModal(cookieName, modalItemId, contextItemId);
        },
        welcomeModal: function (cookieName, modalItemId, contextItemId) {
            welcomeModal(cookieName, modalItemId, contextItemId);
        }
    };
}
// End "initialize generic modals"

// -------------------------------------------------------------------------
// Begin "homepage carousel handler"
function HomePageCarouselClickServiceHandler(arg) {
    $j.ajax({
        type: "POST",
        url: "/app_webservices/public/services.asmx/CarouselAnalyticDump",
        data: JSON.stringify({ 'arguments': arg }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(xhr) {

        },
        error: function(xhr) {

        }
    });
}
// End "homepage carousel handler"

// -------------------------------------------------------------------------
// Begin "record hit handler"
function RecordHitServiceHandler(eventName, eventKey, text, data, integer, item, isAsynchronousRequest) {
    if (typeof isAsynchronousRequest == 'undefined') {
        isAsynchronousRequest = true;
    }

    $j.ajax({
        async: isAsynchronousRequest,
        type: "POST",
        url: "/app_webservices/public/services.asmx/RecordEvent",
        data: JSON.stringify({ 'eventName':eventName, 'eventKey':eventKey, 'text':text, 'data':data, 'integer':integer, 'item':item }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (xhr) {

        },
        error: function (xhr) {

        }
    });
}
// End "record hit handler"

// -------------------------------------------------------------------------
// Begin "homepage modal handler"
function HomePageModalServiceHandler(arg) {
    $j.ajax({
        type: "POST",
        url: "/app_webservices/public/services.asmx/HomepageModalAnalyticDump",
        data: JSON.stringify({ 'arguments': arg }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(xhr) {

        },
        error: function(xhr) {

        }
    });
}
// End "homepage modal handler"

// KAW 10-19: Moved to gcc/trip.js: Modal service handler

// -------------------------------------------------------------------------
// Begin "initialize report abuse handler"
function ReportAbuseHandler(arg) {
    var str;
    var answer = window.confirm("Are you sure you want to report this post as abusive?");
    if (answer) {
        window.alert("Thank you for reporting this post.");
        str = $j(arg).attr('href') + "?abuse=" + $j(arg).attr('id');
        window.location = str;
    }
}
// End "initialize report abuse handler"

// -------------------------------------------------------------------------
// Begin "hide Ajax blanket"
function hideAjaxBlanket() {
    $j('#ajax-loading-container').hide();
}
// End "hide Ajax blanket"

// -------------------------------------------------------------------------
// Begin "show Ajax blanket"
function showAjaxBlanket() {
    $j('#ajax-loading-container, #ajax-blanket').show();
}
// End "show Ajax blanket"

// -------------------------------------------------------------------------
// Begin "displaying overlay for Captcha for reporting abuse"
/* NOTE: this may be obsolete now */
function showModal(e, messageID, hiddenTargetField) {
    e = e || window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

    var hiddenMessageID = document.getElementById(hiddenTargetField);
    if (hiddenMessageID != null)
        hiddenMessageID.value = messageID;

    $j("#modal-content").modal({
        overlayId: 'modal-overlay',
        containerId: 'modal-container',
        closeHTML: '<div class="close"><a href="#" class="simplemodal-close">Close</a></div>',
        minWidth: 200,
        minHeight: 100
    });

    return false;
}
function checkCaptcha(confirmText, inputHidden) {
    var textField = document.getElementById(confirmText);
    if (textField == null) {
        alert("Sorry, your report can not be sent at this time.");
        return false;
    }
    var userInputHidden = document.getElementById(inputHidden);
    if (userInputHidden == null) {
        alert("Sorry, your report can not be sent at this time.");
        return false;
    }
    userInputHidden.value = textField.value;
    var captchaString = $j.cookie("reportAbuseRandom");

    if (captchaString == textField.value) {
        document.getElementById("main_0_forum_0_forum_ctl01_ReportAbuse").style.display = "none";
        return true;
    }
    else {
        alert("Characters do not match, try again!");
        return false;
    }
}
// End "displaying overlay for Captcha for reporting abuse"

// -------------------------------------------------------------------------
// Begin "get and parse querystring parameters"
function getUrlVars() {
    var map = {},
        pattern = "[?&]+([^=&]+)=([^&]*)",
        regex = new RegExp(pattern, "gi"),
        parts = window.location.href.replace(regex, function(m, key, value) {
            map[key] = value;
        });
    return map;
}
// End "get and parse querystring parameters"

// KAW 10-19: Moved to gcc/trip.js: Destination Page initialization functions, GBP slider ini functions

// -------------------------------------------------------------------------
// Begin "Initializing summary action links"
function iniSummaryActionLinks(target, threshold) {
    var top = $j(target).offset().top - parseFloat($j(target).css('marginTop').replace(/auto/, 0));
    var stopperTop = $j(threshold).offset().top - 25 - $j(target).height();
    $j(window).scroll(function (event) {
        var thresholdHeight = $j(threshold).height();

        // what the y position of the scroll is
        var y = $j(this).scrollTop();

        if ((y + 200) >= top) {
            $j(target).addClass('fixed');
            if ((y + 200) >= stopperTop) {
                $j(target).removeClass('fixed').addClass('fixed_bottom');
            } else {
                $j(target).removeClass('fixed_bottom');
            }
        } else {
            $j(target).removeClass('fixed');
        }
    });
}
// End "Initializing summary action links"

// -------------------------------------------------------------------------
// Begin "$ and % conversion functions"
function convertDollars(val) {
    if (val.indexOf('$') != -1) { // if the $ exists in the number
//console.log('dollars!');
        if (val.indexOf(',') != -1) { // if the number is large enough and has a comma
            val = val.substring(0, val.indexOf(',')) + val.substring(val.indexOf(',') + 1, val.length);
            return parseFloat(val.substring(1, val.length));
        } else {
//console.log("val: "+val, val.substring(1, val.length));
            return parseFloat(val.substring(1, val.length));
        }
    } else {
        return parseFloat(val);
    }
}
function convertPercent(val) {
    if (val.indexOf('%') != -1) {
        return parseFloat(val.substring(0, val.length - 1));
    } else {
        return parseFloat(val);
    }
}
// End "$ and % conversion functions"

// -------------------------------------------------------------------------
// Begin "initialize request dropdown select"
function iniRequestSelect(target, formItemClasses, formItemWrapper) {
    var targetClasses = formItemClasses.replace(" ", "").split(",");

    //initial selected item sets defaults
    jQuery(target).each(function() {
        var curForm = jQuery(target).find(':selected').attr('rel');

        for (var i = 0, max = targetClasses.length; i < max; i++) {
            if (curForm == targetClasses[i]) {
                jQuery(formItemWrapper + ":not(.standard_field)").hide();
                jQuery("." + curForm).show();
                jQuery('.simplemodal-container').height(jQuery('.request_call_wrap').height() + 15);
                return;
            } else if (jQuery(target).find(':selected').index() === 0) {
                jQuery(formItemWrapper + ":not(.standard_field)").hide();
            }
        }
    });
    //reset items on selection change
    jQuery(target).live('change', function() {
        var curForm = jQuery(target).find(':selected').attr('rel');

        for (var i = 0, max = targetClasses.length; i < max; i++) {
            if (curForm == targetClasses[i]) {
                jQuery(formItemWrapper + ":not(.standard_field)").hide();
                jQuery("." + curForm).show();
                jQuery('.simplemodal-container').height(jQuery('.request_call_wrap').height() + 15);
                return;
            } else if (jQuery(target).find(':selected').index() === 0) {
                jQuery(formItemWrapper + ":not(.standard_field)").hide();
            }
        }
    });
}
// End "initialize request dropdown select"

// -------------------------------------------------------------------------
// Begin "Get callout GUID function"
function getCalloutGuid(element) {
    var calloutParent = $j(element).closest(".left_callout");
    if (calloutParent.length === 0) {
        return "";
    }

    var calloutGuidElement = calloutParent.children()[0];
    if (typeof calloutGuidElement == 'undefined') {
        return "";
    }

    var calloutGuidRaw = $j(calloutGuidElement).attr('name');
    if (typeof calloutGuidRaw == 'undefined') {
        return "";
    }

    var calloutGuid = calloutGuidRaw.split('item-')[1];
    if (typeof calloutGuid == 'undefined') {
        return "";
    }
    else {
        return "{" + calloutGuid + "}";
    }
}

// End "Get callout GUID function"

/*******************************   END NEW FUNCTIONS  *************************************/
/*
 END functions
 ---------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------
 BEGIN jQuery onload script
 */
$j(document).ready(function ($) {

    $j('input[type="text"], textarea').blur(function () {
        var txt = $j(this);
        txt.val($j.trim(txt.val()));
    });

    // Report abuse link
    $j('a.abuse').bind('click', function (e) {
        e.preventDefault();
        ReportAbuseHandler($j(this));
    });

    //Search redirect code
    $j('#goBtn').click(function (e) {
        e.preventDefault();
        if ($j('.header_search_input').val() === "" || $j('.header_search_input').val() === $j('.header_search_input').attr('title')) {
            $j('.header_search_input').addClass('err_text');
            return false;
        } else {
            $j.cookie("keyword_query", $j('#searchBox').val(), { expires: 365, path: '/' });
            window.location = "/search/keyword.aspx";
        }
    });
    $j('#searchBox').keypress(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $j('#goBtn').click();
        }
    });

    //Kickoff font resize tool. Try auto-resize then allow normal click resizing.
    if ($j.exists($j('#fontsize-print-panel'))) {
        fontResize().autoResize();
        fontResize().clickResize();
        printWindow('#fontsize-print-panel div.print');
    }

    // New Destinations Pages font-resize call
    if ($j.exists($j('dd.fontresize'))) {
        fontResize().textAutoResize();
        fontResize().textResize();
        printWindow('a.print');
    }

    //Location Dropdown
    $j('.url-selector').change(function () {
        window.location = $j(this).val();
    });

    //Init send to a friend popup.
    if (typeof (autoPopup) != 'undefined' && autoPopup == 'true') {
        iniSendToFriend().autoPopup();
    }

    //This javascript puts a class on all radio buttons so they can be styled
    $j('input[type=radio]').addClass("radio-button");
    $j('input[type=checkbox]').addClass("check-box");

    // Bind Analytics data to elements
    if (typeof (analyticDump) == 'function' && typeof (pageGuidTracking) !== 'undefined') {
        //Global Elements
        analyticDump().attachAnchor('#header a', "Header Menu Click", "The header menu item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#top-nav-container a', "Main Navigation Click", "The main navigation item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#left a', "Left Navigation Click", "The left navigation item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('.middle a', "Body Content Click", "The body content item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#callout-container a', "Right Navigation Click", "The right navigation item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#footer a', "Footer Menu Click", "The footer menu item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#hlnkTitle a', "Trip Menu Click", "The trip menu item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('#hlnkSubNavItem a', "Trip Menu Click", "The trip menu item has been clicked.", pageGuidTracking);
        /*SMP-20110624-Added the analytics for D&P Top horizontal nav events*/
        analyticDump().attachAnchor('div.pageNavigation .dropdownlist a', "Trip Menu Click", "The trip menu item has been clicked.", pageGuidTracking);
        analyticDump().attachAnchor('div.pageNavigation .tab', "Trip Menu Click", "The trip menu item has been clicked.", pageGuidTracking);
        // GLK (20110816) - Added analytics for Destination Pages Trip Sub Navigation
        analyticDump().attachAnchor('.primaryNav a', "Trip Sub Menu Click", "The trip sub navigation menu item has been clicked.", pageGuidTracking);
        // GLK (20110816) - Added analytics for Destination Pages Content
        analyticDump().attachAnchor('.destination_content a', "Body Content Click", "The body content item has been clicked.", pageGuidTracking);
    }

    //SET modal windows
    //BEGIN Send to Friend modal
    if ($j.exists($j('.sendToFriendImgBtn'))) {
        iniSendToFriend().ini_sendToFriendModal('.sendToFriendImgBtn');
    }

    var bindSendToAFriend = function () {
        if ($j.exists($j('.send-to-friend-btn'))) {
            iniSendToFriend().ini_sendToFriendModal('.send-to-friend-btn');
        }
    };

    bindSendToAFriend();

    try {
        Sys.WebForms.PageRequestManager.getInstance().add_endRequest(
            function (sender, args) {
                bindSendToAFriend();
            }
        );
    }
    catch (e) {
    }

    //BEGIN Send to Friend modal
    if ($j.exists($j('.trip-item-search-popup'))) {
        iniGenericModals().modalTemplateOne('.trip-item-search-popup', '.two-column-content-container');
        iniGenericModals().modalTemplateOne('.trip-item-search-popup-itin', '.two-column-content-container');
        iniGenericModals().modalTemplateOne('.trip-item-search-popup-ext', '.two-column-content-container');
    }

    //BEGIN Free gift modal
    if ($j.exists($j('.free-gift-btn'))) {
        iniGenericModals().modalTemplateTwo('.free-gift-btn');
    }

    // BEGIN Trip Search modal
    // NOTE: This function call may be obsolete now
    $j('.trip-search-popup').live("click", function (e) {
        e.preventDefault();
        var self = this;
        $j("<div id='modal-container-inner'>" + $j(self).parent().parent("div.section").next().html() + "</div>").modal({
            overlayId: 'modal-overlay',
            containerId: 'modal-container-trip',
            closeHTML: '<div class="close"><a href="#" class="simplemodal-close">Close</a></div>',
            minWidth: 516,
            minHeight: 374
        });
    });
    // END Keyword Search modal

    /* BEGIN ShowHides */
    $j('.show-hide').each(function () {
        var _this = $j(this);
        _this.children('a:first').toggle(function (e) {
            e.preventDefault();
            _this.children('.show-hide-div').fadeIn();
        }, function (e) {
            e.preventDefault();
            _this.children('.show-hide-div').fadeOut();
        });
    });
    $j('ul.archives').each(function () {
        var _this = $j(this);
        _this.children('li').children('a').toggle(function (e) {
            e.preventDefault();
            $j(this).next().fadeIn();
        }, function (e) {
            e.preventDefault();
            $j(this).next().fadeOut();
        });
    });
    /* END ShowHides */

    // Start tooltip code
    /* BEGIN show/hide tooltip */
    $j('a.weatherTip').each(function (e) {
        $j(this).click(function (e) {
            e.preventDefault();
        });
        $j(this).children('img').mouseover(
            function (e) {
                $j('.travel-companion-tooltip').show();
            }).mouseout(function (e) {
                $j('.travel-companion-tooltip').hide();
            });
    });
    /* END show/hide tooltip */

    /* BEGIN show/hide tooltip */
    $j('a.tooltipOcc').each(function (e) {
        $j(this).click(function (e) {
            e.preventDefault();
        });
        $j(this).children('span').attr("style", "border: 2px solid rgb(223, 219, 211); padding: 10px; display: block; position: absolute; color: rgb(51, 51, 51); width: 400px; background-color: rgb(255, 255, 255); z-index:100;  margin-top:18px; right:0; left:auto;").hide();
        $j(this).children('img').mouseover(
            function (e) {
                $j(this).next().show();
            }).mouseout(function (e) {
                $j(this).next().hide();
            });
    });
    /* END show/hide tooltip */

    /* BEGIN show/hide tooltip without icon*/
    $j('a.tooltipSave').each(function (e) {
        $j(this).click(function (e) {
            e.preventDefault();
        });
        $j(this).children('span').attr("style", "border: 2px solid rgb(223, 219, 211); padding: 10px; display: block; position: absolute; color: rgb(51, 51, 51); width: 400px; background-color: rgb(255, 255, 255); z-index:100;").hide();
        $j(this).mouseover(
            function (e) {
                $j(this).children('span').show();
            }).mouseout(function (e) {
                $j(this).children('span').hide();
            });
    });
    /* END show/hide tooltip */

    // ------------------------------------------------------------------------------
    // Begin "Initialize generic dynamic tabs"
    if ($j.exists($j('.dynamic_tabs'))) {
        tabController('.dynamic_tabs .dynamic_nav ul li', { destination: '.dynamic_tabs .dynamic_content', className: 'selected' });
    }

    // KAW 10-19: Content moved to gcc/trip.js: Blade initialization, Hero & Horiz. Nav Mouseover functions

    // -------------------------------------------------------------------------
    // Begin add the class "highlight" to all even rows of the tables that have "highlight_rows" as the class
    $j('table.highlight_rows_even tbody tr:even').addClass('highlight');
    $j('table.highlight_rows_odd tbody tr:odd').addClass('highlight');

    // -------------------------------------------------------------------------
    // Begin "tooltip binding"
    if ($j.exists($j('.jtooltip:visible'))) {
        $j(".jtooltip").tooltip({
            delay: 0,
            track: true,
            showURL: false,
            extraClass: "tooltip_content",
            id: "tooltip",
            fixPNG: true,
            top: 15,
            left: -100,
            bodyHandler: function () {
                return $j(this).next(".tooltip").html();
            }
        });
    }

    // -------------------------------------------------------------------------

    // AW 6/18/12: Top Nav code moved to gcc/nav/topnav.js

    // TODO: $().live() is deprecated; .delegate() is a better solution, and as of jQuery 1.7 both are replaced with .on().
    $j('a.call.jmodal.request_call').live('click', function (e) {
        if (gcc.settings.isCallMeEnabled) {
            e.preventDefault();
            // Get data on the requested item from the button
            var $this = $j(this),
                tripName = $this.data('tripname'),
                tripCode = $this.data('tripcode'),
                tripId = $this.data('tripid');
            // != null is equivalent to !== null && !== undefined
            if (tripName != null && tripId != null && tripCode != null) {
                // Only pre-populate form fields if all values are present (i.e. if we're on Travel Planner, Trip Search, or LMS)
                $j('#RequestACallModal .tripName').attr('disabled', 'disabled').val(tripName);
                $j('#RequestACallModal #requestACallHiddenFields input').first().val(tripCode);
                $j('#RequestACallModal #requestACallHiddenFields input').last().val(tripId);
            }
            // Initialize Modal
            iniModal("#RequestACallModal", '', '', 780, 780, 600, 600);
        }
    });
    
    // DH 2013.04.05: Adding Omniture tracking event calls to Find Trips results CTAs
    // commenting out for 4/15 drop, need to add for 4/25 release
    $j('a[class*=cta-]', '.trip-item-wrap').on('click', function(e) {
        var _this = $j(this),
            _url = _this.attr('href'),
            _root = window.location.protocol + "//" + window.location.hostname;


        if( _this.hasClass('cta-datesandprices') ) {
            $j.publish('/gcc/findtrips/datesandprices', 'View Dates and Prices');
        }
        /*if( _this.hasClass('cta-itinerary') ) {
            $j.publish('/gcc/findtrips/itinerary', 'View itinerary');
        }
        if( _this.hasClass('cta-watchvideo') ) {
            $j.publish('/gcc/findtrips/video', 'Watch Video');
        }*/
        if( _this.hasClass('cta-planner') ) {
            $j.publish('/gcc/findtrips/planner', 'Add to Travel Planner');
        }
        if( _this.hasClass('cta-reviews') ) {
            $j.publish('/gcc/findtrips/reviews', 'View Reviews');
        }

        if(_url.indexOf("http://") != -1) {
            //console.log($j.trim(_url));
            window.location.href=_url;
        } else {
            //console.log(_root + $j.trim(_url));
            window.location.href=_root + _url;
        }
    });


    // KAW 10-19: Moved to gcc/trip.js: GBP Sider, Trip modal tracking, Accomm. photo slider handler

    // -------------------------------------------------------------------------
    // Begin "Request form select"
    if ($j.exists($j('.inquiryReason'))) {
        iniRequestSelect('.inquiryReason', 'booking_field, support_field', '.form_field');
    }

    // -------------------------------------------------------------------------
    // Begin "Show Request a Call Response"
    if ($j.exists($j('#RequestACallModal')) && typeof ShowRequestACallResponse != 'undefined' && ShowRequestACallResponse === true) {
        iniModal("#RequestACallModal", '', '', 780, 780, 600, 600);
    }

    // -------------------------------------------------------------------------
    // Begin "Callout link click event tracker"
    // GLK (20110728) - Submits events when clicking links inside of callouts
    $j('.left_callout a').not('a.jmodal').click(function (e) {
        var calloutGuid = getCalloutGuid(this);
        RecordHitServiceHandler("Callout Link Click", "Callout Link Click", $j(this).text(), calloutGuid, "", pageGuidTracking, false);
    });

    // -------------------------------------------------------------------------
    // Begin "Generic callout with modal click event tracker"
    // GLK (20110728) - Submits events when opening modals from generic callouts
    $j('.left_callout a.jmodal').not('a.request_call').click(function (e) {
        var calloutGuid = getCalloutGuid(this);
        RecordHitServiceHandler("Callout Modal Show", "Callout Modal Show", "", calloutGuid, "", pageGuidTracking);
    });

    // -------------------------------------------------------------------------
    // Begin "Request a call form modal open event tracker"
    // GLK (20110728) - Submits events when clicking request a call form links
    $j('a.jmodal.request_call').on('click.omniture', function (e, eventSource) {
        var calloutGuid = getCalloutGuid(this);
        RecordHitServiceHandler("Call Me Pop Up Shown", "Call Me Pop Up Shown", $j(this).text(), calloutGuid, "", pageGuidTracking);
       // eventSource is passed in from the trigger on header.requestacall.js
       $.publish('/gcc/modal/callme/start', eventSource);
    });

    // -------------------------------------------------------------------------
    // Begin "Append Ajax loading container"
    // GLK (20110802) - Taken from latest Global.js on test.gct.com. This is needed for the trip planner Ajax spinner overlay.
    $j('body').append('<div id="ajax-loading-container"><div id="ajax-blanket"></div><div id="ajax-loading"></div></div>');

    // KAW 10-19: Moved to gcc/trip.js: Bind destination hero slide data, and bind analytics for pre/post itinerary tabs

    /*******************************  END NEW JAVASCRIPT  *************************************/
});
/*
 END jQuery onload script
 ---------------------------------------------------------------------------- */

function updatePricing(tripItem, updatePerDay) {

 var _this = tripItem,
                _code = $j('.leadpriceinput', _this).attr('data-tripcode'),
                _year = $j('.leadpriceinput', _this).attr('data-tripyear');

    $j.ajax({
        type: 'Post',
        url: '/app_webservices/public/services.asmx/GetTripFullLeadPrice',
        data: JSON.stringify({ tripCode: _code, tripYear: _year }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if(data.d !== null) {
                var _price = parseInt(data.d.PriceWithoutAir),
                    _perDiem = parseInt(data.d.PerDiemPriceWithoutAir),
                    _duration = parseInt(data.d.TripDurationWithoutAir),
                    _priceAir = parseInt(data.d.PriceWithAir),
                    _perDiemAir = parseInt(data.d.PerDiemPriceWithAir),
                    _durationAir = parseInt(data.d.TripDurationWithAir);
                $j('.trip-price > p:first-child', _this).html("<span class='num-days' data-duration='"+_duration+"'>"+_duration+" days</span> from <span class='num-price leadpriceoutput'>$"+_price+"</span><span class='separator'>|</span><span class='num-price perday'>$"+_perDiem+" <em>per day</em></span>");
            } else {
                $j('.trip-price > p:first-child', _this).html("Pricing currently unavailable.");
            }

        },
        error: function (data) { console.log("Response error: ", data); }
    });
}

function updateLandingPricing() {
   $j('.content-with-border').each(function (i, e) {
        var _this = $j(this);
        updatePricing(_this);
    });
}
