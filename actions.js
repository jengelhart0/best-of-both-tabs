'use strict';
// browser actions

let tabPairs = {}

function setOldTabId(oldTabId) {
	return function (newWindow) {
        tabPairs[oldTabId] = newWindow.tabs[0].id
        // alert("tab created");
        // alert(oldTabId)
		// alert(newWindow.tabs[0].id)
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // alert("updated url")
})

function openNewTab() {
	chrome.windows.getCurrent((window) => {
		// get the screen dimensions
		// resize the current window
		// create the new window
		const leftWindowInfo = {
			top: 0,
			left: 0,
			width: screen.width / 2,
			height: screen.height
		}
		const rightWindowInfo = {
			top: 0,
			left: screen.width / 2,
			width: screen.width / 2,
			height: screen.height,
			focused: false,
			url: 'http://tripadvisor.com'
		}
		chrome.windows.update(window.id, leftWindowInfo)

        // create new window with info and callback
        chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
            chrome.windows.create(rightWindowInfo, setOldTabId(tabArray[0].id));
        })
	});


	var requestFilter = {
		urls: [
			"<all_urls>"
		]
	};

	chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
		var headers = details.requestHeaders;
		var found = false;
		for (const key in tabPairs) {
			if (tabPairs[key] == details.tabId) {
				found = true
			}
		}
		if (!found) {
			return;
		}
		for(var i = 0, l = headers.length; i < l; ++i) {
			if( headers[i].name == 'User-Agent' ) {
				break;
			}
		}
		if(i < headers.length) {
			headers[i].value = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) CriOS/27.0.1453.10 Mobile/10B350 Safari/8536.25';
		}
		return {requestHeaders: headers};
	}, requestFilter, ['requestHeaders','blocking']);
}

chrome.browserAction.onClicked.addListener(openNewTab);