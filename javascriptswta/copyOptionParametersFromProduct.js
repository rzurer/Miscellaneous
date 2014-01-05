/*global $*/
"use strict";
var copyOptionParametersFromProduct = function (common, htmlHelper, copyOptionParametersDataAccess, authorizationDataAccess, factory, permissions) {
    var librarian,
        copyOptionParametersFromProductTile = $('#copyOptionParametersFromProductTile'),
        copyOptionParametersFromProductWorkspace = $('#copyOptionParametersFromProduct'),
        copyOptionParametersFromProductError = $('#copyOptionParametersFromProductError'),
        copyOptionParametersFromProductCloseButton = $('#copyOptionParametersFromProductCloseButton'),
        container = $("#tableContainer"),
        contentContainer = $("#tableContainerContent"),
        headerContainer = $("#tableContainerHeader"),
        sourceProductCodesTableContainer = $("#sourceProductCodes"),
        destinationProductCodesTableContainer = $("#destinationProductCodes"),
        actionDescriptor = $('#copyOptionParametersFromProductActionDescriptor'),
        previewPane = $('#copyOptionParametersFromProductResult'),
        tiles = $("#tiles"),
        getSourceCommodityCells = function () {
            return $('#sourceProductCodes td');
        },
        getDestinationCommodityCells = function () {
            return $('#destinationProductCodes td');
        },
        getSourceProduct = function () {
            return $('#sourceTable').find('.selectedCommodityCell').text();
        },
        getDestinationProduct = function () {
            return $('#destinationTable').find('.selectedCommodityCell').text();
        },
        canShowActionContainer = function () {
            var sourceProduct = getSourceProduct(),
                destinationProduct = getDestinationProduct();
            return sourceProduct && sourceProduct.length > 0 && destinationProduct && destinationProduct.length > 0 && sourceProduct !== destinationProduct;
        },
        showCopyResult = function (response) {
            var displayError;
            previewPane.empty();
            previewPane.css('color', response.Success && response.Payload ? 'green' : "red");
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
        previewOptionParametersFromProduct = function () {
            var sourceProduct = getSourceProduct(),
                destinationProduct = getDestinationProduct();
            previewPane.fadeOut('slow');
            authorizationDataAccess.getCurrentUsername(function (response) {
                var trader, displayError;
                displayError = function (error) {
                    clearSelectionResult();
                    copyOptionParametersFromProductError.text(error);
                };
                if (!permissions.signOutOrDisplayError(response, displayError)) {
                    return;
                }
                trader = response.Message;
                copyOptionParametersDataAccess.previewOptionParametersFromProduct(trader, sourceProduct, destinationProduct, showPreviewResult);
            });
        },
        showSelectionResult = function () {
            previewPane.empty();
            previewPane.fadeOut("slow");
            $(".smallButton").remove();
            actionDescriptor.empty();
            factory.appendCopyFromProductActionDescriptor(actionDescriptor, getSourceProduct(), getDestinationProduct());
            actionDescriptor.toggle(canShowActionContainer() === true);
            actionDescriptor.append(htmlHelper.createDiv("copy", "smallButton", copyOptionParametersFromProduct));
            actionDescriptor.append(htmlHelper.createDiv("preview", "smallButton", previewOptionParametersFromProduct));
        },
        clearSelectionResult = function () {
            getSourceCommodityCells().removeClass("selectedCommodityCell");
            getDestinationCommodityCells().removeClass("selectedCommodityCell");
            showSelectionResult();
        },
        copyOptionParametersFromProduct = function () {
            var trader, sourceProduct, destinationProduct, displayError;
            sourceProduct = getSourceProduct();
            destinationProduct = getDestinationProduct();
            authorizationDataAccess.getCurrentUsername(function (response) {
                displayError = function (error) {
                    clearSelectionResult();
                    copyOptionParametersFromProductError.text(error);
                };
                if (!permissions.signOutOrDisplayError(response, displayError)) {
                    return;
                }
                trader = response.Message;
                copyOptionParametersDataAccess.copyOptionParametersFromProduct(trader, sourceProduct, destinationProduct, showCopyResult);
            });
        },
        showPreviewResult = function (response) {
            var table, tabSeparatedValues, downloadLink, displayError;
            previewPane.empty();
            previewPane.css('color', response.Success ? 'green' : "red");
            displayError = function (error) {
                clearSelectionResult();
                previewPane.fadeIn("slow");
                previewPane.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            contentContainer.empty();
            headerContainer.empty();
            tabSeparatedValues = factory.createOptionContractParametersText(response.Payload, ',');
            factory.appendCopyFromProductActionDescriptor(headerContainer, getSourceProduct(), getDestinationProduct());
            if ($.browser.webkit) {
                downloadLink = factory.createDownloadLink(tabSeparatedValues, librarian.ExportImage);
                headerContainer.append(downloadLink);
            }
            table = factory.createOptionContractParametersTable(response.Payload);
            contentContainer.append(table);
            common.clearPopup();
            container.appendTo(common.getPopup());
            container.show();
            common.showPopup(120, 100);
        },
        clearControls = function () {
            sourceProductCodesTableContainer.empty();
            sourceProductCodesTableContainer.hide();
            destinationProductCodesTableContainer.empty();
            destinationProductCodesTableContainer.hide();
            previewPane.hide();
            copyOptionParametersFromProductError.text('');
            previewPane.text('');
            actionDescriptor.hide();
        },
        displayOptionCodesTable = function (response) {
            var sourceCellClick, destinationCellClick, sourceTable, sourceTableHeader, cellsPerRow, destinationTable, destinationTableHeader, displayError;
            displayError = function (error) {
                clearSelectionResult();
                copyOptionParametersFromProductError.text(error);
            };
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            sourceCellClick = function () {
                getSourceCommodityCells().removeClass("selectedCommodityCell");
                $(this).removeClass("unselectedCell");
                $(this).addClass("selectedCommodityCell");
                showSelectionResult();
            };
            destinationCellClick = function () {
                getDestinationCommodityCells().removeClass("selectedCommodityCell");
                $(this).removeClass("unselectedCell");
                $(this).addClass("selectedCommodityCell");
                showSelectionResult();
            };
            cellsPerRow = 4;
            sourceProductCodesTableContainer.empty();
            sourceProductCodesTableContainer.show();
            sourceTable = htmlHelper.createTable(response.Payload, cellsPerRow, sourceCellClick);
            sourceTable.addClass("traderOptions");
            sourceTable.attr("id", "sourceTable");
            sourceTableHeader = htmlHelper.createCell(100, "Copy From", true).attr('colspan', "4").addClass('copyOptionParametersFromProductTableHeader');
            sourceTable.find('tr:first').before(sourceTableHeader);
            sourceProductCodesTableContainer.append(sourceTable);
            getSourceCommodityCells().addClass("unselectedCell");
            destinationProductCodesTableContainer.empty();
            destinationProductCodesTableContainer.show();
            destinationTable = htmlHelper.createTable(response.Payload, cellsPerRow, destinationCellClick);
            destinationTable.addClass("traderOptions");
            destinationTable.attr("id", "destinationTable");
            destinationTableHeader = htmlHelper.createCell(100, "Copy To", true).attr('colspan', "4").addClass('copyOptionParametersFromProductTableHeader');
            destinationTable.find('tr:first').before(destinationTableHeader);
            destinationProductCodesTableContainer.append(destinationTable);
            getDestinationCommodityCells().addClass("unselectedCell");
            copyOptionParametersFromProductWorkspace.fadeIn("slow");
        },
        copyOptionParametersFromProductTileClick = function () {
            var trader, displayError;
            tiles.fadeOut('slow', function () {
                authorizationDataAccess.getCurrentUsername(function (response) {
                    displayError = function (error) {
                        clearSelectionResult();
                        copyOptionParametersFromProductError.text(error);
                    };
                    if (!permissions.signOutOrDisplayError(response, displayError)) {
                        return;
                    }
                    trader = response.Message;
                    copyOptionParametersDataAccess.getNonDerivedCommoditiesForTrader(trader, displayOptionCodesTable);
                });
            });
        },
        assignEventHandlers = function () {
            copyOptionParametersFromProductTile.click(copyOptionParametersFromProductTileClick);
            copyOptionParametersFromProductCloseButton.click(function () {
                copyOptionParametersFromProductWorkspace.fadeOut('slow', function () {
                    clearControls();
                    tiles.fadeIn('slow');
                });
            });
        };
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
            copyOptionParametersDataAccess.initialize(urlLibrarian);
            authorizationDataAccess.initialize(urlLibrarian);
            assignEventHandlers();
        }
    };
};