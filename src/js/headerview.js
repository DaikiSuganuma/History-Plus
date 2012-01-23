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
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.Option');
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


/** @override */
historyplus.HeaderView.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};


/** @override */
historyplus.HeaderView.prototype.createDom = function() {
  var dom = this.getDomHelper();
  this.toolbar_.createDom();
  this.setElementInternal(dom.createDom(
    'div',
    historyplus.HeaderView.CLASS_NAME_,
    this.toolbar_.getElement()));

  //
  this.toolbar_.forEachChild(function(comp) {
    comp.createDom();
    this.toolbar_.getContentElement().appendChild(comp.getElement());
  }, this);

  console.log(this.element_);
};


/** @override */
historyplus.HeaderView.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/** @override */
historyplus.HeaderView.prototype.exitDocument = function() {
  goog.base(this, 'exitDocument');
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
  goog.array.forEach(
    ['Today', 'Yesterday', 'Last Week', 'Last Month', null, 'All'],
    function(label, index) {
      var item = null;
      if (label) {
        item = new goog.ui.Option(label, null, opt_domHelper);
        item.setId(label);
        item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
        if (label == 'All') {
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
  goog.array.forEach(['100', '250', '500', '1000'], function(value, index) {
    var button = new goog.ui.ToolbarToggleButton(value, null, opt_domHelper);
    button.addClassName('hp-limit-button');
    button.setValue(value);
    button.setId();
    this.toolbar_.addChild(button);
    if (index == 0) {
      button.setChecked(true);
    }
  }, this);

  // Insert a separator.
  this.toolbar_.addChild(new goog.ui.ToolbarSeparator(null, opt_domHelper));

  // Insert a input box by using historyplus.ComboBoxControl
  var li = new historyplus.ToolbarLabelInput('Filter by keyword', null, null, opt_domHelper);
  this.toolbar_.addChild(li);

  // Insert a search button.
  var button = new goog.ui.CustomButton(null, null, opt_domHelper);
  button.addClassName('hp-button-search');
  this.toolbar_.addChild(button);

  // Insert a separator.
  this.toolbar_.addChild(new goog.ui.ToolbarSeparator(null, opt_domHelper));

  // Insert delete icon.
  var deleteIcon = new goog.ui.Control(null, null, opt_domHelper);
  deleteIcon.addClassName('hp-icon hp-icon-delete goog-inline-block');
  this.toolbar_.addChild(deleteIcon);

  // Insert delete history.
  var tmb = new goog.ui.ToolbarMenuButton('Delete History', null, null, opt_domHelper);
  tmb.setId('delete-history');
  tmb.addClassName('goog-toolbar-select');
  goog.array.forEach(
    ['Current Date Range', null, 'All'],
    function(label, index) {
      var item = null;
      if (label) {
        item = new goog.ui.Option(label, null, opt_domHelper);
        item.setId(label);
        item.setDispatchTransitionEvents(goog.ui.Component.State.ALL, true);
      } else {
        item = new goog.ui.MenuSeparator(opt_domHelper);
      }
      tmb.addItem(item);
    });
  this.toolbar_.addChild(tmb);


  // Render toolbar.
  //toolbar.render(this.header_);


  // Set style for the text input in toolbar,
  // this must be written after toolbar.render().
  /*
  goog.array.forEach(
    goog.dom.query('#header input'),
    function(element) {
      goog.style.setStyle(element, '-webkit-user-select', 'auto');
    });
    */

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
