// Copyright (c) 2011 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.ListView');


goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.decorate');




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
historyplus.ListView = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.initialize_();
};
goog.inherits(historyplus.ListView, goog.ui.Component);


/**
 * Initialize components.
 * @return {boolean} Whether this method have completed successfully.
 */
historyplus.ListView.prototype.initialize_ = function() {
  return true;
};


/**
 * Called before search method excute.
 * @return {boolean} Whether this method have completed successfully.
 */
historyplus.ListView.prototype.onBeginDrowList = function() {
  return true;
};


/**
 * Called after rendering is done.
 * @return {boolean} Whether this method have completed successfully.
 */
historyplus.ListView.prototype.onEndDrowList = function() {
  return true;
};


