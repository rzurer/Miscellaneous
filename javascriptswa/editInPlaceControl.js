/*globals define, $*/
"use strict";
define(['eventListener'], function (eventListener) {
    var that = {
        addListener: eventListener.addListener,
        enterEditMode: function (control) {
            control.read.hide();
            control.write.show();
            control.write.focus();
            control.write.select();
            eventListener.fire("edit", [control.id]);
        },
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
                control.enterEditMode();
            });
            control.write.blur(function () {
                eventListener.fire("change", [control.id]);
                control.leaveEditMode();
            });
            control.write.change(function () {
                var controlText = control.write.find("option:selected").text();
                control.read.text(controlText);
                eventListener.fire("change", [control.id, controlText]);
                control.leaveEditMode();
            });
            control.container.append(control.read, control.write);
            control.enterEditMode = function () {
                that.enterEditMode(control);
            };
            control.leaveEditMode = function () {
                control.read.show();
                control.write.hide();
            };
            return control;
        },
        create: function (id, text, width, classname) {
            var control = {};
            control.id = id;
            control.container = $('<div>').addClass('edit-in-place');
            control.container.attr("id", control.id);
            control.read = $('<span>').attr("title", "Click to edit").addClass('read').css('width', width + 'px').text(text);
            if (classname) {
                control.read.addClass(classname);
            }
            control.read.click(function () {
                control.enterEditMode();
            });
            control.write = $('<input>').attr('type', "text").addClass('write').css('width', (width - 4) + 'px').val(text);
            control.write.blur(function () {
                control.leaveEditMode();
                eventListener.fire("change", [control.id]);
            });
            control.write.keyup(function () {
                if (control.write.val().trim().length > 0) {
                    control.read.text(control.write.val().trim());
                }
            });
            control.container.append(control.read, control.write);
            control.enterEditMode = function () {
                that.enterEditMode(control);
            };
            control.leaveEditMode = function () {
                control.read.show();
                control.write.hide();
            };
            return control;
        }
    };
    return that;
});
