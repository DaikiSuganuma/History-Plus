// Copyright (c) 2011 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview Simply extends goog.ui.LabelInput to add to toolbar.
 *
 * @see http://code.google.com/p/closure-library/wiki/IntroToControls
 */

goog.provide('historyplus.ToolbarLabelInput');

goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Control');


/**
 * Base namespace for History Plus.
 * @const
 **/
var historyplus = historyplus || {};


/**
 * Extends {@link goog.ui.LabelInput} and {@link goog.ui.Control}
 * @param {string=} label The text to show as the label.
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to display as the content of the component (if any).
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.LabelInput}
 * @extends {goog.ui.Control}
 */
historyplus.ToolbarLabelInput = function(label, content, opt_renderer, opt_domHelper) {
  goog.ui.Control.call(this, content, opt_renderer, opt_domHelper);

  this.labelInput_ = new goog.ui.LabelInput(label);
  this.setAllowTextSelection(true);
  this.addChild(this.labelInput_, true);
  this.addClassName(goog.ui.INLINE_BLOCK_CLASSNAME);
};
goog.inherits(historyplus.ToolbarLabelInput, goog.ui.Control);


historyplus.ToolbarLabelInput.prototype.handleMouseUp = function(e) {
  goog.base(this, 'handleMouseUp', e);
  this.setFocused(true);
  this.labelInput_.focusAndSelect();
  console.log(e);
};
