/*globals*/
"use strict";
define(["htmlHelper", "common"], function ( htmlHelper, common) {
    var showErrorMessage = function (message, parent) {
            var width = 500,
                errorContainer = $("#orderFillErrorContainer"),
                top = parent.position().top + 'px',
                left = parent.position().left - (width + 10) + 'px',
                css = { "top": top, "left": left, "width": width + 'px' };
            errorContainer.css(css);
            errorContainer.append(htmlHelper.createContainer(message));
        },
        hideErrorMessage = function () {
            $("#orderFillErrorContainer").empty();
        },
        appendStatusIndicator = function (success, parent, error) {
            var image;
            if (success) {
                image = $("#orderSuccessImage").clone();
                parent.append(image);
                return;
            }
            image = $("#orderFailureImage").clone();
            image.hover(function () {
                showErrorMessage(error, image);
            }, hideErrorMessage);
            parent.append(image);
        },
        createOrderReportRow = function (order) {
            var row;
            row = htmlHelper.createRow();
            common.setSimpleRowHover(row);
            htmlHelper.appendCell(row, order.Time);
            htmlHelper.appendCell(row, order.AutoID);
            htmlHelper.appendCell(row, order.InternalAccount);
            htmlHelper.appendCell(row, order.Product);
            htmlHelper.appendCell(row, order.FuturesMonthYear);
            htmlHelper.appendCell(row, order.BuySell);
            htmlHelper.appendCell(row, order.StrikePrice);
            htmlHelper.appendCell(row, order.LegType);
            htmlHelper.appendCell(row, order.Quantity);
            htmlHelper.appendCell(row, order.Price);
            htmlHelper.appendCell(row, order.ExternalAccount);
            htmlHelper.appendCell(row, order.OrderID);
            appendStatusIndicator(order.StatusID, htmlHelper.appendCell(row, ""), order.StatusMessage);
            return row;
        },
        createOrderReportHeaderRow = function () {
            var row;
            row = htmlHelper.createRow();
            htmlHelper.appendCell(row, "TIME", 130, true);
            htmlHelper.appendCell(row, "AUTOID", 40, true);
            htmlHelper.appendCell(row, "ACCOUNT", 80, true);
            htmlHelper.appendCell(row, "PROD", 60, true);
            htmlHelper.appendCell(row, "CNTRCT", 60, true);
            htmlHelper.appendCell(row, "DIR", 35, true);
            htmlHelper.appendCell(row, "STRIKE", 80, true);
            htmlHelper.appendCell(row, "LEG", 40, true);
            htmlHelper.appendCell(row, "QNTY", 40, true);
            htmlHelper.appendCell(row, "PRICE", 50, true);
            htmlHelper.appendCell(row, "EXTACCT", 80, true);
            htmlHelper.appendCell(row, "ORDERID", 270, true);
            htmlHelper.appendCell(row, "ST", 20, true);
            return row;
        };
    return {
        createOrderReportTable : function (orders) {
            var table = htmlHelper.createTable("orderFillReport");
            table.append(createOrderReportHeaderRow());
            orders.forEach(function (order) {
                table.append(createOrderReportRow(order));
            });
            return table;
        },
    };
});