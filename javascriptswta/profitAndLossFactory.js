/*global  $*/
"use strict";
var profitAndLossFactory = function (common, htmlHelper) {
    var createProfitAndLossTableHeader = function () {
            var row;
            row = $("<tr/>");
            htmlHelper.appendCell(row, "Trader", null, true);
            htmlHelper.appendCell(row, "Account", null, true);
            htmlHelper.appendCell(row, "Product", 0, true);
            htmlHelper.appendCell(row, "ContractCode", 0, true);
            htmlHelper.appendCell(row, "Product", null, true, "profitAndLossProductAndSecurityTypeCell");
            htmlHelper.appendCell(row, "Theoretical Profit", null, true, 'profitAndLossProfitCell');
            //htmlHelper.appendCell(row, "Settlement Profit", null, true, 'profitAndLossProfitCell');
            return row;
        },
        getDistinctTraders = function (payload) {
            var traders, trader;
            traders = [];
            if (!payload || !payload.length || payload.length === 0) {
                return traders;
            }
            payload.forEach(function (element) {
                trader = element.Trader;
                if (traders.indexOf(trader) === -1) {
                    traders.push(trader);
                }
            });
            return traders;
        },
        getDistinctAccounts = function (payload) {
            var account, accounts;
            accounts = [];
            if (!payload || !payload.length || payload.length === 0) {
                return accounts;
            }
            payload.forEach(function (element) {
                account = element.Account;
                if (accounts.indexOf(account) === -1) {
                    accounts.push(account);
                }
            });
            return accounts;
        },
        filterTableAndReturnFilteredClone = function (table, trader, account) {
            var rows, row, i, traderCell, accountCell, totalTheoreticalProfit, shouldIncludeRow, totalsRow, headerRow, result, formattedTotalTheoreticalProfit;//, totalSettlementProfit, formattedTotalSettlementProfit;
            totalTheoreticalProfit = 0;
            //totalSettlementProfit = 0;
            result = $('<table>');
            if (!table) {
                return result;
            }
            rows = table.find('tr');
            if (rows.length === 0) {
                return result;
            }
            headerRow = table.find('tr:first').clone();
            result.append(headerRow);
            for (i = 1; i < rows.length; i += 1) {
                row = $(rows[i]);
                row.show();
                shouldIncludeRow = true;
                traderCell = row.find("td.profitAndLossTraderCell");
                if (trader && traderCell.text() !== trader) {
                    row.hide();
                    shouldIncludeRow = false;
                }
                accountCell = row.find("td.profitAndLossAccountCell");
                if (account && accountCell.text() !== account) {
                    row.hide();
                    shouldIncludeRow = false;
                }
                if (shouldIncludeRow) {
                    result.append(row.clone());
                    totalTheoreticalProfit += Number(row.find('td.theoreticalProfitCell').text().replace(/,/g, ''));
                    //totalSettlementProfit += Number(row.find('td.settlementProfitCell').text().replace(/,/g, ''));
                }
            }
            totalsRow = table.find('tr').eq(1);
            formattedTotalTheoreticalProfit = common.addCommas(totalTheoreticalProfit, 2);
            totalsRow.find('td.theoreticalProfitCell').text(formattedTotalTheoreticalProfit);
            //formattedTotalSettlementProfit = common.addCommas(totalSettlementProfit, 2);
            //totalsRow.find('td.settlementProfitCell').text(formattedTotalSettlementProfit);
            totalsRow.show();
            return result;
        },
        createExportTable = function (trader, account) {
            var cloned, filtered;
            cloned = $('#profitAndLossTable').clone();
            filtered = filterTableAndReturnFilteredClone(cloned, trader, account);
            filtered.find("tr").each(function () {
                $(this).find('th.profitAndLossProductAndSecurityTypeCell').remove();
                $(this).find('td.profitAndLossProductAndSecurityTypeCell').remove();
            });
            if (!trader && !account) {
                filtered.find('tr').eq(1).remove();
            }
            return filtered;
        },
        createProfitAndLossTableRow = function (element) {
            var row;
            row = $("<tr/>");
            htmlHelper.appendCell(row, element.Trader, null, false, 'profitAndLossTraderCell');
            htmlHelper.appendCell(row, element.Account, null, false, 'profitAndLossAccountCell');
            htmlHelper.appendCell(row, element.Product, 0, false, 'profitAndLossProductCell');
            htmlHelper.appendCell(row, element.SecurityType, 0, false, 'profitAndLossSecurityTypeCell');
            htmlHelper.appendCell(row, element.Product + '/' + element.SecurityType, null, false, 'profitAndLossProductAndSecurityTypeCell');
            htmlHelper.appendCell(row, element.TheoreticalProfit, null, false, 'profitAndLossProfitCell theoreticalProfitCell');
           // htmlHelper.appendCell(row, element.SettlementProfit, null, false, 'profitAndLossProfitCell settlementProfitCell');
            return row;
        },
        createTotalsRow = function (theoreticalProfit) { //, settlementProfit) {
            var totalsRow = $("<tr/>");
            totalsRow.addClass('dimgrayAndWhite');
            htmlHelper.appendCell(totalsRow, "", null, false);
            htmlHelper.appendCell(totalsRow, "", null, false);
            htmlHelper.appendCell(totalsRow, "", 0, false);
            htmlHelper.appendCell(totalsRow, "", 0, false);
            htmlHelper.appendCell(totalsRow, "", null, false);
            htmlHelper.appendCell(totalsRow, theoreticalProfit, null, false, 'profitAndLossProfitCell theoreticalProfitCell bold');
            //htmlHelper.appendCell(totalsRow, settlementProfit, null, false, 'profitAndLossProfitCell settlementProfitCell bold');
            return totalsRow;
        };
    return {
        createProfitAndLossTable: function (payload, failCallback, passCallback, profitAndLossTradersSelect, profitAndLossAccountsSelect) {
            var table, header, row;
            if (!payload || !payload.length || payload.length === 0) {
                failCallback();
                return null;
            }
            table = $("<table>");
            table.attr('id', 'profitAndLossTable');
            header = createProfitAndLossTableHeader();
            table.append(header);
            payload.forEach(function (element) {
                row = createProfitAndLossTableRow(element);
                table.append(row);
            });
            header.after(createTotalsRow());
            htmlHelper.fillSelectFromList(profitAndLossTradersSelect, "Filter by trader", getDistinctTraders(payload), "< none >");
            htmlHelper.fillSelectFromList(profitAndLossAccountsSelect, "Filter by reconcile account", getDistinctAccounts(payload), "< none >");
            passCallback();
            return table;
        },
        getFilteredTable: function (table, trader, account) {
            filterTableAndReturnFilteredClone(table, trader, account);
        },
        createProfitAndLossCsv: function (trader, account) {
            var exportTable = createExportTable(trader, account);
            return htmlHelper.tableToCsv(exportTable);
        }
    };
};


