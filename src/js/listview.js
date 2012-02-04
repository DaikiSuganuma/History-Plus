// Copyright (c) 2012 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview History Plus JavaScript Module.
 *
 */


goog.provide('historyplus.ListView');


goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.CustomButton');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');




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

  // Member Variables.
  this.header_ = null;
  this.list_ = null;

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
  this.header_ = new goog.ui.Component(opt_domHelper);
  this.addChild(this.header_);

  // Add toggle collapse button.
  var plusButton = new goog.ui.CustomButton(
    goog.dom.createDom('div', 'hp-icon hp-icon-plus ' +
                       goog.ui.INLINE_BLOCK_CLASSNAME),
    null, opt_domHelper);
  plusButton.addClassName('goog-custom-button-collapse-right');
  plusButton.setId('collapse');
  this.header_.addChild(plusButton);

  var minusButton = new goog.ui.CustomButton(
    goog.dom.createDom('div', 'hp-icon hp-icon-minus ' +
                       goog.ui.INLINE_BLOCK_CLASSNAME),
    null, opt_domHelper);
  minusButton.addClassName('goog-custom-button-collapse-left');
  minusButton.setId('uncollapse');
  this.header_.addChild(minusButton);

  // Add control for message area.
  var msg = new goog.ui.Control('Loading ...', null, opt_domHelper);
  msg.addClassName(goog.ui.INLINE_BLOCK_CLASSNAME);
  msg.addClassName('hp-list-header-message');
  msg.setId('message');

  this.header_.addChild(msg);

  // Add control for result text.
  var res = new goog.ui.Control('0 domain, 0 url', null, opt_domHelper);
  res.addClassName(goog.ui.INLINE_BLOCK_CLASSNAME);
  res.addClassName('hp-list-header-result-text');
  res.setId('result');
  this.header_.addChild(res);


  // Add list result.
  this.list_ = new goog.ui.Component(opt_domHelper);
  this.addChild(this.list_);

  return true;
};


/** @override */
historyplus.ListView.prototype.createDom = function() {
  var dom = this.getDomHelper();
  this.header_.createDom();
  this.list_.createDom();

  // Insert HTML to this.element_.
  this.setElementInternal(dom.createDom(
    'div', historyplus.ListView.CLASS_NAME_,
    dom.createDom('div', 'hp-list-header', this.header_.getElement()),
    dom.createDom('div', 'hp-list-result', this.list_.getElement())));

  // Excute createDom method for child component under header component.
  this.header_.forEachChild(function(child) {
    child.createDom();
    this.header_.getContentElement().appendChild(child.getElement());
  }, this);

  // Hide message area.
  goog.style.showElement(
    this.header_.getChild('message').getContentElement(), false);
};


/** @override */
historyplus.ListView.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/**
 * Set width and height of list content.
 * This method called when window size is changed.
 * @param {number} width
 * @param {number} height
 */
historyplus.ListView.prototype.setListHeight = function(height) {
  var dom = this.getDomHelper();
  if (goog.isNumber(height)) {
    var list = dom.getElementByClass('hp-list-result');
    var sizeHeader = goog.style.getSize(
      dom.getElementByClass('hp-list-header'));
    height = height - sizeHeader.height;
    goog.style.setSize(list, 'auto', height);
  }
};
