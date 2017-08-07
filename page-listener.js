'use strict';

(function() {
    const port = chrome.runtime.connect({name: "main-page-events"});

    let highlightMatches = $();
    let scrolledMatchIdx = -1;
    let lastSelectedText = "";

    // helpers
    function getCurrentScrollPercentage () {
      return document.body.scrollTop / document.body.scrollHeight;
    }

    function clearhighlightMatches() {
      highlightMatches = $();
      lastSelectedText = "";
      scrolledMatchIdx = -1;
    }

    function scrollMatchAndHighlight(matchIdx) {
      // restore previous scrolledMatch background color
      // scroll new match into view and highlight after saving background color
      scrolledMatchIdx = matchIdx;
      let scrolledMatch = highlightMatches.get(scrolledMatchIdx);
      scrolledMatch.scrollIntoView(false);
      $(scrolledMatch).effect( "highlight", {color:"lightgreen"}, 1000 );
      // $(scrolledMatch).css('background-color', 'lightgreen');
    }

    function scrollThroughHighlightMatches(event) {
      // if none of highlightMatches text has been scrolled, scroll to first
      if(scrolledMatchIdx == -1) {
        scrollMatchAndHighlight(0);
      }
      else {
        switch(event.which) {
          // left arrow: scroll previous highlightMatches into view
          case 37:
            scrollMatchAndHighlight(
              (scrolledMatchIdx - 1 + highlightMatches.length) % highlightMatches.length);
            break;
          // right arrow: scroll next highlightMatches into view
          case 39:
            scrollMatchAndHighlight(
              (scrolledMatchIdx + 1) % highlightMatches.length);
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

    window.addEventListener("mousedown", function(event) {
      // only clear highlightMatches on left click
      if(event.which == 1) {
        clearhighlightMatches();
      }
    });

    window.addEventListener("wheel", function() {
      sendScrollPercentage();
    });

    $(document).keydown(function(event) {
      if (highlightMatches.length) {
        scrollThroughHighlightMatches(event);
      }
    });

    // message listener that selects acts according to type of message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // scroll in response to scroll message
      if ("scrollPercentage" in message) {
        const newScroll = message.scrollPercentage * document.body.scrollHeight;
        window.scrollTo(document.documentElement.scrollLeft, newScroll);
      }
      else if ("selectedText" in message) {
        if(message.selectedText.length) {
          clearhighlightMatches();
          // let toHighlight = $(":contains("+ message.selectedText + ")");
          highlightMatches = $("*:contains(" + message.selectedText + ")")
            .filter(function() { return $(this).children().length === 0; })
          // highlightMatches = $(".highlightMatches");
        }
      }
      sendResponse();
    });
})();
