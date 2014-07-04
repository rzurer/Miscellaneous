﻿/*globals $, console, define, jQuery, window, navigator, screen, document, require*/
require.config({
    paths: {
        jQuery: '../Scripts/jquery-1.7.1',
        jQueryUi: '../Scripts/jquery-ui-1.8.16'
    },
    shim: { 'jQueryUi': { deps: ['jQuery']} }
});
define(['jQuery', 'jQueryUi'], function () {
    "use strict";
    var popupStatus = 0,
        getPopupStatus = function () {
            return popupStatus;
        },
        toggleLogContainer = function () {
            var target = $('#logContainer');
            target.slideToggle('normal', function () {
                if (target.css('display') === 'none') {
                    $('#logImage').attr("title", "Show Log");
                    return;
                }
                $('#logImage').attr("title", "Hide Log");
            });
        },
        getBackgroundPopup = function () {
            return $("#backgroundPopup");
        },
        loadPopup = function (popup) {
            var containerWidth, containerHeight;
            containerWidth = $('body').width();
            containerHeight = $('body').height();
            if (getPopupStatus() === 0) {
                getBackgroundPopup().css({
                    "opacity": "0.6",
                    "height": containerHeight,
                    "width": containerWidth
                });
                getBackgroundPopup().fadeIn("slow");
                popup.fadeIn("slow");
                popupStatus = 1;
            }
        },
        doSetErrorBorderAndFocus = function (target) {
            target.css('border', '2px solid red');
            target.focus(function () {
                target.value = this.value;
            });
            target.focus();
        },
        doSetNormalBorderAndCallback = function (target, callback) {
            target.css('border', 'solid 1px #E5E5E5');
            if (callback) {
                callback(target);
            }
        },
        blurEvent = function (target, array, callback, errorCallback) {
            var verifyInList = function () {
                if (!array || array.length === 0 || (target.val().trim()).length === 0) {
                    doSetNormalBorderAndCallback(target, callback);
                    return;
                }
                if (array.indexOf(target.val()) === -1) {
                    doSetErrorBorderAndFocus(target);
                    if (errorCallback) {
                        errorCallback();
                    }
                } else {
                    doSetNormalBorderAndCallback(target, callback);
                }
            };
            verifyInList(target, array, callback);
        },
        caseInsensitiveBlurEvent = function (target, array, callback, errorCallback) {
            var verifyInList = function () {
                if (!array || array.length === 0 || (target.val().trim()).length === 0) {
                    doSetNormalBorderAndCallback(target, callback);
                    return;
                }
                var lowercaseArray = array.map(function (element) {
                    return element.toLowerCase();
                });
                if (lowercaseArray.indexOf(target.val().toLowerCase()) === -1) {
                    doSetErrorBorderAndFocus(target);
                    if (errorCallback) {
                        errorCallback();
                    }
                } else {
                    doSetNormalBorderAndCallback(target, callback);
                }
            };
            verifyInList(target, array, callback);
        },
        focusEvent = function (target, minLength) {
            if (minLength === 0) {
                if (!target || target.val() === '') {
                    target.autocomplete("search");
                }
            }
        },
        isValidIPAddress = function (source) {
            var regexIP = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
            return source ? regexIP.test(source) : false;
        },
        getTwoDigitDate = function (dateNumber) {
            if (dateNumber < 1 || dateNumber > 31) {
                throw "Date must be between 1 and 31";
            }
            if (dateNumber < 10) {
                return "0" + dateNumber;
            }
            return dateNumber;
        },
        getTwoDigitMonthNumber = function (monthNumber) {
            if (monthNumber < 0 || monthNumber > 11) {
                throw "Month number must be between 0 and 11";
            }
            if (monthNumber < 10) {
                return '0' + (monthNumber + 1);
            }
            if (monthNumber === 11) {
                return '0' + 1;
            }
            return 10;
        },
        getPopupClose = function () {
            return $("#popupClose");
        },
        exports = {
            trapEnterKey: function (selector) {
                selector.unbind('keydown');
                selector.keydown(function (event) {
                    if (event.which === 13) {
                        event.preventDefault();
                    }
                });
            },
            parseJsonDate: function (jsonDate) {
                return new Date(parseInt(jsonDate.substr(6), 10));
            },
            formatTime: function (date) {
                var hours, minutes, seconds;
                hours = date.getHours();
                minutes = date.getMinutes();
                seconds = date.getSeconds();
                if (hours < 10) {
                    hours = '0' + hours;
                }
                if (minutes < 10) {
                    minutes = '0' + minutes;
                }
                if (seconds < 10) {
                    seconds = '0' + seconds;
                }
                return hours + ":" + minutes + ":" + seconds;
            },
            formatDate: function (date, separator) {
                var jsDate, month;
                jsDate = new Date(date);
                month = getTwoDigitMonthNumber(jsDate.getMonth());
                return month + (separator || '-') + getTwoDigitDate(jsDate.getDate()) + (separator || '-') + jsDate.getFullYear();
            },
            jsonDateToTimeStamp: function (jsonDateString) {
                var jsonDate = exports.parseJsonDate(jsonDateString);
                return exports.formatDate(jsonDate) + ' ' + exports.formatTime(jsonDate);
            },
            fromJsonDate: function (str) {
                var parsedDate, jsDate, month;
                parsedDate = new Date(parseInt(str.substr(6), 10));
                jsDate = new Date(parsedDate);
                month = getTwoDigitMonthNumber(jsDate.getMonth());
                return month + '-' + getTwoDigitDate(jsDate.getDate()) + '-' + jsDate.getFullYear();
            },
            setErrorBorderAndFocus: function (target) {
                doSetErrorBorderAndFocus(target);
            },
            setNormalBorderAndCallback: function (target, callback) {
                doSetNormalBorderAndCallback(target, callback);
            },
            getPopup: function () {
                return $("#popup");
            },
            nonePlaceholder: "< none >",
            propertiesExist: function (obj) {
                var prop;
                if (!obj) {
                    return false;
                }
                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        return true;
                    }
                }
                return false;
            },
            disableControls: function (controls, opacity) {
                controls.forEach(function (control) {
                    control.unbind("click");
                    control.css('opacity', opacity || '0.3');
                    control.css('cursor', 'not-allowed');
                });
            },
            disableControl: function (control, callback, opacity) {
                control.attr("disabled", "disabled");
                control.css("opacity", opacity || "0.2");
                var opacityValue = (opacity * 100) || '20';
                control.css('filter', 'alpha(opacity=' + opacityValue + ')');
                if (callback) {
                    callback();
                }
            },
            enableControlAndSetClick: function (control, clickCallback, opacity) {
                control.unbind("click");
                control.click(clickCallback);
                control.css('opacity', opacity || '1.0');
                control.css('cursor', 'pointer');
            },
            enableControl: function (control, callback) {
                control.removeAttr('disabled');
                control.css('opacity', '1.0');
                control.css('filter', 'alpha(opacity=100)');
                control.css('cursor', 'arrow');
                if (callback) {
                    callback();
                }
            },
            enableControls: function (controls) {
                controls.forEach(function (control) {
                    control.removeAttr('disabled');
                    control.css('opacity', '1.0');
                    control.css('filter', 'alpha(opacity=100)');
                    control.css('cursor', 'pointer');
                });
            },
            trimmedValueIsNullOrEmpty: function (control) {
                var value = control.val();
                return !value || value.trim().length === 0;
            },
            inspect: function (obj) {
                var p;
                for (p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        console.log(p + '=' + obj[p]);
                    }
                }
            },
            fireOnEnterKeyDown: function (selector, method) {
                selector.unbind('keydown');
                selector.keydown(function (event) {
                    if (event.which === 13) {
                        method();
                    }
                });
            },
            sortArrayByStringProperty: function (array, propertyName) {
                var sortFunction, propertyA, propertyB;
                sortFunction = function (a, b) {
                    propertyA = a[propertyName].toLowerCase();
                    propertyB = b[propertyName].toLowerCase();
                    if (propertyA < propertyB) {
                        return -1;
                    }
                    if (propertyA > propertyB) {
                        return 1;
                    }
                    return 0;
                };
                return array.sort(sortFunction);
            },
            getPropertiesArray: function (obj) {
                var property, properties;
                properties = [];
                for (property in obj) {
                    if (obj.hasOwnProperty(property)) {
                        properties.push(property);
                    }
                }
                return properties;
            },
            disablePopup: function (callback) {
                if (getPopupStatus() === 1) {
                    exports.getPopup().hide();
                    getBackgroundPopup().fadeOut("slow");
                    popupStatus = 0;
                    if (callback) {
                        callback();
                    }
                }
            },
            getFormattedDate: function (dateToFormat, format) {
                var day, month, year;
                day = dateToFormat.getDate();
                month = dateToFormat.getMonth() + 1;
                year = dateToFormat.getFullYear();
                if (format === 'dd/mm/yyyy') {
                    month = month.toString().length === 1 ? "0" + month : String(month);
                    day = day.toString().length === 1 ? "0" + day : String(day);
                    year = year.toString().length === 2 ? "20" + year : String(year);
                    return month + '/' + day + '/' + year;
                }
                return dateToFormat.toDateString();
            },
            isLetter: function (e) {
                var code = e.charCode || e.keyCode;
                return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code === 8);
            },
            isLetterOrNumber: function (e) {
                var code = e.charCode || e.keyCode;
                return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
            },
            isLetterOrNumberOrSpecifiedKeyCode: function (e, allowedKeyCodes) {
                var code = e.charCode || e.keyCode;
                return exports.isLetterOrNumber(e) || (allowedKeyCodes && allowedKeyCodes.indexOf(code) !== -1);
            },
            isLetterOrNumberOrSpace: function (e) {
                var code = e.charCode || e.keyCode;
                return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 32;
            },
            getIndexOfArrayItem: function (array, property, value) {
                var item, i;
                if (!array || array.length === 0 || !property || !value) {
                    return -1;
                }
                for (i = 0; i < array.length; i += 1) {
                    item = array[i];
                    if (item.hasOwnProperty(property) && item[property] === value) {
                        return i;
                    }
                }
                return -1;
            },
            clearPopup: function () {
                exports.getPopup().children('div').remove();
            },
            makeLogEntry: function (logEntry) {
                var html, button, container;
                container = $('#logContainer');
                button = $('#logImage');
                html = container.html();
                html += logEntry + '<br/>';
                container.html(html);
                exports.enableControl(button);
                button.unbind('click');
                button.click(toggleLogContainer);
            },
            confirmDialog: function (control, message, title, top, left, proceed) {
                control.html('');
                control.html(message);
                control.dialog({
                    resizable: false,
                    modal: true,
                    position: [left, top],
                    title: title,
                    buttons: {
                        "Ok": function () {
                            $(this).dialog('close');
                            proceed();
                        },
                        "Cancel": function () {
                            $(this).dialog('close');
                        }
                    }
                });
            },
            showPopup: function (top, left, classname) {
                var width, height, popup;
                popup = exports.getPopup();
                if (classname) {
                    popup.addClass(classname);
                } else {
                    popup.removeClass();
                }
                width = popup.width();
                height = popup.height();
                if (!top) {
                    top = (screen.height / 2) - (height / 2);
                }
                if (!left) {
                    left = (screen.width / 2) - (width / 2);
                }
                popup.css({ "position": "absolute", "top": top, "left": left });
                loadPopup(popup);
            },
            unbindPopupEvents: function () {
                getBackgroundPopup().unbind('click');
                getPopupClose().unbind('click');
            },
            assignPopupEvents: function (callback) {
                if (callback) {
                    getBackgroundPopup().bind('click', function () {
                        exports.disablePopup(callback);
                    });
                    getPopupClose().bind('click', function () {
                        exports.disablePopup(callback);
                    });
                    return;
                }
                getBackgroundPopup().bind('click', exports.disablePopup);
                getPopupClose().bind('click', exports.disablePopup);
            },
            displayPopup: function (top, left, cannotClose, classname, callback) {
                var popup, closeButton;
                popup = exports.getPopup();
                if (classname) {
                    popup.addClass(classname);
                } else {
                    popup.removeClass();
                }
                closeButton = getPopupClose();
                if (getPopupStatus() === 0) {
                    getBackgroundPopup().css({
                        "opacity": "0.6",
                        "height": screen.height,
                        "width": screen.width
                    });
                    getBackgroundPopup().fadeIn("slow");
                    if (!top) {
                        top = (screen.height / 2) - (popup.height() / 2);
                    }
                    if (!left) {
                        left = (screen.width / 2) - (popup.width() / 2);
                    }
                    if (cannotClose) {
                        closeButton.hide();
                        exports.unbindPopupEvents();
                    } else {
                        closeButton.show();
                        exports.assignPopupEvents(callback);
                    }
                    popup.css({ "position": "absolute", "top": top, "left": left });
                    popup.fadeIn("slow");
                    popupStatus = 1;
                }
            },
            createImageButton: function (id, message, callback, classname) {
                var image = $(id).clone();
                image.attr('title', message);
                image.css('cursor', "pointer");
                if (callback) {
                    image.click(callback);
                }
                if (classname) {
                    image.addClass(classname);
                }
                return image;
            },
            wrapFunction: function (func, args) {
                return function (callback) {
                    func(args, callback);
                };
            },
            createAddButton: function (message, callback, classname) {
                var image = $("#addImage").clone();
                image.attr('title', message);
                image.css('cursor', "pointer");
                if (callback) {
                    image.click(callback);
                }
                if (classname) {
                    image.addClass(classname);
                }
                return image;
            },
            createDeleteButton: function (message, callback, classname) {
                var image = $("#deleteImage").clone();
                image.attr('title', message);
                image.css('cursor', "pointer");
                if (callback) {
                    image.click(callback);
                }
                if (classname) {
                    image.addClass(classname);
                }
                return image;
            },
            showToaster: function (parent, text, topOffset, leftOffset, isError, control, delay, callback, className) {                
                var left, top, toaster;
                topOffset = topOffset || 0;
                leftOffset = leftOffset || 0;
                delay = delay || 1500;
                top = parent ? parent.offset().top + topOffset : topOffset;
                left = parent ? parent.offset().left + leftOffset : leftOffset;
                toaster = control || $('#toaster');
                toaster.addClass("toaster");
                if (className) {
                    toaster.addClass(className);
                }
                toaster.css({ 'left': left, 'top': top, 'z-index': 1000 });
                toaster.css('color', isError ? 'red' : 'green');
                toaster.text(text);
                toaster.show();
                if (delay >= 0) {
                    toaster.delay(delay).hide('slow', callback);
                }
                exports.makeLogEntry(text);
            },
            focusAndSelect: function (control) {
                control.show();
                control.focus();
                control.select();
            },
            copyArray: function (source) {
                var destination = [], i;
                for (i = 0; i < source.length; i += 1) {
                    destination.push(source[i]);
                }
                return destination;
            },
            populateSelect: function (select, source) {
                select.find('option').remove();
                select.append($("<option/>").text("< none >"));
                source.forEach(function (element) {
                    select.append($("<option/>").text(element));
                });
            },
            postFunctionAlternate: function (url, data, callback) {
                if (data) {
                    data = jQuery.param(data, true);
                }
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    success: function (response) {
                        if (callback && typeof callback === 'function') {
                            callback(response);
                        }
                    }
                });
            },
            postFunction: function (url, data, callback) {
                var responseHeader;
                if (data) {
                    data = jQuery.param(data, true);
                }
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: data,
                    success: function (response, status, xhr) {
                        responseHeader = xhr.getResponseHeader("content-type") || "";
                        if (responseHeader.indexOf('html') > -1) {
                            window.location.reload();
                        }
                        if (!response.Success) {
                            if (callback && typeof callback === 'function') {
                                callback(response);
                                return;
                            }
                        }
                        if (!response.Payload) {
                            window.location.reload();
                            return;
                        }
                        if (callback && typeof callback === 'function') {
                            callback(response);
                        }
                    }
                });
            },
            getFunction: function (url, data, callback) {
                if (data) {
                    data = jQuery.param(data, true);
                }
                $.ajax({
                    type: 'GET',
                    url: url,
                    data: data,
                    success: function (response) {
                        if (!response.Success) {
                            if (callback && typeof callback === 'function') {
                                callback(response);
                                return;
                            }
                        }
                        if (!response.Payload) {
                            window.location.reload();
                            return;
                        }
                        if (callback && typeof callback === 'function') {
                            callback(response);
                        }
                    }
                });
            },
            spaces: function (count) {
                var i, result = '';
                for (i = 0; i < count; i += 1) {
                    result += String.fromCharCode(160);
                }
                return result;
            },
            verifyItemExists: function (autocomplete, successCallback, top, left) {
                var lowercaseArray, value, message;
                value = autocomplete.val();
                lowercaseArray = autocomplete.autocomplete("option", "source").map(function (element) {
                    return element.toLowerCase();
                });
                if (value.length === 0 || lowercaseArray.indexOf(value.toLowerCase()) >= 0) {
                    $('#toaster').hide();
                    this.setNormalBorderAndCallback(autocomplete, successCallback);
                    return true;
                }
                this.setErrorBorderAndFocus(autocomplete);
                message = "The item" + this.spaces(2) + "'" + value + "'" + this.spaces(2) + "'was not found in the list";
                this.showToaster(autocomplete, message, top || 0, left || 125, true, null, 2000);
                return false;
            },
            getLowercaseArray: function (source) {
                return source.map(function (element) {
                    return element.toLowerCase();
                });
            },
            elementExistsInArray: function (source, element) {
                var isArray = source instanceof Array;
                if (!isArray) {
                    return false;
                }
                return source.indexOf(element) >= 0;
            },
            removeExistingItemsFromArray: function (sourceArray, existingItems) {
                if (!sourceArray) {
                    return;
                }
                existingItems.forEach(function (item) {
                    var index;
                    index = sourceArray.indexOf(item);
                    if (index >= 0) {
                        sourceArray.splice(index, 1);
                    }
                });
            },
            removeItemFromAutocompleteSource: function (item, control) {
                var source, index;
                source = control.autocomplete("option", "source");
                index = source.indexOf(item);
                source.splice(index, 1);
                control.autocomplete("option", "source", source);
            },
            isNumericKey: function (e) {
                var charCode = (e.which) || e.charCode || e.keyCode;
                return (charCode >= 48 && charCode <= 57) || charCode === 45 || charCode === 46;
            },
            isValidIPAddressKey: function (e) {
                var charCode = (e.which) || e.charCode || e.keyCode;
                return (charCode >= 48 && charCode <= 57) || charCode === 46;
            },
            ipAddressBlurEvent: function () {
                var target = $(this),
                    source = target.val();
                if (!source || source.length === 0) {
                    return true;
                }
                if (!isValidIPAddress(source)) {
                    doSetErrorBorderAndFocus(target);
                    return false;
                }
                doSetNormalBorderAndCallback(target);
                return true;
            },
            setAutocomplete: function (target, minLength, array, callback, skipVerify, caseInsensitive) {
                target.autocomplete({
                    source: array,
                    minLength: minLength,
                    select: function () {
                        $(this).blur();
                    }
                });
                target.focus(function () {
                    focusEvent(target, minLength);
                });
                if (!skipVerify) {
                    target.blur(function () {
                        if (caseInsensitive) {
                            caseInsensitiveBlurEvent(target, array, callback);
                        } else {
                            blurEvent(target, array, callback);
                        }
                    });
                } else {
                    if (callback) {
                        callback(target);
                    }
                }
            },
            arrayToCsv: function (array) {
                var itemString, csv = '';
                if (!array || !array.length) {
                    return '';
                }
                array.forEach(function (item) {
                    itemString = item ? item.toString() : "NULL";
                    csv += itemString + ',';
                });
                return csv.substring(0, csv.lastIndexOf(','));
            },
            selectText: function (elementId) {
                var doc = document, text = doc.getElementById(elementId), range, selection;
                if (doc.body.createTextRange) {
                    range = document.body.createTextRange();
                    range.moveToElementText(text);
                    range.select();
                } else if (window.getSelection) {
                    selection = window.getSelection();
                    range = document.createRange();
                    range.selectNodeContents(text);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            },
            setHover: function (target, enter, leave) {
                target.bind('mouseenter',
                    function () {
                        $(this).css({ "background-color": "#FFFF96", "cursor": "pointer" });
                        if (enter) { enter.apply(target); }
                    });
                target.bind('mouseleave',
                    function () {
                        $(this).css({ "background-color": "", "cursor": "default" });
                        if (leave) { leave.apply(target); }
                    });
            },
            setSimpleRowHover: function (row) {
                row.hover(function () {
                    row.css({
                        "background": "#FFFF96",
                        "cursor": "pointer"
                    });
                }, function () {
                    row.css({
                        "background": "",
                        "cursor": "default"
                    });
                });
            },
            setRowHover: function (row, message, callback) {
                row.bind('mouseenter',
                    function () {
                        var deleteButton;
                        $(this).css({
                            "background": "#FFFF96",
                            "cursor": "pointer"
                        });
                        deleteButton = exports.createDeleteButton(message, callback);
                        $(this).children('.deleteButtonCell').append(deleteButton);
                        deleteButton.show();
                    });
                row.bind('mouseleave',
                    function () {
                        $(this).css({
                            "background": "",
                            "cursor": "default"
                        });
                        $(this).children('.deleteButtonCell').empty();
                    });
            },
            getMouseCoordinates: function (evt) {
                var posx, posy;
                posx = 0;
                posy = 0;
                if (!evt) {
                    evt = window.event;
                }
                if (evt.pageX || evt.pageY) {
                    posx = evt.pageX;
                    posy = evt.pageY;
                } else {
                    if (evt.clientX || evt.clientY) {
                        posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                }
                return { X: posx, Y: posy };
            },
            getFirstGreaterValue: function (value, array) {
                var i, result, element;
                result = null;
                for (i = 0; i < array.length; i += 1) {
                    element = array[i];
                    if (element > value) {
                        result = element;
                        break;
                    }
                }
                return result;
            },
            requiredValidationHandler: function (e) {
                var target;
                target = $(this);
                if (!target.val()) {
                    target.css('border', e.data.errorBorder);
                    return;
                }
                target.css('border', e.data.border);
            },
            addRequiredValidationHandler: function (eventName, data, controls) {
                controls.forEach(function (control) {
                    control.on(eventName, data, exports.requiredValidationHandler);
                });
            },
            clearRequiredValidationHandler: function (eventName, controls) {
                controls.forEach(function (control) {
                    control.off(eventName, exports.requiredValidationHandler);
                });
            },
            isIE: function () {
                var ua, msie;
                ua = window.navigator.userAgent;
                msie = ua.indexOf("MSIE");
                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                    return true;
                }
                return false;
            },
            safeCallback: function (callback, arg) {
                if (callback && typeof (callback) === 'function') {
                    callback(arg);
                }
            },
            getUniqueTime: function () {
                var time = new Date().getTime();
                while (time == new Date().getTime());
                return new Date().getTime();
            },
            isArray : function(obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
            }
        };
    return exports;
});