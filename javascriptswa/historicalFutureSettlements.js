/*globals $, define, console, setTimeout, clearInterval, setInterval*/
"use strict";
define(['historicalFutureSettlementsDataAccess', 'historicalFutureSettlementsFactory', 'common', 'htmlHelper'], function (dataAccess, factory, common, htmlHelper) {
    var historicalSettlementsError = $("#historicalSettlementsError"),
        historicalSettlementsTableContainer = $("#historicalSettlementsTableContainer"),
        commodityCodesSelect = $("#commodityCodesSelect"),
        contractCodeSelect = $("#contractCodeSelect"),
        addFutureSettlementImage = $('#addFutureSettlementImage'),
        addNewFutureSettlementContainer = $('#addNewFutureSettlementContainer'),
        saveNewFutureSettlementButton = $('#saveNewFutureSettlementButton'),
        addSettlementDate = $('#addSettlementDate'),
        addCommodityCode = $('#addCommodityCode'),
        addSettlementPrice = $('#addSettlementPrice'),
        getCommodityCode = function () {
            return commodityCodesSelect.val();
        },
        setSettlementDateDatePicker = function () {
            var today = new Date(),
                fillContractCodesSelect = function (response) {
                    htmlHelper.fillSelectFromList(contractCodeSelect, "Choose contract code", response.Payload);
                };
            addSettlementDate.datepicker({
                changeYear: false,
                defaultDate: today,
                dateFormat: "mm/dd/yy",
                minDate: -60,
                maxDate: 0,
                onClose: function (dateText, inst) {
                    $(inst.input).val(dateText);
                    dataAccess.getContractCodesAroundSettlementDate(getCommodityCode(), dateText, fillContractCodesSelect);
                }
            });
        },
        displayError = function (message) {
            historicalSettlementsError.text('');
            historicalSettlementsError.empty();
            historicalSettlementsError.text(message);
        },
        displayErrorsList = function (errorsList) {
            historicalSettlementsError.text('');
            historicalSettlementsError.empty();
            historicalSettlementsError.append(errorsList);
        },
        updateSettlementPrice = function (target, settlement) {
            if (isNaN(settlement.settlementPrice)) {
                common.showToaster(target, "Settlement price must be a valid number", 0, 200, true, null, 2500);
                return;
            }
            var callback = function (response) {
                if (!response.Success) {
                    common.showToaster(target, response.Message, 0, 200, true, null, 2500);
                    return;
                }
                common.showToaster(target, response.Message, 0, 200, false, null, 2500);
            };
            dataAccess.updateFutureSettlementPrice(settlement, callback);
        },
        addNewFutureSettlementPrice = function (target, settlement) {
            var table, callback, settlementsForCommodity;
            callback = function (response) {
                if (!response.Success) {
                    common.showToaster(target, response.Message, 0, 35, true, null, 2500);
                    return;
                }
                common.showToaster(target, response.Message, 0, 35, false, null, 0, function () {
                    dataAccess.getHistoricalFutureSettlements(function (callbackResponse) {
                        historicalSettlementsTableContainer.empty();
                        settlementsForCommodity = callbackResponse.Payload[getCommodityCode()];
                        table = factory.createHistoricalFutureSettlementsTable(settlementsForCommodity, updateSettlementPrice);
                        historicalSettlementsTableContainer.append(table);
                    });
                });
            };
            dataAccess.insertFutureSettlement(settlement, callback);
        },
        clearAddNewFutureSettlementContainer = function () {
            addNewFutureSettlementContainer.slideUp("normal");
            addSettlementDate.val('');
            contractCodeSelect.empty();
            addSettlementDate.attr('placeholder', 'enter date');
            saveNewFutureSettlementButton.attr('title', 'Save');
            contractCodeSelect.val('');
            addSettlementPrice.val('');
        },
        toggleAddNewFutureSettlementContainer = function () {
            if (addNewFutureSettlementContainer.is(':visible')) {
                clearAddNewFutureSettlementContainer();
                return;
            }
            addNewFutureSettlementContainer.slideDown("slow");
        },
        initializeFutureSettlementImage = function () {
            addFutureSettlementImage.attr('title', '');
            common.disableControls([addFutureSettlementImage]);
        },
        displayHistoricalFutureSettlements = function (response) {
            var payload;
            if (!response.Success) {
                displayError(response.Message);
                return;
            }
            payload = response.Payload;
            commodityCodesSelect.bind('change', function () {
                var commodityCode, settlementsForCommodity, table;
                historicalSettlementsTableContainer.empty();
                clearAddNewFutureSettlementContainer();
                initializeFutureSettlementImage();
                commodityCode = getCommodityCode();
                if (!commodityCode) {
                    return;
                }
                addCommodityCode.text(commodityCode);
                addFutureSettlementImage.attr('title', 'Add new future settlement to ' + commodityCode);
                settlementsForCommodity = payload[commodityCode];
                table = factory.createHistoricalFutureSettlementsTable(settlementsForCommodity, updateSettlementPrice);
                historicalSettlementsTableContainer.append(table);
                common.enableControlAndSetClick(addFutureSettlementImage, toggleAddNewFutureSettlementContainer);
            });
            htmlHelper.fillSelectFromList(commodityCodesSelect, '', common.getPropertiesArray(payload));
        },
        getFutureSettlement = function () {
            var commodityCode, contractCode, settlementDate, settlementPrice;
            commodityCode = getCommodityCode();
            contractCode = contractCodeSelect.val();
            settlementDate = addSettlementDate.val();
            settlementPrice = addSettlementPrice.val();
            return { commodityCode: commodityCode, contractCode: contractCode, settlementDate: settlementDate, settlementPrice: settlementPrice };

        },
        validateFutureSettlement = function (futureSettlement) {
            var errors = $('<ul>').addClass('futureSettlementErrors');
            if (!futureSettlement.commodityCode) {
                errors.append($('<li>').text("Commodity code is required"));
            }
            if (!futureSettlement.contractCode) {
                errors.append($('<li>').text("Contract code is required"));
            }
            if (!futureSettlement.settlementDate) {
                errors.append($('<li>').text("Settlement date is required"));
            }
            if (!futureSettlement.settlementPrice) {
                errors.append($('<li>').text("Settlement price is required"));
            }
            if (isNaN(futureSettlement.settlementPrice)) {
                errors.append($('<li>').text("Settlement price must be a valid number"));
            }
            return errors;
        },
        saveNewFuturesSettlement = function () {
            var futureSettlement, errors;
            historicalSettlementsError.text('');
            historicalSettlementsError.empty();
            futureSettlement = getFutureSettlement();
            errors = validateFutureSettlement(futureSettlement);
            if (errors.children().length > 0) {
                displayErrorsList(errors);
                return;
            }
            addNewFutureSettlementPrice($(this), futureSettlement);
        },
        initializeControls = function () {
            clearAddNewFutureSettlementContainer();
            setSettlementDateDatePicker();
            initializeFutureSettlementImage();
        },
        assignEventHandlers = function () {
            addSettlementPrice.keypress(common.isNumericKey);
            saveNewFutureSettlementButton.bind('click', saveNewFuturesSettlement);
        };
    return {
        initialize: function () {
            assignEventHandlers();
            initializeControls();
            dataAccess.getHistoricalFutureSettlements(displayHistoricalFutureSettlements);
        }
    };
});