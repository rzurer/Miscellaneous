/*globals $, define, console */
"use strict";
define(['common', 'liveMarketsPricingDataAccess'], function (common, dataAccess) {
    var getLiveMarketsPricingTable = function () {
        return $('#liveMarketsPricingStatusesTable');
    },
        getliveMarketsPricingStatusesContainer = function () {
            return $('#liveMarketsPricingStatusesContainer');
        },
        getAutoCompleteContainer = function () {
            return $('#disabledLmpUsersContainer');
        },
        separateLiveMarketsPricingUsers = function (liveMarketsPricingUsers) {
            var disabledUsers, enabledUsers;
            disabledUsers = [];
            enabledUsers = [];
            liveMarketsPricingUsers.forEach(function (liveMarketsPricingUser) {
                if (liveMarketsPricingUser.LiveMarketsPricingShouldBeStarted) {
                    enabledUsers.push(liveMarketsPricingUser);
                    return;
                }
                disabledUsers.push(liveMarketsPricingUser);
            });
            return {
                lmpDisabledUsers: disabledUsers,
                lmpEnabledUsers: enabledUsers
            };
        },
        doInitialize = function (response) {
            if (!response.Success) {
                var parent = getLiveMarketsPricingTable();
                common.showToaster(parent, response.Message, 0, 25, true, null, -1);
                return;
            }
            createLiveMarketsPricingStatusesReport(response.Payload);
        },
        updateLiveMarketsPricingForUserButtonClick = function (caller, username, enabled) {
            var callback;
            callback = function (response) {
                if (!response.Success) {
                    common.showToaster(caller, response.Message, 0, 25, true, null, -1);
                    return false;
                }
                common.showToaster(caller, response.Payload, 0, 25, false);
                dataAccess.getLiveMarketsPricingStatuses(doInitialize);
                return false;
            };
            dataAccess.updateLiveMarketsPricingForUser(username, enabled, callback);
            return false;
        },
        disableLmpButtonClick = function () {
            var username;
            username = $(this).parent('td').prev('td').prev('.lmpUsernameCell').text();
            updateLiveMarketsPricingForUserButtonClick(this, username, false);
            return false;
        },
        createDisableLmpButton = function () {
            var disableLmpButton;
            disableLmpButton = $('#disableLmpImage').clone();
            disableLmpButton.attr('title', "Disable this user from using live markets pricing");
            disableLmpButton.click(function () {
                disableLmpButtonClick.apply(disableLmpButton);
            });
            return disableLmpButton;
        },
        fillLiveMarketsPricingUserRow = function (row, user, hideRightBorder) {
            var cell;
            cell = $('<td/>');
            cell.text(user.Username);
            cell.addClass("lmpUsernameCell");

            row.append(cell);
            cell = $('<td/>');
            cell.text(user.LicenseType);
            cell.addClass("lmpLicenseCell");
            row.append(cell);

            cell = $('<td/>');
            cell.append(createDisableLmpButton());
            if (!hideRightBorder) {
                cell.addClass("disableLmpButtonCell");
            }
            row.append(cell);
            cell = $('<td/>');
            cell.addClass("spacerCell");
            row.append(cell);
        },
        populateLiveMarketsPricingStatusesTable = function (table, liveMarketsPricingUsers) {
            var row, user, i;
            for (i = 0; i < liveMarketsPricingUsers.length; i += 3) {
                user = liveMarketsPricingUsers[i];
                if (!user) {
                    return;
                }
                row = $('<tr/>');
                fillLiveMarketsPricingUserRow(row, user);
                user = liveMarketsPricingUsers[i + 1];
                if (!user) {
                    table.append(row);
                    return;
                }
                fillLiveMarketsPricingUserRow(row, user);
                user = liveMarketsPricingUsers[i + 2];
                if (!user) {
                    table.append(row);
                    return;
                }
                fillLiveMarketsPricingUserRow(row, user, true);
                table.append(row);
            }
        },
        createLiveMarketsPricingStatusesReport = function (liveMarketsPricingUser) {
            var table, arrays, summary, lmpDisabledUsers, container, autoCompleteContainer, message;
            arrays = separateLiveMarketsPricingUsers(liveMarketsPricingUser);
            lmpDisabledUsers = arrays.lmpDisabledUsers.map(function (item) {
                return item.Username;
            });
            container = getliveMarketsPricingStatusesContainer();
            autoCompleteContainer = getAutoCompleteContainer();
            container.children('.lmpUsersSummaryContainer').remove();
            message = "Total number of users enabled with live markets pricing: " + arrays.lmpEnabledUsers.length;
            summary = $('<div/>').addClass('lmpUsersSummaryContainer').text(message);
            autoCompleteContainer.before(summary);
            createDisabledLmpUsersAutocomplete(lmpDisabledUsers, arrays.lmpEnabledUsers.length);
            table = getLiveMarketsPricingTable();
            table.find('tr').remove();
            populateLiveMarketsPricingStatusesTable(table, arrays.lmpEnabledUsers);
        },
        createReadOnlyLiveMarketsPricingStatusesReport = function (users) {
            var table, summary, message, container, i, user, row, cell;
            table = getLiveMarketsPricingTable();
            message = "Total number of users enabled with live markets pricing: " + users.length;
            summary = $('<div/>').addClass('lmpUsersSummaryContainer').text(message);
            container = getliveMarketsPricingStatusesContainer();
            container.children('.lmpUsersSummaryContainer').remove();
            table.before(summary);
            table.find('tr').remove();
            for (i = 0; i < users.length; i += 3) {
                user = users[i];
                if (!user) {
                    return;
                }
                row = $('<tr/>');
                cell = $('<td/>');
                cell.text(user);
                cell.addClass("readonlyLmpCell");
                row.append(cell);
                user = users[i + 1];
                if (!user) {
                    table.append(row);
                    return;
                }
                cell = $('<td/>');
                cell.text(user);
                cell.addClass("readonlyLmpCell");
                row.append(cell);
                user = users[i + 2];
                if (!user) {
                    table.append(row);
                    return;
                }
                cell = $('<td/>');
                cell.text(user);
                cell.addClass("readonlyLmpCell");
                row.append(cell);
                table.append(row);
            }
        },
        doReadOnlyInitialize = function (response) {
            if (!response.Success) {
                var parent = getLiveMarketsPricingTable();
                common.showToaster(parent, response.Message, 0, 25, true, null, -1);
                return;
            }
            createReadOnlyLiveMarketsPricingStatusesReport(response.Payload);
        },
        enableLmpButtonClick = function () {
            var username;
            username = $('.lmpUsersAutocomplete').val();
            updateLiveMarketsPricingForUserButtonClick(this, username, true);
            return false;
        },
        createAndFillDisabledLmpUsersAutocomplete = function (disabledLmpUsers, button) {
            var autocomplete;
            autocomplete = $('<input/>').attr('type', 'text').addClass('lmpUsersAutocomplete');
            autocomplete.blur(function () {
                var itemExists = common.verifyItemExists(autocomplete, null, -1, 160);
                if (itemExists && autocomplete.val().trim().length > 0) {
                    button.unbind('click');
                    button.click(function () {
                        enableLmpButtonClick.apply(button);
                    });
                    common.enableControl(button);
                    return false;
                }
                common.disableControls([button]);
                return false;
            });
            autocomplete.keyup(function () {
                common.verifyItemExists(autocomplete, null, -5, 160);
                return false;
            });
            common.setAutocomplete(autocomplete, 2, disabledLmpUsers, null, true, true);
            return autocomplete;
        },
        createDisabledLmpUsersAutocomplete = function (disabledLmpUsers) {
            var autoCompleteContainer, enableLmpButton, autocomplete, pageTitleContainer;
            autoCompleteContainer = getAutoCompleteContainer();
            autoCompleteContainer.children().remove();
            pageTitleContainer = $("<div/>").attr('id', 'pageTitleContainer').text('Select a user to be enabled with live markets pricing');
            enableLmpButton = $('#enableLmpImage').clone();
            enableLmpButton.attr('title', "Enable a user with live markets pricing");
            autocomplete = createAndFillDisabledLmpUsersAutocomplete(disabledLmpUsers, enableLmpButton);
            common.disableControl(enableLmpButton);
            autoCompleteContainer.append(pageTitleContainer);
            autoCompleteContainer.append(autocomplete);
            autoCompleteContainer.append(enableLmpButton);
        };
    return {
        initialize: function () {
            common.trapEnterKey($('form'));
            dataAccess.getLiveMarketsPricingStatuses(doInitialize);
        },
        initializeReadOnly: function () {
            dataAccess.getUsersEnabledWithLiveMarketPricing(doReadOnlyInitialize);
        }
    };
});