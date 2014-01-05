/*globals*/
"use strict";
define(["htmlHelper", "common"], function ( htmlHelper, common) {
    var createFillReportRow = function (fill) {
            var row;
            row = htmlHelper.createRow();
            common.setSimpleRowHover(row);
            htmlHelper.appendCell(row, fill.Time);
            htmlHelper.appendCell(row, fill.AutoID);
            htmlHelper.appendCell(row, fill.InternalAccount);
            htmlHelper.appendCell(row, fill.Product);
            htmlHelper.appendCell(row, fill.FuturesMonthYear);
            htmlHelper.appendCell(row, fill.StrikePrice);
            htmlHelper.appendCell(row, fill.LegType);
            htmlHelper.appendCell(row, fill.Quantity);
            htmlHelper.appendCell(row, fill.Price);
            htmlHelper.appendCell(row, fill.ExternalAccount);
            htmlHelper.appendCell(row, fill.ClientTradeID);
            htmlHelper.appendCell(row, fill.ClientTradeLegID);
            htmlHelper.appendCell(row, fill.OriginalID);
            htmlHelper.appendCell(row, fill.LineDeleted);
            return row;
        },
        
        createFillReportHeaderRow = function () {
            var row;
            row = htmlHelper.createRow();
            htmlHelper.appendCell(row, "TIME", 130, true);
            htmlHelper.appendCell(row, "AUTOID", 40, true);
            htmlHelper.appendCell(row, "ACCOUNT", 80, true);
            htmlHelper.appendCell(row, "PROD", 60, true);
            htmlHelper.appendCell(row, "CNTRCT", 60, true);
            htmlHelper.appendCell(row, "STRIKE", 80, true);
            htmlHelper.appendCell(row, "LEG", 40, true);
            htmlHelper.appendCell(row, "QNTY", 40, true);
            htmlHelper.appendCell(row, "PRICE", 50, true);
            htmlHelper.appendCell(row, "EXTACCT", 80, true);        
            htmlHelper.appendCell(row, "CLTRDID", 100, true);
            htmlHelper.appendCell(row, "CLTRDLEGID", 100, true);
            htmlHelper.appendCell(row, "ORIGID", 100, true);
            htmlHelper.appendCell(row, "DELETED", 100, true);
            return row;
        };
    return {
        createFillReportTable : function (fills) {
            var table = htmlHelper.createTable("orderFillReport");
            table.append(createFillReportHeaderRow());
            fills.forEach(function (fill) {
                table.append(createFillReportRow(fill));
            });
            return table;
        },
    };
});