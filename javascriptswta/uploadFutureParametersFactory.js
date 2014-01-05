"use strict";
var uploadFutureParametersFactory = function (common, htmlHelper) {
    var createFuturePriceComparisonHeader = function () {
        var row;
        row = $("<tr/>");
        htmlHelper.appendCell(row, "Contract", 50, true);
        htmlHelper.appendCell(row, "Old Price", 80, true, 'rightAligned');
        htmlHelper.appendCell(row, "New Price", 80, true, 'rightAligned');
        htmlHelper.appendCell(row, "Change", 80, true, 'rightAligned');
        htmlHelper.appendCell(row, "", null, true);
        return row;
    },
        getChangeCss = function (value) {
            var amount;
            amount = Number(value);
            if (amount === 0.0)
                return { 'color': 'black', 'font-weight': 'normal' };
            if (amount > 0.0)
                return { 'color': 'green', 'font-weight': 'bold' };
            return { 'color': 'red', 'font-weight': 'bold' };
        },
        createFuturePriceComparisonRow = function (futurePriceComparison) {
            var row, changeCell;
            row = htmlHelper.createRow();
            htmlHelper.appendCell(row, futurePriceComparison.ContractCode);
            htmlHelper.appendCell(row, futurePriceComparison.OldPrice, null, false, 'rightAligned');
            htmlHelper.appendCell(row, futurePriceComparison.NewPrice, null, false, 'rightAligned');
            changeCell = htmlHelper.appendCell(row, futurePriceComparison.Change, null, false, 'rightAligned');
            changeCell.css(getChangeCss(changeCell.text()));
            htmlHelper.appendCell(row, "", false);
            if (futurePriceComparison.WasManuallyEntered === true) {
                row.addClass("futureParameterWasManuallyEntered");
            }
            return row;
        },
        createFutureParametersComparisonTable = function (futureParametersComparison) {
            var table = $("<table>");
            table.addClass("futureParametersTable");
            table.append(createFuturePriceComparisonHeader());
            futureParametersComparison.FuturePriceComparisons.forEach(function (futurePriceComparison) {
                table.append(createFuturePriceComparisonRow(futurePriceComparison));
            });
            return table;
        };
    return {
        appendFutureParameterTables: function (tabsParent, tablesParent, payload) {
            if (!payload || payload.length === 0) {
                return;
            }
            payload.forEach(function (futureParametersComparison) {
                var tab, span, table;
                tab = $("<div>");
                tab.addClass('unselectedTab');
                span = $('<span>');
                span.text(futureParametersComparison.ProductCode);
                tab.append(span);
                tabsParent.append(tab);
                table = createFutureParametersComparisonTable(futureParametersComparison);
                tab.click(function () {
                    tablesParent.find('table').hide();
                    tabsParent.find('div').addClass('unselectedTab');
                    tabsParent.find('div').removeClass('selectedTab');
                    $(this).removeClass('unselectedTab');
                    $(this).addClass('selectedTab');
                    table.show();
                });
                tabsParent.find('div:first').removeClass('unselectedTab');
                tabsParent.find('div:first').addClass('selectedTab');
                tablesParent.append(table);
            });
            tablesParent.find('table:first').show();
        },
        fillInterpolationSelect: function (select) {
            var copyOnly = { Key: "CopyOnly", Value: "Copy Only" };
            var simpleAddition = { Key: "SimpleAddition", Value: "Simple Addition" };
            var simpleAdditionWithPriceAdjustment = { Key: "SimpleAdditionWithPriceAdjustment", Value: "Simple Addition With Price Adjustment" };
            var timeWeighted = { Key: "TimeWeighted", Value: "Time Weighted" };
            var interpolations = [copyOnly, simpleAddition, simpleAdditionWithPriceAdjustment, timeWeighted];
            htmlHelper.fillSelectFromKeyValuePairs(select, "Choose an interpolation type", interpolations);
        }
    };
};