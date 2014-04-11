/*
 array of commonly used sites that have fixed this bug to reduce server load
 */
var siteArray = ['amazonaws.com', 'google.com', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com', 'reddit.com', 'ml.com', 'bankofamerica.com', 'bankofamerica.co.uk'];
var isFilteredURL = 0;

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

//source: http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
function parseURL(url) {
    parsed_url = {}

    if (url == null || url.length == 0)
        return parsed_url;

    protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0, protocol_i);

    remaining_url = url.substr(protocol_i + 3, url.length);
    domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    domain_parts = parsed_url.domain.split('.');
    switch (domain_parts.length) {
        case 2:
            parsed_url.subdomain = null;
            parsed_url.host = domain_parts[0];
            parsed_url.tld = domain_parts[1];
            break;
        case 3:
            parsed_url.subdomain = domain_parts[0];
            parsed_url.host = domain_parts[1];
            parsed_url.tld = domain_parts[2];
            break;
        case 4:
            parsed_url.subdomain = domain_parts[0];
            parsed_url.host = domain_parts[1];
            parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
            break;
    }

    parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

    return parsed_url;
}

// background script for access to Chrome APIs
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    // Test for notification support.
    if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        console.log("-------------- onUpdated- ---------------");

        // Only show notifications when the option is activated
        if (JSON.parse(localStorage.isActivated)) {
            console.log("Notifications: " + JSON.parse(localStorage.isActivated));
            //check page has loaded
            if (info.status === 'complete') {

                chrome.tabs.query(
                    {'active': true,
                    'lastFocusedWindow': true},
                    function(tabs) {
                    var currentURL = tabs[0].url;
                    var parsedURL = parseURL(currentURL);
                    var parsedSchema = parsedURL.protocol;

                    // Ignore chrome internal protocols
                    if ( parsedSchema.indexOf('chrome') != -1 ) {
                        return;
                    }

                    // Skip non-https urls
                    if ( parsedSchema != 'https' ) {
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
                    var isokay = JSON.parse(localStorage.isokay || "[]");
                    isokay.some(function(site) {
                        if (parsedURL.domain == site) {
                            isFilteredURL = 1;
                            return true;
                        }
                    });
                    if (isFilteredURL === 0) {
                        //doesn't contain any of the above, carry on
                        var bleedURL = 'http://bleed-1161785939.us-east-1.elb.amazonaws.com/bleed/' + parsedURL.domain;
                        promise.get(bleedURL).then(function(error, text, xhr) {
                            if (error) {
                                //silently fail
                                console.log("[ERR]: Request failed");
                                return;
                            } else {
                                //parse as JSON, check result
                                var result = JSON.parse(text);
                                console.log('Result for site ' + bleedURL + ': ' + result.code);
                                console.log('Further details: ' + result.data);
                                if (result.error) {
                                    console.log('[ERR]:' + result.error);
                                }
                                if (result.code === 0) {
                                    var notification = webkitNotifications.createNotification(
                                            'icon48.png', // icon url - can be relative
                                            'This site is vulnerable!', // notification title
                                            'The domain ' + parsedURL.domain + ' could be vulnerable to the Heartbleed SSL bug.'  // notification body text
                                            );
                                    notification.show();
                                    notification.onclick = function() {
                                        // Handle action from notification being clicked.
                                        notification.cancel();
                                    }
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
                                        var icon_name = (result.error ? 'logo-err48.png' : 'logo-ok48.png');
                                        var message = (result.error ? 'Use Caution, ' + parsedURL.domain + ' had error [' + result.error + ']' : 'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!');
                                        var notification = webkitNotifications.createNotification(
                                                icon_name, // icon url - can be relative
                                                'Site seems Ok!', // notification title
                                                message  // notification body text
                                                );
                                        notification.show();
                                        notification.onclick = function() {
                                            // Handle action from notification being clicked.
                                            notification.cancel();
                                        }
                                    }
                                    return;
                                }
                            }
                        });
                    } else if (JSON.parse(localStorage.isShowingAll)) {
                        //we know these are kosher, so simply reset the filtered URL
                        console.log('Ignoring ' + parsedURL.domain);
                        var notification = webkitNotifications.createNotification(
                                'logo-ok48.png', // icon url - can be relative
                                'Site seems Ok!', // notification title
                                'All Good, ' + parsedURL.domain + ' seems fixed or unaffected!'  // notification body text
                                );
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
