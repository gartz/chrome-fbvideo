// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*global chrome*/

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
	  lastTabId = tabId;
      console.log(tabId);
});

// Shim for contains in old ES6 nom compatible chrome versions
if (!String.prototype.contains) {
	String.prototype.contains = function(searchString) {
		var position = arguments.length > 1 ? arguments[1] : undefined;
		// Somehow this trick makes method 100% compat with the spec.
		return String.prototype.indexOf.call(this, searchString, position) !== -1;
	}
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log('Tab URL', tabId, changeInfo, tab);
  if(changeInfo.status === 'loading') {
    console.log('loading');
    if (!(tab.url.contains('facebook.com') || tab.url.contains('fb.com'))) {
      return;
    }
    console.log('loading show ' + tab.id);
    
    // show page action
    chrome.pageAction.show(tab.id);

    var icon = 'icon19', tooltip;
    // change icon
    chrome.pageAction.setIcon({
        path: 'images/' + icon + '.png'
      , tabId: tab.id
    });

    // change icon tooltip
    chrome.pageAction.setTitle({
        title: 'Facebook Lost Vides'
      , tabId: tab.id
    });
  }
  if(changeInfo.status === 'complete') {
    if (!(tab.url.contains('facebook.com') || tab.url.contains('fb.com'))) {
      return;
    }
    
    console.log('complete show ' + tab.id);
    
    // show page action
    chrome.pageAction.show(tab.id);

    var icon = 'icon19', tooltip;
    // change icon
    chrome.pageAction.setIcon({
        path: 'images/' + icon + '.png'
      , tabId: tab.id
    });

    // change icon tooltip
    chrome.pageAction.setTitle({
        title: 'Facebook Lost Vides'
      , tabId: tab.id
    });
    
    chrome.tabs.executeScript(tab.id, {
      file: 'youtube.js'
    });
  }
});
