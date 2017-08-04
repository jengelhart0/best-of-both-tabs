'use strict';

//TODO bwehner wrap in iife/block or figure out modules s

/**
 * Data structure representing all of the mobile-desktop tab pairings
 * @constructor //TODO bwehner
 */
function MobileDesktopPairings() {
	this._keyedByDesktop ={};
	this._keyedByMobile = {};

    /**
	 * Add a tab pairing
     * @param desktopTabId Integer Tab ID of the desktop tab to be added to the pairing
     * @param mobileTabId Integer Tab ID of the mobile tab to be added to the pairing
     */
    MobileDesktopPairings.prototype.addPair = function(desktopTabId, mobileTabId) {
    	if (!Number.isInteger(desktopTabId) || !Number.isInteger(mobileTabId)) {
    		throw new Error("Tried to insert non-integer into MobileDesktopPairings");
		}
		this._keyedByDesktop[desktopTabId] = mobileTabId;
		this._keyedByMobile[mobileTabId] = desktopTabId;
	};

    MobileDesktopPairings.prototype.getCorrespondingTab = function(tabId) {
    	if (!Number.isInteger(tabId)) {
    		throw new Error("Given Tab Id is not an integer");
		}
		return this._keyedByDesktop[tabId] || this._keyedByMobile[tabId] || false;
	};

	MobileDesktopPairings.prototype.contains = function(tabId) {
        if (!Number.isInteger(tabId)) {
            throw new Error("Given Tab Id is not an integer");
        }
		return !!this.getCorrespondingTab(tabId);
	};

    /**
	 * Removes a pair from the mapping
     * @param eitherTabId Integer id of either the desktop or mobile tab from the map
     */
    MobileDesktopPairings.prototype.removeTabPair = function(eitherTabId) {
        if (!Number.isInteger(eitherTabId)) {
            throw new Error("Given Tab Id is not an integer");
        }
		delete this._keyedByDesktop[eitherTabId];
		delete this._keyedByMobile[eitherTabId];
	};

    MobileDesktopPairings.prototype.clearPairings = function() {
    	this._keyedByDesktop = {};
    	this._keyedByMobile = {};
	};

    /**
	 * Is the tab a desktop tab? Will also return false if tab does not exist in any pairing
     * @param tabId Integer
     */
    MobileDesktopPairings.prototype.isDesktopTab = function(tabId) {
    	return !!this._keyedByDesktop[tabId];
	};
}

// Map from desktop tab id's to mobile tab id's
const tabPairs = new MobileDesktopPairings();

// ID's of desktop (left) and mobile (right) windows
let desktopWindowId;
let mobileWindowId;

// Marks whether a new tab is currently being created, prevents "infinite loops" of tab creation
let newTabBeingCreated = false;

// Keep track of current active window for terrible, hacky reasons (so we can know if tab navigation was user initiated or programmatic)
// Abandon hope all ye who enter here
let focusedWindowId;

const clearTrackingInfo = () => {
	tabPairs.clearPairings()
	desktopWindowId = void(0);
	mobileWindowId = void(0);
	newTabBeingCreated = false;
	focusedWindowId = void(0);
};

const configureWindowSync = (desktopWindow, desktopTabId) => {
	return (mobileWindow) => {
        tabPairs.addPair(desktopTabId, mobileWindow.tabs[0].id);

		desktopWindowId = desktopWindow.id;
		mobileWindowId = mobileWindow.id;
    }
};

const mirrorDesktopWindow = (desktopWindow) => {
    const desktopWindowInfo = {
        top: 0,
        left: 0,
        width: screen.width * 2 / 3,
        height: screen.height
    };

    const device = chrome.extension.getBackgroundPage().getDevice();
    const mobileWindowInfo = {
        top: 0,
		left: screen.width * 2 / 3,
        width: device.width !== 0 ? device.width : screen.width / 2,
        height: device.height !== 0 ? device.height : screen.height,
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
	const correspondingTab = tabPairs.getCorrespondingTab(tabId);
	if (changeInfo.url && correspondingTab && tab.windowId === focusedWindowId) {
		chrome.tabs.update(correspondingTab, {url: changeInfo.url});
	}
});

// Listen to tab creation and mirror it in the other window and update the tab map if relevant
chrome.tabs.onCreated.addListener((newUserTab) => {
	const newTabUrl = newUserTab.url;
	if (!newTabBeingCreated && newUserTab.windowId === desktopWindowId) {
		// Prevents infinite loop of tab creation
        newTabBeingCreated = true;
		chrome.tabs.create({windowId: mobileWindowId}, (newProgrammaticTab) => {
			chrome.tabs.update(newProgrammaticTab.id, {url: newTabUrl}, (updatedProgrammaticTab) => {
                // New tab is in desktop window, programmatic is mobile
                tabPairs.addPair(newUserTab.id, newProgrammaticTab.id);
                newTabBeingCreated = false;
			});
		});
	} else if (!newTabBeingCreated && newUserTab.windowId === mobileWindowId) {
        newTabBeingCreated = true;
        chrome.tabs.create({windowId: desktopWindowId}, (newProgrammaticTab) => {
            // New tab is in mobile window, programmatic is desktop
            chrome.tabs.update(newProgrammaticTab.id, {url: newTabUrl}, (updatedProgrammaticTab) => {
                tabPairs.addPair(newProgrammaticTab.id, newUserTab.id);
                newTabBeingCreated = false;
            });
        });
	}
});

// Listen to tab removal and mirror it in the other window and update the tab map if relevant
chrome.tabs.onRemoved.addListener((removedTabId) => {
	const correspondingTab = tabPairs.getCorrespondingTab(removedTabId);
    if (correspondingTab) {
        tabPairs.removeTabPair(removedTabId);
    	chrome.tabs.remove(correspondingTab);
	}
});

// Listen to a change in which tab is focused in a window and update the focus of the tab in the corresponding window
chrome.tabs.onActivated.addListener((activeInfo) => {
    const correspondingTab = tabPairs.getCorrespondingTab(activeInfo.tabId);
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
        clearTrackingInfo();
	}
});

const createMirroredWindow = ()=> {
	chrome.windows.getCurrent((window) => {
		const startSession = chrome.extension.getBackgroundPage().getStartSession();
        chrome.tabs.query({active: true, windowId: window.id}, (tabArray) => {
            if (startSession === "new") {
                if (tabArray[0].url.includes("tripadvisor")) {
                    chrome.windows.create({ url: tabArray[0].url}, (newWindow) => {
                        mirrorDesktopWindow(newWindow);
                    });
                } else {
                    chrome.windows.create({ url: "https://www.tripadvisor.com/"}, (newWindow) => {
                        mirrorDesktopWindow(newWindow);
                    });
				}


            } else {
            	if (tabArray[0].url.includes("tripadvisor")) {
                    mirrorDesktopWindow(window);
				} else {
            		chrome.tabs.update(tabArray[0].id, {url: "https://www.tripadvisor.com/"}, () => {
            			mirrorDesktopWindow(window);
					})
				}

            }
        })

	});

	// Listener to handle messages from content script
	// super important method!
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		const correspondingTabId = tabPairs.getCorrespondingTab(sender.tab.id);

		// stub out scrolling messages when scrolling is locked
		const scrollLock = chrome.extension.getBackgroundPage().getScrollLock();
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
		const headers = details.requestHeaders;
		// check if the tabId is a mobile page
		const isMobilePage = tabPairs.contains(details.tabId) && !tabPairs.isDesktopTab(details.tabId);
		if (isMobilePage) {
			for(let i = 0; i < headers.length; i += 1) {
                if( headers[i].name === 'User-Agent' ) {
                    const device = chrome.extension.getBackgroundPage().getDevice();
                    headers[i].value = device.ua;
                    break;
                }
			}
		}
        return {requestHeaders: headers};

	}, { urls: ["<all_urls>"] }, ['requestHeaders','blocking']);
}


chrome.browserAction.onClicked.addListener(createMirroredWindow);
