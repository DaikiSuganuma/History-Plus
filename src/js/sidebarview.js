// Copyright (c) 2011 History Plus Authors. All rights reserved.
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
  this.sidebar_ = goog.dom.getElement('sidebar');

  // Create a EventHandler 
  this.eventHandler_ = new goog.events.EventHandler(this);

  this.initialize_();
};
goog.inherits(historyplus.SidebarView, goog.ui.Component);


/**
 * Initialize components.
 * @return {boolean} Whether this method have completed successfully.
 */
historyplus.SidebarView.prototype.initialize_ = function() {

  // Generate Calendar
  var calendar = null;
  this.calendar_ = new goog.ui.DatePicker();
  calendar = this.calendar_;
  //calendar.setId('sidebar-calendar');

  calendar.setShowWeekNum(false);
  calendar.setShowToday(false);
  calendar.setUseNarrowWeekdayNames(true);
  calendar.setAllowNone(false);
  calendar.setUseSimpleNavigationMenu(true);
  calendar.render(this.sidebar_);

  // Insert a separator


  return true;
};

