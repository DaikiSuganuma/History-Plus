// Copyright (c) 2012 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.ListView');


goog.require('goog.ui.Component');
goog.require('goog.ui.ToggleButton');




/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * List Component.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
historyplus.ListView = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.initialize_(opt_domHelper);
};
goog.inherits(historyplus.ListView, goog.ui.Component);


/**
 * CSS class names for ToolbarLabelInput.
 * @type {string}
 * @private
 */
historyplus.ListView.CLASS_NAME_ = goog.getCssName('hp-list');


/**
 * Initialize components.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {boolean} Whether this method have completed successfully.
 * @private
 */
historyplus.ListView.prototype.initialize_ = function(opt_domHelper) {
  // Add list header.
  return true;
};


/** @override */
historyplus.ListView.prototype.createDom = function() {
  var dom = this.getDomHelper();
  // Insert HTML to this.element_.
  this.setElementInternal(dom.createDom(
    'div', historyplus.ListView.CLASS_NAME_,
    dom.createDom('div', 'hp-list-header'),
    dom.createDom('div', 'hp-list-result')));
};


/** @override */
historyplus.ListView.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};

