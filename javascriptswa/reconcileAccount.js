/*globals $, define, console */
"use strict";
define(['reconcileAccountDataAccess', 'htmlHelper', 'common'], function (dataAccess, htmlHelper, common) {
    var showTraderAndProductsByReconcileAccountError = $('#showTraderAndProductsByReconcileAccountError'),
        showTraderAndProductsByReconcileAccountStatus = $('#showTraderAndProductsByReconcileAccountStatus'),
        reconcileAccountSelect = $('#reconcileAccountSelect'),
        traderSelect = $('#traderSelect'),
        productSelect = $('#productSelect'),
        securityTypeSelect = $('#securityTypeSelect'),
        traderAndProductsTableContainer = $('#traderAndProductsTableContainer'),
        getSelectedTrader = function () {
            return traderSelect.val();
        },
        getSelectedProduct = function () {
            return productSelect.val();
        },
        getSelectedSecurityType = function () {
            return securityTypeSelect.val();
        },
        getTraderAndProductsTable = function () {
            return $('#traderAndProductsTable');
        },
        clear = function () {
            showTraderAndProductsByReconcileAccountError.text('');
            showTraderAndProductsByReconcileAccountStatus.text('');
        },
        fillReconcileAccountSelect = function (response) {
            clear();
            if (!response.Success) {
                showTraderAndProductsByReconcileAccountError.text(response.Message);
                return;
            }
            htmlHelper.fillSelectFromList(reconcileAccountSelect, "Select a reconcile account", response.Payload);
            htmlHelper.fillSelectFromList(securityTypeSelect, "Select a security type", []);
            htmlHelper.fillSelectFromList(productSelect, "Select a product", []);
            htmlHelper.fillSelectFromList(traderSelect, "Select a trader", []);
        },
        createTraderAndProductsTableHeader = function () {
            var headerRow;
            headerRow = htmlHelper.createRow('traderAndProductsHeaderRow');
            htmlHelper.appendCell(headerRow, "Trader", '', true);
            htmlHelper.appendCell(headerRow, "Product", '', true);
            htmlHelper.appendCell(headerRow, "Security Type", '', true);
            return headerRow;
        },
        creatTraderAndProductsFilterRow = function () {
            var cell, row;
            row = htmlHelper.createRow('traderAndProductsFilterRow');
            cell = htmlHelper.appendCell(row);
            cell.append(traderSelect);
            cell = htmlHelper.appendCell(row);
            cell.append(productSelect);
            cell = htmlHelper.appendCell(row);
            cell.append(securityTypeSelect);
            return row;
        },
        createTraderAndProductsTableRow = function (item) {
            var cell, row;
            row = htmlHelper.createRow('traderAndProductsRow');
            common.setSimpleRowHover(row);
            htmlHelper.appendCell(row, item.Trader, '120', false, 'reconcileTrader');
            htmlHelper.appendCell(row, item.Product, '120', false, 'reconcileProduct');
            cell = htmlHelper.appendCell(row, item.SecurityType, '120', false, 'reconcileSecurityType');
            cell.css('color', item.SecurityType === 'Fut' ? 'green' : 'red');
            return row;
        },
        createTraderAndProductsTable = function (array) {
            var table;
            table = $("<table>").attr('id', 'traderAndProductsTable');
            table.append(createTraderAndProductsTableHeader());
            table.append(creatTraderAndProductsFilterRow());
            array.forEach(function (item) {
                table.append(createTraderAndProductsTableRow(item));
            });
            return table;
        },
        displayTradersAndProductsForReconcileAccount = function (response) {
            var securityTypes, products, traders;
            securityTypes = [];
            products = [];
            traders = [];
            response.Payload.forEach(function (item) {
                if (securityTypes.indexOf(item.SecurityType) === -1) {
                    securityTypes.push(item.SecurityType);
                }
                if (products.indexOf(item.Product) === -1) {
                    products.push(item.Product);
                }
                if (traders.indexOf(item.Trader) === -1) {
                    traders.push(item.Trader);
                }
            });
            htmlHelper.fillSelectFromList(securityTypeSelect, "Select a security type", securityTypes);
            htmlHelper.fillSelectFromList(productSelect, "Select a product", products);
            htmlHelper.fillSelectFromList(traderSelect, "Select a trader", traders);
            traderAndProductsTableContainer.empty();
            traderAndProductsTableContainer.append(createTraderAndProductsTable(response.Payload));
        },
        retrieveTradersAndProductsByReconcileAccount = function () {
            var accountNumber = $(this).val();
            if (!accountNumber) {
                return;
            }
            dataAccess.retrieveTradersAndProductsByReconcileAccount(accountNumber, displayTradersAndProductsForReconcileAccount);
        },
        filterData = function () {
            var trader, product, securityType, traderAndProductsRows, row;
            trader = getSelectedTrader();
            product = getSelectedProduct();
            securityType = getSelectedSecurityType();
            traderAndProductsRows = getTraderAndProductsTable().find('.traderAndProductsRow');
            //none
            if (!trader && !product && !securityType) {
                traderAndProductsRows.show();
                return;
            }
            //one
            if (!trader && !product && securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileSecurityType').text() === securityType) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            if (!trader && product && !securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileProduct').text() === product) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            if (trader && !product && !securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileTrader').text() === trader) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            //two
            if (!trader && product && securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileSecurityType').text() === securityType && row.find('td.reconcileProduct').text() === product) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            if (trader && !product && securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileSecurityType').text() === securityType && row.find('td.reconcileTrader').text() === trader) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            if (trader && product && !securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileTrader').text() === trader && row.find('td.reconcileProduct').text() === product) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
            //three
            if (trader && product && securityType) {
                traderAndProductsRows.each(function () {
                    row = $(this);
                    if (row.find('td.reconcileTrader').text() === trader && row.find('td.reconcileProduct').text() === product && row.find('td.reconcileSecurityType').text() === securityType) {
                        row.show();
                    } else {
                        row.hide();
                    }
                });
                return;
            }
        },
        assignEventHandlers = function () {
            reconcileAccountSelect.bind('change', retrieveTradersAndProductsByReconcileAccount);
            securityTypeSelect.bind('change', filterData);
            traderSelect.bind('change', filterData);
            productSelect.bind('change', filterData);
        };
    return {
        initialize: function () {
            assignEventHandlers();
            dataAccess.retrieveAllReconcileAccounts(fillReconcileAccountSelect);
        }
    };
});