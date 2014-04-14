var whitelistSites = ['amazonaws.com', 'google.com', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com', 'reddit.com', 'ml.com', 'bankofamerica.com', 'bankofamerica.co.uk'];
function isWhiteListSite(parsedDomain) {
    var foundSite = false;
    // Check for the domain to be in our whitelist
    whitelistSites.some(function(site) {
        if (parsedDomain == site) {
            console.log("Found in WhiteList: " + parsedDomain);
            foundSite = true;
            return true;
        }
    });
    return foundSite;
}

function isCachedSite(parsedDomain) {
    checkResetNeeded();
    var cachedSites = JSON.parse(localStorage.cachedSites || "[]");
    console.log("  Cached Sites: " + JSON.stringify(cachedSites));
    return foundTheSite(parsedDomain, cachedSites);
}

function cacheSite(parsedDomain) {
    checkResetNeeded();
    var cachedSites = JSON.parse(localStorage.cachedSites || "[]");
    if (!foundTheSite(parsedDomain, cachedSites)) {
        cachedSites.push(parsedDomain);
        while (cachedSites.length > 250) {
            cachedSites.shift();
        }
        localStorage.cachedSites = JSON.stringify(cachedSites);
    }
    console.log("  After Caching: " + JSON.stringify(cachedSites));
}
function checkResetNeeded() {
    var d = new Date();
    //console.log(" Current Time(mils) " + d.getTime());
    if (!localStorage.resetTime) {
        localStorage.resetTime = d.getTime();
    }
    //console.log(" Reset Time(mils) " + localStorage.resetTime);
    // Check whether to reset the cache every 5 mins.
    if ((d.getTime() - localStorage.resetTime) > 300000) {
        console.log(" Auto Reseting of Cache");
        localStorage.resetTime = d.getTime();
        resetCachedSites();
        resetCachedBleedSites();
    }
}
function resetCachedSites() {
    var cachedSites = [];
    localStorage.cachedSites = JSON.stringify(cachedSites);
    return true;
}
/*
 * These are for the heartbleed vulnerability sites, we will cache these for less time
 */
function isCachedBleedSite(parsedDomain) {
    checkResetNeeded();
    var cachedBleedSites = JSON.parse(localStorage.cachedBleedSites || "[]");
    console.log("  Cached Bleed Sites: " + JSON.stringify(cachedBleedSites));
    return foundTheSite(parsedDomain, cachedBleedSites);
}

function cacheBleedSite(parsedDomain) {
    checkResetNeeded();
    var cachedBleedSites = JSON.parse(localStorage.cachedBleedSites || "[]");
    if (!foundTheSite(parsedDomain, cachedBleedSites)) {
        cachedBleedSites.push(parsedDomain);
        while (cachedBleedSites.length > 20) {
            cachedBleedSites.shift();
        }
        localStorage.cachedBleedSites = JSON.stringify(cachedBleedSites);
    }
    console.log("  After Caching Bleed: " + JSON.stringify(cachedBleedSites));
}

function resetCachedBleedSites() {
    var cachedBleedSites = [];
    localStorage.cachedBleedSites = JSON.stringify(cachedBleedSites);
    return true;
}

/*
 * Cache the 'heartbleed' result code for all open tabs. This allows
 * the correct icon to be shown when user switches active tab (without reloading the tab).
 */
function cacheTab(parsedDomain, resultCode) {
    var cachedTabs = JSON.parse(localStorage.cachedTabs || "[]");
    if (!foundTheTab(parsedDomain, resultCode, cachedTabs) && !(resultCode === "")) {
    	var tab = new Array();
    	tab.push(parsedDomain);
    	tab.push(resultCode);
    	cachedTabs.push(tab.join(";"));
        while (cachedTabs.length > 20) {
            cachedTabs.shift();
        }
        localStorage.cachedTabs = JSON.stringify(cachedTabs);
    }
    console.log("  After Caching Tab: " + JSON.stringify(cachedTabs));
}

function foundTheTab(parsedDomain, resultCode, cachedTabs){
	var foundTab = false;
	 if (!foundTab && (cachedTabs !== []) && !(resultCode === "")) {
		// Check for the tab to be in our cached entries
		 cachedTabs.some(function(tab) {
	            if (parsedDomain+";"+resultCode == tab) {
	                console.log("   Found in Cached Tabs: " + parsedDomain);
	                foundTab = true;
	                return true;
	            }
	     });
	 }
	 //return whether we found the cached tab
	 return foundTab;
}

function resetCachedTabs() {
    var cachedTabs = [];
    localStorage.cachedTabs = JSON.stringify(cachedTabs);
    return true;
}

/*
 * Return the result code for the cached tab
 */
function getResultCodeForTab(parsedDomain){
	var resultCode = BLEED_STATE_OK;
	var cachedTabs = JSON.parse(localStorage.cachedTabs || "[]");
	cachedTabs.some(function(tab) {
        if (cachedTabs !== [] && tab.indexOf(parsedDomain) >= 0) {
            var elems = tab.split(";");
            resultCode = elems[1];
            return true;
        }
     });
	return resultCode;
}

function foundTheSite(parsedDomain, cachedSites) {
    var foundSite = false;
    if (!foundSite && (cachedSites !== [])) {
        // Check for the domain to be in our cached entries
        cachedSites.some(function(site) {
            if (parsedDomain == site) {
                console.log("   Found in Cached Sites: " + parsedDomain);
                foundSite = true;
                return true;
            }
        });
    }
    //return whether we found the domain in our whitelist or cached entries
    return foundSite;
}
