'use strict';
// browser actions

let tabPairs = {}

function setOldTabId(oldTabId) {
	return function (newWindow) {
        tabPairs[oldTabId] = newWindow.tabs[0].id
        alert("tab created");
        alert(oldTabId)
		alert(newWindow.tabs[0].id)
    }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    alert("updated url")
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
}

chrome.browserAction.onClicked.addListener(openNewTab);