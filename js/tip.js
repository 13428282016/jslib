define(['jquery', 'clib/modal', 'common/utils'], function ($, Modal, Util) {
    //一句话对话框，提供标题，描述，取消，确定
    var Tip = function (options) {
        this.options = $.extend(true, {}, Tip.defaults, options);
        this.dialogEvents = {};
        this.options.sureCallbacks = $.Callbacks();
        this.options.cancelCallbacks = $.Callbacks();
        this.options.closeCallbacks = $.Callbacks();
        if (this.options.dialog) {
            this.setDialog(this.options.dialog);
        }

    };
    Tip.defaults = {
        urls: {
            dialog: '/tip_dialog.html'//对话框url
        },
        title: '提示',//标题
        desc: '',//描述
        buttons: {cancel: '', sure: ''},//取消按钮和确定按钮，如果不为空，则认为显示，字符串内容作为按钮的值
        width: 'auto',
        height: 'auto',
        template: '<div >' +
        '<div class="dailog">' +
        '<p class="close"><a href="javascript:void(0)" class="close-btn">×</a></p>' +
        '<h1 style="padding:0 40px; " class="fs16 bd tac tip-title">提示</h1>' +
        '<p class="dailog_text tip-content">' +

        '</p>' +
        '<div class="tac"><a href="javascript:void(0)" style="display: none" class="common_btn_normal cancel-btn">取消</a><a href="javascript:void(0)" style="display: none" class="common_btn_yellow m_l sure-btn">确定</a></div>' +
        '</div>' +
        '</div>'

    };
    //dialog接口
    Tip.prototype.setDialog = function (dialog) {
        this.$dialog = $(dialog);
        //记录对话框和Tip对象的关系
        this.$dialog.data('tip', this)
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
    };
    Tip.prototype.openDialog = function (options) {
        options = options || {};
        if (!this.$dialog) {
            if(this.options.template)
            {

                this.setDialog(  $(this.options.template).appendTo(document.body));
            }
           else  if (this.options.urls.dialog) {
                var self = this;
                Util.loadHtml(this.options.urls.dialog, function ($dialog) {
                    self.setDialog($dialog);
                    self.openDialog(options);
                });
                return;
            }

        }
        //初始化对话框的数据
        this.options = $.extend(true, {}, this.options, options);
        this.$dialog.data('dm').initData();
        this.$dialog.modal('open', {width: this.options.width, height: this.options.height});
    };
    Tip.prototype.closeDialog = function () {
        if (!this.$dialog) {
            return;
        }
        this.$dialog.modal('close');
    };

    Tip.prototype.on = function (eventName, callback) {

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
            case "tip":
                this.options[realName + 'Callbacks'].add(callback);
                break;
            default :
        }
        return this;
    };
    Tip.prototype.off = function (eventName, callback) {
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
            case "tip":
                if (callback) {
                    this.options[realName + 'Callbacks'].remove(callback);
                } else {
                    this.options[realName + 'Callbacks'].empty();
                }
                break;
            default :
        }
        return this;
    };

    //成功事件
    Tip.prototype.sure = function (cb) {
        this.options.sureCallbacks.add(cb);
        return this;
    };
    //失败事件
    Tip.prototype.cancel = function (cb) {
        this.options.cancelCallbacks.add(cb);
        return this;
    };

    //失败事件
    Tip.prototype.close = function (cb) {
        this.options.closeCallbacks.add(cb);
        return this;
    };
    //业务逻辑
    var DialogManager = function (dialog) {
        this.$dialog = $(dialog);
        this.$dialog.data('dm', this);
    };

    DialogManager.prototype.init = function () {
        var $dialog = this.$dialog;
        var $cancelBtn = $dialog.find('.cancel-btn');
        var $closeBtn = $dialog.find('.close-btn');
        var $sureBtn = $dialog.find('.sure-btn');
        var tip = $dialog.data('tip');
        //初始化取消按钮
        if (tip.options.buttons.cancel) {
            $cancelBtn.click(function () {
                tip.closeDialog();
                tip.options.cancelCallbacks.fireWith($cancelBtn, [tip]);

            })
                .text(tip.options.buttons.cancel)
                .show();
        } else {
            $cancelBtn.hide();
        }
        if (tip.options.buttons.sure) {
            $sureBtn.click(function () {
                tip.closeDialog();
                tip.options.sureCallbacks.fireWith($cancelBtn, [tip]);
            })
                .text(tip.options.buttons.sure)
                .show();
        } else {
            $sureBtn.hide();
        }

        $closeBtn.click(function () {
            tip.closeDialog();
            tip.options.closeCallbacks.fireWith($closeBtn, [tip]);
        })


    };
    DialogManager.prototype.initData = function () {
        if (this.$dialog) {
            var tip = this.$dialog.data('tip');
            this.$dialog.find('.tip-title').html(tip.options.title);
            this.$dialog.find('.tip-content').html(tip.options.desc);

        }
    };


    return Tip;
})
;