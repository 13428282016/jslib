/**
 * Created by wmj on 2015/10/23.
 */
/**
 * Created by wmj on 2015/10/22.
 */
(function (global, factory) {

    if (typeof  define == 'object' && define.amd) {
        define(['jquery'], factory);
    }
    else if (typeof  exports == 'object') {
        factory(require('jquery'));
    }
    else {
        factory(window.jQuery);
    }
})(this, function ($) {
    var VERSION = '1.0.0',
        NAME = "Carousel",
        DATA_KEY = "mj-carousel",
        CAROUSEL_KEY = 'carousel',
        EVENT_PREFIX = 'crs',
        JQUERY_NO_CONFLICT = $.fn[NAME];
    var Default = {
        interval: 5000,
        carousel: true,
        panel: null,
        tab: null,
        delay: 300,
        type: 'slide',
        fadeTime: 1000,
        curClass: 'active',
        direction: 'left',
        nextBtn: null,
        lastBtn: null,
        hover: true
    };
    var EVENTS = {
        BEFORE_CAROUSEL: EVENT_PREFIX + ".before.crs",
        AFTER_CAROUSEL: EVENT_PREFIX + '.after.crs',
        BEFORE_ESCAPE:EVENT_PREFIX+'.before.esc',
        AFTER_ESCAPE:EVENT_PREFIX+'.after.esc'

    };
    var CLASS_NAME = {
        TO_LEFT: 'slide-to-left',
        TO_RIGHT: 'slide-to-right',
        TO_TOP: 'slide-to-top',
        TO_BOTTOM: 'slide-to-bottom',
        VERTICAL: 'vertical',
        HORIZONTAL: 'HORIZONTAL'

    };
    var Carousel = function (context, config) {

        if ($.isPlainObject(context)) {
            config = context;
        }
        else {
            this._$context = $(context);
        }
        this._config = $.extend(true, {}, Default, config);
        var _config = this._config;
        if (this._$context) {
            this._$panels = this._$context.find(_config.panel);
        }
        else {
            this._$panels = $(_config.panel);
        }
        this._size = this._$panels.size();
        if (!this._size) {
            return this;
        }
        this._init();
        this._$tabs = $(_config.tab);
        this._curIndex = 0;

    };

    Carousel.prototype.auto = function () {
        this._timer = setInterval($.proxy(function () {
            this.next();
        }, this), this._config.interval);
        return this;
    };
    Carousel.prototype.pause = function () {
        clearInterval(this._timer);
        this._timer = null;
        return this;
    };
    Carousel.prototype.next = function () {

        this.to(this._curIndex + 1);
        return this;
    };
    Carousel.prototype.last = function () {
        this.to(this._curIndex - 1);
        return this;
    };


    Carousel.prototype.on = function (name, callback, cover) {
        if (!_hasEvent(name)) {
            return this;
        }
        if ($.isFunction(callback)) {
            if (cover) {
                this.off(name);
            }
            this['_'+name].add(callback);
        }
        return this;
    };

    Carousel.prototype._init = function () {

        var self = this,
            $pp = this._$panels.eq(0).parent(),
            $tp = this._$tabs.eq(0).parent();


        $pp.on('mouseenter', this._config.panel, function () {
            self.pause();
        }).on('mouseleave', this._config.panel, function () {
            self.auto();
        }).on('webkitAnimationStart', this._config.panel, function () {

        }).on('webkitAnimationEnd', this._config.panel, function () {

        });
        if (this._config.hover) {
            $tp.on('mouseenter', this._config.tab, function () {

                self.pause()
                    .to($(this).data('tab-index') || $(this).index());
            }).on('mouseleave', this._config.tab, function () {
                self.auto();
            });
        }
        $tp.on('click', this._config.tab, function () {

            self.pause()
                .to($(this).data('tab-index') || $(this).index())
                .auto();
        });

        if (this._config.nextBtn) {
            $(this._config.nextBtn).click(function () {

                self.pause()
                    .next()
                    .auto();

            })
        }
        if (this._config.lastBtn) {
            $(this._config.lastBtn).click(function () {
                self.pause()
                    .last()
                    .auto();
            });
        }
        for(var key in EVENTS)
        {
            this['_'+EVENTS[key]]= $.Callbacks();
        }
        return this;

    };
    Carousel.prototype.off = function (name, callback) {

        if (!_hasEvent(name)) {
            return this;
        }
        if ($.isFunction(callback)) {
            this['_'+name].remove(callback);
        }
        else {
            this['_'+name].empty();
        }

    };
    Carousel.prototype._trigger = function (name) {
        if (!_hasEvent(name)) {
            return this;
        }
        this['_'+name].fireWith(this);

    };
    Carousel.prototype.to = function (target) {

        var total = this._size;
        if (!total) {
            return this;
        }
        target = target >= total ? 0 : (target < 0 ? total - 1 : target);
        if (this._config.type == 'slide') {
            this._toOnSlide(target);
        }
        else if (this._config.type == 'normal') {
            this._toOnNormal(target);
        }
        return this;
    };
    Carousel.prototype._toOnSlide = function (target) {

        if (this._config.direction == 'left') {
            this._rtl(target);
        }
        else if (this._config.direction == 'right') {
            this._ltr(target);
        }
        else if (this._config.direction == 'top') {
            this._btt(target);
        }
        else {
            this._ttb(target);
        }

    };
    Carousel.prototype._toOnNormal = function (target) {

        var origin = this._curIndex;
        if (this._curIndex == target) {
            return;
        }
        this._$panels[origin].removeClass(this._config.curClass);
        this._$tabs[origin].removeClass(this._config.curClass);
        this._$panels[target].addClass(this._config.curClass);
        this._$tabs[target].addClass(this._config.curClass);
        this._curIndex = target;
    };

    Carousel.prototype._ltr = function (target) {

    };
    Carousel.prototype._rtl = function (target) {

    };
    Carousel.prototype._btt = function (target) {

    };
    Carousel.prototype._ttb = function (target) {

    };

    function _jQueryInterface(config) {

        var args = [].slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                data = $this.data(DATA_KEY),
                _config = $.extend(true, {}, data, typeof  config === 'object' ? config : null),
                carousel = $this.data(CAROUSEL_KEY);
            if (!carousel) {
                carousel = new Carousel(this, _config);
                $this.data(CAROUSEL_KEY, carousel);
            }
            if (typeof config == 'object') {
                carousel[config](args);
            }
        });
    }

    $.fn[NAME] = _jQueryInterface;
    $.fn[NAME].constructor = Carousel;
    $.fn[NAME].noConflict = function () {
        var Carousel = $.fn[NAME];
        $.fn[NAME] = JQUERY_NO_CONFLICT;
        return Carousel;
    };

    function _hasEvent(event) {

        for (var key in EVENTS) {
            if (EVENTS[key] == event) {
                return true;
            }

        }
        return false;
    }
});