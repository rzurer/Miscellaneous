/*globals*/
"use strict";
define(["orderFillServiceManagementDataAccess", "orderReportFactory", "fillReportFactory", "htmlHelper"], function (dataAccess, orderReportFactory, fillReportFactory, htmlHelper) {
    var ordersReportContainer = $("#ordersReportContainer"),
        fillsReportContainer = $("#fillsReportContainer"),
        fillsTab = $("#fillsTab"),
        ordersTab = $("#ordersTab"),
        messagesDiv = $('#orderAndFillReportsMessages'),
        fillProvidersSelect = $('#fillProvidersSelect'),
        orderProvidersSelect = $('#orderProvidersSelect'),
        getSelectedFillProvider = function () {
            return fillProvidersSelect.val();
        },
        getSelectedOrderProvider = function () {
            return orderProvidersSelect.val();
        },
        displayFills = function () {
            var provider, fillReportTable,
                fillsCallback = function (response) {
                    if (!response.Success) {
                        messagesDiv.text(response.Payload || response.Message);
                        return;
                    }
                    fillReportTable = fillReportFactory.createFillReportTable(response.Payload);
                    fillsReportContainer.append(fillReportTable);
                    fillsReportContainer.show();
                };
            fillsReportContainer.hide();
            fillsReportContainer.empty();
            provider = getSelectedFillProvider();
            dataAccess.getFills(provider, fillsCallback);
        },
        displayOrders = function () {
            var provider, orderReportTable,
                ordersCallback = function (response) {
                    if (!response.Success) {
                        messagesDiv.text(response.Payload || response.Message);
                        return;
                    }
                    orderReportTable = orderReportFactory.createOrderReportTable(response.Payload);
                    ordersReportContainer.append(orderReportTable);
                    ordersReportContainer.show();
                };
            ordersReportContainer.hide();
            ordersReportContainer.empty();
            provider = getSelectedOrderProvider();
            dataAccess.getOrders(provider, ordersCallback);
        },
        assignEventHandlers = function () {
            fillsTab.click(navigate);
            ordersTab.click(navigate);
            fillProvidersSelect.change(displayFills);
            orderProvidersSelect.change(displayOrders);
        },
        initializeSelects = function (response) {
            htmlHelper.initializeSelect(fillProvidersSelect, "");
            htmlHelper.initializeSelect(orderProvidersSelect, "");
            if (response.Success && response.Payload) {
                response.Payload.forEach(function (element) {
                    fillProvidersSelect.append(htmlHelper.createOption(element.Value, element.Key));
                });
            }
            ["CTS", "CQG", "ICE"].forEach(function (element) {
                orderProvidersSelect.append(htmlHelper.createOption(element, element));
            });
        },
        selectFillsTab = function () {
            fillsTab.css({
                "background-color": "rgb(233, 231, 231)",
                "color": "black",
                "font-weight": "bold"
            });
            ordersTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            orderProvidersSelect.hide();
            fillProvidersSelect.show();
        },
        selectOrdersTab = function () {
            ordersTab.css({
                "background-color": "rgb(233, 231, 231)",
                "color": "black",
                "font-weight": "bold"
            });
            fillsTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            fillProvidersSelect.hide();
            orderProvidersSelect.show();
        },
        showOrdersView = function () {
            ordersReportContainer.show();
            fillsReportContainer.hide();
            selectOrdersTab();
        },
        showFillsView = function () {
            fillsReportContainer.show();
            ordersReportContainer.hide();
            selectFillsTab();
        },
        navigate = function () {
            if (this.id === 'ordersTab') {
                showOrdersView();
                return;
            }
            if (this.id === 'fillsTab') {
                showFillsView();
                return;
            }
        };
    return {
        initialize: function () {
            var callback = function (response) {
                initializeSelects(response);
                assignEventHandlers();
                selectFillsTab();
            };
            dataAccess.getOrderFillServiceProvidersWithTradeEntrySource(callback);
        }
    };
});