"use strict";
var htmlHelper = function (common) {
    var helper = {
        getHeaderRowValues: function (table) {
            var columnNames = [];
            table.find('tr:first th').each(function () {
                var text = $(this).text().replace(/,/g, '');
                columnNames.push(text);
            });
            return columnNames;
        },
        getRowValues: function (row) {
            var rowValues = [];
            $(row).find('td').each(function () {
                var text = $(this).text().replace(/,/g, '');
                rowValues.push(text);
            });
            return rowValues;
        },
        tableToCsv: function (table) {
            var rows, columnNames, csv, i, row, maxLength;
            columnNames = helper.getHeaderRowValues(table);
            csv = columnNames.join() + '\r\n';
            rows = table.find('tr');
            maxLength = rows.length;
            for (i = 1; i < maxLength - 1; i += 1) {
                row = rows[i];
                var rowValues = helper.getRowValues(row);
                csv += rowValues.join() + '\r\n';
            }
            row = rows[rows.length - 1];
            csv += helper.getRowValues(row).join();
            return csv;
        },
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
        createDiv: function (text, classname, clickMethod) {
            var div = $("<div/>");
            div.text(text);
            div.addClass(classname);
            div.click(clickMethod);
            return div;
        },
        createContainer: function (text, className) {
            var container = $('<div/>');
            container.text(text);
            if (className) {
                container.addClass(className);
            }
            return container;
        },
        createRepeatingImageButton: function (src, title, className) {
            var image = $("<img/>");
            image.attr({ "src": src, "title": title });
            image.addClass(className);
            return image;
        },
        createImageButton: function (id, src, title, className, clickMethod) {
            var image = $("<img/>");
            image.attr({ "id": id, "src": src, "title": title });
            image.addClass(className);
            image.click(clickMethod);
            return image;
        },
        createSpan: function (message, className) {
            var span = $("<span/>");
            span.text(message);
            span.addClass(className);
            return span;
        },
        createDownloadLink: function (title, src, width, filename, data) {
            var link, image;
            image = $("<img/>");
            image.attr("width", width);
            image.attr("src", src);
            link = $("<a/>");
            link.append(image);
            link.attr("target", "_blank");
            link.attr("title", title);
            link.attr("href", "data:text/plain;base64," + btoa(data));
            link.attr("download", filename);
            return link;
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
                var option = helper.createOption(element, element);
                select.append(option);
            });
        },
        fillSelectFromKeyValuePairs: function (select, selectMessage, keyValuePairs, emptyOptionText) {
            helper.initializeSelect(select, selectMessage, emptyOptionText);
            keyValuePairs.forEach(function (element) {
                select.append(helper.createOption(element.Value, element.Key));
            });
        },
        fillMultipleSelectFromKeyValuePairs: function (select, keyValuePairs, size) {
            select.empty();
            select.attr({ "multiple": "multiple", "size": size });
            keyValuePairs.forEach(function (element) {
                select.append(helper.createOption(element.Value, element.Key));
            });
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
        createRow: function (className) {
            var row = $('<tr>');
            if (className) {
                row.addClass(className);
            }
            return row;
        },
        createCell: function (width, text, isHeader, className, title) {
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
            if (title) {
                cell.attr("title", title);
            }
            return cell;
        },
        createSelectHeaderCell: function (columnName, width, selectClassName, selectId, options) {
            var cell, container, span, select;
            cell = $("<th/>");
            cell.css("width", width + 'px');
            container = $("<div/>");
            span = $("<span/>");
            span.text(columnName);
            select = $("<select/>");
            select.attr('id', selectId);
            select.addClass(selectClassName);
            options.forEach(function (text) {
                select.append($("<option value='" + text + "'>" + text + "</option>"));
            }),
            container.append(span);
            container.append(select);
            cell.append(container);
            return cell;
        },
        appendCell: function (row, text, width, isHeader, className, title) {
            var cell = helper.createCell(width, text, isHeader, className, title);
            row.append(cell);
            return cell;
        },
        appendHeaderCell: function (row, html, width, className, title) {
            var cell = $("<th>");
            if (html) {
                cell.html(html);
            }
            if (width) {
                cell.css("width", width + 'px');
            }
            if (width === 0) {
                cell.hide();
            }
            if (className) {
                cell.addClass(className);
            }
            if (title) {
                cell.attr("title", title);
            }
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
        },
        createDecimalInput: function (row, width, textEntryWidth, text, maxlength, className, placeholder) {
            var textInput = helper.createTextInput(textEntryWidth, text, maxlength, className, placeholder);
            textInput.keypress(common.isAlphaNumericKeyOrPeriod);
            return textInput;
        },
        addDecimalTextEntryCell: function (row, width, textEntryWidth, text, maxlength, className, placeholder) {
            var textInput = helper.createDecimalInput(row, width, textEntryWidth, text, maxlength, className, placeholder),
                label = helper.createLabel(text, "readonly");
            helper.appendReadWriteCell(row, width, textInput, width - 3, label);
        },
        addTextEntryCell: function (row, width, textEntryWidth, text, maxlength, className, placeholder) {
            var textInput = helper.createTextInput(textEntryWidth, text, maxlength, className, placeholder),
                label = helper.createLabel(text, "readonly");
            helper.appendReadWriteCell(row, width, textInput, width - 3, label);
        },
        enforceAlphaNumericInput: function (input) {
            input.keypress(common.isAlphaNumericKey);
        },
        createTable: function (data, cellsPerRow, cellClick) {
            var i, k, item, row, cell, table, length, remainder, emptyRows, label;
            table = $('<table/>');
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
                label = $('<label/>');
                label.text(item);
                cell.append(label);
                cell.click(cellClick);
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
        }
    };
    return helper;
};