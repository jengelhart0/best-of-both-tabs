'use strict';
// browser actions

const windowInfo = {
	focused: false,
	url: 'http://tripadvisor.com'
}

function openNewTab() {
	// create new window with info and callback
	chrome.windows.create(windowInfo, windowCallback);
}

function windowCallback(window) {
	console.log(window);
	// access window here
}

chrome.browserAction.onClicked.addListener(openNewTab);