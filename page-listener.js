'use strict';

(function () {
    const port = chrome.runtime.connect({name: "main-page-events"});

    let highlighted = {};
    let scrollSendInProgress = false;

    // helpers
    function getCurrentScrollPercentage () {
      return Math.round((document.body.scrollTop / document.body.scrollHeight) * 1000) / 1000;
    }

    // message senders
    function sendSelectedText() {
      const selectedText = window.getSelection().toString();
      chrome.runtime.sendMessage({"selectedText": selectedText});
    }

    function sendScrollPercentage() {
      const scrollPercentage = getCurrentScrollPercentage();
      scrollSendInProgress = true;
      chrome.runtime.sendMessage(null, {"scrollPercentage": scrollPercentage}, null,
        function() {
            scrollSendInProgress = false;
        });
    }

    // on-page event listeners
    window.addEventListener("mouseup", function() {
      sendSelectedText();
    });

    window.addEventListener("scroll", function() {
      sendScrollPercentage();
    });

    // message listener that selects acts according to type of message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      // scroll in response to scroll message
      if (message.scrollPercentage && !scrollSendInProgress) {
        if (message.scrollPercentage !== getCurrentScrollPercentage()) {
          const newScroll = message.scrollPercentage * document.body.scrollHeight;
          window.scrollTo(document.documentElement.scrollLeft, newScroll);
        }
      }
      else if (message.selectedText) {
        console.log("in listener for text selection");
        // let toHighlight = $(":contains("+ message.selectedText + ")");
        let toHighlight = $(":contains(" + message.selectedText + ")")
          .filter(function() { return $(this).children().length === 0; })
          .parent();
        for(let i = 0, length = toHighlight.length; i < length; i++) {
          toHighlight[i].setAttribute("style", "background-color: yellow;");
        }

      }
      sendResponse();
    });

})();
