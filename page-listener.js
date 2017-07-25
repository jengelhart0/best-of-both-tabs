"use strict";

(function () {
    const port = chrome.runtime.connect({name: "main-page-events"});

    function sendSelectedText() {
      const selectedText = window.getSelection().toString();
      console.log("sending selected text: " + selectedText);
      chrome.runtime.sendMessage({"selectedText": selectedText});
    }

    window.addEventListener("mouseup", function() {
      sendSelectedText();
    });

})();
