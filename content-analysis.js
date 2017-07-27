'use strict';


(function () {
	var port = chrome.runtime.connect();

	function getLinks() {
		return $.makeArray($('a').map((i, link) => link.href));
	}

	function sendLinks() {
		let links = getLinks();
	}

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.fetchLinks) {
			let response = {
				links: getLinks(),
				url: location.href
			}
			chrome.tabs.sendMessage(sender.tabId, response);
		}
		else {
		}
    });

})();