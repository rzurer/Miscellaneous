/*globals define, console, $ */
"use strict";
define(['htmlHelper', 'editInPlaceControl'], function (htmlHelper, editInPlaceControl) {
    var that,
        controlsArray = [],
        controlId = 0,
        updatePageFunction,
        pagesTableContainer = $('#pagesTableContainer'),
        pageCategoriesSelect = $('#pageCategoriesSelect '),
        createCheckbox = function (id, caption, isChecked, updatePageAccess) {
            var container, label, checkbox;
            label = $('<span>').text(caption);
            checkbox = $('<input>').attr("type", "checkbox").addClass('pageAccessCheckbox').attr({ "id": id });
            if (isChecked) {
                checkbox.attr({ "checked": "checked" });
            }
            container = $("<div>").addClass('checkboxDiv');
            container.append(label);
            container.append(checkbox);
            checkbox.bind('click', updatePageAccess);
            return container;
        },
        createCheckboxGroup = function (pageId, roles, updatePageAccess) {
            var table, data = [];
            roles.forEach(function (role) {
                if (role.ID !== 5 && role.ID !== 6) {
                    data.push(createCheckbox(pageId + '_' + role.ID, role.Name, role.CanView, updatePageAccess));
                }
            });
            table = htmlHelper.createFixedColumnsTable(data, 3, 'rolesTable');
            return table;
        },
        createPageInfo = function (container) {
            var row, pageId, categoryId, url, description;
            row = container.closest('.pageAccessRow');
            pageId = Number(row.attr('id'));
            categoryId = Number(row.find('select.write').val());
            url = row.find('.pageUrl').text();
            description = row.find('.pageDescription').text();
            return { pageId: pageId, categoryId: categoryId, url: url, description: description };
        },
        changeCallback = function (id) {
            controlsArray.forEach(function (item) {
                if (item.id === id) {
                    var pageInfo = createPageInfo(item.container);
                    updatePageFunction(pageInfo);
                }
            });
        },
        createPageAccessTableHeader = function () {
            var headerRow;
            headerRow = htmlHelper.createRow('pageAccessTableHeaderRow');
            htmlHelper.appendCell(headerRow, "Category", 120, true);
            htmlHelper.appendCell(headerRow, "Description", 300, true);
            htmlHelper.appendCell(headerRow, "Url", 540, true);
            htmlHelper.appendCell(headerRow, "Roles", '', true);
            return headerRow;
        },
        createPageAccessTableRow = function (pageInfo, pageCategories, updatePageAccess, deletePageAccess) {

            var categories, row, cell, deleteButton, controls;
            controls = [];
            row = $('<tr>').addClass('pageAccessRow').attr("id", pageInfo.ID);
            categories = pageCategories.map(function (item) { return { value: item.Key, text: item.Value }; });
            controls.push(editInPlaceControl.createSelect(controlId += 1, pageInfo.Category, 150, categories, "< none selected >", "pageCategory pageAccessEditInPlace"));
            controls.push(editInPlaceControl.create(controlId += 1, pageInfo.Description, 300, "pageDescription  pageAccessEditInPlace"));
            controls.push(editInPlaceControl.create(controlId += 1, pageInfo.Url, 540, "pageUrl pageAccessEditInPlace"));
            controls.forEach(function (control) {
                controlsArray.push(control);
                cell = htmlHelper.appendCell(row).append(control.container);
                cell.attr("title", "Click to edit");
            });
            cell = htmlHelper.appendCell(row);
            cell.append(createCheckboxGroup(pageInfo.ID, pageInfo.Roles, updatePageAccess));
            cell = htmlHelper.appendCell(row);
            deleteButton = $('#deletePageAccessButton').clone().addClass('deletePageAccessButton').attr('title', 'Delete the page "' + pageInfo.Description + '"');
            deleteButton.click(deletePageAccess);
            cell.append(deleteButton);
            return row;
        };
    editInPlaceControl.addListener("change", changeCallback);
    that = {
        createPageAccessTable: function (pageInfos, pageCategories, updatePageAccess, deletePageAccess, updatePage) {
            var table;
            updatePageFunction = updatePage;
            pagesTableContainer.empty();
            table = htmlHelper.createTable("pageAccessTable");
            if (pageInfos.length === 0) {
                return table;
            }
            table.append(createPageAccessTableHeader());
            pageInfos.forEach(function (pageInfo) {
                table.append(createPageAccessTableRow(pageInfo, pageCategories, updatePageAccess, deletePageAccess));
            });
            htmlHelper.fillSelectFromKeyValuePairs(pageCategoriesSelect, 'filter by category', pageCategories, '< all >');
            return table;
        }
    };
    return that;
});