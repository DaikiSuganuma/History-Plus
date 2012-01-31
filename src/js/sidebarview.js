// Copyright (c) 2012 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.SidebarView');


goog.require('goog.ui.Component');
goog.require('goog.ui.DatePicker');




/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * Sidebar Component.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
historyplus.SidebarView = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  // Member Variables.
  this.calendar_ = null;

  this.initialize_(opt_domHelper);
};
goog.inherits(historyplus.SidebarView, goog.ui.Component);


/**
 * CSS class names for ToolbarLabelInput.
 * @type {string}
 * @private
 */
historyplus.SidebarView.CLASS_NAME_ = goog.getCssName('hp-sidebar');


/**
 * Initialize components.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {boolean} Whether this method have completed successfully.
 * @private
 */
historyplus.SidebarView.prototype.initialize_ = function(opt_domHelper) {

  // Generate Calendar component.
  this.calendar_ = new goog.ui.DatePicker();
  this.calendar_.setId('sidebar-calendar');

  this.calendar_.setShowWeekNum(false);
  this.calendar_.setShowToday(false);
  this.calendar_.setUseNarrowWeekdayNames(true);
  this.calendar_.setAllowNone(false);
  this.calendar_.setUseSimpleNavigationMenu(true);

  this.addChild(this.calendar_);

  return true;
};


/** @override */
historyplus.SidebarView.prototype.createDom = function() {
  var dom = this.getDomHelper();
  this.calendar_.createDom();
  // Insert HTML to this.element_.
  this.setElementInternal(dom.createDom(
    'div', historyplus.SidebarView.CLASS_NAME_,
    dom.createDom(
      'div', 'hp-calendar',
      this.calendar_.getElement()),
    dom.createDom('div', 'hp-sidebar-separator'),
    dom.createDom('div', 'hp-sidebar-widget'),
    dom.createDom('div', 'hp-sidebar-separator'),
    dom.createDom('div', 'hp-sidebar-widget')));
};


/** @override */
historyplus.SidebarView.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


