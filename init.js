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

// runs when chrome extension is loaded
let init = () => {
	// default device specified here
	storeDevice('iPhone 5');
}
init();
