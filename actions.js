'use strict';
// browser actions

// Map from desktop tab id's to mobile tab id's
let tabPairs = {}

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
            chrome.windows.create(rightWindowInfo, setDesktopTabId(tabArray[0].id));
        })
	});
}

chrome.browserAction.onClicked.addListener(openNewTab);