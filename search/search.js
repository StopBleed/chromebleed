var isShowingAll = false;
var isShowOnGoogle = false;
var isActivated = true;
var eid = null;
var lastSearchText = null;
var searchText = null;

// call background for a message handler
function loadOptions() {
    chrome.runtime.sendMessage({method: "getCBLocalStorage", key: "options"}, function(response) {
        if (response) {
            isActivated = (response.isActivated === 'true');
            isShowingAll = (response.isShowingAll === 'true');
            isShowOnGoogle = (response.isShowOnGoogle === 'true');
            console.log("  [value isActivated]" + response.isActivated);
            console.log("  [value isShowingAll]" + response.isShowingAll);
            console.log("  [value isShowOnGoogle]" + response.isShowOnGoogle);
        }
    });
}

function checkURL(host, tld, parsedDomain, thisa) {
    var url = host + '.' + tld;
    var isOk = isCachedSite(parsedDomain);
    var isBleedSite = isCachedBleedSite(parsedDomain);
    if (!isBleedSite && !isOk) {
        requestURL(parsedDomain, function(text) {
            var result = JSON.parse(text);
            console.log("  Returned: " + text);
            //register it as checked
            if (result.code === 0) {
                //it is vuln.
                console.log("  Vuln Site: " + parsedDomain);
                cacheBleedSite(parsedDomain);
                thisa.prepend('<img class="chromebleedError" src="https://raw.githubusercontent.com/stopbleed/chromebleed/master/icon48.png" alt="Chromebleed Checker" />');
                return 'fail';
            } else {
                //add to the cached sites
                console.log("  Adding Site to Cache: " + parsedDomain);
                cacheSite(parsedDomain);
            }
        });
    } else {
        if (isBleedSite)
            thisa.prepend('<img class="chromebleedError" src="https://raw.githubusercontent.com/stopbleed/chromebleed/master/icon48.png" alt="Chromebleed Checker" />');
    }
}

function checkElements() {
//In search we only cache bleed sites for the current search
    resetCachedBleedSites();
    //set the eid
    eid = $('#rso').attr('eid');
    //and search text
    lastSearchText = $('#gbqfq').val();
    //iterate
    $('h3 a').each(function() {
        var checkingURL = ($(this).attr('href'));
        console.log("  Checking Url: " + checkingURL);
        var parsedURL = parseURL(checkingURL);
        console.log("  Parsed to: " + JSON.stringify(parsedURL));
        $(this).attr('class', parsedURL.host + parsedURL.tld);
        checkURL(parsedURL.host, parsedURL.tld, parsedURL.domain, $(this));
    });
}

var waitcount = 0;
function waitForLoad() {
    console.log("isActivated=" + isActivated);
    console.log("isShowOnGoogle=" + isShowOnGoogle);
    if (isActivated && isShowOnGoogle) {
        console.log("waiting..." + waitcount + " - " + $('#pnnext').length)
        //wait for results to display
        if ($('#pnnext').length > 0) {
            //remove any prior bleed icons
            $('.chromebleedError').each(function() {
                $(this).remove();
            });
            //elements have arrived
            checkElements();
            waitcount = 0;
        } else {
            waitcount++;
            if (waitcount <= 20) {
                setTimeout(waitForLoad, 500);
            } else {
                waitcount = 0;
            }
        }
    }
}

//upon page load, check page elements
$(document).ready(function() {
    // Load options data when page is started
    loadOptions();
    setTimeout(waitForLoad, 2000);
});
$(window).load(function() {
    console.log("Checking Elements ----->");
    document.getElementById("gbqfb").onclick = runCheckLater;
    document.getElementById("gbqfsa").onclick = runCheckLater;
    document.getElementById("gbqfq").onchange = runCheckLater;
});
function runCheckLater(event) {
    if (!(isActivated && isShowOnGoogle)) return;
    console.log("RunningLater>");
    if (event.target) {
        var mils = 500;
        switch (event.target.id) {
            case 'gbqfb':
            case 'gbqfsa':
                mils = 2000;
                break;
            default:
                mils = 1000;
                break;
        }
        setTimeout(waitForLoad, mils);
    }
}
