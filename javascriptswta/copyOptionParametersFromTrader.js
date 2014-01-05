/*global $*/
"use strict";
var copyOptionParametersFromTrader = function (common, htmlHelper, dataAccess, factory, permissions) {
    var librarian,
        previewPane = $('#copyOptionParametersResult'),
        container = $("#tableContainer"),
        contentContainer = $("#tableContainerContent"),
        headerContainer = $("#tableContainerHeader"),
        actionDescriptor = $('#actionDescriptor'),
        tiles = $("#tiles"),
        commoditiesTableContainer = $("#optionCodes"),
        tradersTableContainer = $("#traders"),
        copyOptionParametersError = $("#copyOptionParametersError"),
        chooseTrader = $("#chooseTrader"),
        chooseCommodity = $("#chooseCommodity"),
        copyOptionParametersFromTraderWorkspace = $('#copyOptionParametersFromTrader'),
        copyOptionParametersFromTraderTile = $('#copyOptionParametersFromTraderTile'),
        copyOptionParametersFromTraderCloseButton = $('#copyOptionParametersFromTraderCloseButton'),
        getSelectedTrader = function () {
            return $('.selectedTraderCell').text();
        },
        getSelectedCommodity = function () {
            return $('.selectedCommodityCell').text();
        },
        getCommodityCells = function () {
            return $('#optionCodes td');
        },
        getTraderCells = function () {
            return $('#traders td');
        },
        showCopyResult = function (response) {
            var displayError;
            previewPane.empty();
            previewPane.css('color', response.Success ? 'green' : "red");
            displayError = function (error) {
                previewPane.fadeIn("slow");
                previewPane.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            previewPane.fadeIn("slow");
            previewPane.text(response.Message);
        },
        showPreviewResult = function (response) {
            var table, tabSeparatedValues, downloadLink, displayError;
            previewPane.empty();
            previewPane.css('color', response.Success ? 'green' : "red");
            displayError = function (error) {
                previewPane.fadeIn("slow");
                previewPane.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            contentContainer.empty();
            headerContainer.empty();
            tabSeparatedValues = factory.createOptionContractParametersText(response.Payload, ',');
            factory.appendCopyFromTraderActionDescriptor(headerContainer, getSelectedTrader(), getSelectedCommodity());
            if ($.browser.webkit) {
                downloadLink = factory.createDownloadLink(tabSeparatedValues, librarian.ExportImage);
                headerContainer.append(downloadLink);
            }
            table = factory.createOptionContractParametersTable(response.Payload);
            contentContainer.append(table);
            if (!response.Success) {
                return;
            }
            common.clearPopup();
            container.appendTo(common.getPopup());
            container.show();
            common.showPopup(120, 100);
        },
        previewOptionParametersFromTrader = function () {
            var trader, optionCode;
            trader = getSelectedTrader();
            optionCode = getSelectedCommodity();
            previewPane.fadeOut('slow', function () {
                dataAccess.previewOptionParametersFromTrader(trader, optionCode, showPreviewResult);
            });
        },
        copyOptionParametersFromTrader = function () {
            var trader, optionCode;
            trader = getSelectedTrader();
            optionCode = getSelectedCommodity();
            previewPane.fadeOut('slow', function () {
                dataAccess.copyOptionParametersFromTrader(trader, optionCode, showCopyResult);
            });
        },
        showSelectionResult = function () {
            actionDescriptor.empty();
            factory.appendCopyFromTraderActionDescriptor(actionDescriptor, getSelectedTrader(), getSelectedCommodity());
            actionDescriptor.append(htmlHelper.createDiv("copy", "smallButton", copyOptionParametersFromTrader));
            actionDescriptor.append(htmlHelper.createDiv("preview", "smallButton", previewOptionParametersFromTrader));
        },
        displayOptionCodesTable = function (response) {
            var cellClick, table, cellsPerRow, displayError;
            displayError = function (error) {
                copyOptionParametersError.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            cellClick = function () {
                previewPane.text('');
                previewPane.hide();
                actionDescriptor.show();
                getCommodityCells().removeClass("selectedCommodityCell");
                $(this).removeClass("unselectedCell");
                $(this).addClass("selectedCommodityCell");
                showSelectionResult();
            };
            cellsPerRow = 4;
            commoditiesTableContainer.empty();
            commoditiesTableContainer.show();
            previewPane.text('');
            actionDescriptor.text('');
            table = htmlHelper.createTable(response.Payload, cellsPerRow, cellClick);
            table.addClass("traderOptions");
            commoditiesTableContainer.append(table);
            getCommodityCells().addClass("unselectedCell");
            chooseCommodity.text("Choose Commodity:");
        },
        displayTradersTable = function (response) {
            var cellClick, table, cellsPerRow, displayError;
            displayError = function (error) {
                tradersTableContainer.empty();
                tradersTableContainer.hide();
                copyOptionParametersError.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            cellClick = function () {
                getTraderCells().removeClass("selectedTraderCell");
                previewPane.hide();
                previewPane.text('');
                actionDescriptor.hide();
                $(this).removeClass("unselectedCell");
                $(this).addClass("selectedTraderCell");
                dataAccess.getNonDerivedCommoditiesForTrader($(this).text(), displayOptionCodesTable);
            };
            cellsPerRow = 1;
            table = htmlHelper.createTable(response.Payload, cellsPerRow, cellClick);
            table.attr("id", "tradersToDownloadFrom");
            tradersTableContainer.append(table);
            getTraderCells().addClass("unselectedCell");
            tradersTableContainer.show();
            chooseTrader.show();
        },
        clearCopyOptionParametersControls = function () {
            tradersTableContainer.empty();
            commoditiesTableContainer.empty();
            tradersTableContainer.hide();
            commoditiesTableContainer.hide();
            chooseTrader.hide();
            previewPane.hide();
            copyOptionParametersError.text('');
            previewPane.text('');
            chooseCommodity.text('');
            actionDescriptor.hide();
        },
        copyOptionParametersTileClick = function () {
            clearCopyOptionParametersControls();
            tiles.fadeOut('slow', function () {
                dataAccess.getTradersToDownloadFrom(displayTradersTable);
                copyOptionParametersFromTraderWorkspace.fadeIn("slow");
            });
        };
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
            dataAccess.initialize(urlLibrarian);
            copyOptionParametersFromTraderTile.click(copyOptionParametersTileClick);
            copyOptionParametersFromTraderCloseButton.click(function () {
                clearCopyOptionParametersControls();
                copyOptionParametersFromTraderWorkspace.fadeOut('slow', function () {
                    tiles.fadeIn('slow');
                });
            });
        }
    };
};