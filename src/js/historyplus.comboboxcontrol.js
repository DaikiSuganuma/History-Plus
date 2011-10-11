// Copyright (c) 2011 History Plus Authors. All rights reserved.
//
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

/**
 * @fileoverview Simply extends goog.ui.ComboBox to add to toolbar
 *
 * @see http://code.google.com/p/closure-library/wiki/IntroToControls
 */

goog.provide('historyplus.ComboBoxControl');

goog.require('goog.ui.Control');
goog.require('goog.ui.ComboBox');


/**
 * Extends {@link goog.ui.ComboBox} and {@link goog.ui.Control}
 * @param {goog.ui.ControlContent} content Text caption or DOM structure
 *     to display as the content of the component (if any).
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.ComboBox}
 * @extends {goog.ui.Control}
 */
historyplus.ComboBoxControl = function(content, opt_renderer, opt_domHelper) {
  // Inherits functions and properties from goog.ui.Control.
  historyplus.inherits(historyplus.ComboBoxControl, goog.ui.Control);

  goog.ui.Control.call(this, content, opt_renderer, opt_domHelper);

  goog.ui.ComboBox.call(this, opt_domHelper);
  this.renderer_ = opt_renderer ||
      goog.ui.registry.getDefaultRenderer(this.constructor);
  this.setContentInternal(content);
};
goog.inherits(historyplus.ComboBoxControl, goog.ui.ComboBox);

