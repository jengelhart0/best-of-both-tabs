'use strict';

// map from name of device to info
let userAgents = {
	'iPhone 5': {
		ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
		width: 320,
		height: 568
	},
	'iPhone 6': {
		ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25',
		width: 375,
		height: 667
	},
	'iPhone 6+': {
		ua: 'Mozilla/6.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/8.0 Mobile/10A5376e Safari/8536.25',
		width: 414,
		height: 736
	},
	'iPhone 7': {
		ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A5297c Safari/602.1',
		width: 375,
		height: 667
	},
	'iPhone 7+': {
		ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1',
		width: 414,
		height: 736
	}
}

let buildDeviceOptions = () => {
	let deviceSelect = document.getElementById('device-select');
	Object.keys(userAgents).forEach((key) => {
		deviceSelect.add(new Option(key, key));
	})
};

let changeDevice = (event) => {
	if (event.target.value) {
		storeDevice(event.target.value)
	}
}

// put device info on local storage
let storeDevice = (device) => {
	if (!userAgents[device]) {
		console.error('device does not exist');
	}
	localStorage['device'] = device
	localStorage['ua'] = userAgents[device]['ua']
	localStorage['width'] = userAgents[device]['width']
	localStorage['height'] = userAgents[device]['height']
}

// init stuff
let deviceSelect = document.getElementById('device-select');
deviceSelect.addEventListener("change", changeDevice);
buildDeviceOptions();
storeDevice('iPhone 5');
