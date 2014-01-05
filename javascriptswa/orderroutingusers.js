/*globals $, console, define */
"use strict";
define(['common', "orderRoutingUserDataAccess", "orderRoutingUserDetail", "orderRoutingUserReports"],
    function (common, dataAccess, detail, reports) {
        var wantReadOnlyView,
            getSelectedLicenseType = function () {
                return $("#licenseFilter").val();
            },
            getSelectedProvider = function () {
                return $("#providerFilter").val();
            },
            model = {},
            getUsersAutoComplete = function () {
                return $("#usersAutoComplete");
            },
            getClearingFirmsAutoComplete = function () {
                return $("#clearingFirmsAutoComplete");
            },
            getOrderRoutingProvidersSelect = function () {
                return $("#orderRoutingProvidersSelect");
            },
            getSenderCompIdsSelect = function () {
                return $("#senderCompIdsSelect");
            },
            getExternalUsername = function () {
                return $("#externalUsername");
            },
            getAddOrderRoutingUserButton = function () {
                return $("#addOrderRoutingUserButton");
            },
            getCancelAddOrderRoutingUserButton = function () {
                return $("#cancelAddOrderRoutingUserButton");
            },
            filterByLicenseAndProvider = function () {
                var licenseType, providerName;
                licenseType = getSelectedLicenseType();
                providerName = getSelectedProvider();
                $(".orderRoutingUser").each(function () {
                    var parent = $(this),
                        license = $(this).children('.license').text().trim(),
                        provider = $(this).find('.provider').text().trim();
                    if (licenseType === 'All' && providerName === 'All') {
                        $('.orderRoutingUser').show();
                        return;
                    }
                    if (providerName === 'All') {
                        parent.toggle(licenseType === license);
                        return;
                    }
                    if (licenseType === 'All') {
                        parent.toggle(provider === providerName);
                        return;
                    }
                    parent.toggle(provider === providerName && licenseType === license);
                });
            },
            showUsersView = function () {
                $("#orderroutingclearingfirms").hide();
                $("#orderroutingfillaccounts").hide();
                $("#orderroutingusers").show();
                $("#orderroutingvalidationerrors").hide();
                $("#clearingFirmTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#fillAccountTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#userTab").css({
                    "background-color": "rgb(233, 231, 231)",
                    "color": "black"
                });
                $("#validationErrorsTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
            },
            showClearingFirmsView = function () {
                $("#orderroutingclearingfirms").show();
                $("#orderroutingfillaccounts").hide();
                $("#orderroutingusers").hide();
                $("#orderroutingvalidationerrors").hide();
                $("#clearingFirmTab").css({
                    "background-color": "rgb(233, 231, 231)",
                    "color": "black"
                });
                $("#fillAccountTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#userTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#validationErrorsTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
            },
            showFillAccountsView = function () {
                $("#orderroutingclearingfirms").hide();
                $("#orderroutingfillaccounts").show();
                $("#orderroutingusers").hide();
                $("#orderroutingvalidationerrors").hide();
                $("#clearingFirmTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#fillAccountTab").css({
                    "background-color": "rgb(233, 231, 231)",
                    "color": "black"
                });
                $("#userTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#validationErrorsTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
            },
            showValidationErrorsView = function () {
                $("#orderroutingclearingfirms").hide();
                $("#orderroutingfillaccounts").hide();
                $("#orderroutingusers").hide();
                $("#orderroutingvalidationerrors").show();
                $("#clearingFirmTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#fillAccountTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#userTab").css({
                    "background-color": "transparent",
                    "color": "dimgray"
                });
                $("#validationErrorsTab").css({
                    "background-color": "rgb(233, 231, 231)",
                    "color": "red"
                });
            },
            hideAddOrderRoutingUserControls = function () {
                $('#addOrderRoutingUserImage').hide();
                $('#addOrderRoutingUserContainer').hide();
            },
            showAddOrderRoutingUserButton = function () {
                if (!wantReadOnlyView) {
                    $('#addOrderRoutingUserImage').show();
                    $('#addOrderRoutingUserContainer').hide();
                }
            },
            navigate = function () {
                if (this.id === 'clearingFirmTab') {
                    hideAddOrderRoutingUserControls();
                    showClearingFirmsView();
                    return;
                }
                if (this.id === 'fillAccountTab') {
                    hideAddOrderRoutingUserControls();
                    showFillAccountsView();
                    return;
                }
                if (this.id === 'userTab') {
                    showUsersView();
                    showAddOrderRoutingUserButton();
                    return;
                }
                if (this.id === 'validationErrorsTab') {
                    hideAddOrderRoutingUserControls();
                    showValidationErrorsView();
                    return;
                }
            },
            fillOrderRoutingProvidersSelect = function () {
                var option, select;
                select = getOrderRoutingProvidersSelect();
                select.empty();
                option = $("<option/>");
                option.text(common.nonePlaceholder);
                select.append(option);
                model.ProviderNames.forEach(function (providerName) {
                    option = $("<option/>");
                    option.text(providerName);
                    select.append(option);
                });
            },
            fillSenderCompIdsSelect = function () {
                var option, select;
                select = getSenderCompIdsSelect();
                select.empty();
                if (model.ICESenderCompIDs.length === 1) {
                    option = $("<option/>");
                    option.text(model.ICESenderCompIDs[0]);
                    select.append(option);
                    common.disableControl(select, null, 0.7);
                    return;
                }
                option = $("<option/>");
                option.text("< choose >");
                select.append(option);
                model.ICESenderCompIDs.forEach(function (senderCompId) {
                    option = $("<option/>");
                    option.text(senderCompId);
                    select.append(option);
                });

            },
            createFillAccountsRow = function (fillAccount) {
                var innerRow, innerCell, span;
                innerRow = $("<tr/>");
                innerCell = $('<td/>');
                innerCell.addClass('fillAccount');
                innerCell.text(fillAccount.Name.trim());
                innerRow.append(innerCell);
                innerCell = $('<td/>');
                innerCell.addClass('fcmAccount');
                span = $('<span/>');
                span.attr('id', fillAccount.ClearingFirmAccount.Id);
                span.text(fillAccount.ClearingFirmAccount.Account.trim());
                innerCell.append(span);
                innerRow.append(innerCell);
                return innerRow;
            },
            createOrderAccountsRow = function (orderAccount) {
                var innerRow, innerCell, span;
                innerRow = $("<tr/>");
                innerCell = $('<td/>');
                innerCell.addClass('productCode');
                innerCell.text(orderAccount.ProductCode.trim());
                innerRow.append(innerCell);
                innerCell = $('<td/>');
                innerCell.addClass('fcmAccount');
                span = $('<span/>');
                span.attr('id', orderAccount.ClearingFirmAccount.Id);
                span.text(orderAccount.ClearingFirmAccount.Account.trim());
                innerCell.append(span);
                innerRow.append(innerCell);
                return innerRow;
            },
            createOrderRoutingSettingsRow = function (setting) {
                var innerRow, innerCell;
                innerRow = $("<tr/>");
                innerCell = $('<td/>');
                innerCell.addClass('provider');
                innerCell.text(setting.ProviderName.trim());
                innerRow.append(innerCell);
                innerCell = $('<td/>');
                innerCell.addClass('externalUsername');
                innerCell.text(setting.ExternalUsername.trim());
                innerRow.append(innerCell);
                innerCell = $('<td/>');
                innerCell.addClass('clearingFirm');
                innerCell.text(setting.ClearingFirmName.trim());
                innerRow.append(innerCell);
                return innerRow;
            },
            fillOrderRoutingUsers = function (users) {
                var table, row, cell, span, innerTable;
                table = $("#orderRoutingUsersTable");
                users.forEach(function (user) {
                    row = $("<tr/>");
                    row.attr("id", user.Username.trim());
                    row.addClass('orderRoutingUser');
                    cell = $('<td/>');
                    cell.addClass('userName');
                    span = $('<span/>');
                    span.text(user.Username.trim());
                    cell.append(span);
                    row.append(cell);
                    cell = $('<td/>');
                    cell.addClass('license');
                    cell.text(user.License);
                    cell.attr('title', user.MarketDataFeedProviderType.trim());
                    row.append(cell);
                    cell = $('<td/>');
                    cell.addClass('orderRoutingSettings');
                    innerTable = $('<table/>');
                    user.OrderRoutingSettings.forEach(function (setting) {
                        innerTable.append(createOrderRoutingSettingsRow(setting));
                    });
                    cell.append(innerTable);
                    row.append(cell);
                    cell = $('<td/>');
                    cell.addClass('orderAccounts');
                    innerTable = $('<table/>');
                    user.OrderAccounts.forEach(function (orderAccount) {
                        innerTable.append(createOrderAccountsRow(orderAccount));
                    });
                    cell.append(innerTable);
                    row.append(cell);
                    cell = $('<td/>');
                    cell.addClass('fillAccounts');
                    innerTable = $('<table/>');
                    user.FillAccounts.forEach(function (fillAccount) {
                        innerTable.append(createFillAccountsRow(fillAccount));
                    });
                    cell.append(innerTable);
                    row.append(cell);
                    table.append(row);
                });
            },
            refreshOrderRoutingUsers = function (response) {
                if (response.Success) {
                    model = response.Payload;
                    dataAccess.setUrlLibrarian(model.UrlLibrarian);
                    reports.createValidationsReport(wantReadOnlyView, model.UsernameValidationErrorsDictionary, showUsersView);
                    reports.createFillAccountsReport(model.FillAccounts);
                    reports.createExecutionUsersPerClearingFirmReport(model.ClearingFirms);
                    reports.createSummaryReport(model.UserProviderCounts, model.OrderRoutingUsersCount);
                    fillOrderRoutingUsers(model.Users);
                    assignEventHandlers();
                    showUsersView();
                }
            },
            clearAddOrderRoutingUserEntryControls = function () {
                if (wantReadOnlyView) {
                    return;
                }
                getUsersAutoComplete().val('');
                getClearingFirmsAutoComplete().val('');
                getOrderRoutingProvidersSelect().val(common.nonePlaceholder);
                getExternalUsername().val('');
            },
            closeAddOrderRoutingUserAddControl = function () {
                if (wantReadOnlyView) {
                    return;
                }
                $("#addOrderRoutingUserContainer").slideUp();
                clearAddOrderRoutingUserEntryControls();
            },
            refreshOrderRoutingUsersTable = function () {
                $('#orderRoutingUsersTable').fadeOut('slow');
                $('#orderRoutingUsersTable > tbody').children('tr.orderRoutingUser').remove();
                dataAccess.getOrderRoutingUsers("GetOrderRoutingUsers", refreshOrderRoutingUsers);
                $('#orderRoutingUsersTable').fadeIn('fast', closeAddOrderRoutingUserAddControl);
            },
            doAddOrderRoutingUser = function () {
                if (wantReadOnlyView) {
                    return false;
                }
                var username, clearingFirm, executionProvider, externalUsername, callback, caller, senderCompId;
                username = getUsersAutoComplete().val();
                clearingFirm = getClearingFirmsAutoComplete().val();
                executionProvider = getOrderRoutingProvidersSelect().val();
                externalUsername = getExternalUsername().val();
                senderCompId = getSenderCompIdsSelect().val();
                caller = $('#saveOrderRoutingUserButtons');
                callback = function (response) {
                    if (!response.Success) {
                        common.showToaster(caller, response.Message, 0, 35, true, null, 2000);
                    } else {
                        refreshOrderRoutingUsersTable();
                        common.showToaster(caller, response.Message, 0, 35, false);
                    }
                };
                dataAccess.addOrderRoutingUser(username, clearingFirm, executionProvider, externalUsername, senderCompId, callback);
                return false;
            },
            validateCanSaveOrderRoutingUser = function (iceExternalUsername) {
                if (wantReadOnlyView) {
                    return false;
                }
                var enabledCallback, disabledCallback, canSave, addButton, username, clearingFirm, provider, externalUsername, senderCompIdIsOk;
                addButton = getAddOrderRoutingUserButton();
                enabledCallback = function () {
                    addButton.unbind('click');
                    addButton.click(doAddOrderRoutingUser);
                    addButton.keydown(function (event) {
                        if (event.which === 13) {
                            doAddOrderRoutingUser();
                        }
                    });
                };
                disabledCallback = function () {
                    addButton.unbind('click');
                };
                username = getUsersAutoComplete().val().trim();
                clearingFirm = getClearingFirmsAutoComplete().val().trim();
                provider = new String(getOrderRoutingProvidersSelect().val()).trim();
                externalUsername = getExternalUsername().val().trim();
                senderCompIdIsOk = provider !== "ICE" || getSenderCompIdsSelect().val() !== "< choose >";
                canSave = username.length > 0 &&
                    clearingFirm.length > 0 &&
                    provider.length > 0 &&
                    provider !== common.nonePlaceholder &&
                    senderCompIdIsOk && (externalUsername.length > 0 || (iceExternalUsername && iceExternalUsername.length > 0));
                if (canSave) {
                    common.enableControl(addButton, enabledCallback);
                } else {
                    common.disableControl(addButton, disabledCallback);
                }
                return false;
            },
            verifyExternalUsernameDoesNotExistForOrderRoutingProvider = function (callback) {
                if (wantReadOnlyView) {
                    return;
                }
                var externalUsername, executionProvider, externalUsernameExistsCallback, target;
                target = getExternalUsername();
                externalUsername = target.val();
                executionProvider = getOrderRoutingProvidersSelect().val();
                externalUsernameExistsCallback = function (response) {
                    target.unbind('click');
                    if (!response.Success || response.Payload === "ExternalUsernameTaken") {
                        target.val('');
                        target.focus();
                        common.showToaster(target, response.Message, 0, 125, true, null, 2500);
                    }
                    if (callback) {
                        callback();
                    }
                };
                dataAccess.externalUsernameExistsForOrderRoutingProvider(externalUsername, executionProvider, externalUsernameExistsCallback);
            },
            setOrderRoutingUserBlurEvents = function () {
                if (wantReadOnlyView) {
                    return;
                }
                var checkExternalUsernameAndValidateCanSaveOrderRoutingUser;
                checkExternalUsernameAndValidateCanSaveOrderRoutingUser = function () {
                    verifyExternalUsernameDoesNotExistForOrderRoutingProvider(validateCanSaveOrderRoutingUser);
                };
                getSenderCompIdsSelect().change(validateCanSaveOrderRoutingUser);
                getOrderRoutingProvidersSelect().change(validateCanSaveOrderRoutingUser);
                getExternalUsername().blur(checkExternalUsernameAndValidateCanSaveOrderRoutingUser);
            },
            getOrderRoutingUsernames = function () {
                var allUsernames, validUsernames, invalidUsernames, dictionary, key;
                invalidUsernames = [];
                allUsernames = [];
                validUsernames = model.Users.map(function (user) {
                    return user.Username.trim();
                });
                dictionary = model.UsernameValidationErrorsDictionary;
                for (key in dictionary) {
                    if (dictionary.hasOwnProperty(key)) {
                        invalidUsernames.push(key.trim());
                    }
                }
                validUsernames.forEach(function (username) {
                    allUsernames.push(username);
                });
                invalidUsernames.forEach(function (username) {
                    allUsernames.push(username);
                });
                return allUsernames;
            },
            retrieveExternalUsername = function () {
                var username, shouldRetrieve, callback, target;
                target = getExternalUsername();
                target.val('');
                shouldRetrieve = getOrderRoutingProvidersSelect().val() === 'ICE';
                if (shouldRetrieve) {
                    callback = function (response) {
                        if (response.Success) {
                            var externalUsername = response.Payload.ExternalUsername;
                            if (externalUsername && externalUsername.length > 0) {
                                target.val(externalUsername);
                                common.disableControl(target, null, 0.7);
                            }
                            validateCanSaveOrderRoutingUser();
                        }
                    };
                    username = getUsersAutoComplete().val();
                    dataAccess.retrieveExternalUsername(username, callback);
                }
            },
            showAddOrderRoutingUserControls = function () {
                var getUsernamesCallback, getClearingFirmsCallback, addButton, cancelAddButton;
                fillOrderRoutingProvidersSelect();
                getExternalUsername().val('');
                common.enableControl(getExternalUsername());
                fillSenderCompIdsSelect();
                $('#orderRoutingProvidersSelect').css({ "margin-right": "220px" });
                $('#senderCompIdsContainer').hide();
                setOrderRoutingUserBlurEvents();
                cancelAddButton = getCancelAddOrderRoutingUserButton();
                cancelAddButton.click(closeAddOrderRoutingUserAddControl);
                addButton = getAddOrderRoutingUserButton();
                common.disableControl(addButton);
                getUsernamesCallback = function (response) {
                    var usersAutocomplete;
                    usersAutocomplete = getUsersAutoComplete();
                    if (response.Success) {
                        common.removeExistingItemsFromArray(response.Payload, getOrderRoutingUsernames());
                        usersAutocomplete.blur(function () {
                            common.verifyItemExists(usersAutocomplete);
                            retrieveExternalUsername();
                            return false;
                        });
                        common.setAutocomplete(usersAutocomplete, 2, response.Payload, null, true, true);
                    }
                };
                getClearingFirmsCallback = function (response) {
                    if (response.Success) {
                        var clearingFirmsAutoComplete = getClearingFirmsAutoComplete();
                        clearingFirmsAutoComplete.blur(function () {
                            common.verifyItemExists(clearingFirmsAutoComplete);
                            validateCanSaveOrderRoutingUser();
                            return false;
                        });
                        common.setAutocomplete(clearingFirmsAutoComplete, 0, response.Payload, null, true, true);
                    }
                };
                dataAccess.getUsernames(getUsernamesCallback);
                dataAccess.getClearingFirms(getClearingFirmsCallback);
                if (wantReadOnlyView) {
                    return;
                }
                $("#addOrderRoutingUserContainer").slideDown('normal');
            },
            showSummaryView = function (e) {
                var target = $("#summary");
                common.clearPopup();
                target.appendTo(common.getPopup());
                target.show();
                common.showPopup(e.pageY, e.pageX);
            },
            showHideSenderCompIdSelect = function () {
                retrieveExternalUsername();
                if ($(this).val() === "ICE") {
                    $('#orderRoutingProvidersSelect').css({ "margin-right": "5px" });
                    $('#senderCompIdsContainer').show();
                    return;
                }
                $('#orderRoutingProvidersSelect').css({ "margin-right": "220px" });
                $('#senderCompIdsContainer').hide();

            },
            assignEventHandlers = function () {
                $('#providerFilter').unbind('click');
                $('#providerFilter').bind('click', filterByLicenseAndProvider);
                $('#licenseFilter').unbind('click');
                $('#licenseFilter').bind('click', filterByLicenseAndProvider);
                $('#userTab').unbind('click');
                $('#userTab').bind('click', navigate);
                $('#userTab').bind('click', refreshOrderRoutingUsersTable);
                $('#clearingFirmTab').unbind('click');
                $('#clearingFirmTab').bind('click', navigate);
                $('#fillAccountTab').unbind('click');
                $('#fillAccountTab').bind('click', navigate);
                $('#validationErrorsTab').unbind('click');
                $('#validationErrorsTab').bind('click', navigate);
                $('#summaryImage').unbind('click');
                $('#summaryImage').bind('click', showSummaryView);
                getOrderRoutingProvidersSelect().change(showHideSenderCompIdSelect);
                common.assignPopupEvents();
                if (wantReadOnlyView) {
                    return;
                }
                $('#addOrderRoutingUserImage').unbind('click');
                $('#addOrderRoutingUserImage').bind('click', function () {
                    showAddOrderRoutingUserControls();
                    getUsersAutoComplete().focus();
                });
                $(".userName").unbind('hover');
                $(".userName").hover(function () {
                    var deleteButton, id, message, disableOrderExecutionCallback, username, executionProvider, externalUsername, selector, callback, orderRoutingSettings;
                    selector = $(this);
                    selector.css({
                        "background": "#FFFF96",
                        "cursor": "pointer"
                    });
                    selector.children('span').attr('title', 'Add or delete fill or order accounts');
                    selector.children('span').css({
                        "text-decoration": "underline",
                        "color": "blue"
                    });
                    id = selector.parent('tr').attr('id');
                    username = id ? id.trim() : 'unknown';
                    orderRoutingSettings = selector.parent().children('.orderRoutingSettings');
                    executionProvider = orderRoutingSettings.find(".provider").text().trim();
                    externalUsername = orderRoutingSettings.find(".externalUsername").text().trim();
                    message = 'Disable order execution for the user ' + username;
                    callback = function (response) {
                        if (!response.Success) {
                            common.showToaster(selector, response.Message, 0, 25, true, null, -1);
                        } else {
                            selector.parent().remove();
                            refreshOrderRoutingUsersTable();
                            common.showToaster(selector, response.Message, 0, 25, false);
                        }
                    };
                    disableOrderExecutionCallback = function (e) {
                        var proceed, warning, control, top, left, title;
                        warning = "The user '" + username + "' will no longer be enabled for order routing through the provider '" +
                            executionProvider + "'<br/>Are you sure that you want to proceed?";
                        title = "Disable Order Execution?";
                        control = $('#confirmDialog');
                        top = e.pageY;
                        left = e.pageX;
                        proceed = function () {
                            dataAccess.deleteOrderRoutingUser(username, executionProvider, externalUsername, callback);
                        };
                        common.confirmDialog(control, warning, title, top, left, proceed);
                    };
                    selector.children('img').remove();
                    deleteButton = common.createDeleteButton(message, disableOrderExecutionCallback);
                    deleteButton.appendTo(selector);
                },
                    function () {
                        var selector = $(this);
                        selector.css({
                            "background": "",
                            "cursor": "default"
                        });
                        selector.children('span').attr('title', '');
                        selector.children('span').css({
                            "text-decoration": "none",
                            "color": "black"
                        });
                        selector.children('img').remove();
                    });
                $('.userName').children('span').unbind('click');
                $('.userName').children('span').bind('click', function (e) {
                    detail.createAndDisplayFcmAccountsControl($(this).closest('tr'), e.pageY, e.pageX + 20);
                });
            },
            initializeControls = function () {
                if (wantReadOnlyView) {
                    $('#addOrderRoutingUserImage').hide();
                    $('#addOrderRoutingUserContainer').hide();
                    $('#logImage').hide();
                    return;
                }
                $('#addOrderRoutingUserContainer').hide();
                $('#addOrderRoutingUserImage').attr('title', 'Enable user with order execution');
                $('#summaryImage').attr('title', 'View order execution provider summary');
                $('#logImage').attr('title', 'Show Log');
                common.disableControl($('#logImage'));
                $('#saveOrderRoutingUserImage').attr('title', 'Enable user with order execution');
                var src = $('#addAccountImage').attr('src');
                $('#saveOrderRoutingUserButtons').append($('<input/>').attr({ "id": 'addOrderRoutingUserButton', 'src': src, 'type': 'image' }));
                $('#saveOrderRoutingUserButtons').append($('#cancelAddAccountImage').clone().attr({ "id": 'cancelAddOrderRoutingUserButton', 'title': 'Cancel' }));
                $('#senderCompIdsContainer').hide();
            },
            fillLicenseTypesFilter = function (licenseTypes) {
                var select, option;
                select = $('#licenseFilter');
                option = $('<option/>');
                option.text('All');
                select.append(option);
                licenseTypes.forEach(function (licenseType) {
                    option = $('<option/>');
                    option.text(licenseType);
                    select.append(option);
                });
            },
            fillProvidersFilter = function (providerNames) {
                var select, option;
                select = $('#providerFilter');
                option = $('<option/>');
                option.text('All');
                select.append(option);
                providerNames.forEach(function (providerName) {
                    option = $('<option/>');
                    option.text(providerName);
                    select.append(option);
                });
            },
            initializeOrderRoutingUsers = function (response) {
                common.trapEnterKey($('form'));
                $('#tMenu').find('a').attr('tabindex', -1);
                $('body').keydown(function (event) {
                    if (event.which === 9 && $("#popup").is(':visible')) {
                        var length = $(event.target).parents('#popup').length;
                        if (length === 0) {
                            event.preventDefault();
                            return false;
                        }
                    }
                    return true;
                });
                if (response.Success) {
                    model = response.Payload;
                    dataAccess.setUrlLibrarian(model.UrlLibrarian);
                    reports.createValidationsReport(wantReadOnlyView, model.UsernameValidationErrorsDictionary, showUsersView);
                    reports.createFillAccountsReport(model.FillAccounts);
                    reports.createExecutionUsersPerClearingFirmReport(model.ClearingFirms);
                    reports.createSummaryReport(model.UserProviderCounts, model.OrderRoutingUsersCount);
                    fillOrderRoutingUsers(model.Users);
                    fillLicenseTypesFilter(model.LicenseTypes);
                    fillProvidersFilter(model.ProviderNames);
                    initializeControls();
                    assignEventHandlers();
                    showUsersView();
                }
            };
        return {
            initialize: function (isReadOnly) {
                wantReadOnlyView = isReadOnly;
                dataAccess.getOrderRoutingUsers("GetOrderRoutingUsers", initializeOrderRoutingUsers);
            }
        };
    });