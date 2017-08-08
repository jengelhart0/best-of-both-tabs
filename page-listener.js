'use strict';

(() => {
    // length of time a match remains highlighted upon scroll focus
    const highlightDuration = 1000;
    const leftArrowKey = 37;
    const rightArrowKey = 39;

    // object to contain results of a highlight action
    let highlightResults = {
      matches: $(),
      currentMatchIdx: -1,
      lastSelectedText: ''
    };

    // helpers
    let getCurrentScrollPercentage = () => {
      return document.body.scrollTop / document.body.scrollHeight;
    }

    let clearhighlightMatches = () => {
      highlightResults = {
        matches: $(),
        currentMatchIdx: -1,
        lastSelectedText: ''
      };
    }

    let scrollMatchAndHighlight = (matchIdx) => {
      // restore previous scrolledMatch background color
      // scroll new match into view and highlight after saving background color
      highlightResults.currentMatchIdx = matchIdx;
      let scrolledMatch = highlightResults.matches.get(matchIdx);
      scrolledMatch.scrollIntoView(false);
      $(scrolledMatch).effect('highlight', {color:'lightgreen'}, highlightDuration);
    }

    let scrollThroughHighlightMatches = (event) => {
      // switch on right or left arrow key presses
      const matchesLength = highlightResults.matches.length;
      switch(event.which) {
        // scroll previous highlightMatches into view
        case leftArrowKey:
          scrollMatchAndHighlight(
            (highlightResults.currentMatchIdx - 1 + matchesLength) % matchesLength);
          break;
        // scroll next highlightMatches into view
        case rightArrowKey:
          scrollMatchAndHighlight(
            (highlightResults.currentMatchIdx + 1) % matchesLength);
          break;
        default:
      }
    }

    // message senders
    // send currently selected text to paired tab to find matching results
    let sendSelectedText = () => {
      const selectedText = window.getSelection().toString();
      if(highlightResults.lastSelectedText !== selectedText) {
        chrome.runtime.sendMessage({'selectedText': selectedText});
        highlightResults.lastSelectedText = selectedText;
      }
    }

    // send scroll percentage to paired tab to synchronize scroll
    let sendScrollPercentage = () => {
      const scrollPercentage = getCurrentScrollPercentage();
      chrome.runtime.sendMessage(null, {'scrollPercentage': scrollPercentage});
    }

    // on-page event listeners
    window.addEventListener('mouseup', () => {
      sendSelectedText();
    });

    window.addEventListener('mousedown', (event) => {
      // only clear highlightResults on left click
      if(event.which == 1) {
        clearhighlightMatches();
      }
    });

    window.addEventListener('wheel', () => {
      sendScrollPercentage();
    });

    $(document).keydown((event) => {
      if (highlightResults.matches.length) {
        scrollThroughHighlightMatches(event);
      }
    });

    // message listener that selects acts according to type of message
    chrome.runtime.onMessage.addListener((message, sender) => {
      // scroll in response to scroll message
      if ('scrollPercentage' in message) {
        const newScroll = message.scrollPercentage * document.body.scrollHeight;
        window.scrollTo(document.documentElement.scrollLeft, newScroll);
      }
      // search DOM for matches to message.selectedText
      else if ('selectedText' in message) {
        if(message.selectedText.length) {
          clearhighlightMatches();
          // function syntax chosen here to allow correct binding of <this>
          highlightResults.matches = $('*:contains(' + message.selectedText + ')')
            .filter(function() { return $(this).children().length === 0; })

          // scroll and highlight first match if results
          if(highlightResults.matches.length) {
            scrollMatchAndHighlight(0);
          }
        }
      }
    });
})();
