var optionsTabID = null;
function openOptions() {
    chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
        // Tab opened.
        optionsTabID = tab.id;  //TODO:Used later
    });
}

window.addEventListener('load', function() {
    document.getElementById("openoptions").onclick = openOptions;
    console.log(" active="+localStorage.isActivated);
    if (JSON.parse(localStorage.isActivated)){
        document.getElementById("runningdesc").innerHTML = 'running in the background and activated';
        document.getElementById("logosrc").src = 'icon48.png';
    } else {
        document.getElementById("runningdesc").innerHTML = 'running in the background, <b>but not activated</b>, use options';
        document.getElementById("logosrc").src = 'logo-off48.png';
    }
});