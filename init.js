// put device info on local storage
var storeDevice = (device) => {
	let userAgents = chrome.extension.getBackgroundPage().userAgents;
	if (!userAgents[device]) {
		console.error('device does not exist');
	}
	localStorage['device'] = device
	localStorage['ua'] = userAgents[device]['ua']
	localStorage['width'] = userAgents[device]['width']
	localStorage['height'] = userAgents[device]['height']
}

// "on" or "off"
var storeScrollLock = (set) => {
	localStorage['scrollLock'] = set;
}

// "new" or "same"
var storeStartSession = (set) => {
	localStorage['startSession'] = set
}

// "on" or "off"
var storeGlueWindows = (set) => {
	localStorage['glueWindows'] = set;
}

// runs when chrome extension is loaded
let init = () => {
	// defaults
	storeDevice('iPhone 5');
	storeScrollLock('on');
	storeStartSession('new');
	storeGlueWindows('on');
}
init();
