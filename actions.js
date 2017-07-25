'use strict';
// browser actions

// Map from desktop tab id's to mobile tab id's
let tabPairs = {};

// ID's of desktop (left) and mobile (right) windows
let desktopWindowId;
let mobileWindowId;

// Marks whether a new tab is currently being created, prevents "infinite loops" of tab creation
let newTabBeingCreated = false;

function getCorrespondingTab(tabId) {
    let correspondingTab = tabPairs[tabId] || false;

    if (!correspondingTab) {
        Object.keys(tabPairs).forEach((key) => {
            if (tabId === tabPairs[key]) {
                correspondingTab = parseInt(key, 10);
            }
        });
    }


    return correspondingTab;
}

function MirrorLeftWindow(leftWindow, oldTabId) {
	return function createAndMirrorRightWindow(rightWindow) {
        tabPairs[oldTabId] = rightWindow.tabs[0].id;

		desktopWindowId = leftWindow.id;
		mobileWindowId = rightWindow.id;
    }
}

// Listen to URL change in any tab and update the corresponding tab with the proper url
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	let correspondingTab = getCorrespondingTab(tabId);
	if (changeInfo.url && correspondingTab) {
		chrome.tabs.update(correspondingTab, {url: changeInfo.url});
	}
});

// Listen to tab creation and mirror it in the other window and update the tab map if relevant
chrome.tabs.onCreated.addListener((newUserTab) => {
	let newTabUrl = newUserTab.url;
	if (!newTabBeingCreated && newUserTab.windowId === desktopWindowId) {
		// Prevents infinite loop of tab creation
        newTabBeingCreated = true;
		chrome.tabs.create({windowId: mobileWindowId}, (newProgrammaticTab) => {
			chrome.tabs.update(newProgrammaticTab.id, {url: newTabUrl}, (updatedProgrammaticTab) => {
                // New tab is in desktop window, programmatic is mobile
                tabPairs[newUserTab.id] = newProgrammaticTab.id;
                newTabBeingCreated = false;
			});
		});
	} else if (!newTabBeingCreated && newUserTab.windowId === mobileWindowId) {
        newTabBeingCreated = true;
        chrome.tabs.create({windowId: desktopWindowId}, (newProgrammaticTab) => {
            // New tab is in mobile window, programmatic is desktop
            chrome.tabs.update(newProgrammaticTab.id, {url: newTabUrl}, (updatedProgrammaticTab) => {
                tabPairs[newProgrammaticTab.id] = newUserTab.id;
                newTabBeingCreated = false;
            });
        });
	}
});

// Listen to tab removal and mirror it in the other window and update the tab map if relevant
chrome.tabs.onRemoved.addListener((removedTabId) => {
	let removedTabIsDesktop = tabPairs[removedTabId] ? true : false;
	let correspondingTab = getCorrespondingTab(removedTabId);
    if (correspondingTab) {
        if (removedTabIsDesktop) {
            delete tabPairs[removedTabId];
        } else {
            delete tabPairs[correspondingTab];
        }
    	chrome.tabs.remove(correspondingTab);
	}
});

// Listen to a change in which tab is focused in a window and update the focus of the tab in the corresponding window
chrome.tabs.onActivated.addListener((activeInfo) => {
	if (activeInfo.windowId === desktopWindowId || activeInfo.windowId === mobileWindowId) {
		let correspondingTab = getCorrespondingTab(activeInfo.tabId);
		chrome.tabs.update(correspondingTab, {selected: true});
	}
});

function CreateMirroredWindow() {
	chrome.windows.getCurrent((window) => {
		// get the screen dimensions
		// resize the current window
		// create the new window
		const leftWindowInfo = {
			top: 0,
			left: 0,
			width: screen.width / 2,
			height: screen.height
		};
		const rightWindowInfo = {
			top: 0,
			left: screen.width / 2,
			width: screen.width / 2,
			height: screen.height,
			focused: false,
			url: 'http://tripadvisor.com'
		};
		chrome.windows.update(window.id, leftWindowInfo);

        // create new window with info and callback
        chrome.tabs.query({active: true, currentWindow: true}, function(tabArray) {
            chrome.windows.create(rightWindowInfo, MirrorLeftWindow(window, tabArray[0].id));
        })
	});


	var requestFilter = {
		urls: [
			"<all_urls>"
		]
	};

	// Listener to redirect to mobile pages
	chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
		var headers = details.requestHeaders;
		// check if the tabId is a value in the map (a mobile page)
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

chrome.browserAction.onClicked.addListener(CreateMirroredWindow);