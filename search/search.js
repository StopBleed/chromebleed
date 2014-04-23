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
    var isOk = isCachedSite(parsedDomain);
    var isCautionSite = isCachedCautionSite(parsedDomain);
    var isBleedSite = isCachedBleedSite(parsedDomain);
    if (!isBleedSite && !isOk && !isCautionSite) {
        requestURL(parsedDomain, function(text) {
            var result = JSON.parse(text);
            console.log("  Returned: " + text);
            //register it as checked
            switch (result.code) {
                case 0:
                    //it is vuln.
                    console.log("  Vuln Site: " + parsedDomain);
                    cacheBleedSite(parsedDomain);
                    thisa.prepend('<img class="chromebleedError imgvuln" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
                    break;
                case 1:
                    console.log("  Adding Site to Cache: " + parsedDomain);
                    thisa.prepend('<img class="chromebleedError imgok" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
                    cacheSite(parsedDomain);
                    break;
                default:
                    console.log("  Adding Site to Caution Cache: " + parsedDomain);
                    thisa.prepend('<img class="chromebleedError imgerr" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
                    cacheCautionSite(parsedDomain, "");
                    break;
            }
        });
    } else {
        if (isBleedSite)
            thisa.prepend('<img class="chromebleedError imgvuln" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
        else if (isOk)
            thisa.prepend('<img class="chromebleedError imgok" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
        else
            thisa.prepend('<img class="chromebleedError imgerr" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM3QkJCOUEyQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM3QkJCOUEzQ0FCNDExRTNBNEZGQTA1NTIxOTczNjE5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzdCQkI5QTBDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzdCQkI5QTFDQUI0MTFFM0E0RkZBMDU1MjE5NzM2MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz45UiacAAAAEElEQVR42mL4//8/A0CAAQAI/AL+26JNFgAAAABJRU5ErkJggg=="/>');
    }
}

function checkElements() {
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

function runCheckLater(event) {
    if (!(isActivated && isShowOnGoogle))
        return;
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

//upon page load, check page elements
$(document).ready(function(event) {
    console.log("DOM fully loaded");
    $("#gbqfb").click(runCheckLater);
    $("#gbqfsa").click(runCheckLater);
    $("#gbqfq").change(runCheckLater);
    //In search we only cache bleed sites for the current search
    resetCachedBleedSites();
    // Load options data when page is started
    loadOptions();
    setTimeout(waitForLoad, 2000);
});
