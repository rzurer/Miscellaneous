/*globals $, console*/
"use strict";
define(['common'], function (common) {
    var getTradersSelect = function () {
        return $("#tradersSelect");
    },
        getDeleteRadioButtonsContainer = function () {
            return $("#deleteRadioButtonsContainer");
        },
        getExecutingBrokersContainer = function () {
            return $("#executingBrokersContainer");
        },
        getDeleteOne = function () {
            return $("#deleteOne");
        },
        getDeleteAll = function () {
            return $("#deleteAll");
        },
        getConfirmDialog = function () {
            return $("#confirmDialog");
        },
        getDeleteAllButton = function () {
            return $("#deleteAllButton");
        },
        getTrader = function () {
            return getTradersSelect().val();
        },
        getExecutingBrokersTable = function () {
            return $("#executingBrokers");
        },
        fillTradersArray = function (select) {
            var traders, url, callback;
            url = 'GetTradersWithExecutingBrokers';
            traders = [];
            callback = function (response) {
                response.Payload.forEach(function (element) {
                    traders.push(element);
                });
                common.populateSelect(select, traders);
                coordinateControls();
            };
            common.postFunction(url, null, callback);
        },
        deleteExternalBrokerCallback = function (parent, row, trader, executingBroker) {
            var url, data, callback;
            url = 'DeleteExecutingBrokerForTrader';
            data = { trader: trader, executingBroker: executingBroker };
            callback = function (response) {
                var text;
                text = response.Message;
                if (!response.Success) {
                    common.showToaster(parent, text, 0, 150, true, null, -1);
                    return;
                }
                common.showToaster(parent, text, 0, 150, false);
                row.remove();
                var result = getExecutingBrokersTable().find('.externalBrokerRow');
                if (result.length === 0) {
                    fillTradersArray(getTradersSelect());
                }
            };
            common.postFunction(url, data, callback);
        },
        deleteAllExternalBrokersCallback = function (parent, trader) {
            var url, data, callback;
            url = 'DeleteAllExecutingBrokersForTrader';
            data = { trader: trader };
            callback = function (response) {
                var text;
                text = response.Message;
                if (!response.Success) {
                    common.showToaster(parent, text, 0, 150, true, null, -1);
                    return;
                }
                common.showToaster(parent, text, 0, 150, false);
                fillTradersArray(getTradersSelect());
                getExecutingBrokersTable().find('tr').remove();
                showHideDeleteAllButton();
                getDeleteOne().attr('checked', "checked");
            };
            common.postFunction(url, data, callback);
        },
        showHideDeleteAllButton = function () {
            var trader = getTrader();
            if (trader !== common.nonePlaceholder && trader.length > 0 && getDeleteAll().is(':checked')) {
                getDeleteAllButton().show();
            } else {
                getDeleteAllButton().hide();
            }
        },
        deleteOneCallback = function (trader, executingBroker, row, top, left) {
            var message, title, proceed;
            message = "Delete the external broker '" + executingBroker + "' for the trader '" + trader + "' ?";
            title = "Delete external broker";
            proceed = function () {
                deleteExternalBrokerCallback(getTradersSelect(), row, trader, executingBroker);
            };
            common.confirmDialog(getConfirmDialog(), message, title, top, left, proceed);
        },
        deleteAllCallback = function (e) {
            var message, title, top, left, proceed, trader;
            trader = getTrader();
            top = e.pageY;
            left = e.pageX;
            proceed = function () {
                deleteAllExternalBrokersCallback(getDeleteAllButton(), trader);
            };
            title = "Delete all executing brokers";
            message = "Delete all executing brokers for the trader '" + trader + "' ?";
            common.confirmDialog(getConfirmDialog(), message, title, top, left, proceed);
            return false;
        },
        getExecutingBrokersForTrader = function () {
            var trader, url, data, callback, wantDeleteOne;
            wantDeleteOne = getDeleteOne().is(':checked');
            trader = getTrader();
            showHideDeleteAllButton();
            if (trader !== common.nonePlaceholder && trader.length > 0) {
                getExecutingBrokersTable().find('tr').remove();
                if (trader.length > 0) {
                    url = 'GetExecutingBrokersForTrader';
                    data = { trader: trader };
                    callback = function (response) {
                        response.Payload.forEach(function (executingBroker) {
                            var deleteCallback,
                                externalBrokerRow = $("<tr/>"),
                                externalBrokerCell = $("<td/>").text(executingBroker),
                                deleteButtonCell = $("<td/>");
                            externalBrokerRow.addClass('externalBrokerRow');
                            externalBrokerCell.addClass('externalBrokerCell');
                            deleteButtonCell.addClass('deleteButtonCell');
                            externalBrokerRow.append(externalBrokerCell);
                            if (wantDeleteOne) {
                                externalBrokerRow.append(deleteButtonCell);
                                deleteCallback = function (e) {
                                    deleteOneCallback(trader, executingBroker, externalBrokerRow, e.pageY, e.pageX);
                                };
                                common.setRowHover(externalBrokerRow, "Delete the external broker '" + executingBroker + "'", deleteCallback);
                            }
                            getExecutingBrokersTable().append(externalBrokerRow);
                        });
                    };
                    common.postFunction(url, data, callback);
                    return;
                }
            }
        },
        coordinateControls = function () {
            if (getTrader() !== common.nonePlaceholder) {
                common.enableControl(getDeleteRadioButtonsContainer());
                getDeleteRadioButtonsContainer().removeAttr("disabled");
                common.enableControl(getExecutingBrokersContainer());
                getExecutingBrokersContainer().removeAttr("disabled");
                getDeleteOne().removeAttr("disabled");
                getDeleteAll().removeAttr("disabled");
                return;
            }
            common.disableControl(getDeleteRadioButtonsContainer());
            getDeleteRadioButtonsContainer().attr("disabled", "disabled");
            common.disableControl(getExecutingBrokersContainer());
            getExecutingBrokersContainer().attr("disabled", "disabled");

            getDeleteOne().attr("disabled", "disabled");
            getDeleteAll().attr("disabled", "disabled");

        },
        traderSelectChange = function () {
            coordinateControls();
            if (getTrader() !== common.nonePlaceholder) {
                getExecutingBrokersForTrader();
            }
        };
    return {
        initialize: function () {
            common.trapEnterKey($('form'));
            getTradersSelect().change(traderSelectChange);
            common.disableControl(getDeleteRadioButtonsContainer());
            getDeleteRadioButtonsContainer().attr("disabled", "disabled");
            common.disableControl(getExecutingBrokersContainer());
            getExecutingBrokersContainer().attr("disabled", "disabled");
            getDeleteAllButton().hide();
            getDeleteAllButton().click(deleteAllCallback);
            getDeleteOne().attr('checked', "checked");
            getDeleteOne().attr("disabled", "disabled");
            getDeleteOne().click(function () {
                getDeleteAllButton().hide();
                getExecutingBrokersForTrader();
            });
            getDeleteAll().attr("disabled", "disabled");
            getDeleteAll().click(function () {
                getDeleteAllButton().show();
                showHideDeleteAllButton();
                getExecutingBrokersForTrader();
            });
            fillTradersArray(getTradersSelect());
        }
    };
});