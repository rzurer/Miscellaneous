/*jslint browser: true*/
/*global $,  window, console, jQuery*/
"use strict";
var common = function () {
    var popupStatus = 0,
        getPopupStatus = function () {
            return popupStatus;
        },
        getBackgroundPopup = function () {
            return $("#backgroundPopup");
        },
        getPopupClose = function () {
            return $("#popupClose");
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
        exports = {
            sessionTimedOutMessage: "Your session has timed out.",
            trapEnterKey: function (selector) {
                selector.unbind('keydown');
                selector.keydown(function (event) {
                    if (event.which === 13) {
                        event.preventDefault();
                    }
                });
            },
            addCommas: function (numberSource, decimalPlaces) {
                var x, x1, x2, regex;
                numberSource = numberSource.toFixed(decimalPlaces);
                numberSource += '';
                x = numberSource.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                regex = /(\d+)(\d{3})/;
                while (regex.test(x1)) {
                    x1 = x1.replace(regex, '$1' + ',' + '$2');
                }
                return x1 + x2;
            },
            truncateDecimals: function (number) {
                return Math[number < 0 ? 'ceil' : 'floor'](number);
            },
            parseJsonDate: function (jsonDate) {
                return new Date(parseInt(jsonDate.substr(6), 10));
            },
            formatTime: function (dt) {
                var hours, minutes, seconds;
                hours = dt.getHours();
                minutes = dt.getMinutes();
                seconds = dt.getSeconds();
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
            fireOnEnterKeyDown: function (selector, method) {
                selector.unbind('keydown');
                selector.keydown(function (event) {
                    if (event.which === 13) {
                        method();
                    }
                });
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
                    control.attr("disabled", "disabled");
                    control.unbind("click");
                    control.css('opacity', opacity || '0.3');
                });
            },
            disableControl: function (control, callback) {
                control.attr("disabled", "disabled");
                control.css("opacity", "0.2");
                control.css('filter', 'alpha(opacity=20)');
                if (callback) {
                    callback();
                }
            },
            selectText: function (container) {
                var range;
                if (document.selection) {
                    range = document.body.createTextRange();
                    range.moveToElementText(container);
                    range.select();
                } else if (window.getSelection) {
                    range = document.createRange();
                    range.selectNode(container);
                    window.getSelection().addRange(range);
                }
            },
            enableControlAndSetClick: function (control, clickCallback, opacity) {
                control.removeAttr('disabled');
                control.unbind("click");
                control.click(clickCallback);
                control.css('opacity', opacity || '1.0');
            },
            enableControl: function (control, callback) {
                control.removeAttr('disabled');
                control.css('opacity', '1.0');
                control.css('filter', 'alpha(opacity=100)');
                if (callback) {
                    callback();
                }
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
            truncateText: function (control, characterLimit) {
                var value, truncated;
                if (control.text().length > characterLimit) {
                    value = control.text();
                    truncated = value.substring(0, characterLimit - 5) + " ...";
                    control.attr('title', value);
                    control.text(truncated);
                }
            },
            disablePopup: function () {
                if (getPopupStatus() === 1) {
                    exports.unbindPopupEvents();
                    getBackgroundPopup().fadeOut("slow");
                    exports.getPopup().fadeOut("slow");
                    popupStatus = 0;
                }
            },
            unbindPopupEvents: function () {
                getBackgroundPopup().unbind('click');
                getPopupClose().unbind('click');
            },
            assignPopupEvents: function () {
                getBackgroundPopup().bind('click', exports.disablePopup);
                getPopupClose().bind('click', exports.disablePopup);
            },
            clearPopupHtml: function () {
                exports.getPopup().html('');
            },
            clearPopup: function () {
                exports.getPopup().children('div').remove();
            },
            showPopup: function (top, left, cannotClose) {
                var popup, closeButton;
                popup = exports.getPopup();
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
                        exports.assignPopupEvents();
                    }
                    popup.css({ "position": "absolute", "top": top, "left": left });
                    popup.fadeIn("slow");
                    popupStatus = 1;
                }
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
            createDeleteButton: function (message, callback) {
                var image = $("#deleteImage").clone();
                image.attr('title', message);
                image.css('cursor', "pointer");
                if (callback) {
                    image.click(callback);
                }
                return image;
            },
            getDateFromDayOfYear: function (year, dayOfYear) {
                var date = new Date(year, 0);
                date.setDate(dayOfYear);
                return date;
            },
            showToaster: function (text, options, callback) {
                var topOffset, leftOffset, parentTopOffset, parentLeftOffset, left, top, delay, toaster, isError;
                topOffset = options.topOffset || 0;
                leftOffset = options.leftOffset || 0;
                parentTopOffset = options.parent ? options.parent.offset().top : 0;
                parentLeftOffset = options.parent ? options.parent.offset().left : 0;
                top = topOffset + parentTopOffset;
                left = leftOffset + parentLeftOffset;
                delay = options.delay || 1500;
                isError = options.isError && options.isError === true;
                toaster = $('#toaster');
                toaster.css("position", "absolute");
                toaster.css({ 'left': left, 'top': top, 'z-index': 1000 });
                toaster.css('color', isError ? 'red' : 'green');
                toaster.html(text);
                toaster.show();
                if (delay >= 0) {
                    toaster.delay(delay).hide('slow', function () {
                        if (callback) {
                            callback();
                        }
                    });
                }
            },
            verifyItemExists: function (autocomplete, successCallback, top, left) {
                var lowercaseArray, value, message, options;
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
                options = {
                    parent: autocomplete,
                    topOffset: top || 0,
                    leftOffset: left || 125,
                    isError: true,
                    delay: 2000
                };
                this.showToaster(message, options);
                return false;
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
            refreshPage: function () {
                window.location.reload();
            },
            postFunction: function (url, data, callback) {
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
            uploadLocalFile: function (url, file, callback) {
                var formData, http;
                if (!file) {
                    return;
                }
                formData = new window.FormData();
                formData.append('file[]', file);
                http = new XMLHttpRequest();
                http.open('POST', url);
                http.send(formData);
                http.onreadystatechange = function(data) {
                    if (http.readyState === 4) {
                        callback(JSON.parse(data.currentTarget.response));
                    }
                };
            },
            spaces: function (count) {
                var i, result = '';
                for (i = 0; i < count; i += 1) {
                    result += String.fromCharCode(160);
                }
                return result;
            },
            getLowercaseArray: function (source) {
                return source.map(function (element) {
                    return element.toLowerCase();
                });
            },
            elementExistsInArray: function (source, element) {
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
            isNumericKey: function (evt) {
                var charCode = (evt.which) || evt.keyCode;
                return (charCode >= 48 && charCode <= 57);
            },
            isAlphaNumericKey: function (evt) {
                var charCode = (evt.which) || evt.keyCode;
                return (charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
            },
            isAlphaNumericKeyOrPeriod: function (evt) {
                var charCode = (evt.which) || evt.keyCode;
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
            setHover: function (target) {
                target.bind('mouseenter',
                    function () {
                        $(this).css({
                            "background-color": "#FFFF96",
                            "cursor": "pointer"
                        });
                    });
                target.bind('mouseleave',
                    function () {
                        $(this).css({
                            "background-color": "",
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
            getFlattenedArray: function (array, delimiter) {
                var result = '';
                delimiter = delimiter || ', ';
                if (!array || array.length === 0) {
                    return result;
                }
                array.forEach(function (element) {
                    result += String(element) + delimiter;
                });
                return result;
            },
            getExtension: function (file) {
                var filename;
                if (file && file.name) {
                    filename = file.name;
                    return filename.substring(filename.lastIndexOf('.'));
                }
                return undefined;
            }
        };
    return exports;
};