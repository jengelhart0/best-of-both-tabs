// interacts with popup.html


function openNewTab() {
	console.log('new tab');
	chrome.windows.create(windowCallback);
}

function windowCallback(window) {
	console.log(window);
	console.log('calledback')
}

document.getElementById('newTabButton').onclick = openNewTab;