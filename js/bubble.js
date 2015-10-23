/**
 * Created by wmj on 2015/10/15.
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    }
    else if (typeof  exports === 'object') {
        // Node/CommonJS:
        factory(require('jquery'));
    }
    else {
        // Browser globals:
        factory(window.jQuery);
    }
})(this, function ($) {

    var NAME = "Bubble",
        VERSION = "1.0.0",
        BUBBLE_KEY = 'bubble',
        DATA_KEY = 'mj-bubble',
        JQUERY_NO_CONFLICT = $.fn[NAME];

    var Default = {
        template: '<div class="cx-bubble" style="display: none">' +
        '<div class="cx-bubble-arrow"></div>' +
        '<div class="cx-bubble-msg"></div>' +
        '</div>',
        offset: 0,
        direction: 'bottom',
        arrowThick: 6,
        maxWidth: 250,
        width: 'auto',
        maxHeight: 100,
        height: 'auto',
        statusClass: {success: 'cx-bubble-success', warning: 'cx-bubble-warning', danger: 'cx-bubble-danger', normal: 'cx-bubble-normal'},
        status: 'danger',
        arrowClass: {right: 'cx-bubble-arrow-left', left: 'cx-bubble-arrow-right', bottom: 'cx-bubble-arrow-top', top: 'cx-bubble-arrow-bottom'},
        delayHideMillSecond: 0,
        wrap: true,
        appendPosition: 'body'


    };

    var Bubble = (function ($) {

        var Bubble = function (element, config) {
            this._config = this._getConfig(config);
            this._$element = $(element);
            this._$element.data(BUBBLE_KEY, this);
            this._isShown = false;
            if (this._config.appendPosition == 'body') {
                this._$tip = $(this._config.template).appendTo(document.body);
            }
            else {

                this._$tip = $(this._config.template);
                this._$element.after(this._$tip);
            }

            this._tm = new TipManager(this._$tip);
        };
        Bubble.prototype.show = function (args) {

            var msg = args[0],
                config = args[1];
            if (typeof msg == 'object') {
                config = msg;
            }
            if (typeof msg == 'string') {
                this._tm.text(msg);
            }
            if (typeof config === "object") {
                $.extend(this._config, config);
            }
            if (this._isShown && !(typeof config === "object" && config.forceRefresh)) {
                return this;
            }
            var position,
                direction = this._config.direction;
            this._tm.getArrowElement().removeClass('cx-bubble-arrow-left cx-bubble-arrow-right cx-bubble-arrow-top cx-bubble-arrow-bottom').addClass(this._config.arrowClass[direction]);
            this._$tip.removeClass('cx-bubble-success cx-bubble-warning cx-bubble-danger cx-bubble-normal').addClass(this._config.statusClass[this._config.status]);
            position = this._config.appendPosition == 'body' ? this._calcPositionOnBody() : this._calcPositionOnSibling();
            this._tm.getContentElement().css({
                "white-space": this._config.wrap ? 'normal' : 'nowrap'
            });
            this._$tip.css({
                left: position.left,
                top: position.top
            }).show();

            this._isShown = true;
            if (this._config.delayHideMillSecond) {
                setTimeout($.proxy(this.hide, this), this._config.delayHideMillSecond);
            }
            return this;

        };

        Bubble.prototype._calcPositionOnBody = function () {

            var
                selfOffset,
                tipOffset = {},
                direction,
                selfW,
                selfH,
                tipW,
                tipH,
                $content;
            selfOffset = this._$element.offset();
            direction = this._config.direction;
            $content = this._tm.getContentElement();

            if (this._config.maxWidth) {
                $content.css('max-width', this._config.maxWidth);
            }
            else if (this._config.width) {
                $content.css('width', this._config.width);
            }
            if (this._config.maxHeight) {
                $content.css('max-height', this._config.height);
            }
            else if (this._config.height) {
                $content.css('height', this._config.height);
            }
            selfH = this._$element.outerHeight();
            selfW = this._$element.outerWidth();
            tipW = this._$tip.outerWidth();
            tipH = this._$tip.outerHeight();

            if (direction == 'top') {

                tipOffset.left = selfOffset.left + (selfW - tipW) / 2;
                tipOffset.top = selfOffset.top - tipH - this._config.offset;


            } else if (direction == 'left') {
                tipOffset.left = selfOffset.left - tipW - this._config.offset;
                tipOffset.top = selfOffset.top + (selfH - tipH) / 2;
            }
            else if (direction == 'right') {
                tipOffset.left = selfOffset.left + selfW + this._config.offset;
                tipOffset.top = selfOffset.top + (selfH - tipH) / 2;
            }
            else {
                tipOffset.left = selfOffset.left + (selfW - tipW) / 2;
                tipOffset.top = selfOffset.top + selfH + this._config.offset;
            }
            return tipOffset;
        };
        Bubble.prototype._calcPositionOnSibling = function () {
            var
                selfOffset,
                tipOffset = {},
                direction,
                selfW,
                selfH,
                tipW,
                tipH,
                $content;


            selfOffset = this._$element.position();
            selfOffset.left += parseInt(this._$element.css('margin-left') == 'auto' ? 0 : this._$element.css('margin-left'));
            selfOffset.top += parseInt(this._$element.css('margin-top') == 'auto' ? 0 : this._$element.css('margin-top'));
            direction = this._config.direction;
            $content = this._tm.getContentElement();
            if (this._config.width) {
                $content.css('width', this._config.width);
            }
            if (this._config.height) {
                $content.css('height', this._config.height);
            }
            selfH = this._$element.outerHeight();
            selfW = this._$element.outerWidth();
            tipW = this._$tip.outerWidth();
            tipH = this._$tip.outerHeight();
            if (direction == 'top') {

                tipOffset.left = selfOffset.left + (selfW - tipW) / 2;
                tipOffset.top = selfOffset.top - tipH - this._config.offset;


            } else if (direction == 'left') {
                tipOffset.left = selfOffset.left - tipW - this._config.offset;
                tipOffset.top = selfOffset.top + (selfH - tipH) / 2;
            }
            else if (direction == 'right') {
                tipOffset.left = selfOffset.left + selfW + this._config.offset;
                tipOffset.top = selfOffset.top + (selfH - tipH) / 2;
            }
            else {
                tipOffset.left = selfOffset.left + (selfW - tipW) / 2;
                tipOffset.top = selfOffset.top + selfH + this._config.offset;
            }
            return tipOffset;
        };
        Bubble.prototype.hide = function () {
            if (!this._isShown) {
                return this;
            }
            this._$tip.hide();
            this._isShown = false;
            return this;
        };
        Bubble.prototype.destroy = function () {

            this._$element.removeData(BUBBLE_KEY);
            this._$tip.remove();
            this._tm = null;
            delete this;
        };
        Bubble.prototype.toggle = function () {

            if (this._isShown) {
                this.hide();
            }
            else {
                this.show();
            }
            return this;
        };
        Bubble.prototype._getConfig = function (config) {

            return $.extend(true, {}, Default, config);
        };
        Bubble._jQueryInterface = function (config) {
            var args = [].slice.call(arguments, 1);
            return this.each(function (i, elem) {

                var data,
                    _config,
                    bubble;

                data = $(elem).data(DATA_KEY);
                _config = $.extend(true, {}, data, typeof config === 'object' ? config : null);
                bubble = $(elem).data(BUBBLE_KEY);

                if (!bubble) {
                    if(config=='hide')
                    {
                        return;
                    }
                    bubble = new Bubble(elem, _config);
                }
                if (typeof  config == "string") {
                    bubble[config](args);
                } else if (_config.show) {
                    bubble.show(args);
                }
            })
        };
        return Bubble;

    })($);

    $.fn[NAME] = Bubble._jQueryInterface;
    $.fn[NAME].Constructor = Bubble;
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT;
        return Bubble._jQueryInterface;
    };
    var TipManager = (function ($) {

        var SELECTOR = {
            TEXT: ".cx-bubble-msg",
            ARROW: ".cx-bubble-arrow"
        };
        var TipManager = function (tip) {
            this._$tip = $(tip);
        };
        TipManager.prototype.text = function (msg) {

            if (typeof msg == 'string') {
                this._setText(msg);
                return this;
            }
            else {
                return this._getText();
            }
        };
        TipManager.prototype._setText = function (msg) {
            this._$tip.find(SELECTOR.TEXT).html(msg);
        };
        TipManager.prototype._getText = function () {

            return this._$tip.find(SELECTOR.TEXT).html();
        };
        TipManager.prototype.getContentElement = function () {
            return this._$tip.find(SELECTOR.TEXT);
        };
        TipManager.prototype.getArrowElement = function () {
            return this._$tip.find(SELECTOR.ARROW);
        };

        return TipManager;
    })($);

    typeof  module == 'object' && (module.exports = Bubble);
    return Bubble;
});





