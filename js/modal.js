/**
 * Created by 20120815 on 2015-8-31.
 */

//居中显示一个模态框
define(['jquery'], function ($) {

    var Modal = function (element, options) {
        this.$body = $(document.body);
        this.options = options;
        this.isShown = false;
        this.$element = $(element);
        //模态遮罩层
        this.$container = $('<div>').css({
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'fixed',
            display: "none",
            "z-index": starCZIndex,
            background: "#000",
            filter: "alpha(opacity=" + this.options.opacity*100 + ")",
            "-moz-opacity": this.options.opacity,
            "-khtml-opacity": this.options.opacity,
            opacity: this.options.opacity
        }).appendTo(document.body);
        //模态框
        this.$element.css({display: 'none', position: 'fixed', top: "50%", left: "50%", "z-index":starZIndex})

    };

    var curOpenDialogNum = 0,
        starZIndex=9999,
        starCZIndex=9998,
        lz=starCZIndex;
    Modal.defaults = {
        open: true,
        opacity: 0.5,
        cz: 9998,
        z: 9999

    };
    //打开模态框
    Modal.prototype.open = function (args) {
        args || (args = {});
        if (this.isShown) {
            return;
        }

        var event = $.Event("beforeOpen"),
            afterEvent= $.Event("afterOpen");
        this.$element.trigger(event);

        if (event.result === false) {
            return false;
        }

        //居中
        if (args.width) {
            if (args.width == 'auto') {
                this.$element.css('width', 'auto');
            }
            else {
                this.$element.width(args.width);
            }

        }
        //居中
        if (args.height) {
            if (args.height == 'auto') {
                this.$element.css('height', 'auto');
            }
            else {
                this.$element.height(args.height);
            }

        }
        var height = this.$element.height(),
            width = this.$element.width(), z, cz;
        cz =lz+1;
        lz=z=cz+1;



        this.$element.css({"margin-top": -height / 2, "margin-left": -width / 2,"z-index":z})
        this.$container.css({"z-index":cz}).show();
        this.$element.show();
        this.isShown = true;
        curOpenDialogNum++;
        this.$element.trigger(afterEvent);

    };
    //重新计算位置
    Modal.prototype.refreshPosition=function(){
        if (!this.isShown) {
            return;
        }
        var height = this.$element.height(),
            width = this.$element.width();
        this.$element.css({"margin-top": -height / 2, "margin-left": -width / 2});
    };
    //关闭模态框
    Modal.prototype.close = function (callback) {
        if(!this.isShown)
        {
            return;
        }
        this.$element.hide();
        this.$container.hide();
        $.isFunction(callback)&&callback();
        this.$element.trigger('afterClose');
        this.isShown = false;
        curOpenDialogNum--;
    }
    //销毁模态框
    Modal.prototype.destroy = function () {
        this.$element.remove();
        this.$container.remove();
        this.$element = null;
        this.$container = null;
    }

    //jquery 插件
    function Plugin(option, args) {
        return this.each(function () {

            var $this = $(this);
            //设置选项
            var options = $.extend(true, {}, Modal.defaults, typeof option == 'object' && option);
            var modal = $this.data('modal');
            if (!modal) {
                //创建模态框
                modal = new Modal(this, options);
                $this.data('modal', modal);
            }
            //参数option为字符串，则认为调用该方法，如果是对象则认为是配置
            if (typeof option == 'string') {
                modal[option](args);
            }
            else if (options.open) {
                modal.open(args);
            }


        })
    }

    $.fn.modal = Plugin;
    return Modal;


});