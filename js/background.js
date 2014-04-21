/*
 array of commonly used sites that have fixed this bug to reduce server load
 */
var siteArray = ['amazonaws.com', 'google.com', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com', 'reddit.com', 'ml.com', 'bankofamerica.com', 'bankofamerica.co.uk'];
var protocolArray = ['chrome', 'chrome-devtools', 'chrome-extension'];
//global reference so we can close open notifications when showing new notification
var notification = null;

if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 1) {
    window.webkitNotifications.requestPermission();
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
    localStorage.isActivated = true;   // The notification activation.
    localStorage.isShowingAll = true;   // The showing of Ok domains.
    localStorage.isShowOnGoogle = false;   // The showing of on Google Search.
    localStorage.isInitialized = true; // The option initialization.
}

//show a notification dialog to the user e.g. on error, success, warning
function showNotification(result, parsedURL, isFixedDomain, isRepeated, cachedError) {
    console.log("result=" + result + ",result.code=" + result.code + ",result.error=" + result.error);

    //default icon
    var icon_name = 'logo-ok48.png';
    var message = 'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!';
    var title = 'Site seems Ok!';
    var resultCode = BLEED_STATE_OK;

    //for Proven URLs we assume all is ok
    if (isFixedDomain) {
        title = 'Site is Fixed!';
        message = 'All Good, ' + parsedURL.domain + ' is known to be fixed.';
    }
    else if (result) {
        icon_name = result.code === 0 ? 'icon48.png' : (result.error || result.code == BLEED_STATE_ERR ? 'logo-err48.png' : 'logo-ok48.png');
        title = result.code === 0 ? 'This site is vulnerable!' : (result.error || result.code == BLEED_STATE_ERR ? 'Use Caution' : 'Site seems Ok!');

        var errorDetail = cachedError ? cachedError : result.error;
        message = result.code === 0 ? 'The domain ' + parsedURL.domain + ' could be vulnerable to the Heartbleed SSL bug.' :
                (result.error || result.code == BLEED_STATE_ERR ? 'Use Caution, ' + parsedURL.domain + ' returned an error [' + errorDetail + ']. Unable to test for Heartbleed vulnerability.'
                        : 'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!');
        resultCode = result.error ? BLEED_STATE_ERR : result.code;
    }
    else {
        icon_name = 'logo-err48.png';
        title = 'Error';
        message = 'Request to ' + parsedURL.domain + ' failed';
        resultCode = BLEED_STATE_REQUEST_ERR;
    }

    //close open notifications - prevents more than one notification
    //appearing at same time.
    if (notification) {
        notification.cancel();
    }

    var showIt = (result && result.code === 0) || JSON.parse(localStorage.isShowingAll);
    if (showIt) {
        //show the notification message with appropriate content
        notification = webkitNotifications.createNotification(
                icon_name,
                title,
                message
                );
        notification.show();
        notification.onclick = function() {
            // Handle action from notification being clicked.
            notification.cancel();
        };

        //keep open for 10 seconds then close
        //if not a vulnerability warning or already saw this vulnerablity
        if ((result && result.code !== 0) || isFixedDomain || isRepeated) {
            var milisecs = ((isRepeated || isFixedDomain) ? 4000 : 10000);
            notification.ondisplay = function(event) {
                setTimeout(function() {
                    event.currentTarget.cancel();
                }, milisecs);
            };
        }
    }
    if (resultCode !== undefined) {
        setBrowserAction(resultCode, parsedURL);
    }
}

/*
 * Change the 'heartbleed' icon and title at top right of browser.
 */
function setBrowserAction(resultCode, parsedURL) {

    var icon_name = 'logo-ok48.png';
    var title = parsedURL.domain + ' seems Ok!';

    if (resultCode !== undefined) {
        switch (parseInt(resultCode)) {
            case BLEED_STATE_NOK:
                icon_name = 'icon48.png';
                title = parsedURL.domain + ' is vulnerable!';
                break;
            case BLEED_STATE_OK:
                break;
            case BLEED_STATE_ERR:
                icon_name = 'logo-err48.png';
                title = parsedURL.domain + ' not able to test. Use Caution.';
                break;
            case BLEED_STATE_REQUEST_ERR:
                icon_name = 'logo-err48.png';
                title = parsedURL.domain + ' had a communication error.';
                break;
            default:
                break;
        }
    }

    chrome.browserAction.setIcon({path: icon_name});
    chrome.browserAction.setTitle({title: title});
}

/*
 * Manage tab changes. Check cache or re-run Heartbleed check if cached site info has expired. 
 * Re-run checks since it may have been some time since tab was loaded and need to 
 * be sure of Heartbleed status for site. 
 */
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Test for notification support.
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        console.log("-------------- onActivated ---------------");
        console.log(activeInfo);
        //close open notifications on tab change
        if (notification) {
            notification.cancel();
        }
        checkHeartBleed();
    }
});

// background script for access to Chrome APIs
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    checkHeartBleedOnLoad(tabId, info);
});

/*
 * Check the Heartbleed status when the page is loaded.
 */
function checkHeartBleedOnLoad(tabId, info) {
    // Test for notification support.
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        console.log("-------------- onUpdated ---------------");
        console.log(info);
        //check page started loading
        if (info.status === 'loading') {
            checkHeartBleed();
        }
    } else {
        console.log("webkitNotifications: disabled " + window.webkitNotifications.checkPermission());
    }
}

/*
 * Check the Heartbleed status - used by both onActivated and onUpdated handlers.
 */
function checkHeartBleed() {
    // Only show notifications when the option is activated
    if (JSON.parse(localStorage.isActivated)) {
        console.log("Notifications: " + JSON.parse(localStorage.isActivated));
        //get the tab's URL
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true},
        function(tabs) {
            var currentURL = tabs[0].url;
            var parsedURL = parseURL(currentURL);
            console.log("Protocol: " + parsedURL.protocol);
            if (protocolArray.indexOf(parsedURL.protocol) >= 0) {
                chrome.browserAction.setIcon({path: 'logo-ok48.png'});
                chrome.browserAction.setTitle({title: "Localized Path [" + parsedURL.protocol + "], Ok!"});
                return;
            }
            console.log("Domain: " + parsedURL.domain);
            //Google, bit.ly, t.co (and other URL shortners) do some funny URL things, we want to stop it, ergo reducing requests to the server
            // Check for the domain to be in our whitelist or already cached as ok
            var isProvenSite = isWhiteListSite(parsedURL.domain);
            var isCachedURL = isCachedSite(parsedURL.domain);
            if (isCachedURL || isProvenSite) {
                //we know these are kosher, so simply show the filtered URL
                console.log('Ignoring ' + parsedURL.domain);
                showNotification({code: 1}, parsedURL, isProvenSite, isCachedURL);
            } else {
                // First check to see if we have this domain already cached as a Bleed Site
                if (isCachedBleedSite(parsedURL.domain)) {
                    showNotification({code: 0}, parsedURL, false, true);
                    return;
                }
                //then check if domain is cached as a 'caution' site - i.e. one that returned an error
                if (isCachedCautionSite(parsedURL.domain)) {
                    showNotification({code: BLEED_STATE_ERR}, parsedURL, false, true, getCautionSiteError(parsedURL.domain));
                    return;
                }
                //doesn't contain any of the above, carry on
                requestURL(parsedURL.domain, function(text) {
                    //parse as JSON, check result
                    var result = JSON.parse(text);
                    console.log('Result for site ' + parsedURL.domain + ': ' + result.code);
                    console.log('Further details: ' + result.data);
                    if (result.error) {
                        console.log('[ERR]:' + result.error);
                        cacheCautionSite(parsedURL.domain, result.error);
                    }
                    if (result.code === 0) {
                        cacheBleedSite(parsedURL.domain);
                        showNotification(result, parsedURL);
                    } else {
                        if (!result.error) {
                            cacheSite(parsedURL.domain);
                        }
                        showNotification(result, parsedURL);
                        return;
                    }
                });
            }
        });
    } else {
        chrome.browserAction.setIcon({path: 'logo-off48.png'});
        chrome.browserAction.setTitle({title: "Notifications Off!"});
        console.log("Notifications: Off");
    }
}

// Allow the content script to access the localStorage for options
chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("<-- onMessage Called -->" + request.method + " - " + request.key);
            if (request.method === "getCBLocalStorage") {
                switch (request.key) {
                    case 'options':
                        var returnVal = {isActivated: localStorage.isActivated, isShowingAll: localStorage.isShowingAll, isShowOnGoogle: localStorage.isShowOnGoogle};
                        sendResponse(returnVal);
                        break;
                    default:
                        sendResponse({}); // snub them.
                        break;
                }
            }
            else
                sendResponse({}); // snub them.
        });