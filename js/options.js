// Copyright (c) 2014 The Chromebleed Contributors. All rights reserved.

/*
 Grays out or [whatever the opposite of graying out is called] the option
 field.
 */
function ghost(isDeactivated) {
    options.style.color = isDeactivated ? 'graytext' : 'black';
    // The label color.
}

window.addEventListener('load', function() {
    // Initialize the option controls.
    options.isActivated.checked = JSON.parse(localStorage.isActivated);
    options.isShowingAll.checked = JSON.parse(localStorage.isShowingAll);
    //options.isShowOnGoogle.checked = JSON.parse(localStorage.isShowOnGoogle);

    if (!options.isActivated.checked) {
        ghost(true);
    }

    // Set the display activation
    options.isActivated.onchange = function() {
        localStorage.isActivated = options.isActivated.checked;
        ghost(!options.isActivated.checked);
        console.log("isActivated:" + options.isActivated.checked);
        
        //Visual icon for on Activated.
        var icon_name = (options.isActivated.checked?"logo-ok48.png":"logo-off48.png")
        var title = (options.isActivated.checked?"Notificatons Active!":"Notificatons Off!")
        //also change the 'heartbleed' icon at top right of browser
        chrome.browserAction.setIcon({path: icon_name});
        //add tooltip with title
        chrome.browserAction.setTitle({title: title});

    };
    // Set the showing of domains that seem Ok
    options.isShowingAll.onchange = function() {
        localStorage.isShowingAll = options.isShowingAll.checked;
        console.log("isShowingAll:" + options.isShowingAll.checked);
    };
    // Set whether showing on Google search page
//    options.isShowOnGoogle.onchange = function() {
//        localStorage.isShowOnGoogle = options.isShowOnGoogle.checked;
//        console.log("isShowOnGoogle:" + options.isShowOnGoogle.checked);
//    };
    // Clear cached sites on click
    options.clearCachedSites.onclick = function() {
        resetCachedSites();
        resetCachedBleedSites();
        alert('Cached Sites Cleared!');
        //console.log(" Cached Sites after clear:" + JSON.stringify(cachedSites) + JSON.stringify(cachedBleedSites));
    };

});