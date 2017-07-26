'use strict';
// browser actions

// Map from desktop tab id's to mobile tab id's
let tabPairs

// ID's of desktop (left) and mobile (right) windows
let desktopWindowId;
let mobileWindowId;

// Marks whether a new tab is currently being created, prevents "infinite loops" of tab creation
let newTabBeingCreated

// Keep track of current active window for terrible, hacky reasons (so we can know if tab navigation was user initiated or programmatic)
// Abandon hope all ye who enter here
let focusedWindowId;

function initTracking() {
	tabPairs = {};
	desktopWindowId = void(0);
	mobileWindowId = void(0);
	newTabBeingCreated = false;
	focusedWindowId = void(0);
}

initTracking();

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

function configureWindowSync(desktopWindow, oldTabId) {
	return function createAndMirrorMobileWindow(mobileWindow) {
        tabPairs[oldTabId] = mobileWindow.tabs[0].id;

		desktopWindowId = desktopWindow.id;
		mobileWindowId = mobileWindow.id;
    }
}

function mirrorDesktopWindow(desktopWindow) {
  const desktopWindowInfo = {
    top: 0,
    left: 0,
    width: screen.width * 2 / 3,
    height: screen.height
  };
  const mobileWindowInfo = {
    top: 0,
    left: screen.width * 2 / 3,
    width: localStorage['width'] ? parseInt(localStorage['width'], 10) : screen.width / 2,
    height: localStorage['height'] ? parseInt(localStorage['height'], 10) : screen.height,
    focused: false,
  };

    // resize desktop window
    chrome.windows.update(desktopWindow.id, desktopWindowInfo);

    // Mark the initilizer window as the active window
    focusedWindowId = desktopWindow.id;

    // create mobile window, add to map
    chrome.tabs.query({active: true, windowId: desktopWindow.id}, (tabArray) => {
        mobileWindowInfo.url = tabArray[0].url;
        chrome.windows.create(mobileWindowInfo, configureWindowSync(desktopWindow, tabArray[0].id));
    });
}

// Listen to URL change in any tab and update the corresponding tab with the proper url
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	let correspondingTab = getCorrespondingTab(tabId);
	if (changeInfo.url && correspondingTab && tab.windowId === focusedWindowId) {
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
    let correspondingTab = getCorrespondingTab(activeInfo.tabId);
	if (correspondingTab && (activeInfo.windowId === desktopWindowId || activeInfo.windowId === mobileWindowId)) {
		chrome.tabs.update(correspondingTab, {selected: true});
	}
});

// Keep track of when the focused window changes
chrome.windows.onFocusChanged.addListener((newFocusedWindowId) => {
	focusedWindowId = newFocusedWindowId;
});

// Clear everything when the mobile window closes
chrome.windows.onRemoved.addListener((windowId) => {
	if (windowId === mobileWindowId) {
        initTracking();
	}
})

function createMirroredWindow() {
	chrome.windows.getCurrent((window) => {
		let startSession = chrome.extension.getBackgroundPage().getStartSession();
		if (startSession === "new") {
			chrome.tabs.query({active: true, windowId: window.id}, (tabArray) => {
                chrome.windows.create({ url: tabArray[0].url}, (newWindow) => {
                    mirrorDesktopWindow(newWindow);
				})
			})
		} else {
			mirrorDesktopWindow(window);
		}
	});

	var requestFilter = {
		urls: [
			"<all_urls>"
		]
	};

	// Listener to handle messages from content script
	// super important method!
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		let correspondingTabId = getCorrespondingTab(sender.tab.id);

		// stub out scrolling messages when scrolling is locked
		let scrollLock = chrome.extension.getBackgroundPage().getScrollLock();
		if (message.scrollPercentage && scrollLock !== 'on') {
			return
		}
		if(correspondingTabId) {
			chrome.tabs.sendMessage(correspondingTabId, message, null, sendResponse);
		} else {
			console.log("Error relaying message: No corresponding tab to receive messsage");
		}
	});

	// Listener to redirect to mobile pages
	chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
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
				headers[i].value = localStorage['ua']
			}
			return {requestHeaders: headers};
	}, requestFilter, ['requestHeaders','blocking']);
}


chrome.browserAction.onClicked.addListener(createMirroredWindow);
