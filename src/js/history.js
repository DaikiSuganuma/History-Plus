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
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_en_ISO');
goog.require('goog.ui.DatePicker');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.style');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Option');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Separator');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarRenderer');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');
goog.require('goog.ui.decorate');

/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};




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
  this.view_.clear();
  this.view_.setMessage('Searching ...');
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
  this.lastQuery = query || {};
  this.lastQuery.text = query.text || '';
  this.lastQuery.startTime = query.startTime || null;
  this.lastQuery.endTime = query.endTime || null;
  this.lastQuery.maxResults = query.maxResults || 100;

  var self = this;

  //call chrome api
  //http://code.google.com/chrome/extensions/history.html#method-search
  chrome.history.search(query, function(results) {
    self.view_.setMessage('');
    self.saveHistory(results);
  });
  return true;
};

/**
 * Callback function of 'chrome.history.search'.
 * Loop in search results and save history data.
 * @see http://code.google.com/chrome/extensions/history.html#type-HistoryItem
 * @param {array} itemList List of historyItem.
 */
historyplus.SearchModel.prototype.saveHistory = function(itemList) {
  this.queryCount = itemList.length;
  if (itemList.length == 0) {
    this.view_.setMessage('No Search Results');
    return;
  }
  var domainItem = {title: '', path: ''};
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
      domainItem = {title: '', path: ''};
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

  //Header Area
  this.menuDateRage_ = [];
  this.menuMaxResults_ = [];

  //Search Result Area
  this.resultDiv_ = null;
  this.dateFormatter_ = null;
  this.timeFormatter_ = null;

  //Variables to control list.
  this.rowDate_ = null;
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

  //Search Result Area
  this.resultDiv_ = goog.dom.getElement('result-display');

  //date format
  this.dateFormatter_ =
    new goog.i18n.DateTimeFormat("yyyy'/'MM'/'dd '(' E ')'");
  this.timeFormatter_ = new goog.i18n.DateTimeFormat("H':'mm");

  //Create header menu toolbar.
  var toolbar = new goog.ui.Toolbar();
  toolbar.decorate(goog.dom.getElement('header-toolbar'));

  // Search Text input
  var li = new goog.ui.LabelInput;
  li.decorate(goog.dom.getElement('text-search-box'));
  var button = goog.ui.decorate(goog.dom.getElement('button-search'));
  goog.events.listen(button, goog.ui.Component.EventType.ACTION,
    function(e) {
      self.controller_.searchHistory();
    });

  // Sidebar init
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
 * Clear HTML Contents for search results
 */
historyplus.SearchView.prototype.clear = function() {
  this.rowDate_ = null;
  this.resultDiv_.innerHTML = '';
};

/**
 * Clear HTML Contents and set text message
 * @param {string} str The text is inserted to result div.
 */
historyplus.SearchView.prototype.setMessage = function(str) {
  str = str || '';
  this.resultDiv_.innerHTML = str;
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

    if (goog.date.Date.compare(this.rowDate_, endDate) > 0) {
      if (!goog.date.isSameDay(this.rowDate_, endDate)) {
        isDateLine = true;
      }
      this.rowDate_ = endDate;
    }
    if (isDateLine) {
      var currentDate = this.dateFormatter_.format(this.rowDate_);
      this.resultDiv_.appendChild(
        goog.dom.createDom('div', 'date', currentDate));
    }
  }

  var frameDiv = goog.dom.createDom('div', 'item-frame row');

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
  frameDiv.appendChild(goog.dom.createDom('div', 'time col col_2', timeString));

  var itemDiv = goog.dom.createDom('div', 'item col col_10');
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
    var toggleButton = goog.dom.createDom('div', 'button-toggle');
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

  this.resultDiv_.appendChild(frameDiv);
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
  //search string
  cond.text = goog.dom.getElement('text-search-box').value;
  //date range
  var button = goog.dom.query('#menu-date-range .goog-custom-button-checked');
  if (button) button = button[0];
  var range = null;
  if (button.id == 'button-today') { //today
    range = goog.date.DateRange.today();
  } else if (button.id == 'button-yesterday') { //yesterday
    range = goog.date.DateRange.yesterday();
  } else if (button.id == 'button-last-week') { //last week
    range = goog.date.DateRange.lastWeek();
  } else if (button.id == 'button-last-month') { //last month
    range = goog.date.DateRange.lastMonth();
  } else {
    range = goog.date.DateRange.allTime();
  }
  if (range) {
    cond.startTime = range.getStartDate().getTime();
    var endDate = goog.cloneObject(range.getEndDate()); //copy object
    endDate.add(new goog.date.Interval(0, 0, 1)); //+1 day
    cond.endTime = endDate.getTime();

    // set start row date for draw search result
    var today = new goog.date.Date();
    this.rowDate_ = range.getEndDate();
    if (goog.date.Date.compare(this.rowDate_, today) > 0) {
      this.rowDate_ = today;
    }
  }
  //max results
  var button = goog.dom.query('#menu-max-results .goog-custom-button-checked');
  if (button) button = button[0];
  var count = parseInt(button.getAttribute('value'));
  if (goog.isNumber(count)) {
    cond.maxResults = count;
  }
  return cond;
};

/**
 * Action Event when Date Rage Menu click
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 */
historyplus.SearchView.prototype.handleMenuDateRageClick = function(e) {
  //all button check false
  goog.array.forEach(this.menuDateRage_, function(button) {
    button.setChecked(false);
  });
  e.target.setChecked(true);

  //excute search
  this.controller_.searchHistory();
  return true;
};

/**
 * Action Event when Max Results Menu click
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 */
historyplus.SearchView.prototype.handleMenuMaxResultsClick = function(e) {
  goog.array.forEach(this.menuMaxResults_, function(button) {
    button.setChecked(false);
  });
  event.target.setChecked(true);

  //excute search
  this.controller_.searchHistory();
  return true;
};



//set that this controller should be singleton
goog.addSingletonGetter(historyplus.SearchController);

//get instance
historyplus.SearchController.getInstance();
