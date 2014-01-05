/*globals $, define, console*/
"use strict";
define(['htmlHelper', 'common'], function (htmlHelper, common) {
    var that,
        updateAllSettlementsOnExchangeMethod,
        updateSelectedSettlementsOnExchangeMethod,
        updateSelectedSettlementsOnExchangeFromFileMethod,
        uploadSettlementsFileMethod,
        optionsHash = {},
        futuresHash = {},
        selectedOptions = {},
        selectedFutures = {},
        createExchangeTableHeader = function () {
            var headerRow, cell;
            headerRow = htmlHelper.createRow('exchangesTableHeaderRow');
            htmlHelper.appendCell(headerRow, "Exchange", 160, true);
            htmlHelper.appendCell(headerRow, "Exchange Name", 350, true);
            cell = htmlHelper.appendCell(headerRow, "", 40, true, 'multiLine');
            cell.append($("<span>").text("SPAN"));
            cell.append($("<span>").text("Start"));
            cell.append($("<span>").text("Time"));
            cell = htmlHelper.appendCell(headerRow, "", 50, true, 'multiLine');
            cell.append($("<span>").text("Early"));
            cell.append($("<span>").text("Feed"));
            cell = htmlHelper.appendCell(headerRow, "", 120, true, 'multiLine');
            cell.append($("<span>").text("Last"));
            cell.append($("<span>").text("Settlement"));
            cell.append($("<span>").text("Update"));
            cell.append($("<span>").text("Date"));
            cell = htmlHelper.appendCell(headerRow, "", 60, true, 'multiLine');
            cell.append($("<span>").text("File"));
            cell.append($("<span>").text("Size"));
            cell = htmlHelper.appendCell(headerRow, "", 100, true, 'multiLine');
            cell.append($("<span>").text("File"));
            cell.append($("<span>").text("Timestamp"));
            htmlHelper.appendCell(headerRow, "Directory", 60, true, 'alignCenter');
            htmlHelper.appendCell(headerRow, "Full File Name", 400, true);
            return headerRow;
        },
        enableOrDisableUpdateSelectedSettlementsButton = function (exchangeCode, exchangeFeedSeqNumber, uploadPath) {
            var updateSelectedSettlementsButton, updateSelectedSettlements, updateSelectedSettlementsFromFile;
            updateSelectedSettlementsButton = $('#updateSelectedSettlementsButton');
            if ($('span.selectedProduct').length > 0) {
                updateSelectedSettlements = function () {
                    updateSelectedSettlementsOnExchangeMethod(exchangeCode, exchangeFeedSeqNumber, selectedOptions, selectedFutures);
                };
                updateSelectedSettlementsFromFile = function () {
                    updateSelectedSettlementsOnExchangeFromFileMethod(exchangeCode, exchangeFeedSeqNumber, selectedOptions, selectedFutures, uploadPath);
                };
                common.enableControlAndSetClick(updateSelectedSettlementsButton, uploadPath ? updateSelectedSettlementsFromFile : updateSelectedSettlements);
            } else {
                common.disableControls([updateSelectedSettlementsButton]);
            }
        },
        addProduct = function (span) {
            if (span.hasClass('optionSpan')) {
                selectedOptions.push(span.text());
            }
            if (span.hasClass('futureSpan')) {
                selectedFutures.push(span.text());
            }
        },
        removeProduct = function (span) {
            if (span.hasClass('optionSpan')) {
                selectedOptions.splice(selectedOptions.indexOf(span.text()), 1);
            }
            if (span.hasClass('futureSpan')) {
                selectedOptions.splice(selectedFutures.indexOf(span.text()), 1);
            }
        },
        createProductsTablesContainer = function (exchangeCode, exchangeFeedSeqNumber, uploadPath) {
            var selectProduct, productsTablesContainer, optionSpans, futureSpans, max, columnCount, headerWidth, optionsHeader, futuresHeader, updateSelectedSettlementsButton;
            selectProduct = function () {
                var span = $(this).find('span');
                if (!span.hasClass('selectedProduct') && !span.hasClass('unselectedProduct')) {
                    span.addClass('selectedProduct');
                    enableOrDisableUpdateSelectedSettlementsButton(exchangeCode, exchangeFeedSeqNumber, uploadPath);
                    addProduct(span);
                    return;
                }
                if (span.hasClass('selectedProduct')) {
                    span.removeClass('selectedProduct');
                    span.addClass('unselectedProduct');
                    enableOrDisableUpdateSelectedSettlementsButton(exchangeCode, exchangeFeedSeqNumber, uploadPath);
                    removeProduct(span);
                    return;
                }
                if (span.hasClass('unselectedProduct')) {
                    span.removeClass('unselectedProduct');
                    span.addClass('selectedProduct');
                }
                enableOrDisableUpdateSelectedSettlementsButton(exchangeCode, exchangeFeedSeqNumber, uploadPath);
                addProduct(span);
            };
            productsTablesContainer = $('<div>').addClass('productsTablesContainer').attr('id', 'productsTablesContainer');
            optionSpans = optionsHash[exchangeCode] ? optionsHash[exchangeCode].map(function (option) {
                return $('<span>').addClass('optionSpan productSpan').text(option);
            }) : [];
            futureSpans = futuresHash[exchangeCode] ? futuresHash[exchangeCode].map(function (option) {
                return $('<span>').addClass('futureSpan productSpan').text(option);
            }) : [];
            max = Math.max(optionSpans.length, futureSpans.length);
            columnCount = Math.min(max, 15);
            headerWidth = Math.max(columnCount * 80, 550);
            productsTablesContainer.append($('<span>').text('Exchange: ' + exchangeCode).addClass('exchangeHeader').css('width', headerWidth));
            productsTablesContainer.append($('<br>'));
            productsTablesContainer.append($('<span>').text('Select options and/or futures for which to update settlements').addClass('titleHeader').css('width', headerWidth));
            productsTablesContainer.append($('<br>'));
            updateSelectedSettlementsButton = $('<span>').text('Update Settlements').addClass('updateSelectedSettlementsButton').attr('id', 'updateSelectedSettlementsButton');
            common.disableControls([updateSelectedSettlementsButton]);
            productsTablesContainer.append(updateSelectedSettlementsButton);
            optionsHeader = $('<span>').text('OPTIONS').addClass('securityTypeHeader').css('width', headerWidth);
            futuresHeader = $('<span>').text('FUTURES').addClass('securityTypeHeader').css('width', headerWidth);
            productsTablesContainer.append(htmlHelper.createFixedColumnsTable([optionsHeader], 1, 'securityTypeHeaderTable'));
            productsTablesContainer.append(htmlHelper.createFixedColumnsTable(optionSpans, columnCount, 'productsTable', selectProduct));
            productsTablesContainer.append(htmlHelper.createFixedColumnsTable([futuresHeader], 1, 'securityTypeHeaderTable'));
            productsTablesContainer.append(htmlHelper.createFixedColumnsTable(futureSpans, columnCount, 'productsTable', selectProduct));
            productsTablesContainer.show();
            return productsTablesContainer;
        },
        updateAllSettlementsOnExchange = function (exchange) {
            updateAllSettlementsOnExchangeMethod(exchange.ExchangeCode, exchange.ExchangeFeedSeqNumber);
        },
        getSelectedSettlementDate = function () {
            return $('#dateSelect').val();
        },
        getConfirmDialog = function () {
            return $('#confirmDialog');
        },
        createExchangeTableRow = function (exchange) {
            var row, cell, image, errorMessage, lastSettlementUpdateDate, updateSettlementsButton, displayProductsButton, exchangeCodeCell, updateSettlementsFromUploadedFileButton, updateSettlementsButtonClick,
                updateSettlementsFromUploadedFileButtonClick, displayProductsButtonClick, updateSelectedSettlementsFromUploadedFileButtonClick, updateSelectedSettlementsFromUploadedFileButton;
            row = htmlHelper.createRow('exchangesTableRow');
            if (!exchange.IsActive) {
                row.addClass('isInactive');
            }
            row.addClass('unsettled');
            common.setSimpleRowHover(row);
            exchangeCodeCell = htmlHelper.appendCell(row, exchange.ExchangeCode);
            lastSettlementUpdateDate = new Date(exchange.LastSettlementUpdateDate).setHours(0, 0, 0, 0);
            errorMessage = "The selected settlement date cannot be later than the last settlement update date. [ " + exchange.LastSettlementUpdateDate + " ]";
            exchangeCodeCell.hover(function () {
                exchangeCodeCell.children('img').remove();
                updateSettlementsButtonClick = function (e) {
                    var dateSelectValue = getSelectedSettlementDate(),
                        selectedSettlementUpdateDate = dateSelectValue ? new Date(dateSelectValue) : new Date("01-01-9999"),
                        dateDiff = lastSettlementUpdateDate - selectedSettlementUpdateDate.setHours(0, 0, 0, 0);
                    if (!dateSelectValue) {
                        common.showToaster($(this), "Please select a settlement date.", -3, 30, true, null, 2500, null, 'blueColor');
                        return;
                    }
                    if (dateDiff < 0) {
                        common.showToaster($(this), errorMessage, -3, 30, true, null, 2500, null, 'blueColor');
                        return;
                    }
                    if (dateDiff >= 86400000) {
                        var message, title, proceed;
                        message = "A newer settlement file exists, are you sure you want to run the selected date?";
                        title = "Update SPAN Settlements";
                        proceed = function () {
                            updateAllSettlementsOnExchange(exchange);
                        };
                        common.confirmDialog(getConfirmDialog(), message, title, e.pageY, e.pageX, proceed);
                        return;
                    }
                    updateAllSettlementsOnExchange(exchange);
                };
                updateSettlementsButton = common.createImageButton("#updateSettlementsImage", exchange.ExchangeCode + '  -->  Update settlements for all products.', updateSettlementsButtonClick, 'updateSettlementsButton');
                updateSettlementsButton.css("width", "20px");
                updateSettlementsButton.appendTo(exchangeCodeCell);
                displayProductsButtonClick = function (e) {
                    var dateSelectValue = getSelectedSettlementDate(),
                        selectedSettlementUpdateDate = dateSelectValue ? new Date(dateSelectValue) : new Date("01-01-9999"),
                        dateDiff = lastSettlementUpdateDate - selectedSettlementUpdateDate.setHours(0, 0, 0, 0);
                    if (!dateSelectValue) {
                        common.showToaster($(this), "Please select a settlement date.", -3, 30, true, null, 2500, null, 'blueColor');
                        return;
                    }
                    if (dateDiff <= 0) {
                        common.showToaster($(this), errorMessage, -3, 30, true, null, 2500, null, 'blueColor');
                        return;
                    }
                    if (dateDiff >= 86400000) {
                        var message, title, proceed;
                        message = "A newer settlement file exists, are you sure you want to run the selected date?";
                        title = "Update SPAN Settlements";
                        proceed = function () {
                            that.displayProducts(exchange.ExchangeCode, exchange.ExchangeFeedSeqNumber);
                        };
                        common.confirmDialog(getConfirmDialog(), message, title, e.pageY, e.pageX, proceed);
                        return;
                    }
                    that.displayProducts(exchange.ExchangeCode, exchange.ExchangeFeedSeqNumber);
                };
                displayProductsButton = common.createImageButton("#displayProductsTableImage", exchange.ExchangeCode + '  -->  Update settlements for selected products.', displayProductsButtonClick, 'updateSettlementsButton');
                displayProductsButton.css("width", "20px");
                displayProductsButton.appendTo(exchangeCodeCell);
                updateSettlementsFromUploadedFileButtonClick = function () {
                    uploadSettlementsFileMethod(exchange.ExchangeCode, exchange.ExchangeFeedSeqNumber, "False");
                };
                updateSettlementsFromUploadedFileButton = common.createImageButton("#uploadSpanFileImage", exchange.ExchangeCode + '  -->  Import file and update settlements for all products.', updateSettlementsFromUploadedFileButtonClick, 'updateSettlementsButton');
                updateSettlementsFromUploadedFileButton.css("width", "20px");
                updateSettlementsFromUploadedFileButton.appendTo(exchangeCodeCell);
                updateSelectedSettlementsFromUploadedFileButtonClick = function () {
                    uploadSettlementsFileMethod(exchange.ExchangeCode, exchange.ExchangeFeedSeqNumber, "True");
                };
                updateSelectedSettlementsFromUploadedFileButton = common.createImageButton("#uploadSelectedSpanFileImage", exchange.ExchangeCode + '  -->  Import file and update settlements for selected products.', updateSelectedSettlementsFromUploadedFileButtonClick, 'updateSettlementsButton');
                updateSelectedSettlementsFromUploadedFileButton.css("width", "20px");
                updateSelectedSettlementsFromUploadedFileButton.appendTo(exchangeCodeCell);
            }, function () {
                exchangeCodeCell.children('img').remove();
            });
            htmlHelper.appendCell(row, exchange.ExchangeName);
            htmlHelper.appendCell(row, exchange.SPANStartTime);
            htmlHelper.appendCell(row, exchange.IsEarlyFeed, '', false);
            htmlHelper.appendCell(row, exchange.LastSettlementUpdateDate, '', false, 'settlementDate');
            htmlHelper.appendCell(row, exchange.FileSize || '0');
            htmlHelper.appendCell(row, exchange.FileTimestamp);
            cell = htmlHelper.appendCell(row, '', false, 'alignCenter');
            image = $('#folderImage').clone();
            cell.append(htmlHelper.createImageAnchor(image, exchange.SPANFileDirectory, true));
            cell = htmlHelper.appendCell(row);
            cell.append(htmlHelper.createAnchor(exchange.SPANFileName, exchange.SPANFileName, true, 'download file'));
            optionsHash[exchange.ExchangeCode] = exchange.Options;
            futuresHash[exchange.ExchangeCode] = exchange.Futures;
            return row;
        };
    that = {
        initialize: function (updateAllMethod, updateSelectedMethod, updateSelectedFromFileMethod, uploadMethod) {
            updateAllSettlementsOnExchangeMethod = updateAllMethod;
            updateSelectedSettlementsOnExchangeMethod = updateSelectedMethod;
            updateSelectedSettlementsOnExchangeFromFileMethod = updateSelectedFromFileMethod;
            uploadSettlementsFileMethod = uploadMethod;
        },
        createExchangesTable: function (exchanges) {
            var table = htmlHelper.createTable("exchangesTable");
            table.append(createExchangeTableHeader());
            optionsHash = {};
            futuresHash = {};
            exchanges.forEach(function (exchange) {
                table.append(createExchangeTableRow(exchange));
            });
            return table;
        },
        displayProducts: function (exchangeCode, exchangeFeedSeqNumber, uploadPath, callback) {
            selectedOptions = [];
            selectedFutures = [];
            var target = createProductsTablesContainer(exchangeCode, exchangeFeedSeqNumber, uploadPath);
            common.clearPopup();
            target.appendTo(common.getPopup());
            $('#popupClose').css("color", "#6fa5fd");
            target.show();
            common.displayPopup(null, null, false, 'productsPopup', callback);
        },
        refreshSettlementRows: function (date) {
            $('.exchangesTable').find('td.settlementDate').each(function () {
                var row, settlementDate;
                settlementDate = new Date($(this).text());
                row = $(this).parent('tr');
                row.removeClass('settled');
                row.removeClass('unsettled');
                row.addClass(settlementDate - date.setHours(0, 0, 0, 0) > 0 ? 'settled' : 'unsettled');
            });
        },
        createSettlementsUpdateResults: function (messages) {
            var list = $('<ul>').attr('id', 'settlementsUpdateMessages');
            messages.forEach(function (message) {
                list.append($('<li>').text(message));
            });
            return list;
        }
    };
    return that;
});
