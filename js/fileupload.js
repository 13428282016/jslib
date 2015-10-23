/**
 * Created by wmj on 2015/9/28.
 */



define(['jquery', 'jquery.fileupload'], function ($, JFileUpload) {

    var FileUpload = function (options) {


        this.options = $.extend(true, {}, defaults, options);
        this.addCallbacks = $.Callbacks();
        this.successCallbacks = $.Callbacks();
        this.failCallbacks = $.Callbacks();
        this.alwaysCallbacks = $.Callbacks();
        this.options.done = $.proxy(_done,this);
        this.options.add = $.proxy( _add,this);
        this.options.always = $.proxy(_always,this);

        if(options.file)
        {
            this.$file = $(options.file);
            this.$file.fileupload(this.options);
        }
        else
        {
            this.$file = $("<input type='file' name='" + (this.options.name || 'file') + "'>");
        }



    };

    function _done(e, data) {
        var result = data.result;
        if (result&&result.status == 200) {
            this.successCallbacks.fireWith(this, [e, data]);
        }
        else {
            this.failCallbacks.fireWith(this, [e, data]);
        }
    }

    function _add(e, data) {
        this.addCallbacks.fireWith(this, [e, data]);
        data.submit();
    }

    function _always(e,data) {

        this.alwaysCallbacks.fireWith(this, [e,data]);
    }



    FileUpload.prototype.openDialog = function () {
        this.$file.val('');
        this.$file.fileupload(this.options);
        this.$file.click();
    };
    FileUpload.prototype.on = function (eventName, callback) {
        var prefix = eventName.substring(0, eventName.indexOf('.'));
        var realName = eventName.substring(eventName.indexOf('.') + 1);
        switch (prefix) {
            case "upload":
                this[realName + 'Callbacks'].add(callback);
                break;
            default :
        }
        return this;
    };
    FileUpload.prototype.off = function (eventName, callback) {
        var prefix = eventName.substring(0, eventName.indexOf('.'));
        var realName = eventName.substring(eventName.indexOf('.') + 1);
        switch (prefix) {
            case "upload":
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
    var defaults = {
        dataType: 'json',
        forceIframeTransport: true,//强制使用form表单提交到iframe
        autoUpload: true

    };

    return FileUpload;

});