'use strict';

// build the options in the device select
let buildDeviceOptions = () => {
	let deviceSelect = document.getElementById("device-select");
	chrome.storage.local.get('userAgents', (items) => {
		Object.keys(items.userAgents).forEach((key) => {
			deviceSelect.add(new Option(key, key));
		})
	});
};

// Change the current device
let changeDevice = (event) => {
	const deviceName = event.target.value;
	if (deviceName) {
		chrome.storage.local.get('userAgents', (items) => {
			chrome.storage.local.set({
				deviceName: deviceName,
				ua: items.userAgents[deviceName].ua,
				width: items.userAgents[deviceName].width,
				height: items.userAgents[deviceName].height
			});
		});
	}
}

// Add a new device
let addDevice = (event) => {
	let deviceName = document.getElementById("name-input").value;
	let ua = document.getElementById("user-agent-input").value;
	let width = document.getElementById("width-input").value;
	let height = document.getElementById("height-input").value;

	if (deviceName && ua && width && height) {
		chrome.storage.local.get('userAgents', (items) => {
			items.userAgents[deviceName] = {
				ua: ua,
				width: width,
				height: height
			};
			chrome.storage.local.set({
				userAgents: items.userAgents
			});
		});
	}

	// Rebuild options and change device to new one
	buildDeviceOptions(); 
	changeDevice(deviceName);
}

let addScrollLockListeners = () => {
	let radios = document.forms.settings.scroll;
    for(let i = 0; i < radios.length; i++) {
        radios[i].onclick = function () {
        	chrome.storage.local.set({
        		scrollLock: (this.value === "on" ? true : false),
        	})
        };
    }
}

let addStartSessionListeners = () => {
	let radios = document.forms.settings.session;
    for(let i = 0; i < radios.length; i++) {
        radios[i].onclick = function () {
           	chrome.storage.local.set({
        		newWindow: (this.value === "new" ? true : false),
        	})
        };
    }
}

let addTextHighlightingListeners = () => {
	let radios = document.forms.settings.highlighting;
    for(let i = 0; i < radios.length; i++) {
        radios[i].onclick = function () {
           	chrome.storage.local.set({
        		highlighting: (this.value === "on" ? true : false),
        	})
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
	addTextHighlightingListeners();
}


let getSettings = () => {
	chrome.storage.local.get(null, (items) => {
		let sel = document.getElementById("device-select");
		let opts = sel.options;
		for (let opt, i = 0; opt = opts[i]; i++) {
			if (opt.value === items.deviceName) {
				sel.selectedIndex = i;
				break;
			}
		}
		if (items.scrollLock) {
			document.getElementById("scroll-lock-on").checked = true;
		} else {
			document.getElementById("scroll-lock-off").checked = true;
		}
		if (items.newWindow) {
			document.getElementById("session-new").checked = true;
		} else {
			document.getElementById("session-same").checked = true;
		}
		if (items.highlighting) {
			document.getElementById("highlighting-on").checked = true;
		} else {
			document.getElementById("highlighting-off").checked = true;
		}
	})
}

// Run on page load
let init = () => {
	addListeners();
	buildDeviceOptions();
	getSettings();
}
init();