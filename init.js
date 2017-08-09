'use strict';

// Runs when the chrome extension is loaded
(function() {

	const defaultUserAgents = {
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
	};

	// Default device
	const defaultDeviceName = 'iPhone 7+';

	// Save info for default device, default settings, and store userAgents
	chrome.storage.local.set({
		deviceName: defaultDeviceName,
		ua: defaultUserAgents[defaultDeviceName].ua,
		width: defaultUserAgents[defaultDeviceName].width,
		height: defaultUserAgents[defaultDeviceName].height,
		userAgents: defaultUserAgents,
		scrollLock: true,
		newWindow: false,
		highlighting: false
	});

})();
