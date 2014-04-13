var isShowingAll = false;
var isShowOnGoogle = false;
var isActivated = true;
var eid = null;
var searchText = null;

// call background for a message handler
function loadOptions() {
    chrome.runtime.sendMessage({method: "getCBLocalStorage", key: "isActivated"}, function(response) {
        if (response && response.data) {
            console.log("  [value isActivated]" + response.data);
            isActivated = response.data;
        }
    });
    chrome.runtime.sendMessage({method: "getCBLocalStorage", key: "isShowingAll"}, function(response) {
        if (response && response.data) {
            console.log("  [value isShowingAll]" + response.data);
            isShowingAll = response.data;
        }
    });
    chrome.runtime.sendMessage({method: "getCBLocalStorage", key: "isShowOnGoogle"}, function(response) {
        if (response && response.data) {
            console.log("  [value isShowOnGoogle]" + response.data);
            isShowOnGoogle = response.data;
        }
    });
}

function checkURL(host, tld, parsedDomain) {
    var url = host + '.' + tld;
    requestURL(parsedDomain, function(text) {
        var result = JSON.parse(text);
        console.log("  Returned: " + text);
        //register it as checked
        if (result.code === 0) {
            //it is vuln.
            console.log("  Vuln Site: " + parsedDomain);
            if (!isCachedBleedSite(parsedDomain)) {
                // Only need to add once for this domain
                cacheBleedSite(parsedDomain);
                $('.' + host + tld).prepend('<img class="chromebleedError" src="https://raw.githubusercontent.com/hyl/chromebleed/master/icon128.png" alt="Chromebleed Checker" />');
            }
            return 'fail';
        } else {
            //add to the cached sites
            console.log("  Adding Site to Cache: " + parsedDomain);
            cacheSite(parsedDomain);
        }
    });
}

function checkElements() {
    //In search we only cache bleed sites for the current search
    resetCachedBleedSites();
    //set the eid
    eid = $('#rso').attr('eid');
    //and search text
    searchText = $('#gbqfq').val();
    //iterate
    $('h3 a').each(function() {
        var alreadyChecked = false;
        var checkingURL = ($(this).attr('href'));
        console.log("  Checking Url: " + checkingURL);
        var parsedURL = parseURL(checkingURL);
        console.log("  Parsed to: " + JSON.stringify(parsedURL));
        $(this).attr('class', parsedURL.host + parsedURL.tld);
        //check if already checked
        if ($(this).attr('checkedByChromebleed')) {
            console.log("  Checked OnPage: " + checkingURL);
            // marked as checked on this page
            alreadyChecked = true;
        } else {
            //check if in cached sites
            alreadyChecked = isCachedSite(parsedURL.domain);
        }
        console.log((alreadyChecked ? "  alreadyChecked: " : "  NOT alreadyChecked: ") + parsedURL.domain);
        //now check alreadyChecked
        if (!alreadyChecked && !isCachedBleedSite(parsedURL.domain)) {
            //it's going to be checked for a Bleed Site
            $('.' + parsedURL.host + parsedURL.tld).attr('checkedByChromebleed', '1');
            checkURL(parsedURL.host, parsedURL.tld, parsedURL.domain);
        }
    });
}

function waitForLoad() {
    console.log("waiting...")
//wait for results to display
    if ($('.g').length > 0) {
        //elements have arrived
        checkElements();
    } else {
        setTimeout(waitForLoad, 500);
    }
}

function searchUpdate() {
    newEid = $('#rso').attr('eid');
    newSearchText = $('#gbqfq').val();
    if (newEid === eid) {
        setTimeout(searchUpdate, 500);
    } else if (newSearchText === searchText) {
    } else {
        checkElements();
    }
}

//upon page load, check page elements
$(document).ready(function() {
    // Load options data when page is started
    loadOptions();
});

$(window).load(function() {
    console.log("Checking Elements ----->");
    checkElements();
});

$('#gbqfb').click(function() {
    console.log("Search Update ----->");
    searchUpdate();
});

$('#gbqfsa').click(function() {
    console.log("WaitFor Load ----->");
    waitForLoad();
});
