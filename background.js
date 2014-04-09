/*
  array of commonly used sites that have fixed this bug to reduce server load
  */
var siteArray = ['google', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com'];
var isFilteredURL = 0;

//source: http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
function parseURL(url){
    parsed_url = {}

    if ( url == null || url.length == 0 )
        return parsed_url;

    protocol_i = url.indexOf('://');
    parsed_url.protocol = url.substr(0,protocol_i);

    remaining_url = url.substr(protocol_i + 3, url.length);
    domain_i = remaining_url.indexOf('/');
    domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
    parsed_url.domain = remaining_url.substr(0, domain_i);
    parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

    domain_parts = parsed_url.domain.split('.');
    switch ( domain_parts.length ){
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
    //check page has loaded
    if (info.status === 'complete') {
        //get the tab's URL
        chrome.tabs.getSelected(null, function(tab) {
          var currentURL = tab.url;
          var parsedURL = parseURL(currentURL);
          //Google, bit.ly, t.co (and other URL shortners) do some funny URL things, we want to stop it, ergo reducing requests to the server
          siteArray.forEach(function(site) {
            if(parsedURL.domain.indexOf(site) >= 0) {
              isFilteredURL = 1;
            }
          })
          if(isFilteredURL === 0) {
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
                if(result.error) {
                  console.log('[ERR]:' + result.error);
                }
                if(result.code === 0) {
                  var notification = webkitNotifications.createNotification(
                    'logo.png',  // icon url - can be relative
                    'This site is vulnerable!',  // notification title
                    'The domain ' + parsedURL.domain + ' could be vulnerable to the Heartbleed SSL bug.'  // notification body text
                  );
                  notification.show();
                } else {
                  //do nothing
                  return;
                }
              }
            });
          } else {
            //we know these are kosher, so simply reset the filtered URL
            console.log('Ignoring ' + parsedURL.domain);
            isFilteredURL = 0;
          }
      });
    }
});
