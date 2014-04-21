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
        chrome.runtime.sendMessage({method: "getCBLocalStorage", key: "update"}, function(response) {
                if (response) {
                    console.log("returned:"+response.method);
                }   
        });
    }
}