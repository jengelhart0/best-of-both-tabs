(function () {
    var port = chrome.runtime.connect({name: "main-page-events"});

    chrome.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab) {
            debugger;
        }
    )
})();