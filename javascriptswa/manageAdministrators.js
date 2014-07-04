/*globals $, define, console*/
"use strict";
define(['manageAdministratorsDataAccess', 'htmlHelper', 'common', 'manageAdministratorsFactory'], function (dataAccess, htmlHelper, common, factory) {
    var administratorRoles = [],
        defaultCompany = '',
        alphanumericRegex = /^[a-z0-9]+$/i,
        administratorPrefix = "XWA",
        emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
        createAdministratorButton = $("#createAdministratorButton"),
        showAddAdministratorControlButton = $("#showAddAdministratorControlImage"),
        hideAddAdministratorControlButton = $("#hideAddAdministratorControlButton"),
        addAdministratorContainer = $("#addAdministrator"),
        manageAdministratorsError = $('#manageAdministratorsError'),
        manageAdministratorsErrors = $("#manageAdministratorsErrors"),
        manageAdministratorsStatus = $('#manageAdministratorsStatus'),
        administratorsTableContainer = $('#administratorsTableContainer'),
        administratorRolesSelect = $('#administratorRolesSelect'),
        usernameInput = $('#usernameInput'),
        defaultCompanyInput = $("#defaultCompanyInput"),
        firstNameInput = $('#firstNameInput'),
        lastNameInput = $('#lastNameInput'),
        emailInput = $('#emailInput'),
        confirmDialog = $("#confirmDialog"),
        getAdministratorsTable = function () {
            return $(".administratorsTable");
        },
        removeAdministratorRow = function (administrator) {
            var rows = getAdministratorsTable().find('tr');
            rows.each(function () {
                if ($(this).attr("id") === administrator) {
                    $(this).remove();
                    return;
                }
            });
        },
        assignNewAdministratorPassword = function () {
            var username, email, callback, that;
            that = $(this);
            callback = function (response) {
                if (!response.Success) {
                    manageAdministratorsError.text(response.Message);
                    return;
                }
                common.showToaster(that, 'Password assigned.', 0, 30, false, null, 1500);
            };
            username = $(this).closest('tr').attr('id');
            email = "Cant find email";
            $(this).closest('tr').find('span').each(function () {
                if ($(this).hasClass('Email')) {
                    email = $(this).text();
                }
            });
            dataAccess.assignNewAdministratorPassword(username, email, callback);
        },
        deleteAdministrator = function () {
            var message, title, proceed, administrator, position, deleteAdministratorCallback;
            administrator = $(this).closest('tr').attr('id');
            message = "Delete the administrator '" + administrator + "'?";
            title = "Delete administrator";
            position = $(this).position();
            deleteAdministratorCallback = function (response) {
                if (!response.Success) {
                    manageAdministratorsError.text(response.Message);
                    return;
                }
                removeAdministratorRow(administrator);
                manageAdministratorsStatus.text(response.Message);
            };
            proceed = function () {
                dataAccess.deleteAdministrator(administrator, deleteAdministratorCallback);
            };
            common.confirmDialog(confirmDialog, message, title, position.top, position.left, proceed);
        },
        createIsRequiredError = function (fieldName) {
            return 'The ' + fieldName + ' is required.';
        },
        createIsNonAlphError = function (fieldName) {
            return 'The ' + fieldName + ' must contain only alphanumeric characters.';
        },
        getUsername = function () {
            return administratorPrefix + usernameInput.val().trim();
        },
        getFirstName = function () {
            return firstNameInput.val().trim();
        },
        getCompany = function () {
            return defaultCompanyInput.val().trim();
        },
        getLastName = function () {
            return lastNameInput.val().trim();
        },
        getEmail = function () {
            return emailInput.val().trim();
        },
        getAccessLevel = function () {
            return administratorRolesSelect.val();
        },
        clearAndDisplaySuccess = function (message) {
            manageAdministratorsErrors.empty();
            manageAdministratorsError.text('');
            usernameInput.val('');
            firstNameInput.val('');
            lastNameInput.val('');
            emailInput.val('');
            defaultCompanyInput.val(defaultCompany);
            administratorRolesSelect.find('option:first-child').attr("selected", "selected");
            manageAdministratorsStatus.text(message);
        },
        toggleAddAdministratorControls = function () {
            showAddAdministratorControlButton.toggle();
            hideAddAdministratorControlButton.toggle();
            addAdministratorContainer.slideToggle();
            administratorsTableContainer.slideToggle();
        },
        updateAdministrator = function (administrator) {
            var callback = function (response) {
                if (!response.Success) {
                    manageAdministratorsError.text(response.Message);
                    dataAccess.getAdministratorRoles(fillAdministratorRolesAndDisplayAdministrators);
                    return;
                }
            };
            dataAccess.updateAdministrator(administrator, callback);
        },
        displayAdministrators = function (response) {
            if (!response.Success) {
                manageAdministratorsError.text(response.Message);
                return;
            }
            var administratorsTable, array;
            array = administratorRoles.map(function (administratorRole) {
                return { value: administratorRole.ID, text: administratorRole.Name };
            });
            administratorsTableContainer.empty();
            administratorsTable = factory.createAdministratorsTable(response.Payload, array, deleteAdministrator, updateAdministrator, assignNewAdministratorPassword);
            administratorsTableContainer.append(administratorsTable);
        },
        getUsernameError = function () {
            var username = getUsername();
            if (username.length < administratorPrefix.length + 1) {
                return createIsRequiredError("username");
            }
            if (!alphanumericRegex.test(username)) {
                return createIsNonAlphError('username');
            }
            return null;
        },
        getFirstNameError = function () {
            var firstName = getFirstName();
            if (firstName.length < 1) {
                return createIsRequiredError("first name");
            }
            if (!alphanumericRegex.test(firstName)) {
                return createIsNonAlphError('first name');
            }
            return null;
        },
        getLastNameError = function () {
            var lastName = getLastName();
            if (lastName.length < 1) {
                return createIsRequiredError("last name");
            }
            if (!alphanumericRegex.test(lastName)) {
                return createIsNonAlphError('last name');
            }
            return null;
        },
        getEmailError = function () {
            if (!emailRegex.test(getEmail())) {
                return "The email format is not valid.";
            }
            return null;
        },
        getAccessLevelError = function () {
            var accessLevel = getAccessLevel();
            if (accessLevel && accessLevel >= 0) {
                return null;
            }
            return "The access level must be specified.";
        },
        inputIsValid = function () {
            var errors, error;
            errors = [];
            manageAdministratorsErrors.empty();
            error = getUsernameError();
            if (error) {
                errors.push(error);
            }
            error = getFirstNameError();
            if (error) {
                errors.push(error);
            }
            error = getLastNameError();
            if (error) {
                errors.push(error);
            }
            error = getEmailError();
            if (error) {
                errors.push(error);
            }
            error = getAccessLevelError();
            if (error) {
                errors.push(error);
            }
            errors.forEach(function (errorMessage) {
                var item = $("<li>");
                item.text(errorMessage);
                item.addClass('redLabel');
                manageAdministratorsErrors.append(item);
            });
            return errors.length === 0;
        },
        createAdministrator = function () {
            var array, callback;
            callback = function (response) {
                if (!response.Success) {
                    manageAdministratorsError.text(response.Message);
                    return;
                }
                array = administratorRoles.map(function (administratorRole) {
                    return { value: administratorRole.ID, text: administratorRole.Name };
                });
                clearAndDisplaySuccess(response.Message);
                dataAccess.getAdministrators(displayAdministrators);
                toggleAddAdministratorControls();
            };
            if (inputIsValid()) {
                dataAccess.createAdministrator(getUsername(), getAccessLevel(), getFirstName(), getLastName(), getEmail(), getCompany(), callback);
            }
        },
        showAddAdministratorControl = function () {
            manageAdministratorsErrors.empty();
            manageAdministratorsStatus.text('');
            manageAdministratorsError.text('');
            usernameInput.val('');
            firstNameInput.val('');
            lastNameInput.val('');
            emailInput.val('');
            defaultCompanyInput.val(defaultCompany);
            administratorRolesSelect.empty();
            htmlHelper.initializeSelect(administratorRolesSelect, '', "< none selected >");
            administratorRoles.forEach(function (administratorRole) {
                var option = htmlHelper.createOption(administratorRole.Name, administratorRole.ID);
                option.attr("title", administratorRole.Description);
                administratorRolesSelect.append(option);
            });
            toggleAddAdministratorControls();
        },
        assignEventHandlers = function () {
            showAddAdministratorControlButton.click(showAddAdministratorControl);
            hideAddAdministratorControlButton.click(toggleAddAdministratorControls);
            administratorRolesSelect.change(htmlHelper.setSelectTitleToOptionTitle);
            createAdministratorButton.click(createAdministrator);
            common.trapEnterKey(createAdministratorButton);
        },
        fillAdministratorRolesAndDisplayAdministrators = function (response) {
            if (!response.Success) {
                manageAdministratorsError.text(response.Message);
                return;
            }
            administratorRoles = [];
            response.Payload.forEach(function (administratorRole) {
                administratorRoles.push(administratorRole);
            });
            dataAccess.getAdministrators(displayAdministrators);
        };
    return {
        initialize: function (company) {
            defaultCompany = company;
            assignEventHandlers();
            dataAccess.getAdministratorRoles(fillAdministratorRolesAndDisplayAdministrators);
        }
    };
});