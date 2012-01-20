// Copyright (c) 2011 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.HeaderView');


goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.ui.Control');
goog.require('goog.ui.Component');
goog.require('goog.ui.Option');
goog.require('goog.ui.Separator');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarSelect');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');

goog.require('historyplus.ComboBoxControl');
goog.require('historyplus.LabelInputControl');
goog.require('historyplus.LabelInput');
goog.require('historyplus.ToolbarLabelInput');




/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * Functions for drawing the page with HTML.
 *
 * Datetime formatting pattern is written in source code, see below:
 * closure/goog/i18n/datetimeformat.js
 *
 * @param {object} App controller App object.
 * @constructor
 */
historyplus.HeaderView = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  // List of member variables.
  this.toolbar_ = null;

  // Create a EventHandler 
  this.eventHandler_ = new goog.events.EventHandler(this);

  this.initialize_();
};
goog.inherits(historyplus.HeaderView, goog.ui.Component);


/**
 * Initialize components.
 * @return {boolean} Whether this method have completed successfully.
 * @private
 */
historyplus.HeaderView.prototype.initialize_ = function() {
  var self = this;
  var eventHandler = null;
  eventHandler = this.eventHandler_;

  // Generate Toolbar component.
  var toolbar = null;
  this.toolbar_ = new goog.ui.Toolbar();
  toolbar = this.toolbar_;
  toolbar.setId('header-toolbar');

  // Insert calendar icon.
  var calIcon = new goog.ui.Control();
  calIcon.addClassName('hp-icon hp-icon-calendar goog-inline-block');
  toolbar.addChild(calIcon, true);

  // Insert date range menu.
  var ts = new goog.ui.ToolbarSelect();
  var selectedIndex = null;
  ts.setId('date-range');
  ts.addClassName('goog-toolbar-select');
  goog.array.forEach(
    ['Today', 'Yesterday', 'Last Week', 'Last Month', null, 'All'],
    function(label, index) {
      var item = null;
      if (label) {
        item = new goog.ui.Option(label);
        item.setId(label);
        item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
        if (label == 'All') {
          selectedIndex = index;
        }
      } else {
        item = new goog.ui.MenuSeparator();
      }
      ts.addItem(item);
    });
  toolbar.addChild(ts, true);
  ts.setSelectedIndex(selectedIndex);

  // Insert date range begin menu.
  var tsb = new goog.ui.ToolbarSelect();
  tsb.setId('date-range-begin');
  tsb.addClassName('goog-toolbar-select');
  var item = new goog.ui.Option('0000/00/00 (Mon)');
  item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
  tsb.addItem(item);
  toolbar.addChild(tsb, true);
  tsb.setSelectedItem(item);
  tsb.setEnabled(false);

  // Insert dash icon.
  var dashIcon = new goog.ui.Control('-');
  dashIcon.addClassName('date-range-separator goog-inline-block');
  toolbar.addChild(dashIcon, true);

  // Insert date range end menu.
  var tse = new goog.ui.ToolbarSelect();
  tse.setId('date-range-end');
  tse.addClassName('goog-toolbar-select');
  var item = new goog.ui.Option('9999/99/99 (Sun)');
  item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
  tse.addItem(item);
  toolbar.addChild(tse, true);
  tse.setSelectedItem(item);
  tse.setEnabled(false);

  // Insert a separator.
  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);

  // Insert limit icon.
  var limitIcon = new goog.ui.Control();
  limitIcon.addClassName('hp-icon hp-icon-limit goog-inline-block');
  toolbar.addChild(limitIcon, true);

  // Insert Limit buttons.
  goog.array.forEach(['100', '250', '500', '1000'], function(value, index) {
    var button = new goog.ui.ToolbarToggleButton(value);
    button.addClassName('hp-limit-button');
    button.setValue(value);
    button.setId();
    toolbar.addChild(button, true);
    if (index == 0) {
      button.setChecked(true);
    }
    // Set EventHandler to handle click event.
    eventHandler.listen(button,
                        goog.ui.Component.EventType.ACTION,
                        self.onLimitClick_);
  });

  // Insert a separator.
  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);

  // Insert a input box by using historyplus.ComboBoxControl
  var li = new historyplus.ToolbarLabelInput('Filter by keyword');
  toolbar.addChild(li, true);

  // Insert a search button.
  
  // Insert a separator.
  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);

  // Render toolbar.
  toolbar.render(goog.dom.getElement('header'));

  //
  goog.array.forEach(
    goog.dom.query('#header input'),
    function(element) {
      goog.style.setStyle(element, '-webkit-user-select', 'auto');
    });

  return true;
};


/**
 * Collect search condition from header menu.
 * @return {object} The object include search condition.
 */
historyplus.HeaderView.prototype.getSearchCondition = function() {
  return false;
};


/**
 * Action Event when limit bottun is clicked
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 * @private
 */
historyplus.HeaderView.prototype.onLimitClick_ = function(e) {
  // Reset limit buttons.
  var toolbar = this.toolbar_;
  goog.array.forEach(
    goog.dom.query('#header .hp-limit-button'),
    function(element) {
      var button = toolbar.getChild(element.id);
      button.setChecked(false);
    });
  // Check the click button.
  e.target.setChecked(true);

  console.log('Excute search method');
  return true;
};


/**
 * Action Event when Enter key press in Keyword box.
 * @param {object} e Event object.
 * @return {boolean} Whether the click event end correctly.
 * @private
 */
historyplus.HeaderView.prototype.onFilterKeywordKeyUp_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.ENTER) {
    console.log('Excute search method');
  }
  return true;
};
