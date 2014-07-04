/*globals define, $*/
define(['eventListener'], function (eventListener) {
    "use strict";
    var enterEditMode = function (control) {
        control.read.hide();
        control.write.show();
        control.write.focus();
        control.write.select();
        eventListener.fire("edit", [control.id]);
    },
        leaveEditMode = function (control) {
            control.read.show();
            control.write.hide();
            eventListener.fire("change", [control.id]);
        },
        that = {
            addListener: eventListener.addListener,
            removeListener: eventListener.removeListener,
            createSelect: function (id, text, width, array, defaultText, classname) {
                var selectedValue, control = {};
                control.id = id;
                control.container = $('<div>').addClass('edit-in-place');
                control.container.attr("id", control.id);
                control.read = $('<span>').attr("title", "Click to edit").addClass('read').css('width', width + 'px').text(text);
                if (classname) {
                    control.read.addClass(classname);
                }
                control.write = $('<select>').addClass('write').css('width', (width - 4) + 'px');
                control.write.append($('<option>').text(defaultText));
                array.forEach(function (item) {
                    control.write.append($('<option>').val(item.value).text(item.text));
                });
                selectedValue = control.write.find('option').filter(function () { return $(this).html() === text; }).val();
                control.write.val(selectedValue);
                control.read.click(function () {
                    enterEditMode(control);
                });
                control.write.blur(function () {
                    eventListener.fire("change", [control.id]);
                    leaveEditMode(control);
                });
                control.write.change(function () {
                    var controlText = control.write.find("option:selected").text();
                    control.read.text(controlText);
                    eventListener.fire("change", [control.id, controlText]);
                    leaveEditMode(control);
                });
                control.container.append(control.read, control.write);
                control.enterEditMode = function () {
                    enterEditMode(control);
                };
                return control;
            },
            create: function (id, text, width, classname, onKeyPress, onBlur, onEdit, whitspaceProhibited) {
                var control, writeValueIsEmpty;
                control = {};
                control.id = id;
                control.oldValue = '';
                control.container = $('<div>').addClass('edit-in-place');
                control.container.attr("id", control.id);
                writeValueIsEmpty = function () {
                    return control.write.val().trim().length === 0;
                };
                control.read = $('<span>').attr("title", "Click to edit").addClass('read').css('width', width + 'px');
                control.read.text(text);
                if (classname) {
                    control.read.addClass(classname);
                }
                control.read.on('click', function () {
                    enterEditMode(control);
                });
                if (onEdit) {
                    control.read.on('click', onEdit);
                }
                control.write = $('<input>').attr('type', "text").addClass('write').css('width', (width - 4) + 'px').val(text);
                control.write.on('blur', function () {
                    if (whitspaceProhibited && writeValueIsEmpty()) {
                        control.write.val(control.oldValue);
                        control.read.text(control.oldValue);
                    }
                    leaveEditMode(control);
                });
                if (onBlur) {
                    control.write.on('blur', onBlur);
                }
                if (onKeyPress) {
                    control.write.on('keypress', onKeyPress);
                }
                control.write.on('keydown', function () {
                    if (!writeValueIsEmpty()) {
                        control.oldValue = control.write.val();
                    }
                });
                control.write.on('keyup', function () {
                    if (!writeValueIsEmpty()) {
                        control.read.text(control.write.val().trim());
                    }
                });
                control.container.append(control.read, control.write);
                return control;
            }
        };
    return that;
});
