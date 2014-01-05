"use strict";
var copyOptionParametersFactory = function (common, htmlHelper) {
    var addCellTitle = function (cell, title, titlePrefix) {
        cell.attr("title", titlePrefix ? titlePrefix + title : title);
    },
        createOptionContractParametersTableHeader = function () {
            var cell, row;
            row = $("<tr/>");
            cell = htmlHelper.appendCell(row, "COM", null, true);
            addCellTitle(cell, "Commodity Code");
            cell = htmlHelper.appendCell(row, "CNTR", null, true);
            addCellTitle(cell, "Contract Code");
            cell = htmlHelper.appendCell(row, "EXP", null, true);
            addCellTitle(cell, "Option Expiration");
            cell = htmlHelper.appendCell(row, "FUT", null, true);
            addCellTitle(cell, "Underlying Price");
            cell = htmlHelper.appendCell(row, "VOL", null, true);
            addCellTitle(cell, "Volatility");
            cell = htmlHelper.appendCell(row, "VDIFF", null, true);
            addCellTitle(cell, "Volatility Offset To Base");
            cell = htmlHelper.appendCell(row, "PIVT", null, true);
            addCellTitle(cell, "Pivot Value");
            cell = htmlHelper.appendCell(row, "VSLP", null, true);
            addCellTitle(cell, "Volatility Slope");
            cell = htmlHelper.appendCell(row, "VADJ", null, true);
            addCellTitle(cell, "Volatility Adjustment");
            cell = htmlHelper.appendCell(row, "A", null, true);
            addCellTitle(cell, "Parameter A");
            cell = htmlHelper.appendCell(row, "B", null, true);
            addCellTitle(cell, "Parameter B");
            cell = htmlHelper.appendCell(row, "C", null, true);
            addCellTitle(cell, "Parameter C");
            cell = htmlHelper.appendCell(row, "D", null, true);
            addCellTitle(cell, "Parameter D");
            cell = htmlHelper.appendCell(row, "E", null, true);
            addCellTitle(cell, "Parameter E");
            cell = htmlHelper.appendCell(row, "F", null, true);
            addCellTitle(cell, "Parameter F");
            cell = htmlHelper.appendCell(row, "G", null, true);
            addCellTitle(cell, "Parameter G");
            cell = htmlHelper.appendCell(row, "H", null, true);
            addCellTitle(cell, "Parameter H");
            cell = htmlHelper.appendCell(row, "INT", null, true);
            addCellTitle(cell, "Interest Rate");
            cell = htmlHelper.appendCell(row, "SKSLP", null, true);
            addCellTitle(cell, "Skew Slope");
            cell = htmlHelper.appendCell(row, "YLD", null, true);
            addCellTitle(cell, "Dividend Yield");
            return row;
        },
        createOptionContractParametersTableRow = function (element) {
            var cell, row, titlePrefix, expirationDate;
            row = $("<tr/>");
            titlePrefix = element.OptionCode + " " + element.ContractCode + " - ";
            cell = htmlHelper.appendCell(row, element.OptionCode, 30, false, 'optionCodeCell');
            addCellTitle(cell, "Commodity Code", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ContractCode, 30, false, 'contractCodeCell');
            addCellTitle(cell, "Contract Code", titlePrefix);
            cell = htmlHelper.appendCell(row, element.OptionExpiration);
            addCellTitle(cell, "Option Expiration", titlePrefix);
            cell = htmlHelper.appendCell(row, element.UnderlyingPrice);
            addCellTitle(cell, "Underlying Price", titlePrefix);
            cell = htmlHelper.appendCell(row, element.Volatility);
            addCellTitle(cell, "Volatility", titlePrefix);
            cell = htmlHelper.appendCell(row, element.VolatilityOffsetToBase);
            addCellTitle(cell, "Volatility Offset To Base", titlePrefix);
            cell = htmlHelper.appendCell(row, element.PivotValue);
            addCellTitle(cell, "Pivot Value", titlePrefix);
            cell = htmlHelper.appendCell(row, element.VolatilitySlope);
            addCellTitle(cell, "Volatility Slope", titlePrefix);
            cell = htmlHelper.appendCell(row, element.VolatilityAdjustment);
            addCellTitle(cell, "Volatility Adjustment", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterA);
            addCellTitle(cell, "Parameter A", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterB);
            addCellTitle(cell, "Parameter B", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterC);
            addCellTitle(cell, "Parameter C", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterD);
            addCellTitle(cell, "Parameter D", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterE);
            addCellTitle(cell, "Parameter E", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterF);
            addCellTitle(cell, "Parameter F", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterG);
            addCellTitle(cell, "Parameter G", titlePrefix);
            cell = htmlHelper.appendCell(row, element.ParameterH);
            addCellTitle(cell, "Parameter H", titlePrefix);
            cell = htmlHelper.appendCell(row, element.InterestRate);
            addCellTitle(cell, "Interest Rate", titlePrefix);
            cell = htmlHelper.appendCell(row, element.SkewSlope);
            addCellTitle(cell, "Skew Slope", titlePrefix);
            cell = htmlHelper.appendCell(row, element.DividendYield);
            addCellTitle(cell, "Dividend Yield", titlePrefix);
            return row;
        },
        createOptionContractParametersTextHeader = function (delimiter) {
            return "COM" + delimiter +
                "CNTR" + delimiter +
                "EXP" + delimiter +
                "FUT" + delimiter +
                "VOL" + delimiter +
                "VDIFF" + delimiter +
                "PIVT" + delimiter +
                "VSLP" + delimiter +
                "VADJ" + delimiter +
                "A" + delimiter +
                "B" + delimiter +
                "C" + delimiter +
                "D" + delimiter +
                "E" + delimiter +
                "F" + delimiter +
                "G" + delimiter +
                "H" + delimiter +
                "INT" + delimiter +
                "SKSLP" + delimiter +
                "YLD\r\n";
        },
        createOptionContractParametersTextRow = function (element, delimiter) {
            return element.OptionCode + delimiter +
                element.ContractCode + delimiter +
                element.OptionExpiration + delimiter +
                element.UnderlyingPrice + delimiter +
                element.Volatility + delimiter +
                element.VolatilityOffsetToBase + delimiter +
                element.PivotValue + delimiter +
                element.VolatilitySlope + delimiter +
                element.VolatilityAdjustment + delimiter +
                element.ParameterA + delimiter +
                element.ParameterB + delimiter +
                element.ParameterC + delimiter +
                element.ParameterD + delimiter +
                element.ParameterE + delimiter +
                element.ParameterF + delimiter +
                element.ParameterG + delimiter +
                element.ParameterH + delimiter +
                element.InterestRate + delimiter +
                element.SkewSlope + delimiter +
                element.DividendYield + '\r\n';
        };
    return {
        createDownloadLink: function (data, src) {
            var title, downloadFilename;
            title = "Export to comma-separated value text file";
            downloadFilename = "Export.csv";
            return htmlHelper.createDownloadLink(title, src, 30, downloadFilename, data);
        },
        appendCopyFromTraderActionDescriptor: function (parent, trader, commodity) {
            parent.append(htmlHelper.createLabel("Copy "));
            parent.append(htmlHelper.createLabel(commodity, "selectedCommodity"));
            parent.append(htmlHelper.createLabel(" parameters from "));
            parent.append(htmlHelper.createLabel(trader, "selectedTrader"));
        },
        appendCopyFromProductActionDescriptor: function (parent, sourceProduct, destinationProduct) {
            parent.append(htmlHelper.createLabel("Copy parameters from "));
            parent.append(htmlHelper.createLabel(sourceProduct, "sourceProduct"));
            parent.append(htmlHelper.createLabel(" to "));
            parent.append(htmlHelper.createLabel(destinationProduct, "destinationProduct"));
        },
        createOptionContractParametersTable: function (array, className) {
            var table = $("<table/>");
            table.attr("id", 'optionContractParametersTable');
            if (className) {
                table.addClass(className);
            }
            table.append(createOptionContractParametersTableHeader());
            array.forEach(function (element) {
                table.append(createOptionContractParametersTableRow(element));
            });
            return table;
        },
        createOptionContractParametersText: function (array, delimiter) {
            var csv = createOptionContractParametersTextHeader(delimiter);
            array.forEach(function (element) {
                var row = createOptionContractParametersTextRow(element, delimiter);
                csv += row;
            });
            return csv.substr(0, csv.length - 4);
        }
    };
};