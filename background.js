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
    localStorage.isShowingAll = false;   // The showing of Ok domains.
    localStorage.isShowOnGoogle = false;   // The showing of on Google Search.
    localStorage.isInitialized = true; // The option initialization.
}

//show a notification dialog to the user e.g. on error, success, warning
function showNotification(result, parsedURL, isFixedDomain, isRepeated, cachedError) {
	
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
	if(notification){
		notification.cancel();
	}

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
        var milisecs = ((isRepeated || isFixedDomain) ? 2000 : 10000);
        notification.ondisplay = function(event) {
            setTimeout(function() {
                event.currentTarget.cancel();
            }, milisecs);
        };
    }

    if(resultCode){
    	setBrowserAction(resultCode);
    }
}

/*
 * Change the 'heartbleed' icon and title at top right of browser.
 */
function setBrowserAction(resultCode){
	
	var icon_name = 'logo-ok48.png';
	var title = 'Site seems Ok!';
	
	if(resultCode){
		switch(parseInt(resultCode)){
			case BLEED_STATE_NOK:
				icon_name = 'icon48.png';
				title = 'This site is vulnerable!';
				break;
			case BLEED_STATE_OK:
				break;
			case BLEED_STATE_ERR:
				icon_name = 'logo-err48.png';
				title = 'Use Caution';
				break;
			case BLEED_STATE_REQUEST_ERR:
				icon_name = 'logo-err48.png';
				title = 'Error';
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
chrome.tabs.onActivated.addListener(function(tabId, windowId) {

	//close open notifications on tab change
	if(notification){
		notification.cancel();
	}
	
	//re-run checks on tab change
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		var currentURL = tabs[0].url;
		var parsedURL = parseURL(currentURL);
	 
		//set default icon for internal URLs (incl. new tabs)
		if(protocolArray.indexOf(parsedURL.protocol) >= 0){
			var ok_icon = 'logo-ok48.png';
			chrome.browserAction.setIcon({path: ok_icon});
		}
		//otherwise check cache or re-run heartbleed check if cached value has expired
		else{
			checkHeartBleed();
		}
  });
});

// background script for access to Chrome APIs
chrome.tabs.onUpdated.addListener(function(tabId, info) {
	checkHeartBleedOnLoad(tabId, info);
});

/*
 * Check the Heartbleed status when the page is loaded.
 */
function checkHeartBleedOnLoad(tabId, info){
	// Test for notification support.
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        console.log("-------------- onUpdated ---------------");
        //check page has loaded
        if (info.status === 'complete') {
          checkHeartBleed();
        }
    } else {
        console.log("webkitNotifications: disabled " + window.webkitNotifications.checkPermission());
    }
}

/*
 * Check the Heartbleed status - used by both onActivated and onUpdated handlers.
 */
function checkHeartBleed(){
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
	            return;
	        }
	        console.log("Domain: " + parsedURL.domain);
	        //Google, bit.ly, t.co (and other URL shortners) do some funny URL things, we want to stop it, ergo reducing requests to the server
	        // Check for the domain to be in our whitelist or already cached as ok
	        var isProvenSite = isWhiteListSite(parsedURL.domain);
	        var isCachedURL = isCachedSite(parsedURL.domain);
	        if (isCachedURL || isProvenSite) {
	            if (JSON.parse(localStorage.isShowingAll)) {
	                //we know these are kosher, so simply show the filtered URL
	                console.log('Ignoring ' + parsedURL.domain);
	                showNotification({code: 1}, parsedURL, isProvenSite, isCachedURL);
	            }
	        } else {
	            // First check to see if we have this domain already cached as a Bleed Site
	            if (isCachedBleedSite(parsedURL.domain)) {
	                showNotification({code: 0}, parsedURL, false, true);
	                return;
	            }
	            //then check if domain is cached as a 'caution' site - i.e. one that returned an error
	            if(isCachedCautionSite(parsedURL.domain)) {
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
	                    //do nothing unless we want to show all notifications
	                    if (JSON.parse(localStorage.isShowingAll)) {
	                        showNotification(result, parsedURL);
	                    }
	                    return;
	                }
	            });
	        }
	    });
	} else {
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