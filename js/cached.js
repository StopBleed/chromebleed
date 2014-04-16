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

/*
 * Is matching site with error ('Caution' notification) cached? 
 */
function isCachedCautionSite(parsedDomain) {
    checkResetNeeded();
    var cachedCautionSites = JSON.parse(localStorage.cachedCautionSites || "[]");
    return foundTheSite(parsedDomain, cachedCautionSites);
}

/*
 * Cache sites that cannot be checked due to errors along with the error detail.
 */
function cacheCautionSite(parsedDomain, err) {
    checkResetNeeded();
    var cachedCautionSites = JSON.parse(localStorage.cachedCautionSites || "[]");
    if (!foundTheSite(parsedDomain, cachedCautionSites)) {
    	cachedCautionSites.push(parsedDomain);
        while (cachedCautionSites.length > 250) {
        	cachedCautionSites.shift();
        }
        cacheCautionSiteError(parsedDomain, err);
        localStorage.cachedCautionSites = JSON.stringify(cachedCautionSites);
    }
    console.log("  After Caching caution site: " + JSON.stringify(cachedCautionSites));
}

/*
 * Cache the error detail for 'Caution' notifications.
 */
function cacheCautionSiteError(parsedDomain, err) {
    checkResetNeeded();
    var cachedCautionSiteErrors = JSON.parse(localStorage.cachedCautionSiteErrors || "[]");
    if (!getCautionSiteError(parsedDomain)) {
    	var errorDetail = new Array();
    	errorDetail.push(parsedDomain);
    	errorDetail.push(err);
    	cachedCautionSiteErrors.push(errorDetail.join("[;]"));
        while (cachedCautionSiteErrors.length > 250) {
        	cachedCautionSiteErrors.shift();
        }
        localStorage.cachedCautionSiteErrors = JSON.stringify(cachedCautionSiteErrors);
    }
    console.log("  After Caching site errors: " + JSON.stringify(cachedCautionSiteErrors));
}

/*
 * Return the error detail associated with the site.
 */
function getCautionSiteError(parsedDomain){
	var err = false;
	 var cachedCautionSiteErrors = JSON.parse(localStorage.cachedCautionSiteErrors || "[]");
	 if (cachedCautionSiteErrors !== []) {
		 //Check for the site to be in our cached entries
		 cachedCautionSiteErrors.some(function(entry) {
	            if (entry.indexOf(parsedDomain) >= 0) {	                
	                //error is part of cached entry after '[;]' delimiter
	                if(entry){
	                	var vals = entry.split("[;]");
	                	if(vals.length == 2){
	                		err = vals[1];
	                	}
	                }
	                return true;
	            }
	     });
	 }
	 //return error text
	 return err;
}

function resetCachedCautionSites() {
    var cachedCautionSites = [];
    localStorage.cachedCautionSites = JSON.stringify(cachedCautionSites);
    return true;
}

function resetCautionSiteErrors() {
    var cachedCautionSiteErrors = [];
    localStorage.cachedCautionSiteErrors = JSON.stringify(cachedCautionSiteErrors);
    return true;
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
        resetCachedCautionSites();
        resetCautionSiteErrors();
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
