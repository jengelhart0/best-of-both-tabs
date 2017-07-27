'use strict';

// build the options in the device select
let buildDeviceOptions = () => {
	let deviceSelect = document.getElementById("device-select");
	let userAgents = chrome.extension.getBackgroundPage().userAgents;
	Object.keys(userAgents).forEach((key) => {
		deviceSelect.add(new Option(key, key));
	})
};

// change the current device
let changeDevice = (event) => {
	if (event.target.value) {
		let storeDevice = chrome.extension.getBackgroundPage().storeDevice;
		storeDevice(event.target.value)
	}
}

// Add a new device
let addDevice = (event) => {
	let deviceName = document.getElementById("name-input").value;
	let userAgent = document.getElementById("user-agent-input").value;
	let width = document.getElementById("width-input").value;
	let height = document.getElementById("height-input").value;

	let userAgents = chrome.extension.getBackgroundPage().userAgents;
	userAgents[deviceName] = {
		ua: userAgent,
		width: width,
		height: height
	};
	// rebuild options and change device to new one
	buildDeviceOptions(); 
	changeDevice(deviceName);
}

let addScrollLockListeners = () => {
	var radios = document.forms.settings.scroll;
    for(var i = 0; i < radios.length; i++) {
        radios[i].onclick = function () {
           	let storeScrollLock = chrome.extension.getBackgroundPage().storeScrollLock;
           	storeScrollLock(this.value);
        };
    }
}

let addStartSessionListeners = () => {
	var radios = document.forms.settings.session;
    for(var i = 0; i < radios.length; i++) {
        radios[i].onclick = function () {
           	let storeStartSession = chrome.extension.getBackgroundPage().storeStartSession;
           	storeStartSession(this.value);
        };
    }
}

let addListeners = () => {
	let deviceSelect = document.getElementById("device-select");
	deviceSelect.addEventListener("change", changeDevice);
	let addBtn = document.getElementById("add-btn");
	addBtn.addEventListener("click", addDevice)

	addScrollLockListeners();
	addStartSessionListeners();
}


let getDefaults = () => {
	let device = chrome.extension.getBackgroundPage().getDevice().device;
	let sel = document.getElementById("device-select");
	var opts = sel.options;
	for (var opt, i = 0; opt = opts[i]; i++) {
		if (opt.value == device) {
			sel.selectedIndex = i;
			break;
		}
	}	

	let scrollLock = chrome.extension.getBackgroundPage().getScrollLock();
	if (scrollLock === "on")
	{
		document.getElementById("scroll-lock-on").checked = true;
	} else {
		document.getElementById("scroll-lock-off").checked = true;
	}

	let session = chrome.extension.getBackgroundPage().getStartSession();
	if (session === "same")
	{
		document.getElementById("session-same").checked = true;
	} else {
		document.getElementById("session-new").checked = true;
	}
}

// run on page load
let init = () => {
	addListeners();
	buildDeviceOptions();
	getDefaults();
}
init();