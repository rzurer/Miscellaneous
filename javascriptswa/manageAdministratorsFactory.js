/*globals define, $*/
"use strict";
define(['htmlHelper', 'editInPlaceControl'], function (htmlHelper, editInPlaceControl) {
    var controlsArray = [],
        that,
        controlId = 0,
        updateFunction,
        createAdministratorsTableHeader = function () {
            var headerRow = htmlHelper.createRow('administratorsTableHeaderRow');
            htmlHelper.appendCell(headerRow, "Username", 90, true);
            htmlHelper.appendCell(headerRow, "First Name", 80, true);
            htmlHelper.appendCell(headerRow, "Last Name", 80, true);
            htmlHelper.appendCell(headerRow, "Email", 250, true);
            htmlHelper.appendCell(headerRow, "Role", 110, true);
            htmlHelper.appendCell(headerRow, "Company", 400, true);
            htmlHelper.appendCell(headerRow, "", '');
            htmlHelper.appendCell(headerRow, "", '');
            return headerRow;
        },
        createAdministratorsTableRow = function (administrator, array, deleteFunction, assignNewAdministratorPasswordFunction) {
            var row, controls, cell, deleteButton, assignNewAdministratorPasswordButton;
            controls = [];
            row = htmlHelper.createRow('administratorsTableRow').attr('id', administrator.Username);
            htmlHelper.appendCell(row, administrator.Username, 90, false, 'administratorUsername');
            controls.push(editInPlaceControl.create(controlId += 1, administrator.FirstName, 80, "FirstName"));
            controls.push(editInPlaceControl.create(controlId += 1, administrator.LastName, 80, "LastName"));
            controls.push(editInPlaceControl.create(controlId += 1, administrator.Email, 250, "Email"));
            controls.push(editInPlaceControl.createSelect(controlId += 1, administrator.Role, 110, array, "< none selected >", "Role"));
            controls.forEach(function (control) {
                controlsArray.push(control);
                cell = htmlHelper.appendCell(row).append(control.container);
                cell.attr("title", "Click to edit");
            });
            htmlHelper.appendCell(row, administrator.Company, 400, false, 'Company');
            cell = htmlHelper.appendCell(row);
            assignNewAdministratorPasswordButton = $('#assignNewAdministratorPasswordButton').clone().addClass('assignNewAdministratorPasswordButton').attr('title', 'Assign new administrator password for ' + administrator.Username);
            assignNewAdministratorPasswordButton.bind('click', assignNewAdministratorPasswordFunction);
            cell.append(assignNewAdministratorPasswordButton);
            cell = htmlHelper.appendCell(row);
            deleteButton = $('#deleteAdministratorButton').clone().addClass('deleteAdministratorButton').attr('title', 'Delete ' + administrator.Username);
            deleteButton.bind('click', deleteFunction);
            cell.append(deleteButton);
            return row;
        },
        createAdministratorFromControl = function (control) {
            var username, accessLevel, firstName, lastName, email, company, row, role;
            row = control.closest('tr');
            username = row.attr('id');
            firstName = control.closest('tr').find(".FirstName").text();
            lastName = control.closest('tr').find(".LastName").text();
            email = control.closest('tr').find(".Email").text();
            company = control.closest('tr').find(".Company").text();
            role = control.closest('tr').find(".Role").text();
            accessLevel = control.closest('tr').find(".Role").siblings('select').find('option').filter(function () { return $(this).html() === role; }).val();
            return { username: username, accessLevel: Number(accessLevel), firstName: firstName, lastName: lastName, email: email, company: company };
        },
        changeCallback = function (id) {
            controlsArray.forEach(function (item) {
                if (item.id === id) {
                    var administrator = createAdministratorFromControl(item.container);
                    updateFunction(administrator);
                }
            });
        };
    editInPlaceControl.addListener("change", changeCallback);
    that = {
        createAdministratorsTable: function (administrators, array, deleteFunction, updateAdministratorFunction, assignNewAdministratorPasswordFunction) {
            var table;
            updateFunction = updateAdministratorFunction;
            table = htmlHelper.createTable("administratorsTable");
            if (administrators.length === 0) {
                return table;
            }
            table.append(createAdministratorsTableHeader());
            administrators.forEach(function (administrator) {
                table.append(createAdministratorsTableRow(administrator, array, deleteFunction, assignNewAdministratorPasswordFunction));
            });
            return table;
        }
    };
    return that;
});