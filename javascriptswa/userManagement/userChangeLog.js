/*globals console, $, define*/
define(['htmlHelper', 'common'], function (htmlHelper, common) {
    "use strict";
    var eventListener,
        userChangeLogToaster = $('#userChangeLogToaster'),
        userChangeLogFilterContainer = $('#userChangeLogFilterContainer'),
        userChangeLogTableContainer = $("#userChangeLogTableContainer"),
        userChangeLogContainer = $("#userChangeLogContainer"),
        userChangeLog = $("#userChangeLog"),
        openImage = $('#openImage'),
        closeImage = $('#closeImage'),
        oneDayButton = $("#oneDayButton"),
        oneWeekButton = $("#oneWeekButton"),
        oneMonthButton = $("#oneMonthButton"),
        threeMonthButton = $("#threeMonthButton"),
        userChangeLogUsersSelect = $('#userChangeLogUsersSelect'),
        createUserChangeLogHeaderRow = function () {
            var row;
            row = htmlHelper.createRow('userChangeLogHeaderRow', true);
            htmlHelper.appendCell(row, "When", '', true);
            htmlHelper.appendCell(row, "Who", '', true);
            htmlHelper.appendCell(row, "What", '', true);
            htmlHelper.appendCell(row, "Change", '', true);
            htmlHelper.appendCell(row, "By Whom", '', true);
            return row;
        },
        daysBack = 1,
        getPropertyDisplayName = function (propertyName) {
            switch (propertyName) {
                case "CancellationReason":
                    return 'Cancellation Reason';
                case "LicenseComment":
                    return 'Comment';
                case "LicenseExpiration":
                    return 'License Expiration';
                case "LicenseType":
                    return 'License Type';
                case "MarketDataFeedPassword":
                    return 'RTF Password';
                case "MarketDataFeedProviderType":
                    return 'RTF Provider';
                case "MarketDataFeedProxyAddress":
                    return 'RTF Proxy Address';
                case "MarketDataFeedProxyPassword":
                    return 'RTF Proxy Password';
                case "MarketDataFeedProxyPort":
                    return 'RTF Proxy Port';
                case "MarketDataFeedProxyUserName":
                    return 'MarketDataFeedProxyUserName';
                case "MarketDataFeedSubscriptionLimit":
                    return 'RTF Subscription Limit';
                case "MarketDataFeedUserName":
                    return 'RTF Username';
                case "UserScreenSheets":
                    return 'Screen Sheets';
                case "UserBasicFutureSetups":
                    return 'Future Setups';
                case "UserBasicOptionSetups":
                    return 'Option Setups';
                case "UserFutures":
                    return 'Futures';
                case "UserOptions":
                    return 'Options';
                case "ValuationServiceAccounts":
                    return 'Valuation Service Accounts';
                default:
                    return propertyName;
            }
        },
        getPropertyChangeTable = function (existingValue, updatedValue) {
            var table, row, cell, span;
            table = htmlHelper.createTable('propertyChangeTable');
            row = htmlHelper.createRow();
            cell = htmlHelper.appendCell(row);
            span = $('<span>').addClass('oldValue');
            cell.append(span);
            htmlHelper.truncateAndShow(existingValue || '[none]', 20, span, userChangeLogToaster, 'userChangeLogToaster', true);
            htmlHelper.appendCell(row, ' ==> ');
            cell = htmlHelper.appendCell(row);
            span = $('<span>').addClass('newValue');
            cell.append(span);
            htmlHelper.truncateAndShow(updatedValue || '[none]', 20, span, userChangeLogToaster, 'userChangeLogToaster', true);
            table.append(row);
            return table;
        },
        toggleProductTable = function (id) {
            var target, that;
            target = $('#' + id);
            that = $(this);
            if (target.is(':visible')) {
                target.fadeOut();
                $(this).empty();
                $(this).append(openImage.clone());
                return;
            }
            $('.productArrayTable').css('position', 'static');
            $('.productArrayTable').hide();
            target.css({ position: 'absolute', top: ($(this).position().top - 10) + 'px', left: ($(this).position().left + 40) + 'px' });
            target.fadeIn();
            $('.toggleInnerTableButton').empty();
            $('.toggleInnerTableButton').append(openImage.clone());
            $(this).empty();
            $(this).append(closeImage.clone());
            target.off('click');
            target.on('click', function () {
                that.empty();
                that.append(openImage.clone());
                $(this).hide();
            });
        },
        appendAddedCell = function (row, addedArray, rowCount) {
            var cell, arrayLength, div, id, innerTable, span;
            arrayLength = addedArray.length;
            cell = htmlHelper.appendCell(row, 'Added: [' + arrayLength + ']', '', false, 'oldValue');
            if (arrayLength > 0) {
                div = $('<div>').addClass('productArrayTable');
                id = common.getUniqueTime();
                div.attr('id', id);
                innerTable = htmlHelper.createFixedColumnsTable(addedArray, Math.min(arrayLength, rowCount));
                div.append(innerTable);
                div.hide();
                userChangeLogTableContainer.append(div);
                span = $('<span>').addClass('toggleInnerTableButton').append(openImage.clone());
                cell.append(span);
                span.on("click", function () {
                    toggleProductTable.apply(this, [id]);
                });
            }
        },
        appendRemovedCell = function (row, removedArray, rowCount) {
            var cell, arrayLength, div, id, innerTable, span;
            arrayLength = removedArray.length;
            cell = htmlHelper.appendCell(row, 'Removed: [' + arrayLength + ']', '', false, 'newValue');
            if (arrayLength > 0) {
                div = $('<div>').addClass('productArrayTable');
                id = common.getUniqueTime();
                div.attr('id', id);
                innerTable = htmlHelper.createFixedColumnsTable(removedArray, Math.min(arrayLength, rowCount));
                div.append(innerTable);
                div.hide();
                userChangeLogTableContainer.append(div);
                span = $('<span>').addClass('toggleInnerTableButton').append(openImage.clone());
                cell.append(span);
                span.on("click", function () {
                    toggleProductTable.apply(this, [id]);
                });
            }
        },
        getArrayPropertyChangeTable = function (added, removed, rowCount) {
            var table, row, addedArray, removedArray;
            table = htmlHelper.createTable('arrayPropertyChangeTable');
            row = htmlHelper.createRow();
            addedArray = added || [];
            appendAddedCell(row, addedArray, rowCount);
            removedArray = removed || [];
            appendRemovedCell(row, removedArray, rowCount);
            table.append(row);
            return table;
        },
        createScreenSheetsArray = function (screenSheets) {
            if (!screenSheets) {
                return [];
            }
            return screenSheets.map(function (screenSheet) {
                return "Option:\xA0" + screenSheet.CommodityCode + '\xA0\xA0S\xA0Sheet:\xA0' + screenSheet.SheetName + '\xA0\xA0S\xA0Copied From:\xA0' + screenSheet.CopyFromUser + '\xA0\xA0';
            });
        },
        createValuationAccountsArray = function (valuationAccounts) {
            if (!valuationAccounts) {
                return [];
            }
            return valuationAccounts.map(function (valuationAccount) {
                return "Partner:\xA0" + valuationAccount.SessionOwner + '\xA0\xA0\xA0Session:\xA0' + valuationAccount.SourceSession + '\xA0\xA0S\xA0External Username:\xA0' + valuationAccount.ExternalUsername + '\xA0\xA0';
            });
        },
        appendPropertyChangeTable = function (updateDate, cell, propertyName, property) {
            var existing, updated, added, removed;
            existing = property.Item1;
            updated = property.Item2;
            switch (propertyName) {
                case "UserScreenSheets":
                    cell.append(getArrayPropertyChangeTable(createScreenSheetsArray(existing), createScreenSheetsArray(updated), 1));
                    break;
                case "ValuationServiceAccounts":
                    cell.append(getArrayPropertyChangeTable(createValuationAccountsArray(existing), createValuationAccountsArray(updated), 1));
                    break;
                case "UserBasicFutureSetups":
                case "UserBasicOptionSetups":
                case "UserFutures":
                case "UserOptions":
                    added = existing;
                    removed = updated;
                    cell.append(getArrayPropertyChangeTable(added, removed, 10));
                    break;
                default:
                    cell.append(getPropertyChangeTable(existing, updated, 10));
                    break;
            }
        },
        createUserChangeLogRow = function (updateDate, username, propertyName, property, updatedBy) {
            var row, cell;
            row = htmlHelper.createRow('userChangeLogRow');
            htmlHelper.appendCell(row, updateDate);
            htmlHelper.appendCell(row, username, '', false, 'userChangeLogUsername');
            htmlHelper.appendCell(row, getPropertyDisplayName(propertyName), '', false, 'userChangeLogPropertyName');
            cell = htmlHelper.appendCell(row);
            appendPropertyChangeTable(updateDate, cell, propertyName, property);
            htmlHelper.appendCell(row, updatedBy, '', false, 'userChangeLogUpdatedBy');
            return row;
        },
        getPropertyDictionary = function (log) {
            var information, propertyNames, property, propertyDictionary;
            propertyDictionary = {};
            information = JSON.parse(log.Information);
            propertyNames = common.getPropertiesArray(information);
            propertyNames.forEach(function (propertyName) {
                property = information[propertyName];
                if (property) {
                    propertyDictionary[propertyName] = property;
                }
            });
            return propertyDictionary;
        },
        createUserChangeLogTable = function (logs) {
            var table, updateDate, username, updatedBy, propertyDictionary, propertyName;
            table = htmlHelper.createTable('userChangeLogTable');
            table.append(createUserChangeLogHeaderRow());
            logs.forEach(function (log) {
                updateDate = log.UpdateDate;
                username = log.Username;
                updatedBy = log.UpdatedBy;
                propertyDictionary = getPropertyDictionary(log);
                for (propertyName in propertyDictionary) {
                    table.append(createUserChangeLogRow(updateDate, username, propertyName, propertyDictionary[propertyName], updatedBy));
                }
            });
            return table;
        },
        getUserName = function () {
            return userChangeLogUsersSelect.val();
        },
        setUserChangeLogButtons = function () {
            $('.userChangeLogButton').removeClass('userChangeLogButtonSelected');
            switch (daysBack) {
                case 1:
                    oneDayButton.addClass("userChangeLogButtonSelected");
                    break;
                case 7:
                    oneWeekButton.addClass("userChangeLogButtonSelected");
                    break;
                case 30:
                    oneMonthButton.addClass("userChangeLogButtonSelected");
                    break;
                case 90:
                    threeMonthButton.addClass("userChangeLogButtonSelected");
                    break;
                default:
                    oneDayButton.addClass("userChangeLogButtonSelected");
                    break;
            }
        },
        getUserChangeLogs = function (e) {
            var userName;
            userName = getUserName();
            daysBack = e.data.getDaysBack();
            setUserChangeLogButtons();
            eventListener.fire("RetrieveUserChangeLogs", [daysBack, userName]);
        },
        displayLog = function (logs) {
            userChangeLogTableContainer.empty();
            userChangeLogTableContainer.append(createUserChangeLogTable(logs));
            userChangeLog.show();
            userChangeLogContainer.slideDown('slow');
        },
        assignEventHandlers = function () {
            oneDayButton.off('click');
            oneWeekButton.off('click');
            oneMonthButton.off('click');
            threeMonthButton.off('click');
            oneDayButton.on('click', '', { getDaysBack: function () { return 1; } }, getUserChangeLogs);
            oneWeekButton.on('click', '', { getDaysBack: function () { return 7; } }, getUserChangeLogs);
            oneMonthButton.on('click', '', { getDaysBack: function () { return 30; } }, getUserChangeLogs);
            threeMonthButton.on('click', '', { getDaysBack: function () { return 90; } }, getUserChangeLogs);
            userChangeLogUsersSelect.off('change', getUserChangeLogs);
            userChangeLogUsersSelect.on('change', { getDaysBack: function () { return daysBack; } }, getUserChangeLogs);
        },
        initializeControls = function () {
            var callback = function (usernames) {
                htmlHelper.fillSelectFromList(userChangeLogUsersSelect, "", usernames);
            };
            assignEventHandlers();
            userChangeLogFilterContainer.show();
            eventListener.fire('GetUserChangeLogUsernames', [callback]);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("ShowUserChangeLog", displayLog);
            eventListener.addListener("ShowUserChangeLog", displayLog);
        };
    return {
        initializeEventListener: initializeEventListener,
        initializeControls: initializeControls
    };
});
