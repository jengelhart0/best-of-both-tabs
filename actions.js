'use strict';
// browser actions

// Map from desktop tab id's to mobile tab id's
let tabPairs = {}

function setOldTabId(oldTabId) {
	return function (newWindow) {
        tabPairs[oldTabId] = newWindow.tabs[0].id
    }
}

function setDesktopTabId(desktopTabId) {
	return (newWindow) => {
        tabPairs[desktopTabId] = newWindow.tabs[0].id;
    }
}

function getCorrespondingTab(tabId) {
	let correspondingTab = tabPairs[tabId] || false;

	Object.keys(tabPairs).forEach((key) => {
		if (tabId === tabPairs[key]) {
			correspondingTab = parseInt(key, 10);
		}
	})

	return correspondingTab;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	let correspondingTab = getCorrespondingTab(tabId)
	if (changeInfo.url && correspondingTab) {
		chrome.tabs.update(correspondingTab, {url: changeInfo.url});
	}
})

function openNewTab() {
	chrome.windows.getCurrent((window) => {
		chrome.storage.local.get('device', (store) => {
			const desktopWindowInfo = {
				top: 0,
				left: 0,
				width: screen.width / 2,
				height: screen.height
			}
			const mobileWindowInfo = {
				top: 0,
				left: screen.width / 2,
				width: store.device ? store.device.width : screen.width / 2,
				height: store.device ? store.device.height : screen.height,
				focused: false,
				url: 'http://tripadvisor.com'
			}

			// resize desktop window
			chrome.windows.update(window.id, desktopWindowInfo)

	        // create mobile window, add to map
	        chrome.tabs.query({active: true, currentWindow: true}, (tabArray) => {
	            chrome.windows.create(mobileWindowInfo, setDesktopTabId(tabArray[0].id));
	        });
		});
	});

	var requestFilter = {
		urls: [
			"<all_urls>"
		]
	};

	// Listener to redirect to mobile pages
	chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
		chrome.storage.local.get('device', (store) => {
			var headers = details.requestHeaders;
			// check if the tabId is a value in the map (a mobile page)
			var found = false;
			Object.keys(tabPairs).forEach((key) => {
				if (tabPairs[key] == details.tabId) {
					found = true
				}
			})
			if (!found) {
				return;
			}
			for(var i = 0, l = headers.length; i < l; ++i) {
				if( headers[i].name == 'User-Agent' ) {
					break;
				}
			}
			if(i < headers.length) {
				headers[i].value = store.device.ua
			}
			return {requestHeaders: headers};
		});
	}, requestFilter, ['requestHeaders','blocking']);
}

chrome.browserAction.onClicked.addListener(openNewTab);