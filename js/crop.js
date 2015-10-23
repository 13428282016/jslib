/**
 * Created by wmj on 2015/9/28.
 */

define(['jquery', 'jquery.jcrop', 'clib/modal', 'common/utils'], function ($, JCrop, Modal, Util) {

    var Crop = function (options) {
        this.options = $.extend(true, {}, defaults, options);
        this.dialogEvents = {};
        this.sureCallbacks = $.Callbacks();
        this.cancelCallbacks = $.Callbacks();
        this.closeCallbacks = $.Callbacks();
        this.successCallbacks = $.Callbacks();
        this.failCallbacks = $.Callbacks();
        if (this.options.dialog) {
            this.setDialog(this.options.dialog);
        }
        this.isLoading=false
    };


    var defaults = {
        urls: {
            dialog: '/crop_dialog.html',//对话框url
            crop: 'http://backend.star.kankan.com/image_upload?jsoncallback=?'
        },
        ratio: 1,
        selectAreaWidth: 100

    };

    Crop.prototype.openDialog = function (options) {
        if (!this.$dialog) {
            //如果没有对话框，远程加载对话框
            if (this.options.urls.dialog) {
                var self = this;
                Util.loadHtml(this.options.urls.dialog, function ($dialog) {
                    self.setDialog($dialog);
                    self.openDialog(options);
                })
            }
            return;
        }
        this.options = $.extend(true, {}, this.options, options);

        //初始化对话框的数据
        this.$dialog.data('dm').initData();
        //打开对话框
        this.$dialog.modal('open');
    };

    Crop.prototype.closeDialog = function () {

        if (!this.$dialog||this.isLoading) {
            return;
        }
        this.$dialog.modal('close');
        //重置对话框
        this.resetDialog();
    };
    Crop.prototype.crop = function () {
        var data = this.getFormData();
        var self = this;
        this.isLoading=true;
        $.getJSON(this.options.urls.crop, data, function (json) {
            self.isLoading=false;
            self.$dialog.data('dm').resetBtn();
            if (json.status == 200) {
                self.successCallbacks.fireWith(self, [json]);
            }
            else {
                self.failCallbacks.fireWith(self, [json]);
            }
        })
    };
    Crop.prototype.setDialog = function (dialog) {

        this.$dialog = $(dialog);
        //记录对话框和Tip对象的关系
        this.$dialog.data('crop', this)
        //初始化对话框的事件
        var dm = new DialogManager(this.$dialog);
        dm.init();
        var events = this.dialogEvents;
        //注册dialog事件
        for (var key in events) {
            var callbacks = events[key];
            if (callbacks) {
                for (var i in callbacks) {
                    this.$dialog.on(key, callbacks[i]);
                }
            }
        }
    }
    //注册对话框事件或者鲜花业务相关的事件
    Crop.prototype.on = function (eventName, callback) {

        var prefix = eventName.substring(0, eventName.indexOf('.'));
        var realName = eventName.substring(eventName.indexOf('.') + 1);
        switch (prefix) {
            case "dlg":
                if (this.$dialog) {
                    this.$dialog.on(realName, callback);
                } else {
                    var dlgEvents = this.dialogEvents;
                    dlgEvents[realName] || (dlgEvents[realName] = []);
                    dlgEvents[realName].push(callback);
                }

                break;
            case "crop":
                this[realName + 'Callbacks'].add(callback);
                break;
            default :
        }
        return this;
    };
    Crop.prototype.off = function (eventName, callback) {
        var prefix = eventName.substring(0, eventName.indexOf('.'));
        var realName = eventName.substring(eventName.indexOf('.') + 1);
        switch (prefix) {
            case "dlg":
                if (this.$dialog) {
                    this.$dialog.off(realName, callback);
                }
                var dlgEvents = this.dialogEvents;
                if (dlgEvents[realName]) {
                    if (callback) {
                        var index = dlgEvents[realName].indexOf(callback);
                        index != -1 && dlgEvents[realName].splice(index, 1);
                    }
                    else {
                        dlgEvents[realName] = [];
                    }

                }

                break;
            case "crop":
                if (!callback) {
                    this[realName + 'Callbacks'].empty();
                }
                else {
                    this[realName + 'Callbacks'].remove(callback);
                }

                break;
            default :
        }
        return this;
    };
    Crop.prototype.getFormData = function () {
        var data,
            img,
            rateX,
            rateY;
        data = this.$dialog.data('dm').getFormData();
        $.extend(data, this.options.args);
        data.url = this.options.img;
        img = new Image();
        img.src = data.url;
        rateX = img.width / data.iw;
        rateY = img.height / data.ih;
        data.x = Math.round(data.x * rateX);
        data.y = Math.round(data.y * rateY);
        data.w = Math.round(data.w * rateX);
        data.h = Math.round(data.h * rateY);
        return data;
    };
    //重置对话框
    Crop.prototype.resetDialog = function () {

        this.$dialog.data('dm').resetDialog();
    };


    //对dialog的操作和事件
    var DialogManager = function (dialog) {
        this.$dialog = $(dialog);
        this.$dialog.data('dm', this);
    };
    //初始化事件
    DialogManager.prototype.init = function () {
        var $cancelBtn,
            $closeBtn,
            $sureBtn,
            crop,
            self,
            $img;
        $cancelBtn = this.$dialog.find('.cancel-btn');
        $closeBtn = this.$dialog.find('.close-btn');
        $sureBtn = this.$dialog.find('.sure-btn');
        crop = this.$dialog.data('crop');
        self = this;
        //取消事件
        $cancelBtn.click(function () {

            crop.cancelCallbacks.fireWith(crop);
            crop.closeDialog();

        });
        $closeBtn.click(function () {
            crop.closeCallbacks.fireWith(crop);
            crop.closeDialog();

        });
        //献花事件
        $sureBtn.click(function () {
            crop.sureCallbacks.fireWith(crop);
            Util.disableBtn($sureBtn, '裁剪中...');
            crop.crop();


        });

        $img = this.$dialog.find('.origin-img');

        $img.on('load', function () {
            self.initSelectArea();
        });

        $img.Jcrop({
            onSelect: $.proxy(onJcropSelect, this.$dialog),

            onChange: $.proxy(onJcropPreview, this)
        }, function () {
            self.jcrop = this;
             self.initSelectArea();
        });


    };
    //初始化数据
    DialogManager.prototype.initData = function () {
        var crop = this.$dialog.data('crop'),

            $pimg;
        //$img = this.$dialog.find('.origin-img');
        this.$dialog.find('.see_pic img').attr('src', crop.options.img);
        $pimg = this.$dialog.find('.preview-img');
        $pimg.attr('src', crop.options.img);


    };
    DialogManager.prototype.resetBtn=function()
    {
       Util.enableBtn( this.$dialog.find('.sure-btn'));
    };

    DialogManager.prototype.getFormData = function () {

        var $dialog = this.$dialog,
            data = {},
            $img;
        data.x = $dialog.find('[name=x]').val();
        data.y = $dialog.find('[name=y]').val();
        data.w = $dialog.find('[name=w]').val();
        data.h = $dialog.find('[name=h]').val();
        $img = this.$dialog.find('.origin-img');
        data.iw = $img.width();
        data.ih = $img.height();

        return data;
    };
    DialogManager.prototype.resetDialog = function () {
        this.$dialog.find('form')[0].reset();

    };
    DialogManager.prototype.updatePreviewImg = function (c, $pimg) {

        var self = this;
        if (parseInt(c.w) > 0 && self.jcrop) {
            $pimg.each(function (i, elem) {
                var $img = self.$dialog.find('.origin-img'),

                    $pimg = $(elem),
                    $pc = $pimg.parent(),
                    pcw = $pc.width(),
                    pch = $pc.height(),
                    rx = pcw / c.w,
                    ry = pch / c.h,
                    bounds = self.jcrop.getBounds(),
                    boundx = bounds[0],
                    boundy = bounds[1];

                $pimg.css({
                    width: Math.round(rx * boundx) + 'px',
                    height: Math.round(ry * boundy) + 'px',
                    marginLeft: '-' + Math.round(rx * c.x) + 'px',
                    marginTop: '-' + Math.round(ry * c.y) + 'px'
                });
            });

        }
    };

    function onJcropSelect(c) {
        var $dialog = this;
        $dialog.find('[name=x]').val(c.x);
        $dialog.find('[name=y]').val(c.y);
        $dialog.find('[name=w]').val(c.w);
        $dialog.find('[name=h]').val(c.h);
    }

    function onJcropPreview(c) {
        var $pimg = this.$dialog.find('.preview-img');
        this.updatePreviewImg(c, $pimg);
    }

    DialogManager.prototype.initSelectArea = function () {
        var
            $img,
            iw,
            ih,
            jcrop,
            saw,
            sah,
            x1,
            x2,
            y1,
            y2,
            oimg,
            crop;
        crop = this.$dialog.data('crop');
        $img = this.$dialog.find('.origin-img');
        oimg = new Image();
        oimg.src = $img.attr('src');
        iw = $img.width();
        ih = $img.height();
        jcrop = this.jcrop;
        saw = crop.options.selectAreaWidth;
        sah = parseInt((saw * oimg.width * ih) / (oimg.height * iw * crop.options.ratio));
        x1 = (iw - saw) / 2;
        y1 = (ih - sah) / 2;
        x2 = saw + x1;
        y2 = sah + y1;
        if (jcrop) {
            jcrop.setOptions({aspectRatio: saw / sah});
            jcrop.setSelect([x1, y1, x2, y2]);
        }


    };


    return Crop;


});