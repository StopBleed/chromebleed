var whitelistSites = ['amazonaws.com', 'google.com', 'facebook.com', 'etsy.com', 'thinkgeek.com', 'github.com', 'yahoo.com', 'twitter.com', 'reddit.com', 'ml.com', 'bankofamerica.com', 'bankofamerica.co.uk'];
function isCachedSite(parsedDomain) {
    var cachedSites = JSON.parse(localStorage.cachedSites || "[]");
    console.log("  Cached Sites: " + JSON.stringify(cachedSites));
    var foundSite = false;
    // Check for the domain to be in our whitelist
    whitelistSites.some(function(site) {
        if (parsedDomain == site) {
            console.log("Found in WhiteList: " + parsedDomain);
            foundSite = true;
            return true;
        }
    });
    if (!foundSite && (cachedSites !== [])) {
        // Check for the domain to be in our cached entries
        cachedSites.some(function(site) {
            if (parsedDomain == site) {
                console.log("Found in Cached Sites: " + parsedDomain);
                foundSite = true;
                return true;
            }
        });
    }
    //return whether we found the domain in our whitelist or cached entries
    return foundSite;
}

function cacheSite(parsedDomain) {
    var cachedSites = JSON.parse(localStorage.cachedSites || "[]");
    cachedSites.push(parsedDomain);
    while (cachedSites.length > 250) {
        cachedSites.shift();
    }
    localStorage.cachedSites = JSON.stringify(cachedSites);
    console.log("  After Caching: " + JSON.stringify(cachedSites));
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
    var cachedBleedSites = JSON.parse(localStorage.cachedBleedSites || "[]");
    console.log("  Cached Bleed Sites: " + JSON.stringify(cachedBleedSites));
    var foundSite = false;
    if (!foundSite && (cachedBleedSites !== [])) {
        // Check for the domain to be in our cached entries
        cachedBleedSites.some(function(site) {
            if (parsedDomain == site) {
                console.log("   Found in Cached Bleed Sites: " + parsedDomain);
                foundSite = true;
                return true;
            }
        });
    }
    //return whether we found the domain in our whitelist or cached entries
    return foundSite;
}

function cacheBleedSite(parsedDomain) {
    var cachedBleedSites = JSON.parse(localStorage.cachedBleedSites || "[]");
    cachedBleedSites.push(parsedDomain);
    while (cachedBleedSites.length > 20) {
        cachedBleedSites.shift();
    }
    localStorage.cachedBleedSites = JSON.stringify(cachedBleedSites);
    console.log("  After Caching Bleed: " + JSON.stringify(cachedBleedSites));
}

function resetCachedBleedSites() {
    var cachedBleedSites = [];
    localStorage.cachedBleedSites = JSON.stringify(cachedBleedSites);
    return true;
}

