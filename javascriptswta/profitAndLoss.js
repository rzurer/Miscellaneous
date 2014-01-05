/*global  $*/
"use strict";
var profitAndLoss = function (dataAccess, factory, common, permissions) {
    var currentToDateValue = '',
        currentFromDateValue = '',
        profitAndLossTile = $("#profitAndLossTile"),
        profitAndLossWorkspace = $("#profitAndLoss"),
        profitAndLossCloseButton = $('#profitAndLossCloseButton'),
        showProfitAndLossButton = $('#showProfitAndLossButton'),
        profitAndLossTableContainer = $('#profitAndLossTableContainer'),
        fromDate = $('#fromDate'),
        toDate = $('#toDate'),
        tiles = $("#tiles"),
        exportToCsvButton = $('#exportToCsvButton'),
        exportCsvHidden = $('#exportCsvHidden'),
        profitAndLossFilterContainer = $('#profitAndLossFilterContainer'),
        profitAndLossTradersSelect = $('#profitAndLossTradersSelect'),
        profitAndLossAccountsSelect = $('#profitAndLossAccountsSelect'),
        exportCsvForm = $('#exportCsvForm'),
        yearToDateRange = $('#yearToDateRange'),
        monthToDateRange = $('#monthToDateRange'),
        profitAndLossError = $('#profitAndLossError'),
        profitAndLossTileClick = function () {
            tiles.fadeOut('slow', function () {
                profitAndLossWorkspace.fadeIn("slow");
            });
        },
        getProfitAndLossTable = function () {
            return $('#profitAndLossTable');
        },
        getTrader = function () {
            return profitAndLossTradersSelect.val();
        },
        getAccount = function () {
            return profitAndLossAccountsSelect.val();
        },
        hideError = function () {
            profitAndLossError.text('');
        },
        clear = function () {
            hideError();
            exportToCsvButton.hide();
            profitAndLossFilterContainer.hide();
            profitAndLossTableContainer.empty();
        },
        closeWorkspace = function () {
            profitAndLossWorkspace.fadeOut('slow', function () {
                clear();
                tiles.fadeIn('slow');
            });
        },
        validateToDate = function () {
            if (new Date(toDate.val()) < new Date(fromDate.val())) {
                toDate.datepicker("setDate", fromDate.val());
            }
            if (toDate.val() !== currentToDateValue) {
                currentToDateValue = toDate.val();
                clear();
            }
        },
        validateFromDate = function () {
            if (new Date(fromDate.val()) > new Date(toDate.val())) {
                fromDate.datepicker("setDate", toDate.val());
            }
            if (fromDate.val() !== currentFromDateValue) {
                currentFromDateValue = fromDate.val();
                clear();
            }
        },
        initializeDatePicker = function (datePickerControl, validateMethod) {
            datePickerControl.datepicker({
                changeYear: true,
                dateFormat: "MM d, yy",
                onSelect: validateMethod
            });
        },
        getFilteredTable = function () {
            factory.getFilteredTable(getProfitAndLossTable(), getTrader(), getAccount());
        },
        showFilterAndExportControl = function () {
            exportToCsvButton.show();
            profitAndLossFilterContainer.show();
        },
        displayError =  function (error) {
           profitAndLossError.text(error);
        },
        displayProfitAndLossTable = function (response) {
            var table;
            profitAndLossTableContainer.empty();
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            table = factory.createProfitAndLossTable(response.Payload, clear, showFilterAndExportControl, profitAndLossTradersSelect, profitAndLossAccountsSelect);
            factory.getFilteredTable(table);
            profitAndLossTableContainer.append(table);
        },
        showProfitAndLoss = function () {
            dataAccess.getProfitAndLossByTrader(fromDate.val(), toDate.val(), displayProfitAndLossTable);
        },
        exportToCsv = function () {
            var csv = factory.createProfitAndLossCsv(getTrader(), getAccount());
            exportCsvHidden.val(csv);
            exportCsvForm.submit();
        },
        setYearToDate = function () {
            fromDate.datepicker("setDate", new Date(new Date().getFullYear(), 0, 1));
            toDate.datepicker("setDate", new Date());
        },
        setMonthToDate = function () {
            fromDate.datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1));
            toDate.datepicker("setDate", new Date());
        },
        assignEventHandlers = function () {
            initializeDatePicker(toDate, validateToDate),
            initializeDatePicker(fromDate, validateFromDate),
            profitAndLossTile.click(profitAndLossTileClick);
            profitAndLossCloseButton.click(closeWorkspace);
            showProfitAndLossButton.click(showProfitAndLoss);
            exportToCsvButton.click(exportToCsv);
            profitAndLossTradersSelect.change(getFilteredTable);
            profitAndLossAccountsSelect.change(getFilteredTable);
            yearToDateRange.click(setYearToDate);
            monthToDateRange.click(setMonthToDate);
        };
    return {
        initialize: function (urlLibrarian) {
            dataAccess.initialize(urlLibrarian);
            assignEventHandlers();
            toDate.datepicker("setDate", new Date());
            currentToDateValue = toDate.val();
            fromDate.datepicker("setDate", new Date(new Date().getFullYear(), 0, 1));
            currentFromDateValue = fromDate.val();
        }
    };
};