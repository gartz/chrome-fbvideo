// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*global chrome*/


// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  if (tab.url.contains('facebook.com')) {
    chrome.browserAction.getBadgeText({}, function (result) {
//       if (result === 'on') {
//         chrome.browserAction.setBadgeText({text: ''});
//       } else {
//         chrome.browserAction.setBadgeText({text: 'on'});
//       }
    });
    chrome.tabs.executeScript({
      file: 'youtube.js'
    });
  }
});
