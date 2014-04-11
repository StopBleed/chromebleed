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
    console.log("Checking Elements ----->");
    checkElements();
});

$('#gbqfb').click(function() {
    searchUpdate();
});

$('#gbqfsa').click(function() {
    waitForLoad();
});
