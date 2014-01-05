/*globals $, define, console*/
"use strict";
define(['common', 'htmlHelper', 'configurationDataAccess'], function (common, htmlHelper, dataAccess) {
    var unselectedTraderValue = "< select >",
        tradersSelect = $('#tradersSelect'),
        enabledUsersContainer = $('#enabledUsersContainer'),
        errorLabel = $('#errorLabel'),
        enableDisableExcelRTDServerButton = $("#enableDisableExcelRTDServerButton"),
        getSelectedTrader = function () {
            if (unselectedTraderValue === tradersSelect.val()) {
                return '';
            }
            return tradersSelect.val();
        },
        fillTradersSelect = function (response) {
            if (!response.Success) {
                errorLabel.text(response.Message);
                return;
            }
            htmlHelper.fillSelectFromList(tradersSelect, "Choose Trader", response.Payload, unselectedTraderValue);
        },
        displayEnabledUsers = function () {
            var enabledUsersTable;
            dataAccess.getEnabledUsers(function (response) {
                var enabledUsers;
                if (!response.Success) {
                    errorLabel.text(response.Message);
                    return;
                }
                enabledUsers = response.Payload;
                enabledUsersContainer.empty();
                enabledUsersContainer.append(enabledUsersTable = htmlHelper.createFixedColumnsTable(enabledUsers, 5, 'enabledUsersTable'));
            });
        },
        setToInitial = function () {
            tradersSelect.get(0).selectedIndex = 0;
            enableDisableExcelRTDServerButton.hide();
            displayEnabledUsers();
        },
        enableExcelRTDServer = function () {
            var selectedTrader = getSelectedTrader();
            dataAccess.enableOrDisableTraderWithExcelRTDServer(true, selectedTrader, setToInitial);
        },
        disableExcelRTDServer = function () {
            var selectedTrader = getSelectedTrader();
            dataAccess.enableOrDisableTraderWithExcelRTDServer(false, selectedTrader, setToInitial);
        },
        showExcelRTDServerButton = function (isEnabled) {
            var clickHandler, buttonText;
            buttonText = isEnabled ? "Disable" : "Enable";
            enableDisableExcelRTDServerButton.unbind("click");
            clickHandler = isEnabled ? disableExcelRTDServer : enableExcelRTDServer;
            enableDisableExcelRTDServerButton.bind("click", clickHandler);
            enableDisableExcelRTDServerButton.show();
            enableDisableExcelRTDServerButton.text(buttonText);
        },
        assignEventHandlers = function () {
            var callback = function (isEnabled) {
                showExcelRTDServerButton(isEnabled);
            };
            tradersSelect.change(function () {
                var trader = getSelectedTrader();
                if (!trader) {
                    enableDisableExcelRTDServerButton.hide();
                    return;
                }
                dataAccess.traderIsEnabledToUseExcelRTDServer(trader, callback);
            });
        },
        initializeTradersSelect = function () {
            dataAccess.getUsernames(fillTradersSelect);
            displayEnabledUsers();
        };
    return {
        initialize: function () {
            initializeTradersSelect();
            assignEventHandlers();
        },
        initializeReadOnly: function () {
            displayEnabledUsers();
        }
    };
});