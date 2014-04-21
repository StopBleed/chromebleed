var optionsTabID = null;
function openOptions() {
    chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
        // Tab opened.
        optionsTabID = tab.id;  //TODO (#25):Used later
    });
}

window.addEventListener('load', function() {
    // get activation status
    var isActive = JSON.parse(localStorage.isActivated);
    console.log(" active=" + isActive);
    // update the visual page status
    updateVisual(isActive);
    // set the activation checkbox
    document.getElementById("isActivated").checked = isActive;
    
    // set the event listeners
    document.getElementById("isActivated").onclick = changeActivation;
    document.getElementById("openoptions").onclick = openOptions;
});
function updateVisual(isActive) {
    var icon_name = (isActive ? "icon48.png" : "logo-off48.png")
    var title = (isActive ? "Notifications Active!" : "Notifications Off!")
    document.getElementById("logosrc").src = icon_name;
    //also change the 'heartbleed' icon at top right of browser
    chrome.browserAction.setIcon({path: icon_name});
    //add tooltip with title
    chrome.browserAction.setTitle({title: title});
    if (isActive) {
        document.getElementById("runningdesc").innerHTML = 'running in the background and activated';
    } else {
        document.getElementById("runningdesc").innerHTML = 'running in the background, <b>but not activated</b>';
    }
}
function changeActivation(event) {
    if (event.target) {
        var isChecked = event.target.checked;
        localStorage.isActivated = isChecked;
        updateVisual(isChecked);
        console.log("isActivated:" + localStorage.isActivated);
    }
}