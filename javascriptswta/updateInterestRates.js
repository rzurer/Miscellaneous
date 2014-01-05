"use strict";
var updateInterestRates = function (common, htmlHelper, dataAccess, factory, permissions) {
    var tiles = $("#tiles"),
        checkUpdateStatusIntervalId = 0,
        trader,
        updateInterestRatesTile = $('#updateInterestRatesTile'),
        updateInterestRatesCloseButton = $('#updateInterestRatesCloseButton'),
        updateInterestRatesWorkspace = $('#updateInterestRates'),
        updateInterestRatesError = $('#updateInterestRatesError'),
        yieldCurves = $('#yieldCurves'),
        leaveEditMode = function () {
            var textInputs, labels;
            textInputs = $('#yieldCurvesTable').find('input[type="text"]');
            labels = $('#yieldCurvesTable').find('label');
            textInputs.each(function () {
                $(this).val($(this).next('label').text());
            });
            textInputs.hide();
            labels.show();
            common.disableControls([$('#saveYieldCurveImage')]);
        },
        createTraderYieldCurve = function (row) {
            return {
                Trader: $(".traderCell").attr("id"),
                OneMonth: row.find('input.oneMonth').val(),
                ThreeMonth: row.find('input.threeMonth').val(),
                SixMonth: row.find('input.sixMonth').val(),
                OneYear: row.find('input.oneYear').val(),
                TwoYear: row.find('input.twoYear').val(),
                ThreeYear: row.find('input.threeYear').val(),
                FiveYear: row.find('input.fiveYear').val(),
                SevenYear: row.find('input.sevenYear').val(),
                TenYear: row.find('input.tenYear').val(),
                TwentyYear: row.find('input.twentyYear').val(),
                ThirtyYear: row.find('input.thirtyYear').val()
            };
        },
        enterEditMode = function () {
            var textInputs, labels, oneMonth;
            textInputs = $('#yieldCurvesTable').find('input[type="text"]');
            labels = $('#yieldCurvesTable').find('label');
            leaveEditMode();
            textInputs.show();
            labels.hide();
            oneMonth = $('input.oneMonth');
            oneMonth.focus();
            oneMonth.select();
            common.enableControlAndSetClick($('#saveYieldCurveImage'), validateInterestRateYieldCurve);
        },
        copyYieldCurve = function () {
            var dailyTreasuryYieldCurveRow, traderYieldCurveRow, treasuryValue, input, classNames;
            classNames = ["oneMonth", "threeMonth", "sixMonth", "oneYear", "twoYear", "threeYear", "fiveYear", "sevenYear", "tenYear", "twentyYear", "thirtyYear"];
            enterEditMode();
            dailyTreasuryYieldCurveRow = $("#dailyTreasuryYieldCurveRow");
            traderYieldCurveRow = $("#traderYieldCurveRow");
            classNames.forEach(function (className) {
                treasuryValue = dailyTreasuryYieldCurveRow.find('.' + className).text();
                input = traderYieldCurveRow.find('input.' + className);
                input.val(treasuryValue);
            });
        },
        displayError = function (error) {
            updateInterestRatesError.text(error);
        },
        displayYieldCurves = function (response) {
            var table, treasuryCurve, traderCurve, currentUsername;
            yieldCurves.empty();
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            treasuryCurve = response.Payload.DailyTreasuryYieldCurve;
            traderCurve = response.Payload.TraderInterestRateYieldCurve;
            currentUsername = response.Payload.CurrentUsername;
            table = factory.createInterestRateYieldCurvesTable(treasuryCurve, traderCurve, currentUsername);
            yieldCurves.append(table);
            $('#editYieldCurveImage').click(enterEditMode);
            $('#cancelEditYieldCurveImage').click(leaveEditMode);
            $('#copyYieldCurveImage').click(copyYieldCurve);
            yieldCurves.fadeIn("slow");
            if (!traderCurve) {
                enterEditMode();
            }
        },
        showProcessingPopup = function () {
            var container;
            common.clearPopup();
            container = $('#processingContainer').clone();
            container.show();
            common.getPopup().append(container);
            common.showPopup(null, null, true);
            return container;
        },
        getValidationsLevel = function (validations) {
            var isError;
            if (!validations || validations.length === 0) {
                return "Success";
            }
            validations.forEach(function (validation) {
                if (validation.toLowerCase().indexOf('error') >= 0) {
                    isError = true;
                }
            });
            return isError === true ? "Error" : "Warning";
        },
        validateInterestRateYieldCurve = function (e) {
            var row, curve, callback, options, validationLevel, doUpdateInterestRateYieldCurve, 
                updateInterestRateYieldCurve, validationsContainer, updateCallback, count, processingContainer, progress;
            count = 0;
            updateInterestRateYieldCurve = function (validateResponse) {
                if (!permissions.signOutOrDisplayError(validateResponse)) {
                    return;
                }
                updateInterestRatesError.text('');
                doUpdateInterestRateYieldCurve = function () {
                    row = $("#traderYieldCurveRow");
                    curve = createTraderYieldCurve(row);
                    options = {
                        parent: $('#saveYieldCurveImage'),
                        topOffset: -2,
                        leftOffset: 30,
                        delay: 2500
                    };
                    callback = function (response) {
                        if (!permissions.signOutOrDisplayError(response, function(error) {options.isError = true; common.showToaster(error, options);})){
                            return;
                        }
                        updateCallback = function (updateResponse) {
                            if (!permissions.signOutOrDisplayError(response)){
                                return;
                            }
                            progress = $('#progress');
                            count += 1;
                            if (count === 10) {
                                progress.text("Processing please wait ");
                                count = 0;
                            } else {
                                progress.text(progress.text() + ' .');
                            }
                            if (updateResponse.Payload) {
                                clearInterval(checkUpdateStatusIntervalId);
                                progress.css("color", "green");
                                progress.text(response.Message);
                                setTimeout(common.disablePopup, 4000);
                            }
                        },
                        checkUpdateStatusIntervalId = setInterval(function () {
                            dataAccess.checkWhetherInterestRatesHaveBeenUpdated(updateCallback);
                        }, 1000);
                        dataAccess.getExistingInterestRateYieldCurves(displayYieldCurves);
                    };
                    processingContainer = showProcessingPopup();
                    dataAccess.updateInterestRateYieldCurve(curve, callback);
                };
                if (!validateResponse.Success) {
                    if (validateResponse.Message === common.sessionTimedOutMessage) {
                        permissions.signOut(common.sessionTimedOutMessage);
                        return;
                    }
                    updateInterestRatesError.text(validateResponse.Message);
                    return;
                }
                validationLevel = getValidationsLevel(validateResponse.Payload);
                validationsContainer = htmlHelper.createContainer();
                validateResponse.Payload.forEach(function (validation) {
                    validationsContainer.append(htmlHelper.createContainer(validation));
                });
                if (validationLevel === "Error") {
                    updateInterestRatesError.html(validationsContainer);
                    return;
                }
                if (validationLevel === "Warning") {
                    common.confirmDialog($("#confirmDialog"), factory.createConfirmUpdateDialog(validationsContainer), "Proceed?", e.pageY, e.pageX, doUpdateInterestRateYieldCurve);
                    return;
                }
                if (validationLevel === "Success") {
                    doUpdateInterestRateYieldCurve();
                }
            };
            row = $("#traderYieldCurveRow");
            curve = createTraderYieldCurve(row);
            dataAccess.validateInterestRateYieldCurve(curve, updateInterestRateYieldCurve);
        },
        updateInterestRatesTileClick = function () {
            tiles.fadeOut('slow', function () {
                updateInterestRatesError.text('');
                dataAccess.getExistingInterestRateYieldCurves(displayYieldCurves);
                updateInterestRatesWorkspace.fadeIn("slow");
            });
        };
    return {
        initialize: function (urlLibrarian, loggedInUsername) {
            updateInterestRatesError.text('');
            trader = loggedInUsername;
            dataAccess.initialize(urlLibrarian);
            factory.initialize(urlLibrarian);
            updateInterestRatesTile.click(updateInterestRatesTileClick);
            updateInterestRatesCloseButton.click(function () {
                updateInterestRatesWorkspace.fadeOut('slow', function () {
                    tiles.fadeIn('slow');
                });
            });
        }
    };
};