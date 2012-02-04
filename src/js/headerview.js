// Copyright (c) 2012 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.HeaderView');


goog.require('goog.array');
goog.require('goog.date.DateRange');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.Control');
goog.require('goog.ui.Component');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Option');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Separator');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');

goog.require('historyplus.ToolbarLabelInput');




/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * Header Component.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
historyplus.HeaderView = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  // Member Variables.
  this.toolbar_ = null;
  this.limitButtons_ = null;

  // Add child component under Toolbar component.
  this.initialize_(opt_domHelper);
};
goog.inherits(historyplus.HeaderView, goog.ui.Component);


/**
 * CSS class names for HeaderView outer container.
 * @type {string}
 * @private
 */
historyplus.HeaderView.CLASS_NAME_ = goog.getCssName('header-toolbar');


/**
 * Events.
 * @enum {string}
 */
historyplus.HeaderView.EventType = {
  /**
   * Dispatched after the value in Toolbar is changed.
   */
  CHANGE_CONDITION: 'historyplus_change_condition'
};


/**
 * Initialize components.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {boolean} Whether this method have completed successfully.
 * @private
 */
historyplus.HeaderView.prototype.initialize_ = function(opt_domHelper) {

  // Generate Toolbar component.
  this.toolbar_ = new goog.ui.Toolbar(
    goog.ui.ToolbarRenderer.getInstance(),
    goog.ui.Container.Orientation.HORIZONTAL,
    opt_domHelper);
  this.toolbar_.setId('header-toolbar');
  this.addChild(this.toolbar_);

  // Insert calendar icon.
  var calIcon = new goog.ui.Control(null, null, opt_domHelper);
  calIcon.addClassName('hp-icon hp-icon-calendar goog-inline-block');
  this.toolbar_.addChild(calIcon);

  // Insert date range menu.
  var ts = new goog.ui.ToolbarSelect(null, null, null, opt_domHelper);
  var selectedIndex = null;
  ts.setId('date-range');
  ts.addClassName('goog-toolbar-select');
  var dateRange = [
    ['daterange-today', 'Taday'],
    ['daterange-yesterday', 'Yesterday'],
    ['daterange-last-week', 'Last Week'],
    ['daterange-last-month', 'Last Month'],
    null,
    ['daterange-all', 'All']];
  goog.array.forEach(dateRange,
    function(data, index) {
      var item = null;
      if (data) {
        item = new goog.ui.Option(data[1], null, opt_domHelper);
        item.setId(data[0]);
        item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
        if (data[0] == 'daterange-all') {
          selectedIndex = index;
        }
      } else {
        item = new goog.ui.MenuSeparator(opt_domHelper);
      }
      ts.addItem(item);
    });
  this.toolbar_.addChild(ts);
  ts.setSelectedIndex(selectedIndex);

  // Insert date range begin menu.
  var tsb = new goog.ui.ToolbarSelect(null, null, null, opt_domHelper);
  tsb.setId('date-range-begin');
  tsb.addClassName('goog-toolbar-select');
  var item = new goog.ui.Option('0000/00/00 (Mon)', null, opt_domHelper);
  item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
  tsb.addItem(item);
  this.toolbar_.addChild(tsb);
  tsb.setSelectedItem(item);
  tsb.setEnabled(false);

  // Insert dash icon.
  var dashIcon = new goog.ui.Control('-', null, opt_domHelper);
  dashIcon.addClassName('date-range-separator goog-inline-block');
  this.toolbar_.addChild(dashIcon);

  // Insert date range end menu.
  var tse = new goog.ui.ToolbarSelect(null, null, null, opt_domHelper);
  tse.setId('date-range-end');
  tse.addClassName('goog-toolbar-select');
  var item = new goog.ui.Option('9999/99/99 (Sun)', null, opt_domHelper);
  item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
  tse.addItem(item);
  this.toolbar_.addChild(tse);
  tse.setSelectedItem(item);
  tse.setEnabled(false);

  // Insert a separator.
  this.toolbar_.addChild(new goog.ui.ToolbarSeparator(null, opt_domHelper));

  // Insert limit icon.
  var limitIcon = new goog.ui.Control(null, null, opt_domHelper);
  limitIcon.addClassName('hp-icon hp-icon-limit goog-inline-block');
  this.toolbar_.addChild(limitIcon);

  // Insert Limit buttons.
  // Have the limit buttons be controlled by selection model. 
  this.limitButtons_ = new goog.ui.SelectionModel();
  this.limitButtons_.setSelectionHandler(this.onLimitClick_);
  var limitButtonsData = [
    ['limit-100', '100'],
    ['limit-250', '250'],
    ['limit-500', '500'],
    ['limit-1000', '1000']];
  goog.array.forEach(limitButtonsData, function(data, index) {
    var button = new goog.ui.ToolbarToggleButton(data[1], null, opt_domHelper);
    button.addClassName('hp-limit-button');
    button.setValue(data[1]);
    button.setId(data[0]);
    button.setAutoStates(goog.ui.Component.State.CHECKED, false);
    this.limitButtons_.addItem(button);
    this.toolbar_.addChild(button);
    if (index == 0) {
      this.limitButtons_.setSelectedItem(button);
    }
  }, this);

  // Insert a separator.
  this.toolbar_.addChild(new goog.ui.ToolbarSeparator(null, opt_domHelper));

  // Insert a input box by using historyplus.ComboBoxControl
  var li = new historyplus.ToolbarLabelInput('Filter by keyword',
                                             null, null, opt_domHelper);
  li.setId('filterkeyword');
  this.toolbar_.addChild(li);

  // Insert a search button.
  var button = new goog.ui.CustomButton(null, null, opt_domHelper);
  button.setId('filterkeyword-button');
  button.addClassName('hp-button-search');
  this.toolbar_.addChild(button);

  // Insert a separator.
  this.toolbar_.addChild(new goog.ui.ToolbarSeparator(null, opt_domHelper));

  // Insert delete icon.
  var deleteIcon = new goog.ui.Control(null, null, opt_domHelper);
  deleteIcon.addClassName('hp-icon hp-icon-delete goog-inline-block');
  this.toolbar_.addChild(deleteIcon);

  // Insert delete history.
  var tmb = new goog.ui.ToolbarMenuButton('Delete History',
                                          null, null, opt_domHelper);
  tmb.setId('delete-history');
  tmb.addClassName('goog-toolbar-select');
  var deleteHistory = [
    ['delete-current', 'Current Date Range'],
    null,
    ['delete-all', 'All']];
  goog.array.forEach(deleteHistory,
    function(data, index) {
      var item = null;
      if (data) {
        item = new goog.ui.Option(data[1], null, opt_domHelper);
        item.setId(data[0]);
        item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
        // TODO: Develop after Calendar feature enabled.
        if (data[0] == 'delete-current') {
          item.setEnabled(false);
        }
      } else {
        item = new goog.ui.MenuSeparator(opt_domHelper);
      }
      tmb.addItem(item);
    });
  this.toolbar_.addChild(tmb);

  return true;
};


/** @override */
historyplus.HeaderView.prototype.createDom = function() {
  var dom = this.getDomHelper();
  this.toolbar_.createDom();
  // Insert HTML to this.element_.
  this.setElementInternal(dom.createDom(
    'div',
    historyplus.HeaderView.CLASS_NAME_,
    this.toolbar_.getElement()));

  // Excute createDom method for child component under Toolbar component.
  this.toolbar_.forEachChild(function(child) {
    child.createDom();
    // Insert HTML to Toolbar content.
    this.toolbar_.getContentElement().appendChild(child.getElement());
  }, this);
};


/** @override */
historyplus.HeaderView.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Set style for the text input in Toolbar.
  goog.array.forEach(
    this.getElementsByClass('label-input-label'),
    function(elem) {
      goog.style.setStyle(elem, '-webkit-user-select', 'auto');
    });

  // Set Event Handlers.
  var handler = this.getHandler();
  handler.listen(
    this.toolbar_,
    goog.ui.Component.EventType.ACTION,
    this.onAction_);

  // Set for Enter event in filter keyword box.
  handler.listen(
    this.toolbar_.getChild('filterkeyword'),
    historyplus.ToolbarLabelInput.EventType.ENTER,
    this.onFilterKeywordEnter_);

  // Set Event Handlers for limit buttons.
  goog.array.forEach(
    this.limitButtons_.getItems(),
    function(button) {
      handler.listen(button, goog.ui.Component.EventType.ACTION,
        function(e) {
          this.limitButtons_.setSelectedItem(e.target);
        });
    }, this);
};


/**
 * Control all Action Event when toolbar is clicked.
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 * @private
 */
historyplus.HeaderView.prototype.onAction_ = function(e) {
  var id = e.target.getId();
  if (!id) return false;

  if (id == 'data-range') {
    this.dispatchEvent(historyplus.HeaderView.EventType.CHANGE_CONDITION);
  } else if (id == 'filterkeyword-button') {
    this.dispatchEvent(historyplus.HeaderView.EventType.CHANGE_CONDITION);
  }

  return true;
};


/**
 * Action Event when limit bottun is clicked
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 * @private
 */
historyplus.HeaderView.prototype.onLimitClick_ = function(button, select) {
  if (button) {
    button.setChecked(select);
    if (select) {
      this.dispatchEvent(historyplus.HeaderView.EventType.CHANGE_CONDITION);
    }
  }
  return true;
};


/**
 * Action Event when Enter key press in Keyword box.
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 * @private
 */
historyplus.HeaderView.prototype.onFilterKeywordEnter_ = function(e) {
  this.dispatchEvent(historyplus.HeaderView.EventType.CHANGE_CONDITION);
  return true;
};


/**
 * Get selected status/information from header menu.
 * @return {object} The object include search condition.
 */
historyplus.HeaderView.prototype.getSelectedValues = function() {
  var data = {};
  var dom = this.toolbar_.getDomHelper();

  // Get date range.
  var item = this.toolbar_.getChild('date-range').getSelectedItem();
  if (item) {
    var range = null;
    var value = item.getId();
    goog.object.add(data, 'dateRangeId', value);

    if (value == 'daterange-today') {
      range = goog.date.DateRange.today();
    } else if (value == 'daterange-yesterday') {
      range = goog.date.DateRange.yesterday();
    } else if (value == 'daterange-last-week') {
      range = goog.date.DateRange.lastWeek();
    } else if (value == 'daterange-last-month') {
      range = goog.date.DateRange.lastMonth();
    } else if (value == 'daterange-all') {
      range = goog.date.DateRange.allTime();
    }
    goog.object.add(data, 'dateRange', range);
    
    if (range) {
      // Set start time.
      goog.object.add(data, 'startTime', range.getStartDate().getTime());

      // Set end time.
      var endDate = range.getEndDate();
      endDate.add(new goog.date.Interval(0, 0, 1)); //+1 day
      goog.object.add(data, 'endTime', endDate.getTime());
    }
  }

  // Get max length.
  var button = this.limitButtons_.getSelectedItem();
  console.log(button);

  // Get keyword.
  return data;
};


