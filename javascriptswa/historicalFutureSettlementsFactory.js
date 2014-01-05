/*globals $, define, console*/
"use strict";
define(['htmlHelper', "common", 'editInPlaceControl'], function (htmlHelper, common, editInPlaceControl) {
    var controlsArray = [],
        controlId = 0,
        updateFunction,
        createHistoricalFutureSettlementsTableHeaderRow = function () {
            var headerRow;
            headerRow = htmlHelper.createRow();
            htmlHelper.appendCell(headerRow, "Settlement Date", 120, true, "textAlignLeft");
            htmlHelper.appendCell(headerRow, "Contract Code", 120, true, "textAlignLeft");
            htmlHelper.appendCell(headerRow, "Settlement Price", 190, true, "textAlignRight");
            htmlHelper.appendCell(headerRow, '', 800);
            return headerRow;
        },
        createContractCodePriceTable = function (contractCodePriceArray) {
            var table, row, contractCode, settlementPrice, control, settlementPriceCell;
            table = htmlHelper.createTable("contractCodePriceTable");
            contractCodePriceArray.forEach(function (contractCodePrice) {
                row = htmlHelper.createRow();
                contractCode = contractCodePrice.Item1;
                settlementPrice = contractCodePrice.Item2 || '0';
                htmlHelper.appendCell(row, contractCode, 120, false, 'contractCodeCell');
                control = editInPlaceControl.create(controlId += 1, settlementPrice, 180, "settlementPriceCell");
                control.write.addClass('textAlignRight');
                control.write.keypress(common.isNumericKey);
                controlsArray.push(control);
                settlementPriceCell = htmlHelper.appendCell(row).append(control.container).attr("title", "Click to edit");
                htmlHelper.appendCell(row);
                table.append(row);
            });
            return table;
        },
        createHistoricalFutureSettlementsTableRow = function (settlementDate, contractCodePriceArray) {
            var row, cell;
            row = htmlHelper.createRow('historicalFutureSettlementsTableRow');
            htmlHelper.appendCell(row, settlementDate, 120, false, 'settlementDateCell');
            cell = htmlHelper.appendCell(row);
            cell.attr('colspan', 3);
            cell.append(createContractCodePriceTable(contractCodePriceArray));
            return row;
        },
        createHistoricalFutureSettlementFromControl = function (container) {
            var commodityCode, settlementDate, contractCode, settlementPrice;
            commodityCode = $('#commodityCodesSelect').val();
            settlementDate = container.closest('tr.historicalFutureSettlementsTableRow').find('td.settlementDateCell').text();
            contractCode = container.parent().closest('tr').find('td.contractCodeCell').text();
            settlementPrice = container.find('span.settlementPriceCell').text();
            return { commodityCode: commodityCode, settlementDate: settlementDate, contractCode: contractCode, settlementPrice: settlementPrice };
        },
        changeCallback = function (id) {
            controlsArray.forEach(function (item) {
                var settlement, target;
                if (item.id === id) {
                    target = item.container;
                    settlement = createHistoricalFutureSettlementFromControl(target);
                    updateFunction(target, settlement);
                }
            });
        };
    editInPlaceControl.addListener("change", changeCallback);
    return {
        createHistoricalFutureSettlementsTable: function (settlementsForCommodity, updateSettlementPriceFunction) {
            var table, settlementDates, contractCodePriceArray, futureSettlementsTableRow;
            updateFunction = updateSettlementPriceFunction;
            table = htmlHelper.createTable("historicalFutureSettlementsTable");
            table.append(createHistoricalFutureSettlementsTableHeaderRow());
            settlementDates = common.getPropertiesArray(settlementsForCommodity);
            settlementDates.forEach(function (settlementDate) {
                contractCodePriceArray = settlementsForCommodity[settlementDate];
                futureSettlementsTableRow = createHistoricalFutureSettlementsTableRow(settlementDate, contractCodePriceArray);
                table.append(futureSettlementsTableRow);
            });
            return table;
        }
    };
});