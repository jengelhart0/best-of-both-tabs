'use strict';
// browser actions

function openNewTab() {
	chrome.windows.getCurrent((window) => {
		// get the screen dimensions
		// resize the current window
		// create the new window
		const leftWindowInfo = {
			top: 0,
			left: 0,
			width: screen.width / 2,
			height: screen.height
		}
		const rightWindowInfo = {
			top: 0,
			left: screen.width / 2,
			width: screen.width / 2,
			height: screen.height,
			focused: false,
			url: 'http://tripadvisor.com'
		}
		chrome.windows.update(window.id, leftWindowInfo)
		chrome.windows.create(rightWindowInfo);
	});
	
	var requestFilter = {
		urls: [
			"<all_urls>"
		]
	};

	chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
		var headers = details.requestHeaders;
		if( !localStorage['user-agent'] ) {
			return;
		}
		for(var i = 0, l = headers.length; i < l; ++i) {
			if( headers[i].name == 'User-Agent' ) {
				break;
			}
		}
		if(i < headers.length) {
			headers[i].value = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
		}
		return {requestHeaders: headers};
	}, requestFilter, ['requestHeaders','blocking']);
}

chrome.browserAction.onClicked.addListener(openNewTab);