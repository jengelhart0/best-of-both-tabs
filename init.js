// put device info on local storage
var storeDevice = (device) => {
	let userAgents = chrome.extension.getBackgroundPage().userAgents;
	if (!userAgents[device]) {
		console.error('device does not exist');
	}
	localStorage['device'] = device;
	localStorage['ua'] = userAgents[device]['ua'];
	localStorage['width'] = userAgents[device]['width'];
	localStorage['height'] = userAgents[device]['height'];
};
// "on" or "off"
var storeScrollLock = (set) => {
	localStorage['scrollLock'] = set;
};

// "new" or "same"
var storeStartSession = (set) => {
	localStorage['startSession'] = set
};

// "on" or "off"
var storeGlueWindows = (set) => {
	localStorage['glueWindows'] = set;
};

// get device
var getDevice = () => {
	return {
		'device': localStorage['device'],
		'ua': localStorage['ua'],
		'width': parseInt(localStorage['width'], 10),
		'height': parseInt(localStorage['height'], 10)
	}
}

// "on" or "off"
var getScrollLock = () => {
	return localStorage['scrollLock'];
};

// "new" or "same"
var getStartSession = () => {
	return localStorage['startSession'];
};

// "on" or "off"
var getGlueWindows = () => {
	return localStorage['glueWindows'];
};

// runs when chrome extension is loaded
let init = () => {
	// defaults
	storeDevice('iPhone 5');
	storeScrollLock('on');
	storeStartSession('same');
	storeGlueWindows('on');
};
init();
