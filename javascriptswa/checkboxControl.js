/*globals define, $*/
define(['common'], function (common) {
    "use strict";
    var controlClass = 'customCheckbox',
        checkedClass = 'checkedCheckbox',
        someCheckedClass = 'someCheckedCheckbox',
        uncheckedClass = 'uncheckedCheckbox',
        createCheckbox = function (controlId, checkboxState, clickHandler, className) {
            var checkbox,
                isCheckedClassname = checkboxState.checkedState === 2 ? checkedClass : uncheckedClass,
                toggleChecked = function (checked) {
                    if (checked) {
                        checkbox.removeClass(uncheckedClass);
                        checkbox.addClass(checkedClass);
                        return;
                    }
                    checkbox.removeClass(checkedClass);
                    checkbox.addClass(uncheckedClass);
                };
            checkbox = $('<span>');
            checkbox.attr("id", controlId);
            checkbox.addClass(controlClass);
            checkbox.addClass(isCheckedClassname);
            if (className) {
                checkbox.addClass(className);
            }
            if (checkboxState.wantDisabled) {
                common.disableControls([checkbox]);
                return checkbox;
            }
            checkbox.on('click', function (e, checked, runCount) {
                var isChecked = checked === undefined ? $(this).hasClass(uncheckedClass) : checked;
                toggleChecked(isChecked);
                runCount = runCount || 1;
                clickHandler(e, isChecked, runCount);
            });
            return checkbox;
        },
        getCheckedStateClassName = function (checkedState) {
            switch (checkedState) {
            case 0:
                return uncheckedClass;
            case 1:
                return someCheckedClass;
            case 2:
                return checkedClass;
            default:
                return uncheckedClass;
            }
        },
        createTriStateCheckbox = function (controlId, checkboxState, clickHandler, className) {
            var checkbox,
                checkedStateClassName = getCheckedStateClassName(checkboxState.checkedState),
                toggleChecked = function (checked) {
                    if (checked) {
                        checkbox.removeClass(uncheckedClass);
                        checkbox.addClass(checkedClass);
                        return;
                    }
                    checkbox.removeClass(checkedClass);
                    checkbox.addClass(uncheckedClass);
                };
            checkbox = $('<span>');
            checkbox.attr("id", controlId);
            checkbox.addClass(controlClass);
            checkbox.addClass(checkedStateClassName);
            if (className) {
                checkbox.addClass(className);
            }
            if (checkboxState.wantDisabled) {
                common.disableControls([checkbox]);
                return checkbox;
            }
            checkbox.on('click', function (e, checked, runCount) {
                var isChecked = checked === undefined ? ($(this).hasClass(uncheckedClass) || $(this).hasClass(someCheckedClass)) : checked;
                toggleChecked(isChecked);
                runCount = runCount || checkboxState.runCount;
                clickHandler(controlId, isChecked, runCount);
            });
            return checkbox;
        };
    return { createCheckbox: createCheckbox, createTriStateCheckbox: createTriStateCheckbox };
});