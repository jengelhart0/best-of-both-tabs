'use strict';

(function () {
    const port = chrome.runtime.connect({name: "main-page-events"});

    let highlighted = [];
    let lastSelectedText = "";

    // helpers
    function getCurrentScrollPercentage () {
      return Math.round((document.body.scrollTop / document.body.scrollHeight) * 1000) / 1000;
    }

    function clearHighlighted() {
      for(let i = 0, length = highlighted.length; i < length; i++) {
        highlighted[i].setAttribute("style", "background-color: transparent;");
      }
      highlighted = [];
      lastSelectedText = "";
    }

    // message senders
    function sendSelectedText() {
      const selectedText = window.getSelection().toString();
      if(lastSelectedText !== selectedText) {
        chrome.runtime.sendMessage({"selectedText": selectedText});
        lastSelectedText = selectedText;
      }
    }

    function sendScrollPercentage() {
      const scrollPercentage = getCurrentScrollPercentage();
      chrome.runtime.sendMessage(null, {"scrollPercentage": scrollPercentage});
    }

    // on-page event listeners
    window.addEventListener("mouseup", function() {
      sendSelectedText();
    });

    window.addEventListener("mousedown", function(){
      console.log("mousedown");
      clearHighlighted();
    });

    window.addEventListener("wheel", function() {
      sendScrollPercentage();
    });

    // message listener that selects acts according to type of message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // scroll in response to scroll message
      if (message.scrollPercentage) {
        const newScroll = message.scrollPercentage * document.body.scrollHeight;
        window.scrollTo(document.documentElement.scrollLeft, newScroll);
      }
      else if (message.selectedText) {
        console.log(message.selectedText);
        clearHighlighted();
        // let toHighlight = $(":contains("+ message.selectedText + ")");
        let toHighlight = $("*:contains(" + message.selectedText + ")")
          .filter(function() { return $(this).children().length === 0; })

        for(let i = 0, length = toHighlight.length; i < length; i++) {
          toHighlight[i].setAttribute("style", "background-color: lightgreen;");
          highlighted = toHighlight;
        }
      }
      sendResponse();
    });

})();
