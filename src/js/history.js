// Copyright (c) 2011 History Plus Authors. All rights reserved.
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


goog.provide('historyplus');
goog.provide('historyplus.SearchController');


goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.date');
goog.require('goog.date.DateRange');
goog.require('goog.date.DateTime');
goog.require('goog.date.Interval');
goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_en_ISO');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.Control');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.DatePicker');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Option');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Separator');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarRenderer');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');
goog.require('goog.ui.decorate');

goog.require('historyplus.ComboBoxControl');


/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * Copy the properties. This method is called by historyplus.inherits.
 *
 * @param {Object} child Child property.
 * @param {Object} parent Parent property.
 */
historyplus.copyProperties = function(child, parent) {
  for (var prop in parent) {
    if (typeof(child[prop]) == 'undefined') {
      child[prop] = parent[prop];
    }
  }
};


/**
 * Inherit the properties and prototype methods from parent constructor
 * into child.
 *
 * @param {Function} child Child class.
 * @param {Function} parent Parent class.
 */
historyplus.inherits = function(child, parent) {
  historyplus.copyProperties(child, parent);
  historyplus.copyProperties(child.prototype, parent.prototype);
};




/**
 * Control of the state of the page.
 *
 * @constructor
 */
historyplus.SearchController = function() {
  //create view, model object
  this.view_ = new historyplus.SearchView(this);
  this.model_ = new historyplus.SearchModel(this);

  this.model_.setView(this.view_);

  this.startApp();
};


/**
 * Call rendering method and begin search method.
 */
historyplus.SearchController.prototype.startApp = function() {
  //create header menu and bind javascript events
  this.view_.init();

  //excute search method
  this.searchHistory();
};


/**
 * Search History
 * @return {boolean} Whether the search method is working correct.
 */
historyplus.SearchController.prototype.searchHistory = function() {
  this.view_.clearList();
  this.view_.showMessage('Searching ...');
  var query = this.view_.getSeachCondition();
  return this.model_.search(query);
};




/**
 * Container for history data.
 * Wrapper for chrome.history.
 *
 * @param {object} controller App controller object.
 * @constructor
 */
historyplus.SearchModel = function(controller) {
  //private
  this.controller_ = controller;
  this.view_ = null;
  this.data_ = [];

  //public
  this.lastQuery = null;
  this.queryCount = 0;
};


/**
 * Sets our current view that is called when the history model changes.
 * @param {historyplus.SearchView} view The view to set our current view to.
 */
historyplus.SearchModel.prototype.setView = function(view) {
  this.view_ = view;
};


/**
 * Wrapper for chrome.history.search
 * @see http://code.google.com/chrome/extensions/history.html
 * @param {object} query Include search condition parameters.
 * @return {boolean} Whether search method is called.
 */
historyplus.SearchModel.prototype.search = function(query) {
  this.data_ = [];
  //check search condition
  query = query || {};
  query.text = query.text || '';
  query.startTime = query.startTime || null;
  query.endTime = query.endTime || null;
  query.maxResults = query.maxResults || 100;

  this.lastQuery = query;

  var self = this;

  //call chrome api
  //http://code.google.com/chrome/extensions/history.html#method-search
  chrome.history.search(query, function(results) {
    self.view_.hideMessage();
    self.saveHistory(results);
  });
  return true;
};


/**
 * Callback function of 'chrome.history.search'.
 * Loop in search results and group by domain.
 * @see http://code.google.com/chrome/extensions/history.html#type-HistoryItem
 * @param {array} itemList List of historyItem.
 */
historyplus.SearchModel.prototype.saveHistory = function(itemList) {
  this.queryCount = itemList.length;
  if (itemList.length == 0) {
    this.view_.showMessage('No Search Results');
    return;
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
    if (goog.date.Date.compare(preTime, currentDate) < 0) {
      //the lastVisitTime is already updated
      historyItem.lastVisitTimeUpdated = true;
    } else {
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
};


/**
 * Callback function of 'chrome.history.getVisits'.
 * Loop in search results and save visit to object.
 * @see http://code.google.com/chrome/extensions/history.html#method-getVisits
 * @param {array} itemList List of VisitItem.
 */
historyplus.SearchModel.prototype.saveVisits = function(itemList) {
  if (!itemList.length) {
    return;
  }
  if (this.data_[itemList[0].id]) {
    this.data_[itemList[0].id].visits = itemList;
  }
};




/**
 * Functions for drawing the page with HTML.
 *
 * Datetime formatting pattern is written in source code, see below:
 * closure/goog/i18n/datetimeformat.js
 *
 * @param {object} controller App controller object.
 * @constructor
 */
historyplus.SearchView = function(controller) {
  this.controller_ = controller;

  // Frames
  this.domHeader_ = null;
  this.domContent_ = null;
  this.domSidebar_ = null;

  // Search Result Area
  this.domListHeader_ = null;
  this.domList_ = null;
  this.domMessage_ = null;
  this.dateFormatter_ = null;
  this.timeFormatter_ = null;

  // Header
  this.toolbar_ = null;

  // the date to control drawing the list
  this.dateTemp_ = null;
};


/**
 * Escapes a URI as appropriate for CSS.
 * CSS uris need to have '(' and ')' escaped.
 * @param {string} uri CSS uri.
 * @return {string} The escaped uri.
 */
historyplus.SearchView.prototype.getEncodeURIForCSS = function(uri) {
  return uri.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};


/**
 * Initialize the mouse and submit event on header
 */
historyplus.SearchView.prototype.init = function() {
  var self = this;

  // Set each frames to local variable.
  this.domHeader_ = goog.dom.getElement('header');
  this.domContent_ = goog.dom.getElement('content');
  this.domSidebar_ = goog.dom.getElement('sidebar');

  this.domListHeader_ = goog.dom.getElement('list-header');
  this.domList_ = goog.dom.getElement('list-result');
  this.domMessage_ = goog.dom.getElement('list-header-message');

  // date format
  this.dateFormatter_ =
    new goog.i18n.DateTimeFormat("yyyy'/'MM'/'dd '(' E ')'");
  this.timeFormatter_ = new goog.i18n.DateTimeFormat("H':'mm");

  // Initiallize the content size
  this.setContentSize(goog.dom.getViewportSize());
  // Bind window resize
  var vsm = new goog.dom.ViewportSizeMonitor();
  goog.events.listen(vsm, goog.events.EventType.RESIZE, function(e) {
    self.setContentSize(vsm.getSize());
  });

  // Header init
  this.initHeader();

  // Sidebar init
  this.initSidebar();

  // List init
  this.initList();
};


/**
 * Initialize Elements on Header
 */
historyplus.SearchView.prototype.initHeader = function() {
  var self = this;

  // Create header menu toolbar.
  this.toolbar_ = new goog.ui.Toolbar();
  this.toolbar_.decorate(goog.dom.getElement('header-toolbar'));

  // Date Range Select Menu
  var range = this.toolbar_.getChild('date-range');
  range.setSelectedIndex(5); //select "All"
  goog.events.listen(range, goog.ui.Component.EventType.ACTION,
    function(e) {
      self.handleDateRangeChange(e);
    });

  // Limit Button
  goog.array.forEach(
    goog.dom.query('#header .hp-limit-button'),
    function(element, index) {
      var button = self.toolbar_.getChild(element.id);
      if (index == 0) {
        button.setChecked(true);
      }
      goog.events.listen(button, goog.ui.Component.EventType.ACTION,
        function(e) {
          self.handleLimitClick(e);
        });
    });

  // Search Button
  var button = this.toolbar_.getChild('button-search');
  goog.events.listen(button, goog.ui.Component.EventType.ACTION,
    function(e) {
      self.controller_.searchHistory();
    });
  // Set text input by using ComboBoxControl
  var cb = new historyplus.ComboBoxControl();
  cb.setUseDropdownArrow(false);
  cb.setDefaultText('Filter by keyword');
  cb.setId('text-search-box');
  this.toolbar_.addChildAt(cb, this.toolbar_.indexOfChild(button), true);
  // Bind enter key press in text box.
  var handler = cb.getHandler();
  handler.listen(cb.getKeyEventTarget(), goog.events.EventType.KEYUP,
    function(e) {
      if (e.keyCode == goog.events.KeyCodes.ENTER) {
        self.controller_.searchHistory();
      }
    });

  // Delete History button
  var deleteHistory = this.toolbar_.getChild('delete-history');
  goog.events.listen(deleteHistory, goog.ui.Component.EventType.ACTION,
    function(e) {
      self.handleDeleteHistoryChange(e);
    });

};


/**
 * Initialize Elements on Sidebar
 */
historyplus.SearchView.prototype.initSidebar = function() {
  // Calendar
  var calendar = new goog.ui.DatePicker();
  calendar.setShowWeekNum(false);
  calendar.setShowToday(false);
  calendar.setUseNarrowWeekdayNames(true);
  calendar.setAllowNone(false);
  calendar.setUseSimpleNavigationMenu(true);
  calendar.render(goog.dom.getElement('sidebar-calendar'));
};


/**
 * Initialize Elements on List Header
 */
historyplus.SearchView.prototype.initList = function() {
  // List Header
  goog.array.forEach(
    goog.dom.query('#list-header-collapse .goog-toggle-button'),
    function(element) {
      var button = goog.ui.decorate(goog.dom.getElement(element));
      //bind event
      goog.events.listen(button, goog.ui.Component.EventType.ACTION,
        function(e) {
          console.log('list-header-collapse');
        });
    });
};


/**
 * Clear HTML Contents for search results
 */
historyplus.SearchView.prototype.clearList = function() {
  this.dateTemp_ = null;
  this.domList_.innerHTML = '';
};


/**
 * show the text message
 * @param {?string} opt_str The text is inserted to result div.
 */
historyplus.SearchView.prototype.showMessage = function(opt_str) {
  opt_str = opt_str || '';
  this.domMessage_.innerHTML = opt_str;
  goog.style.showElement(this.domMessage_, true);
};


/**
 * Hide text message
 */
historyplus.SearchView.prototype.hideMessage = function() {
  this.domMessage_.innerHTML = '';
  goog.style.showElement(this.domMessage_, false);
};


/**
 * Set width and height of content.
 * @param {object} sizeWindow Includes the window width and height.
 * @return {boolean} Whether the rendering succress.
 */
historyplus.SearchView.prototype.setContentSize = function(sizeWindow) {
  if (!sizeWindow) return false;
  if (!sizeWindow.width) return false;

  var sizeSidebar = goog.style.getSize(this.domSidebar_);
  var sizeHeader = goog.style.getSize(this.domHeader_);
  var sizeListHeader = goog.style.getSize(this.domListHeader_);

  // Set Content Width
  var widthContent = sizeWindow.width - sizeSidebar.width;
  if (widthContent < 800) widthContent = 800;
  goog.style.setSize(this.domContent_, widthContent, 'auto');

  // Set List Height
  var heightContent = sizeWindow.height - sizeHeader.height;
  if (heightContent < 400) heightContent = 400;
  var heightList = heightContent;
  if (sizeListHeader) {
    heightList = heightList - sizeListHeader.height;
  }
  goog.style.setSize(this.domList_, 'auto', heightList);

  // Set Sidebar Height;
  goog.style.setSize(this.domSidebar_, sizeSidebar.width, heightContent);

  return true;
};


/**
 * Append new domain item. it has HistoryItem array list.
 * @param {object} domainItem A object that has HistoryItem of same domain.
 * @param {integer} dataNo The number of incremented by domain.
 * @return {boolean} Whether the rendering succress.
 */
historyplus.SearchView.prototype.addHistoryRow = function(domainItem, dataNo) {
  if (!domainItem.list) return false;

  //Date
  var startDate = this.getStartDate(domainItem);
  var endDate = this.getEndDate(domainItem);

  //check whether it should show date line.
  if (endDate) {
    var isDateLine = false;
    if (dataNo == 1) isDateLine = true;

    if (goog.date.Date.compare(this.dateTemp_, endDate) > 0) {
      if (!goog.date.isSameDay(this.dateTemp_, endDate)) {
        isDateLine = true;
      }
      this.dateTemp_ = endDate;
    }
    if (isDateLine) {
      var currentDate = this.dateFormatter_.format(this.dateTemp_);
      this.domList_.appendChild(
        goog.dom.createDom('div', 'date', currentDate));
    }
  }

  var frameDiv = goog.dom.createDom('div', 'item-frame');

  //time
  var timeString = '-';
  if (endDate) {
    timeString = this.timeFormatter_.format(endDate);
    if (startDate && endDate) {
      if (goog.date.Date.compare(startDate, endDate) != 0) {
        //draw time range
        timeString = this.timeFormatter_.format(startDate) + ' - ' + timeString;
      }
    }
  }
  frameDiv.appendChild(goog.dom.createDom('div', 'time', timeString));

  var itemDiv = goog.dom.createDom('div', 'item');
  //title & favicon
  itemDiv.appendChild(
    goog.dom.createDom('a',
      { 'class': 'title',
        'href': domainItem.url,
        'target': '_blank',
        'title': domainItem.title,
        'style': 'background: url(' + domainItem.faviconUri + ') no-repeat;'
        }, domainItem.title || domainItem.url));
  //visit count and child node
  if (domainItem.list.length == 1) {
    var item = domainItem.list[0];
    if (item.visitCount > 1) {
      //visit count
      itemDiv.appendChild(
        goog.dom.createDom('span',
          'visit-count',
          goog.dom.createTextNode('( '),
          goog.dom.createDom('a', {'href': '#'}, item.visitCount + ' times'),
          goog.dom.createTextNode(' )')));
    }
  } else {
    //if it have some child node
    //append node page count
    itemDiv.appendChild(
      goog.dom.createDom('span',
        'page-count',
        goog.dom.createTextNode('( '),
        goog.dom.createTextNode(domainItem.list.length + ' pages'),
        goog.dom.createTextNode(' )')));

    var frameChildItem = goog.dom.createDom('div', 'child-frame');
    goog.style.showElement(frameChildItem, false);
    //collapse event bind
    var toggleButton = goog.dom.createDom('div', 'hp-icon button-toggle');
    goog.events.listen(toggleButton, goog.events.EventType.CLICK, function(e) {
      var display = true;
      if (goog.style.isElementShown(frameChildItem)) {
        display = false;
        goog.dom.classes.remove(toggleButton, 'close');
      } else {
        goog.dom.classes.add(toggleButton, 'close');
      }
      goog.style.showElement(frameChildItem, display);
    });
    itemDiv.appendChild(toggleButton);

    //loop child node
    for (var i = 0, child; child = domainItem.list[i]; i++) {
      var childDiv = goog.dom.createDom('div', 'item-child');
      //time
      var timeString = '-';
      if (!child.lastVisitTimeUpdated) {
        var timeObject =
          goog.date.DateTime.fromRfc822String(child.lastVisitTime);
        timeString = this.timeFormatter_.format(timeObject);
      }
      childDiv.appendChild(goog.dom.createDom('span', 'time', timeString));

      //title
      childDiv.appendChild(
        goog.dom.createDom('a',
          { 'class': 'title',
            'href': child.url,
            'title': child.title,
            'target': '_blank'
            }, child.title || child.url));

      //visit count
      childDiv.appendChild(
        goog.dom.createDom('span', 'visit-count',
          goog.dom.createTextNode('( '),
          goog.dom.createDom('a', {'href': '#'}, child.visitCount + ' times'),
          goog.dom.createTextNode(' )')));

      frameChildItem.appendChild(childDiv);
    }

    itemDiv.appendChild(frameChildItem);

  }

  frameDiv.appendChild(itemDiv);

  this.domList_.appendChild(frameDiv);
  return true;
};


/**
 * Get start date from list
 * @param {object} domainItem A object that has HistoryItem of same domain.
 * @return {goog.date.DateTime} The first date of the domain.
 */
historyplus.SearchView.prototype.getStartDate = function(domainItem) {
  if (!domainItem) return false;
  if (!domainItem.list) return false;
  var list = domainItem.list;
  var date = null;
  for (var i = list.length - 1, item; item = list[i]; i--) {
    if (item.lastVisitTimeUpdated) continue;
    date = new goog.date.DateTime();
    date.setTime(item.lastVisitTime);
    break;
  }
  return date;
};


/**
 * Get end date from list
 * @param {object} domainItem A object that has HistoryItem of same domain.
 * @return {goog.date.DateTime} The End date of the domain.
 */
historyplus.SearchView.prototype.getEndDate = function(domainItem) {
  if (!domainItem) return false;
  if (!domainItem.list) return false;
  var list = domainItem.list;
  var date = null;
  for (var i = 0, item; item = list[i]; i++) {
    if (item.lastVisitTimeUpdated) continue;
    date = new goog.date.DateTime();
    date.setTime(item.lastVisitTime);
    break;
  }
  return date;
};


/**
 * Collect search condition from header menu.
 * @return {object} The object include search condition.
 */
historyplus.SearchView.prototype.getSeachCondition = function() {
  var cond = {};
  var self = this;

  // Get date range
  var element = this.toolbar_.getChild('date-range');
  if (element) {
    var range = null;
    var item = element.getSelectedItem();
    var value = item.getElement().getAttribute('value');
    if (value == 'today') {
      range = goog.date.DateRange.today();
    } else if (value == 'yesterday') {
      range = goog.date.DateRange.yesterday();
    } else if (value == 'last-week') {
      range = goog.date.DateRange.lastWeek();
    } else if (value == 'last-month') {
      range = goog.date.DateRange.lastMonth();
    } else if (value == 'all') {
      range = goog.date.DateRange.allTime();
    }
    if (range) {
      cond.startTime = range.getStartDate().getTime();
      var endDate = goog.cloneObject(range.getEndDate()); //copy object
      endDate.add(new goog.date.Interval(0, 0, 1)); //+1 day
      cond.endTime = endDate.getTime();

      // Set start row date for search result.
      var today = new goog.date.Date();
      this.dateTemp_ = range.getEndDate();
      if (goog.date.Date.compare(this.dateTemp_, today) > 0) {
        this.dateTemp_ = today;
      }
    }
  }

  // Get limit amount
  cond.maxResults = null;
  goog.array.forEach(
    goog.dom.query('#header .hp-limit-button'),
    function(element) {
      var button = self.toolbar_.getChild(element.id);
      if (button.isChecked()) {
        var count = parseInt(button.getElement().getAttribute('value'));
        if (goog.isNumber(count)) {
          cond.maxResults = count;
        }
      }
    });

  // Get Search String
  var element = this.toolbar_.getChild('text-search-box');
  if (element) {
    cond.text = element.getValue();
  }

  return cond;
};


/**
 * Action Event when Date Rage in header toolbar is changed
 * @param {object} e Event object.
 * @return {boolean} Whether the action event end correctly.
 */
historyplus.SearchView.prototype.handleDateRangeChange = function(e) {
  //excute search method
  this.controller_.searchHistory();
  return true;
};


/**
 * Action Event when limit bottun in header toolbar is clicked
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 */
historyplus.SearchView.prototype.handleLimitClick = function(e) {
  var self = this;
  goog.array.forEach(
    goog.dom.query('#header .hp-limit-button'),
    function(element) {
      var button = self.toolbar_.getChild(element.id);
      button.setChecked(false);
    });

  e.target.setChecked(true);

  //excute search method
  this.controller_.searchHistory();
  return true;
};


/**
 * Action Event when Delete History in header toolbar is changed
 * @param {object} e Event object.
 * @return {boolean} Whether the action event end correctly.
 */
historyplus.SearchView.prototype.handleDeleteHistoryChange = function(e) {
  console.log(e);
  if (confirm('Are you sure that all history is deleted?')) {
  }
  return true;
};




//set that this controller should be singleton
goog.addSingletonGetter(historyplus.SearchController);


//get instance
historyplus.SearchController.getInstance();
