"use strict";
var dragDropControl = function (eventListener) {
    var dropZone,
        stopPropagation = function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            try {
                e.returnValue = false;
            } catch (ex) {
            }
        },
        preventDefault = function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            try {
                e.returnValue = false;
            } catch (ex) {
            }
        },
        initEvent = function (event) {
            preventDefault(event);
            stopPropagation(event);
        },
        doDragOver = function (event) {
            initEvent(event);
            event.dataTransfer.dropEffect = 'copy';
        },
        doDragEnter = function (event) {
            initEvent(event);
            eventListener.fire('dragZoneEntered');
            dropZone.addClass('hover');
        },
        doDragLeave = function (event) {
            initEvent(event);
            dropZone.removeClass('hover');
        },
        doDrop = function (event) {
            var files;
            initEvent(event);
            files = event.dataTransfer.files;
            if (files && files.length > 0) {
                eventListener.fire('fileDropped', [files]);
            }
            dropZone.removeClass('hover');
        },
        bindEvent = function (element, eventName, eventHandler, useCapture) {
            if (element.addEventListener) {
                element.addEventListener(eventName, eventHandler, useCapture);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, eventHandler);
            }
        },
        initializeEvents = function (containerControl) {
            var element;
            dropZone = containerControl;
            element = dropZone.get(0);
            bindEvent(element, "dragover", doDragOver, true);
            bindEvent(element, "drop", doDrop, true);
            bindEvent(element, "dragenter", doDragEnter, true);
            bindEvent(element, "dragleave", doDragLeave, true);
        },
        that = {
            ready: function (containerControl) {
                initializeEvents(containerControl);
            },
            addListener: function (type, listener) {
                eventListener.addListener(type, listener);
            },
            removeListener: function (type, listener) {
                eventListener.removeListener(type, listener);
            }
        };
    return that;
};