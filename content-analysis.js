'use strict';


(function () {
	var port = chrome.runtime.connect();

	function getLinks() {
		return $.makeArray($('a').map((i, link) => link.href));
	}

	function sendLinks() {
		let links = getLinks();
	}

	window.addEventListener("dblclick", function() {
		sendLinks();
    });

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.links) {
			console.log('other links', message.links)
			console.log('my links', getLinks());
		}
     	sendResponse();
    });

})();