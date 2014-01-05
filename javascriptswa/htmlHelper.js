/*globals $, define */
"use strict";
define(['common'], function (common) {
    var helper = {
        getSelectValues: function (select) {
            var val, values = [];
            select.find('option').each(function () {
                val = $(this).val();
                if (val && val.trim().length > 0) {
                    values.push(val);
                }
            });
            values.sort();
            return values;
        },
        createContainer: function (text, className) {
            var container = $('<div/>');
            container.text(text);
            if (className) {
                container.addClass(className);
            }
            return container;
        },
        createImageAnchor: function (image, url, openInNewWindow, classname) {
            var anchor = helper.createAnchor(url, '', openInNewWindow, classname);
            anchor.append(image);
            return anchor;
        },
        createAnchor: function (url, text, openInNewWindow, title, classname) {
            var anchor = $('<a>').attr('href', url);
            if (text) {
                anchor.text(text);
            }
            if (openInNewWindow) {
                anchor.attr('target', '_blank');
            }
            if (title) {
                anchor.attr('title', title);
            }
            if (classname) {
                anchor.addClass(classname);
            }
            return anchor;
        },
        tryAddToSelect: function (select, text) {
            var found;
            select.find("option").each(function () {
                if ($(this).val() === text) {
                    found = true;
                }
            });
            if (!found) {
                select.append(helper.createOption(text, text));
            }
        },
        createOptionBase: function (value, title, className) {
            var option = $('<option/>');
            option.val(value);
            if (title) {
                option.attr('title', title);
            }
            if (className) {
                option.addClass(className);
            }
            return option;
        },
        createOption: function (text, value, title, className) {
            var option = helper.createOptionBase(value, title, className);
            option.text(text);
            return option;
        },
        createHtmlOption: function (html, value, title, className) {
            var option = helper.createOptionBase(value, title, className);
            option.html(html);
            return option;
        },
        copySelectToSelect: function (sourceSelect, destinationSelect) {
            var option;
            destinationSelect.empty();
            sourceSelect.find("option").each(function () {
                option = helper.createOption($(this).text(), $(this).val());
                destinationSelect.append(option);
            });
            return destinationSelect;
        },
        createSelect: function (id, classname, selectMessage, emptyOptionText) {
            var select = $("<select>");
            if (id) {
                select.attr('id', id);
            }
            if (classname) {
                select.addClass(classname);
            }
            helper.initializeSelect(select, selectMessage, emptyOptionText);
            return select;
        },
        initializeSelect: function (select, selectMessage, emptyOptionText) {
            select.empty();
            select.append(helper.createOption(emptyOptionText || '<select>', '', selectMessage));
            select.attr('title', selectMessage);
        },
        fillSelectFromList: function (select, selectMessage, list, emptyOptionText) {
            helper.initializeSelect(select, selectMessage, emptyOptionText);
            list.forEach(function (element) {
                select.append(helper.createOption(element, element));
            });
        },
        fillSelectFromKeyValuePairs: function (select, selectMessage, keyValuePairs, emptyOptionText) {
            helper.initializeSelect(select, selectMessage, emptyOptionText);
            keyValuePairs.forEach(function (element) {
                select.append(helper.createOption(element.Value, element.Key));
            });
        },
        setSelectTitleToOptionTitle: function () {
            var title = $(this).find(":selected").attr('title');
            if (!title) {
                $(this).removeAttr("title");
                return;
            }
            $(this).attr("title", title);
        },
        createLabel: function (text, className, id) {
            var label = $("<label>");
            label.text(text);
            if (className) {
                label.addClass(className);
            }
            if (id) {
                label.attr('id', id);
            }
            return label;
        },
        createTextInput: function (width, text, maxlength, className, placeholder) {
            var input = $("<input>");
            input.attr("type", "text");
            if (width) {
                input.css("width", width + 'px');
            }
            if (text) {
                input.val(text);
            }
            if (maxlength) {
                input.attr("maxlength", maxlength);
            }
            if (className) {
                input.addClass(className);
            }
            if (placeholder) {
                input.attr("placeholder", placeholder);
            }
            return input;
        },
        createTristateCheckbox: function (getStateCallback, setStateCallback, filterCallback, className) {
            var checkbox, state;
            checkbox = helper.createCheckboxInput(null, className);
            state = getStateCallback();
            if (state === 'active') {
                checkbox.data('checked', 1);
                checkbox.attr('checked', 'checked');
            }
            if (state === 'inactive') {
                checkbox.data('checked', 0);
                checkbox.removeAttr('checked');
            }
            if (state === 'all') {
                checkbox.data('checked', 2);
                checkbox.removeAttr('checked');
                checkbox.prop('indeterminate', true);
            }
            helper.enableTristate(checkbox, setStateCallback, filterCallback);
            if (state === 'all') {
                checkbox.click();
                checkbox.prop('indeterminate', true);
            }
            return checkbox;
        },
        enableTristate: function (checkbox, setStateCallback, filterCallback) {
            checkbox.data('checked', 0);
            checkbox.click(function () {
                var that = $(this);
                switch (that.data('checked')) {
                    case 0:
                        that.data('checked', 1);
                        that.prop('indeterminate', true);
                        setStateCallback('all');
                        break;
                    case 1:
                        that.data('checked', 2);
                        that.prop('checked', true);
                        that.prop('indeterminate', false);
                        setStateCallback('active');
                        break;
                    default:
                        that.data('checked', 0);
                        that.prop('checked', false);
                        that.prop('indeterminate', false);
                        setStateCallback('inactive');
                }
                if (filterCallback) {
                    filterCallback();
                }
            });
        },
        createCheckboxInput: function (text, className, wantReadOnly) {
            var isChecked = text && text.toString().toLowerCase() === 'true',
                input = $("<input>");
            input.attr("type", "checkbox");
            if (isChecked) {
                input.attr('checked', 'checked');
            }
            if (wantReadOnly) {
                input.attr('disabled', 'disabled');
            }
            if (className) {
                input.addClass(className);
            }
            return input;
        },
        createFixedColumnsTable: function (data, cellsPerRow, className, cellClick) {
            var i, k, item, row, cell, table, length, remainder, emptyRows;
            table = $('<table/>');
            if (className) {
                table.addClass(className);
            }
            if (!data || data.length === 0) {
                return table;
            }
            length = data.length;
            remainder = length % cellsPerRow;
            emptyRows = cellsPerRow - remainder;
            for (i = 0; i < length; i += 1) {
                item = data[i];
                if (i === 0 || i % cellsPerRow === 0) {
                    row = $('<tr/>');
                    table.append(row);
                }
                cell = $('<td/>');
                cell.append(item);
                if (cellClick) {
                    cell.click(cellClick);
                }
                common.setHover(cell);
                if (row) {
                    row.append(cell);
                }
            }
            for (k = 0; k < emptyRows; k += 1) {
                cell = $('<td/>');
                if (row) {
                    row.append(cell);
                }
            }
            return table;
        },
        createTable: function (className) {
            var table = $('<table>');
            if (className) {
                table.addClass(className);
            }
            return table;
        },
        createRow: function (className) {
            var row = $('<tr>');
            if (className) {
                row.addClass(className);
            }
            return row;
        },
        createCell: function (width, text, isHeader, className) {
            var cell = isHeader ? $("<th>") : $("<td>");
            if (width) {
                cell.css("width", width + 'px');
            }
            if (text) {
                cell.text(text);
            }
            if (width === 0) {
                cell.hide();
            }
            if (className) {
                cell.addClass(className);
            }
            return cell;
        },
        appendCell: function (row, text, width, isHeader, className) {
            var cell = helper.createCell(width, text, isHeader, className);
            row.append(cell);
            return cell;
        },
        appendReadOnlyCell: function (row, text, width, className) {
            var cell, label;
            cell = helper.createCell(width, null, false);
            label = helper.createLabel(text, className);
            label.css("width", width + 'px');
            cell.append(label);
            row.append(cell);
            return cell;
        },
        appendReadWriteCell: function (row, width, textInput, textInputWidth, label, className) {
            var cell = helper.createCell(width, null, false, className);
            if (textInputWidth) {
                textInput.css("width", textInputWidth + 'px');
            }
            cell.append(textInput);
            cell.append(label);
            row.append(cell);
            textInput.hide();
            return cell;
        },
        createIPAddressInput: function (width, text, maxlength, className, placeholder) {
            var input = helper.createTextInput(width, text, maxlength, className, placeholder);
            input.keypress(common.isValidIPAddressKey);
            input.blur(common.ipAddressBlurEvent);
            return input;
        },
        createNumericInput: function (width, text, maxlength, className, placeholder) {
            var input = helper.createTextInput(width, text, maxlength, className, placeholder);
            input.keypress(common.isNumericKey);
            return input;
        }
    };
    return helper;
});