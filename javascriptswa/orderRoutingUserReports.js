/*globals $, console, define */
"use strict";
var addDictionaryRow, getProviderColor;
define(['common', 'orderRoutingUserDataAccess'], function (common, dataAccess) {
    var getError = function (value) {
        var indexOfFirstPipe;
        indexOfFirstPipe = value.indexOf('|');
        return value.substring(0, indexOfFirstPipe);
    },
        getExecutionProvider = function (value) {
            var indexOfFirstPipe, indexOfSecondPipe;
            indexOfFirstPipe = value.indexOf('|');
            indexOfSecondPipe = value.lastIndexOf('|');
            return value.substring(indexOfFirstPipe + 1, indexOfSecondPipe);
        },
        getExternalUsername = function (value) {
            var indexOfSecondPipe;
            indexOfSecondPipe = value.lastIndexOf('|');
            return value.substring(indexOfSecondPipe + 1);
        },
        addDictionaryRow = function (innerTable, value) {
            var innerRow, innerCell, error, executionProvider, externalUsername;
            error = getError(value);
            executionProvider = getExecutionProvider(value);
            externalUsername = getExternalUsername(value);
            innerRow = $('<tr/>').addClass("validationError");
            innerCell = $('<td/>').text(error);
            innerRow.append(innerCell);
            innerCell = $('<td/>').addClass('executionProvider hidden').text(executionProvider);
            innerRow.append(innerCell);
            innerCell = $('<td/>').addClass('externalUsername hidden').text(externalUsername);
            innerRow.append(innerCell);
            innerTable.append(innerRow);
        },
        getProviderColor = function (provider) {
            if (provider === 'CTS') {
                return 'blue';
            }
            if (provider === 'CQG') {
                return 'red';
            }
            if (provider === 'ICE') {
                return 'purple';
            }
            return 'black';
        };
    return {
        createFillAccountsReport: function (fillAccounts) {
            var table, row, headerCell, span, cell, innerTable, innerRow, innerCell, name;
            table = $("#orderroutingfillaccounts > table");
            table.children().remove();
            row = $('<tr/>');
            row.addClass("header");
            headerCell = $('<th/>');
            span = $('<span/>');
            span.text("Fill Account");
            headerCell.append(span);
            row.append(headerCell);
            headerCell = $('<th/>');
            span = $('<span/>');
            span.addClass("spanClearingFirmUsername");
            span.text("Username");
            headerCell.append(span);
            span = $('<span/>');
            span.addClass("spanClearingFirmAccountNumber");
            span.text("FCMAccount#");
            headerCell.append(span);
            row.append(headerCell);
            table.append(row);
            fillAccounts.forEach(function (fillAccount) {
                row = $('<tr/>');
                row.addClass("fillAccountsRow");
                name = fillAccount.Name.trim();
                cell = $('<td/>');
                cell.addClass("fillsFillAccount");
                cell.text(name);
                row.append(cell);
                cell = $('<td/>');
                innerTable = $("<table/>");
                fillAccount.ClearingFirmAccountUsernames.forEach(function (clearingFirmAccountUsername) {
                    innerRow = $('<tr/>');
                    innerCell = $('<td/>');
                    innerCell.addClass("fillUsername");
                    innerCell.text(clearingFirmAccountUsername.Username.trim());
                    innerRow.append(innerCell);
                    innerCell = $('<td/>');
                    innerCell.addClass("fillsClearingFirmAccount");
                    innerCell.text(clearingFirmAccountUsername.ClearingFirmAccount.Account.trim());
                    innerRow.append(innerCell);
                    innerTable.append(innerRow);
                });
                cell.append(innerTable);
                row.append(cell);
                table.append(row);
            });
        },
        createValidationsReport: function (wantReadOnlyView, dictionary, noErrorsCallback) {
            var table, row, cell, innerTable, key, headerCell, createESignalEntry, createESignalSubscriptionLimitSelect,
                disableOrderExecutionCallback, deleteOrderRoutingUserCallback, createMarketDataProviderSelect,
                fixOrderRoutingUserCallback, shouldShowFixButton, errors, shouldShowMarketDataProviderSelect;
            table = $("#orderroutingvalidationerrors > table");
            table.children().remove();
            if (!common.propertiesExist(dictionary)) {
                table.parent().hide();
                $("#validationErrorsTab").hide();
                return;
            }
            row = $('<tr/>');
            row.addClass("header");
            headerCell = $('<th/>');
            headerCell.text("Username");
            row.append(headerCell);
            headerCell.attr("colspan", 3);
            headerCell = $('<th/>');
            headerCell.text("Error");
            row.append(headerCell);
            table.append(row);
            deleteOrderRoutingUserCallback = function (response) {
                var hasErrors, errorsContainer;
                errorsContainer = $("#orderroutingvalidationerrors");
                if (!response.Success) {
                    common.showToaster($(this), response.Message, 0, 25, true, null, -1);
                } else {
                    common.showToaster($(this), response.Message, 0, 25, false);
                    $(this).closest('tr').remove();
                    hasErrors = errorsContainer.find('.usernameValidationError').length > 0;
                    if (!hasErrors) {
                        table.empty();
                        table.parent().hide();
                        $("#validationErrorsTab").hide();
                        noErrorsCallback();
                    }
                }
            };
            disableOrderExecutionCallback = function () {
                var that = $(this),
                    username = that.closest('tr').find('td.validationUserName').text(),
                    executionProvider = that.closest('tr').find('td.executionProvider:first').text(),
                    externalUsername = that.closest('tr').find('td.externalUsername:first').text();
                dataAccess.deleteOrderRoutingUser(username, executionProvider, externalUsername, function (response) {
                    deleteOrderRoutingUserCallback.call(that, response);
                });
            };
            shouldShowFixButton = function (errorMessages) {
                if (wantReadOnlyView) {
                    return false;
                }
                var result, message, i;
                result = true;
                for (i = 0; i < errorMessages.length; i += 1) {
                    message = errorMessages[i];
                    if (message.indexOf('The license type is not eligible for order execution.') !== -1) {
                        result = false;
                        break;
                    }
                }
                return result;
            };
            shouldShowMarketDataProviderSelect = function (errorMessages) {
                var result, message, i, executionProvider;
                result = true;
                for (i = 0; i < errorMessages.length; i += 1) {
                    message = errorMessages[i];
                    executionProvider = message.substring(message.indexOf('|') + 1, message.lastIndexOf('|'));
                    if (message.indexOf('MarketDataFeedProviderType') === -1 || executionProvider !== 'ICE') {
                        result = false;
                        break;
                    }
                }
                return result;
            };
            createESignalSubscriptionLimitSelect = function () {
                var eSignalSubscriptionLimitSelect = $('<select>').attr('id', 'eSignalSubscriptionLimitSelect'),
                    limits = [1000, 1500, 2000, 2500, 5000];
                limits.forEach(function (limit) {
                    var option;
                    option = $('<option>');
                    option.val(limit);
                    option.text(limit);
                    eSignalSubscriptionLimitSelect.append(option);
                });
                return eSignalSubscriptionLimitSelect;
            };
            createESignalEntry = function () {
                var eSignalEntry, eSignalUsernameEntry, eSignalPasswordEntry, subscriptionLabel;
                eSignalEntry = $('<div>').attr('id', 'eSignalEntry');
                subscriptionLabel = $('<span>').attr({ "id": "subscriptionLabel" }).text('Subscription limit: ');
                eSignalEntry.append(subscriptionLabel);
                eSignalEntry.append(createESignalSubscriptionLimitSelect());
                eSignalUsernameEntry = $('<input>').attr({ "id": "eSignalUsernameEntry", "type": "text", 'placeholder': 'username' }).addClass('styledSmall');
                eSignalEntry.append(eSignalUsernameEntry);
                eSignalPasswordEntry = $('<input>').attr({ "id": "eSignalPasswordEntry", "type": "text", 'placeholder': 'password' }).addClass('styledSmall'); ;
                eSignalEntry.append(eSignalPasswordEntry);
                return eSignalEntry;
            };
            createMarketDataProviderSelect = function () {
                var eSignalEntry,
                    select = $('<select>'),
                    noneOption = $('<option>').text('< none >'),
                    eSignalOption = $('<option>').text('eSignal'),
                    iceOption = $('<option>').text('ICE');
                select.addClass("chooseMarketDataProviderSelect");
                select.append(noneOption);
                select.append(eSignalOption);
                select.append(iceOption);
                select.bind('change', function () {
                    if ($(this).val() === 'eSignal') {
                        eSignalEntry = createESignalEntry();
                        select.after(eSignalEntry);
                        eSignalEntry.fadeIn('slow');
                        return;
                    }
                    eSignalEntry.fadeOut('slow', function () {
                        eSignalEntry.remove();
                    });
                });
                return select;
            };
            fixOrderRoutingUserCallback = function () {
                var callback, username, executionProvider, that, errorMessages, select, marketDataFeedProviderType,
                    eSignalSubscriptionLimit, eSignalUsername, eSignalPassword;
                select = $(this).parent().find('.chooseMarketDataProviderSelect');
                that = $(this);
                errorMessages = [];
                that.closest('tr.usernameValidationError').find("tr.validationError").find('td:first').each(function () {
                    errorMessages.push($(this).text());
                });
                username = that.closest('tr').find('td.validationUserName').text();
                executionProvider = $(this).closest('tr').find('td.executionProvider:first').text();
                callback = function (response) {
                    if (!response.Success) {
                        common.showToaster(that, response.Message, 0, 25, true, null, 2500);
                    } else {
                        common.showToaster(that, response.Message, 0, 25, false);
                        that.closest('tr').remove();
                    }
                };
                if (!select.val()) {
                    dataAccess.fixOrderRoutingUser(username, executionProvider, errorMessages, '', '', '', '', callback);
                    return;
                }
                marketDataFeedProviderType = select.val();
                if (marketDataFeedProviderType === '< none >') {
                    common.showToaster(that, "Please select a market data provider.", 0, 30, true);
                    return;
                }
                if (marketDataFeedProviderType === 'ICE') {
                    dataAccess.fixOrderRoutingUser(username, executionProvider, errorMessages, marketDataFeedProviderType, '', '', '', callback);
                    return;
                }
                if (marketDataFeedProviderType === 'eSignal') {
                    eSignalSubscriptionLimit = $('#eSignalSubscriptionLimitSelect').val(),
                    eSignalUsername = $('#eSignalUsernameEntry').val(),
                    eSignalPassword = $('#eSignalPasswordEntry').val();
                    if (!eSignalUsername || eSignalUsername.trim().length === 0 || !eSignalPassword || eSignalPassword.trim().length === 0) {
                        common.showToaster(that, "Both username and passsword are required.", 0, 25, true, null, 2500);
                        return;
                    }
                    dataAccess.fixOrderRoutingUser(username, executionProvider, errorMessages, marketDataFeedProviderType, eSignalSubscriptionLimit, eSignalUsername, eSignalPassword, callback);
                }
            };
            for (key in dictionary) {
                if (dictionary.hasOwnProperty(key)) {
                    errors = dictionary[key];
                    row = $('<tr/>');
                    row.addClass("usernameValidationError");
                    cell = $('<td/>');
                    cell.addClass("validationUserName");
                    cell.text(key);
                    row.append(cell);
                    cell = $('<td/>');
                    var deleteButton = common.createDeleteButton("Delete", disableOrderExecutionCallback);
                    if (!wantReadOnlyView) {
                        cell.append(deleteButton);
                    }
                    row.append(cell);
                    cell = $('<td/>');
                    if (shouldShowFixButton(errors)) {
                        if (shouldShowMarketDataProviderSelect(errors)) {
                            cell.append(createMarketDataProviderSelect());
                        }
                        cell.append(common.createImageButton('#fixImage', "Fix", fixOrderRoutingUserCallback));
                    }
                    row.append(cell);
                    cell = $('<td/>');
                    innerTable = $("<table/>");
                    errors.forEach(function (value) {
                        addDictionaryRow(innerTable, value);
                    });
                    cell.append(innerTable);
                    row.append(cell);
                    table.append(row);
                }
            }
            $("#validationErrorsTab").show();
        },
        createSummaryReport: function (userProviderCounts, orderRoutingUsersCount) {
            var sumaryContainer, label, key, text;
            text = "Users enabled for order routing :  ";
            for (key in userProviderCounts) {
                if (userProviderCounts.hasOwnProperty(key)) {
                    text += key + ":" + userProviderCounts[key] + "   ";
                }
            }
            text += "Total :  " + orderRoutingUsersCount;
            sumaryContainer = $('#summary');
            label = $('<label/>');
            label.text(text);
            sumaryContainer.append(label);
        },
        createExecutionUsersPerClearingFirmReport: function (clearingFirms) {
            var table, row, headerCell, div;
            table = $("#orderroutingclearingfirms > table");
            table.children().remove();
            row = $('<tr/>');
            row.addClass("header");
            headerCell = $('<th/>');
            headerCell.addClass('clearingFirmsFirmHeader');
            headerCell.text("Clearing Firm");
            row.append(headerCell);
            headerCell = $('<th/>');
            headerCell.addClass('clearingFirmsAccountHeader');
            div = $('<div/>');
            div.addClass("uname");
            div.text("Username");
            headerCell.append(div);
            div = $('<div/>');
            div.addClass("acctnum");
            div.text("FCM Account #");
            headerCell.append(div);
            row.append(headerCell);
            headerCell = $('<th/>');
            row.append(headerCell);
            table.append(row);
            clearingFirms.forEach(function (firm) {
                var cell, innerTable, innerRow, innerCell, innermostTable, innermostRow, innermostCell, span, prop;
                row = $('<tr/>');
                row.addClass("firmRow");
                cell = $('<td/>');
                cell.addClass("clearingFirmsFirm");
                cell.text(firm.Name);
                row.append(cell);
                cell = $('<td/>');
                innerTable = $("<table/>");
                for (prop in firm.AccountUserProviders) {
                    if (firm.AccountUserProviders.hasOwnProperty(prop)) {
                        innerRow = $('<tr/>');
                        innerRow.addClass("accountIdRow");
                        innerCell = $('<td/>');
                        innerCell.addClass("clearingFirmsUsernames");
                        innermostTable = $("<table/>");
                        firm.AccountUserProviders[prop].forEach(function (userProvider) {
                            innermostRow = $('<tr/>');
                            innermostCell = $('<td/>');
                            innermostCell.addClass('clearingFirmsUsernameProviderName');
                            span = $('<span/>');
                            span.addClass('clearingFirmsUsername');
                            span.text(userProvider.Key);
                            innermostCell.append(span);
                            span = $('<span/>');
                            span.addClass('clearingFirmsProviderName');
                            span.text("  [ " + userProvider.Value + " ]");
                            span.css({ 'color': getProviderColor(userProvider.Value), 'opacity': '0.4' });
                            innermostCell.append(span);
                            innermostRow.append(innermostCell);
                            innermostCell = $('<td/>');
                            innermostCell.addClass('clearingFirmsAccount');
                            innermostCell.text(prop);
                            innermostRow.append(innermostCell);
                            innermostTable.append(innermostRow);
                        });
                        innerCell.append(innermostTable);
                        innerRow.append(innerCell);
                        innerTable.append(innerRow);
                    }
                }
                cell.append(innerTable);
                row.append(cell);
                table.append(row);
            });
        }
    };
});