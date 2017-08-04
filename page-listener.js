'use strict';

(function() {
    const port = chrome.runtime.connect({name: "main-page-events"});

    let highlighted = $();
    let currentHighlighted = -1;
    let lastSelectedText = "";

    // helpers
    function getCurrentScrollPercentage () {
      return document.body.scrollTop / document.body.scrollHeight;
    }

    function clearHighlighted() {
      highlighted.each(function () {
        let text = $(this).html();
        $(this).parent().html(text);
      });

      highlighted = $();
      lastSelectedText = "";
      currentHighlighted = -1;
    }

    function scrollThroughHighlighted(event) {
      // if none of highlighted text has been scrolled, scroll to first
      if(currentHighlighted == -1) {
        currentHighlighted = 0;
        highlighted.get(currentHighlighted).scrollIntoView(false);
      }
      else {
        switch(event.which) {
          // left arrow: scroll previous highlighted into view
          case 37:
            currentHighlighted = ((currentHighlighted - 1) + highlighted.length) % highlighted.length;
            highlighted.get(currentHighlighted).scrollIntoView(false);
            break;
          // right arrow: scroll next highlighted into view
          case 39:
            currentHighlighted = (currentHighlighted + 1) % highlighted.length;
            highlighted.get(currentHighlighted).scrollIntoView(false);
            break;
          default:
        }
      }
    }

    // message senders
    function sendSelectedText() {
      const selectedText = window.getSelection().toString();
      if(lastSelectedText !== selectedText) {
        chrome.runtime.sendMessage({"selectedText": selectedText});
        lastSelectedText = selectedText;
      }
    }

    // scroll percentage sent to paired tab to synchronize scroll
    function sendScrollPercentage() {
      const scrollPercentage = getCurrentScrollPercentage();
      chrome.runtime.sendMessage(null, {"scrollPercentage": scrollPercentage});
    }

    // on-page event listeners
    window.addEventListener("mouseup", function() {
      sendSelectedText();
    });

    window.addEventListener("mousedown", function(event){
      // only clear highlighted on left click
      if(event.which == 1) {
        clearHighlighted();
      }
    });

    window.addEventListener("wheel", function() {
      sendScrollPercentage();
    });

    $(document).keydown(function(event) {
      if (highlighted.length) {
        scrollThroughHighlighted(event);
      }
    });

    // message listener that selects acts according to type of message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // scroll in response to scroll message
      if (message.scrollPercentage) {
        const newScroll = message.scrollPercentage * document.body.scrollHeight;
        window.scrollTo(document.documentElement.scrollLeft, newScroll);
      }
      else if (message.selectedText) {
        clearHighlighted();
        // let toHighlight = $(":contains("+ message.selectedText + ")");
        $("*:contains(" + message.selectedText + ")")
          .filter(function() { return $(this).children().length === 0; })
          .each(function() {
            let html = $(this).html();
            $(this).html("<span class='highlighted' style='background-color: lightgreen'>" + html + "</span>");
          });
        highlighted = $(".highlighted");
      }
      sendResponse();
    });
})();
