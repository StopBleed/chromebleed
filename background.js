/*
 array of commonly used sites that have fixed this bug to reduce server load
 */
var siteArray = ['amazonaws.com', 'google.com', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com', 'reddit.com', 'ml.com', 'bankofamerica.com', 'bankofamerica.co.uk'];
var protocolArray = ['chrome', 'chrome-devtools', 'chrome-extension'];
var isFilteredURL = 0;
//global reference so we can close open notifications when showing new notification
var notification = null;

var notificationPermission = 0;
if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 1) {
    window.webkitNotifications.requestPermission();
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
    localStorage.isActivated = true;   // The notification activation.
    localStorage.isShowingAll = false;   // The showing of Ok domains.
    localStorage.isInitialized = true; // The option initialization.
}

//show a notification dialog to the user e.g. on error, success, warning
function showNotification(result, parsedURL, isFilteredURL) {
	
	//default icon
	var icon_name = 'logo-ok48.png';
	var message = 'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!';
	var title = 'Site seems Ok!';

	//for filtered URLs we assume all is ok
	if(isFilteredURL){
		title = 'Site is Filtered!';
		message = 'All Good, ' + parsedURL.domain + ' ignored!';
	}
	else if(result) {
		icon_name = result.code == 0 ? 'icon48.png' : (result.error ? 'logo-err48.png' : 'logo-ok48.png');
		title = result.code == 0 ? 'This site is vulnerable!' : (result.error ? 'Use Caution' : 'Site seems Ok!');
		message = result.code == 0 ? 'The domain ' + parsedURL.domain + ' could be vulnerable to the Heartbleed SSL bug.' : 
					  (result.error ? 'Use Caution, ' + parsedURL.domain + ' returned an error [' + result.error + ']. Unable to test for Heartbleed vulnerability.' 
					   : 'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!');
	}
	else {
		icon_name = 'logo-err48.png';
		title = 'Error';
		message = 'Request to '+ parsedURL.domain + ' failed';
	}
	
	//close open notifications
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
	//if not a vulnerability warning
	if(!result || result.code !== 0) {
		notification.ondisplay = function(event) {
			setTimeout(function() {
					event.currentTarget.cancel();
			    	}, 10000);
		};
	}
	
	//also change the 'heartbleed' icon at top right of browser
	chrome.browserAction.setIcon({path:icon_name});
	//add tooltip with title
	chrome.browserAction.setTitle({title:title});
}

// background script for access to Chrome APIs
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    // Test for notification support.
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        console.log("-------------- onUpdated ---------------");

        // Only show notifications when the option is activated
        if (JSON.parse(localStorage.isActivated)) {
            console.log("Notifications: " + JSON.parse(localStorage.isActivated));
            //check page has loaded
            if (info.status === 'complete') {
                //get the tab's URL
                chrome.tabs.getSelected(null, function(tab) {
                    var currentURL = tab.url;
                    var parsedURL = parseURL(currentURL);
                    // Bail if it is an internal chrome url, this should be extended
                    console.log("Protocol: " + parsedURL.protocol);
                    if (protocolArray.indexOf(parsedURL.protocol) >= 0) {
                        return;
                    }
                    console.log("Domain: " + parsedURL.domain);
                    //Google, bit.ly, t.co (and other URL shortners) do some funny URL things, we want to stop it, ergo reducing requests to the server
                    isFilteredURL = 0;
                    // Check for the domain to be in our whitelist
                    siteArray.some(function(site) {
                        if (parsedURL.domain == site) {
                            isFilteredURL = 1;
                            return true;
                        }
                    });
                    // Check for the domain to be in our cached entries
                    isokay.some(function(site) {
                        if (parsedURL.domain == site) {
                            isFilteredURL = 1;
                            return true;
                        }
                    });
                    if (isFilteredURL === 0) {
                        //doesn't contain any of the above, carry on
                        requestURL(parsedURL.domain, function(text) {
                            //parse as JSON, check result
                            var result = JSON.parse(text);
                            console.log('Result for site ' + parsedURL.domain + ': ' + result.code);
                            console.log('Further details: ' + result.data);
                            if (result.error) {
                                console.log('[ERR]:' + result.error);
                                showNotification(result, parsedURL);
                            }
                            if (result.code === 0) {
                            	showNotification(result, parsedURL);
                            } else {
                                if (!result.error) {
                                    isokay.push(parsedURL.domain);
                                    while (isokay.length > 250) {
                                        isokay.shift();
                                    }
                                    localStorage.isokay = JSON.stringify(isokay);
                                }
                                //do nothing unless we want to show all notifications
                                if (JSON.parse(localStorage.isShowingAll)) {
                                	showNotification(result, parsedURL);
                                }
                                return;
                            }
                        });
                    } else if (JSON.parse(localStorage.isShowingAll)) {
                    	 //we know these are kosher, so simply reset the filtered URL
                        console.log('Ignoring ' + parsedURL.domain);
                        showNotification(null, parsedURL, true);
                    }
                });
            }
        } else {
            console.log("Notifications: Off");
        }
    } else {
        console.log("webkitNotifications: disabled " + window.webkitNotifications.checkPermission());
    }
});
