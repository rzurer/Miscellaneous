/*global  $*/
"use strict";
var yieldCurvesFactory = function (common, htmlHelper) {
    var librarian,
        floatCellWidth = 35,
        dateCellWidth = 70,
        captionCellWidth = 180,
        buttonsCellWidth = 100,
        tableWidth = 940,
        maxTextLength = 7,
        createYieldCurvesTableHeader = function () {
            var row;
            row = $("<tr/>");
            htmlHelper.appendCell(row, "Date", captionCellWidth, true);
            htmlHelper.appendCell(row, "", dateCellWidth, true);
            htmlHelper.appendCell(row, "1 Mo", floatCellWidth, true);
            htmlHelper.appendCell(row, "3 Mo", floatCellWidth, true);
            htmlHelper.appendCell(row, "6 Mo", floatCellWidth, true);
            htmlHelper.appendCell(row, "1 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "2 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "3 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "5 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "7 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "10 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "20 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "30 Yr", floatCellWidth, true);
            htmlHelper.appendCell(row, "(in percent)", buttonsCellWidth, true, "isPercent");
            return row;
        },
        createTreasuryLink = function () {
            var goToTreasuryWebsiteImage, title, treasuryLink, attributes;
            treasuryLink = $("<a/>");
            attributes = {
                "id": "treasuryLink",
                "href": librarian.DailyTreasuryInterestYieldCurvesDocument,
                "target": "_blank"
            };
            title = "Open daily U.S. Department of the Treasury yield curve rates in a new tab";
            goToTreasuryWebsiteImage = htmlHelper.createImageButton('goToTreasuryWebsiteImage', librarian.WebsiteImage, title, "yieldCurveImage");
            treasuryLink.attr(attributes);
            treasuryLink.append(goToTreasuryWebsiteImage);
            return treasuryLink;
        },
        createDailyTreasuryYieldCurveRow = function (curve) {
            var row, cell, asOfDate, dateString, copyYieldCurveImage, title;
            row = $("<tr/>");
            row.attr("id", "dailyTreasuryYieldCurveRow");
            htmlHelper.appendCell(row, "Treasury yield curve as of:", captionCellWidth, false);
            asOfDate = common.parseJsonDate(curve.AsOfDate);
            dateString = asOfDate.getMonth() + 1 + "-" + asOfDate.getDate() + "-" + asOfDate.getFullYear();
            htmlHelper.appendCell(row, dateString, dateCellWidth, false, "asOfDateCell");
            htmlHelper.appendCell(row, curve.OneMonth, null, false, "oneMonth");
            htmlHelper.appendCell(row, curve.ThreeMonth, null, false, "threeMonth");
            htmlHelper.appendCell(row, curve.SixMonth, null, false, "sixMonth");
            htmlHelper.appendCell(row, curve.OneYear, null, false, "oneYear");
            htmlHelper.appendCell(row, curve.TwoYear, null, false, "twoYear");
            htmlHelper.appendCell(row, curve.ThreeYear, null, false, "threeYear");
            htmlHelper.appendCell(row, curve.FiveYear, null, false, "fiveYear");
            htmlHelper.appendCell(row, curve.SevenYear, null, false, "sevenYear");
            htmlHelper.appendCell(row, curve.TenYear, null, false, "tenYear");
            htmlHelper.appendCell(row, curve.TwentyYear, null, false, "twentyYear");
            htmlHelper.appendCell(row, curve.ThirtyYear, null, false, "thirtyYear");
            cell = htmlHelper.appendCell(row, "");
            title = "Copy treasury yield curve and edit";
            copyYieldCurveImage = htmlHelper.createImageButton('copyYieldCurveImage', librarian.CopyImage, title, "yieldCurveImage");
            cell.append(copyYieldCurveImage);
            cell.append(createTreasuryLink);
            return row;
        },
        createTraderInterestRateYieldCurveRow = function (curve, trader) {
            var row, cell, yieldCurveSpan, traderSpan, asOfSpan, captionDiv, asOfDate, dateString, editYieldCurveImage, cancelEditYieldCurveImage, saveYieldCurveImage;
            row = $("<tr/>");
            row.attr("id", "traderYieldCurveRow");
            captionDiv = $("<div/>");
            yieldCurveSpan = $("<span/>");
            yieldCurveSpan.text("Yield curve for");
            traderSpan = $("<span/>");
            traderSpan.attr("id", 'traderSpan');
            traderSpan.text(trader);
            asOfSpan = $("<span/>");
            asOfSpan.text("as of:");
            captionDiv.append(yieldCurveSpan);
            captionDiv.append(traderSpan);
            captionDiv.append(asOfSpan);
            cell = htmlHelper.appendCell(row, "", captionCellWidth, false, "traderCell");
            cell.attr("id", trader);
            cell.append(captionDiv);
            asOfDate = curve ? common.parseJsonDate(curve.AsOfDate) : new Date();
            dateString = asOfDate.getMonth() + 1 + "-" + asOfDate.getDate() + "-" + asOfDate.getFullYear();
            htmlHelper.appendCell(row, dateString, dateCellWidth, false, "asOfDateCell");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.OneMonth : 0, maxTextLength, "oneMonth");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.ThreeMonth : 0, maxTextLength, "threeMonth");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.SixMonth : 0, maxTextLength, "sixMonth");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.OneYear : 0, maxTextLength, "oneYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.TwoYear : 0, maxTextLength, "twoYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.ThreeYear : 0, maxTextLength, "threeYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.FiveYear : 0, maxTextLength, "fiveYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.SevenYear : 0, maxTextLength, "sevenYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.TenYear : 0, maxTextLength, "tenYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.TwentyYear : 0, maxTextLength, "twentyYear");
            htmlHelper.addDecimalTextEntryCell(row, floatCellWidth, floatCellWidth, curve ? curve.ThirtyYear : 0, maxTextLength, "thirtyYear");
            cell = htmlHelper.appendCell(row, "");
            editYieldCurveImage = htmlHelper.createImageButton('editYieldCurveImage', librarian.EditImage, "Edit", "yieldCurveImage");
            cell.append(editYieldCurveImage);
            cancelEditYieldCurveImage = htmlHelper.createImageButton('cancelEditYieldCurveImage', librarian.CancelImage, "Cancel", "yieldCurveImage");
            cell.append(cancelEditYieldCurveImage);
            saveYieldCurveImage = htmlHelper.createImageButton('saveYieldCurveImage', librarian.SaveImage, "Save", "yieldCurveImage", function () {});
            common.disableControl(saveYieldCurveImage);
            cell.append(saveYieldCurveImage);
            return row;
        };
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        createConfirmUpdateDialog: function (validationsContainer) {
            var confirmDialog;
            confirmDialog = htmlHelper.createContainer('', 'confirmUpdateInterestRate');
            confirmDialog.append(validationsContainer);
            return confirmDialog;
        },
        createInterestRateYieldCurvesTable: function (treasuryCurve, traderCurve, trader) {
            var table;
            table = $("<table/>");
            table.css("width", tableWidth + "px");
            table.attr("id", 'yieldCurvesTable');
            table.append(createYieldCurvesTableHeader());
            if (treasuryCurve) {
                table.append(createDailyTreasuryYieldCurveRow(treasuryCurve));
            }
            table.append(createTraderInterestRateYieldCurveRow(traderCurve, trader));
            return table;
        }
    };
};