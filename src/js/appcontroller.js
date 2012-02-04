// Copyright (c) 2012 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 * Search and show the web history by using Google Chrome Extensions API.
 * See blow:
 * chrome.history - Google Chrome Extensions - Google Code
 * http://code.google.com/chrome/extensions/history.html
 *
 * Using Closure Library.
 * http://code.google.com/closure/library/
 *
 * According to Google JavaScript Style Guide.
 * http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
 *
 * Checked by Closure Linter.
 * http://code.google.com/closure/utilities/
 *
 * Compress by Closure Compliler.
 * http://code.google.com/closure/compiler/
 */


goog.provide('historyplus.AppController');

goog.require('goog.events.EventHandler');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.style');

goog.require('historyplus.HeaderView');
goog.require('historyplus.SidebarView');
goog.require('historyplus.ListView');




/**
 * Control of this application.
 *
 * @constructor
 */
historyplus.AppController = function() {
  // List of Member Variables.
  this.data_ = [];
  this.lastQuery_ = null;
  this.eventHandler_ = null;
  this.viewportSizeMonitor_ = null;

  this.headerView_ = null;
  this.sidebarView_ = null;
  this.listView_ = null;

  // Excute initialize method.
  this.initialize_();
};


/**
 * Call rendering method and begin search method.
 * @private
 */
historyplus.AppController.prototype.initialize_ = function() {
  // Create a EventHandler that manage event caused in this application.
  this.eventHandler_ = new goog.events.EventHandler(this);

  // Create view objects.
  this.headerView_ = new historyplus.HeaderView();
  this.sidebarView_ = new historyplus.SidebarView();
  this.listView_ = new historyplus.ListView();

  // Render the components.
  this.headerView_.render(goog.dom.getElement('header'));
  this.sidebarView_.render(goog.dom.getElement('sidebar'));
  this.listView_.render(goog.dom.getElement('content'));

  // Bind event for resizing window.
  this.viewportSizeMonitor_ = new goog.dom.ViewportSizeMonitor();
  this.eventHandler_.listen(this.viewportSizeMonitor_,
                            goog.events.EventType.RESIZE,
                            this.onResizeViewport_);
  this.onResizeViewport_();

  // Excute search method.
  this.searchHistory();

  // TODO:Hide "Initializing..." message and show content.
};


/**
 * Call the search method from Google Chrome History API.
 * @return {boolean} Whether the search method is working correct.
 */
historyplus.AppController.prototype.searchHistory = function() {
  // Ready for receive search result.
  this.data_ = [];

  // Get search parameter(condition) from header view.
  var values = this.headerView_.getSelectedValues();
  console.log(values);
  return;
  query = query || {};
  query.text = query.text || '';
  query.maxResults = query.maxResults || 100;
  this.lastQuery_ = query;

  var self = this;

  // Call google chrome api for history.
  // http://code.google.com/chrome/extensions/history.html#method-search
  chrome.history.search(this.lastQuery_, function(results) {
    self.saveHistory(results);
    self.listView_.onEndDrowList();
  });
  return true;
};



/**
 * Callback function of 'chrome.history.search'.
 * Loop in search results and group by domain.
 * @see http://code.google.com/chrome/extensions/history.html#type-HistoryItem
 * @param {array} itemList List of historyItem.
 * @return {boolean} Whether the result have item.
 */
historyplus.AppController.prototype.saveHistory = function(itemList) {
  return true;
  this.queryCount = itemList.length;
  if (itemList.length == 0) {
    this.view_.showMessage('No Search Results');
    return false;
  }
  var domainItem = {};
  domainItem.title = '';
  domainItem.path = '';
  domainItem.list = [];
  var preTime = new goog.date.DateTime();
  if (this.lastQuery.endTime) preTime.setTime(this.lastQuery.endTime);
  for (var i = 0, historyItem; historyItem = itemList[i]; i++) {
    var currentUrl = goog.Uri.parse(historyItem.url);
    //set favicon uri
    var faviconUri = 'chrome://favicon/';
    faviconUri += this.view_.getEncodeURIForCSS(currentUrl.toString());
    historyItem.faviconUri = faviconUri;

    //check whether the date is real date or not.
    //because "lastVisitTime" may be updated by latest date.
    var currentDate = new goog.date.DateTime();
    currentDate.setTime(historyItem.lastVisitTime);
    var time = goog.date.Date.compare(preTime, currentDate); // Elapsed Time
    if (time < 0) {
      //the lastVisitTime is already updated
      historyItem.lastVisitTimeUpdated = true;
    } else {
      if (i > 0) {
        historyItem.elapsedTime = time;
      }
      preTime.setTime(historyItem.lastVisitTime);
    }

    //push to list
    domainItem.list.push(historyItem);

    //set domain information
    if (currentUrl.getPath() == '/') {
      domainItem.title = historyItem.title;
      domainItem.domain = currentUrl.getDomain();
      domainItem.url = currentUrl.toString();
      domainItem.faviconUri = faviconUri;
    } else if (domainItem.title.length == 0 ||
               (domainItem.path.length > currentUrl.getPath().length &&
                historyItem.title.length != 0)) {
      domainItem.title = historyItem.title;
      domainItem.url = currentUrl.toString();
      domainItem.path = currentUrl.getPath();
      domainItem.faviconUri = faviconUri;
    }

    //check whether the next item is same domain
    var isNewLine = true;
    if (i + 1 < itemList.length) {
    if (historyItem.id == '121577') {
      var str = '/keyword/%A5%D6%A5%ED%A5%B0';
      str = str.replace(/\+/g, '%20');
      console.log(unescape(str));
      console.log(decodeURIComponent(unescape(str)));
      var test2 = decodeURIComponent('/keyword/%A5%D6%A5%ED%A5%B0');
      console.log(itemList[i + 1].url);
      console.log(goog.Uri.parse(itemList[i + 1].url));
      console.log(currentUrl.hasSameDomainAs(nextUrl));
    }
      var nextUrl = goog.Uri.parse(itemList[i + 1].url);
      if (currentUrl.hasSameDomainAs(nextUrl)) {
        isNewLine = false;
      }
    }
    if (isNewLine) {
      this.data_.push(domainItem);
      //draw line
      this.view_.addHistoryRow(domainItem, this.data_.length);
      //init container
      domainItem = {};
      domainItem.title = '';
      domainItem.path = '';
      domainItem.list = [];
    }
  }
  return true;
};


/**
 * Set width and height of content.
 * @private
 */
historyplus.AppController.prototype.onResizeViewport_ = function() {
  var sizeWindow = this.viewportSizeMonitor_.getSize();

  // Calculate width of list content.
  var widthContent = 800;
  var domSidebar = this.sidebarView_.getContentElement();
  if (domSidebar) {
    var sizeSidebar = goog.style.getSize(domSidebar);
    widthContent = sizeWindow.width - sizeSidebar.width;
    if (widthContent < 800) widthContent = 800;
  }

  // Calculate height of list content.
  var heightContent = 400;
  var domHeader = this.headerView_.getContentElement();
  if (domHeader) {
    var sizeHeader = goog.style.getSize(domHeader);
    heightContent = sizeWindow.height - goog.style.getSize(domHeader).height;
    if (heightContent < 400) heightContent = 400;
  }

  // Set width and height of sidebar.
  var sidebar = goog.dom.getElement('sidebar');
  var sizeSidebar = goog.style.getSize(sidebar);
  heightContent = heightContent - 2;
  goog.style.setSize(sidebar, sizeSidebar.width, heightContent);

  // Set width and height of list.
  var content = goog.dom.getElement('content');
  var sizeContent = goog.style.getSize(content);
  goog.style.setSize(content, widthContent, 'auto');
  this.listView_.setListHeight(heightContent);
};


// This controller should be singleton.
goog.addSingletonGetter(historyplus.AppController);

// Get instance. Start application.
historyplus.AppController.getInstance();
