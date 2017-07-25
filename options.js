'use strict';

let buildDeviceOptions = () => {
	let deviceSelect = document.getElementById('device-select');
	let userAgents = chrome.extension.getBackgroundPage().userAgents;
	Object.keys(userAgents).forEach((key) => {
		deviceSelect.add(new Option(key, key));
	})
};

let changeDevice = (event) => {
	if (event.target.value) {
		let storeDevice = chrome.extension.getBackgroundPage().storeDevice;
		storeDevice(event.target.value)
	}
}

// run on page load
let init = () => {
	let deviceSelect = document.getElementById('device-select');
	deviceSelect.addEventListener("change", changeDevice);
	buildDeviceOptions();
}
init();