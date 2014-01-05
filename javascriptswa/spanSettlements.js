/*globals $, define, console, setTimeout, clearInterval, setInterval*/
"use strict";
define(['spanSettlementsDataAccess', "spanSettlementsFactory", "common", "htmlHelper"], function (dataAccess, factory, common, htmlHelper) {
    var checkUpdateStatusIntervalId = 0,
        count = 0,
        settlementsStatus = $('#settlementsStatus'),
        settlementsError = $('#settlementsError'),
        exchangesTableContainer = $('#exchangesTableContainer'),
        showInactiveFeedsCheckbox = $('#showInactiveFeedsCheckbox'),
        dateSelect = $('#dateSelect'),
        clearMessages = function () {
            settlementsStatus.empty();
            settlementsError.text('');
        },
        displayError = function(error) {
            settlementsError.text(error);
        },
        displayExchanges = function (response) {
            clearMessages();
            if (!response.Success) {
                displayError(response.Message);
                return;
            }
            exchangesTableContainer.empty();
            exchangesTableContainer.append(factory.createExchangesTable(response.Payload));
        },
        updateSettlementsCallback = function (response) {
            var closePopupAndDisplayResult, settlementsUpdateResults;
            clearMessages();
            if (!response.Success) {
                clearInterval(checkUpdateStatusIntervalId);
                $('#progress').css("color", "red");
                settlementsStatus.text(response.Message);
                setTimeout(common.disablePopup, 3000);
                return;
            }
            count += 1;
            if (count === 10) {
                $('#progress').text("Processing please wait ");
                count = 0;
            } else {
                $('#progress').text($('#progress').text() + ' .');
            }
            if (response.Payload) {
                clearInterval(checkUpdateStatusIntervalId);
                $('#progress').css("color", "lightgreen");
                $('#progress').text("Finished. Please review the status messages for the results.");
                closePopupAndDisplayResult = function () {
                    common.disablePopup();
                    settlementsUpdateResults = factory.createSettlementsUpdateResults(response.Payload);
                    settlementsStatus.empty();
                    settlementsStatus.append(settlementsUpdateResults);
                };
                setTimeout(closePopupAndDisplayResult, 3000);
            }
        },
        showProcessingPopup = function () {
            var container, popup;
            clearMessages();
            common.clearPopup();
            container = $('#processingContainer').clone();
            container.show();
            popup = common.getPopup();
            popup.append(container);
            common.unbindPopupEvents();
            $('#popupClose').css("color", "black");
            common.displayPopup(null, null, true);
        },
        runSelectedSettlementsOnExchange = function (exchangeCode, sequenceNumber, options, futures) {
            var callback;
            count = 0;
            callback = function () {
                checkUpdateStatusIntervalId = setInterval(function () {
                    dataAccess.checkWhetherSettlementsHaveBeenUpdated(updateSettlementsCallback);
                }, 4000);
            };
            showProcessingPopup();
            dataAccess.runSelectedSettlementsOnExchange(dateSelect.val(), exchangeCode, sequenceNumber, options, futures, callback);
        },
        removeUploadFile = function (filePath) {
            dataAccess.removeFile(filePath, function (removeFileResponse) {
                if (!removeFileResponse.Succcess) {
                    displayError(removeFileResponse.Message);
                }
            });
        },
        runSelectedSettlementsOnExchangeFromFile = function (exchangeCode, sequenceNumber, options, futures, filePath) {
            var callback;
            count = 0;
            clearMessages();
            callback = function (runSettlementsResponse) {
                if (!runSettlementsResponse.Success) {
                    common.disablePopup();
                    settlementsStatus.text(runSettlementsResponse.Message);
                    return;
                }
                checkUpdateStatusIntervalId = setInterval(function () {
                    var doUpdateSettlementsCallback = function (response) {
                        updateSettlementsCallback(response);
                        if (response.Payload) {
                            removeUploadFile(filePath);
                        }
                    };
                    dataAccess.checkWhetherSettlementsHaveBeenUpdated(doUpdateSettlementsCallback);
                }, 4000);
            };
            showProcessingPopup();
            dataAccess.runSelectedSettlementsOnExchangeFromFile(exchangeCode, sequenceNumber, options, futures, filePath, callback);
        },
        runSettlementsOnExchange = function (exchangeCode, sequenceNumber) {
            var callback;
            count = 0;
            callback = function () {
                checkUpdateStatusIntervalId = setInterval(function () {
                    dataAccess.checkWhetherSettlementsHaveBeenUpdated(updateSettlementsCallback);
                }, 4000);
            };
            showProcessingPopup();
            dataAccess.runSettlementsOnExchange(dateSelect.val(), exchangeCode, sequenceNumber, callback);
        },
        runSettlementsOnExchangeFromFile = function (exchangeCode, sequenceNumber, filePath) {
            var callback;
            count = 0;
            clearMessages();
            callback = function (runSettlementsResponse) {
                if (!runSettlementsResponse.Success) {
                    common.disablePopup();
                    settlementsStatus.text(runSettlementsResponse.Message);
                    return;
                }
                checkUpdateStatusIntervalId = setInterval(function () {
                    var doUpdateSettlementsCallback = function (response) {
                        updateSettlementsCallback(response);
                        if (response.Payload) {
                            removeUploadFile(filePath);
                        }
                    };
                    dataAccess.checkWhetherSettlementsHaveBeenUpdated(doUpdateSettlementsCallback);
                }, 4000);
            };
            showProcessingPopup();
            dataAccess.runSettlementsOnExchangeFromFile(exchangeCode, sequenceNumber, filePath, callback);
        },
        toggleInactiveFeeds = function () {
            $('.isInactive').toggle();
        },
        uploadSPANSettlementsFile = function (exchangeCode, sequenceNumber, wantSelectedProducts) {
            dataAccess.uploadSPANSettlementsFile(exchangeCode, sequenceNumber, wantSelectedProducts);
        },
        dateSelected = function () {
            if (dateSelect.val()) {
                factory.refreshSettlementRows(new Date(dateSelect.val()));
            } else {
                factory.refreshSettlementRows(new Date("01-01-9999"));
            }
        },
        assignEventHandlers = function () {
            showInactiveFeedsCheckbox.bind('change', toggleInactiveFeeds);
            dateSelect.bind('change', dateSelected);
        },
        initializeDateSelect = function (response) {
            if (!response.Success) {
                displayError(response.Message);
                return;
            }
            htmlHelper.fillSelectFromList(dateSelect, 'Select a date for which you would like to run settlements', response.Payload);
        };
    return {
        initialize: function (model) {
            factory.initialize(runSettlementsOnExchange, runSelectedSettlementsOnExchange, runSelectedSettlementsOnExchangeFromFile, uploadSPANSettlementsFile);
            assignEventHandlers();
            var doDisplayExchanges = function (response) {
                displayExchanges(response);
                if (model) {
                    if (model.wantSelectedProducts === "True") {
                        factory.displayProducts(model.exchangeCode, model.sequenceNumber, model.uploadPath, function () {
                            removeUploadFile(model.uploadPath);
                        });
                        return;
                    }
                    runSettlementsOnExchangeFromFile(model.exchangeCode, model.sequenceNumber, model.uploadPath);
                }
            };
            dataAccess.getExchanges(doDisplayExchanges);
            dataAccess.getLastFourBusinessDays(initializeDateSelect);
        }
    };
});