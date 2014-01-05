/*globals define, $ */
"use strict";
define([], function () {
    var _popupStatus = 0,
        _backgroundPopup,
        _popup,
        _popupClose,
        _container,
        disablePopup = function () {
            if (_popupStatus === 1) {
                _backgroundPopup.fadeOut("slow");
                _popup.fadeOut("slow");
                _popupStatus = 0;
            }
        },
        assignPopupEvents = function () {
            _backgroundPopup.click(disablePopup);
            _popupClose.click(disablePopup);
        },
        loadPopup = function () {
            if (_popupStatus === 0) {
                _backgroundPopup.css({
                    "opacity": "0.6",
                    "height": $('body').height(),
                    "width": $('body').width()
                });
                _backgroundPopup.fadeIn("slow");
                _popup.fadeIn("slow");
                _popupStatus = 1;
            }
        },
        clearPopup = function () {
            _popup.children('div').remove();
        };
    return {
        showPopup: function (message, top, left, container) {
            clearPopup();
            _popup.append(message);
            if (container) {
                if (!top) {
                    top = (_container.height() / 2) - (_popup.height() / 2);
                }
                if (!left) {
                    left = (_container.width() / 2) - (_popup.width() / 2);
                }
            } else {
                if (!top) {
                    top = ($('body').height() / 2) - (_popup.height() / 2);
                }
                if (!left) {
                    left = ($('body').width() / 2) - (_popup.width() / 2);
                }
            }
            _popup.css({ "position": "absolute", "top": top, "left": left });
            loadPopup(_popup);
        },
        initialize: function () {
            _backgroundPopup = $('#backgroundPopup');
            _popup = $('#popup');
            _popupClose = $('#popupClose');
            _container = $('.environmentContainer');
            assignPopupEvents();
        }
    };
});