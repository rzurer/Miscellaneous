"use strict";
define(['common', 'htmlHelper', 'copyOptionParametersDataAccess', 'compareSmilesFactory'], function (common, htmlHelper, dataAccess, factory) {
    var earlier = $('#earlier'),
        diff = $('#diff'),
        later = $('#later'),
        earlierTab = $('#earlierTab'),
        diffTab = $('#diffTab'),
        laterTab = $('#laterTab'),
        compareSmilesWorkspace = $("#compareSmiles"),
        archiveSetsTraderSelect = $("#archiveSetsTraderSelect"),
        archiveSetsTraderProductsSelect = $("#archiveSetsTraderProductsSelect"),
        compareSmilesError = $("#compareSmilesError"),
        archiveSetsContainer = $("#archiveSets"),
        tabsContainer = $("#tabs"),
        getTrader = function () {
            return archiveSetsTraderSelect.val();
        },
        getProduct = function () {
            return archiveSetsTraderProductsSelect.val();
        },
        clearComparisonTables = function () {
            tabsContainer.fadeOut();
            earlier.fadeOut();
            earlier.empty();
            diff.fadeOut();
            diff.empty();
            later.fadeOut();
            later.empty();
        },
        displayArchiveSets = function (response) {
            var table, createArchiveSetsTable;
            if (!response.Success) {
                if (response.Message === common.sessionTimedOutMessage) {
                    return;
                }
                compareSmilesError.text(response.Message);
                return;
            }
            createArchiveSetsTable = function () {
                archiveSetsContainer.empty();
                table = factory.createArchiveSetsTable(response.Payload);
                archiveSetsContainer.append(table);
                archiveSetsContainer.fadeIn('slow');
            };
            archiveSetsContainer.fadeOut('slow', createArchiveSetsTable);
        },
        getParametersArchiveSetsForTraderByProduct = function () {
            compareSmilesError.text('');
            clearComparisonTables();
            var trader = getTrader();
            var product = getProduct();
            if (!trader || !product) {
                archiveSetsContainer.empty();
                return;
            }
            dataAccess.getParametersArchiveSetsForTraderByProduct(trader, product, displayArchiveSets);
        },
        fillTradersSelect = function (response) {
            if (!response.Success) {
                if (response.Message === common.sessionTimedOutMessage) {
                    return;
                }
                compareSmilesError.text(response.Message);
                return;
            }
            htmlHelper.fillSelectFromList(archiveSetsTraderSelect, "Choose Trader", response.Payload, "< select >");
        },
        initializeTradersSelect = function () {
            compareSmilesError.text('');
            clearComparisonTables();
            archiveSetsContainer.empty();
            tabsContainer.hide();
            compareSmilesWorkspace.fadeIn('slow');
            htmlHelper.initializeSelect(archiveSetsTraderProductsSelect, "Choose Product", "< select >");
            dataAccess.getTradersHavingArchiveSetsAsOf(fillTradersSelect);
        },
        fillProductsSelect = function (response) {
            if (!response.Success) {
                if (response.Message === common.sessionTimedOutMessage) {
                    return;
                }
                compareSmilesError.text(response.Message);
                return;
            }
            htmlHelper.fillSelectFromList(archiveSetsTraderProductsSelect, "Choose Product", response.Payload, "< select >");
        },
        getProductsForTrader = function () {
            compareSmilesError.text('');
            clearComparisonTables();
            archiveSetsContainer.empty();
            tabsContainer.hide();
            var trader = getTrader();
            if (!trader) {
                htmlHelper.initializeSelect(archiveSetsTraderProductsSelect, "Choose Product", "< select >");
                return;
            }
            dataAccess.getProductsForTradersHavingArchiveSetsAsOf(trader, fillProductsSelect);
        },
         getSelectedArchiveSetsInfos = function () {
             var cells, infos;
             cells = $('#archiveSetsTable td');
             infos = [];
             cells.each(function () {
                 var cell = $(this);
                 if (cell.hasClass("selectedArchiveCell")) {
                     infos.push({ id: cell.attr("id"), text: cell.text() });
                 }
             });
             return infos;
         },
        getSelectedArchiveDates = function () {
            var infos = getSelectedArchiveSetsInfos();
            if (!infos || infos.length !== 2) {
                return { earlierDate: '', laterDate: '' };
            }
            if (Number(infos[0].id) < Number(infos[1].id)) {
                return { earlierDate: infos[0].text, laterDate: infos[1].text };
            }
            return { earlierDate: infos[1].text, laterDate: infos[0].text };
        },
        selectEarlierTab = function () {
            diff.fadeOut();
            later.fadeOut();
            earlierTab.css({
                "background-color": "rgb(233, 231, 231)",
                "color": "black",
                "font-weight": "bold"
            });
            diffTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            laterTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            earlier.fadeIn('slow');
        },
        selectDiffTab = function () {
            earlier.fadeOut();
            later.fadeOut();
            diffTab.css({
                "background-color": "rgb(233, 231, 231)",
                "color": "black",
                "font-weight": "bold"
            });
            earlierTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            laterTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            diff.fadeIn('slow');
        },
        selectLaterTab = function () {
            earlier.fadeOut();
            diff.fadeOut();
            laterTab.css({
                "background-color": "rgb(233, 231, 231)",
                "color": "black",
                "font-weight": "bold"
            });
            earlierTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            diffTab.css({
                "background-color": "transparent",
                "color": "dimgray",
                "font-weight": "normal"
            });
            later.fadeIn('slow');
        },
        getNonZeroCellIndices = function (diffTable) {
            var rowColArray = [];
            var diffTableRows = diffTable.find('tr');
            for (var i = 1; i < diffTableRows.length; i++) {
                var cells = $(diffTableRows[i]).find('td');
                for (var j = 2; j < cells.length; j++) {
                    var cell = $(cells[j]);
                    var cellValue = Number(cell.text());
                    if (cellValue < 0 || cellValue > 0) {
                        rowColArray.push({ row: i, col: j });
                    }
                }
            }
            return rowColArray;
        },
        highlightDeltas = function (rowColArray, tableRows) {
            rowColArray.forEach(function (rowCol) {
                var row = $(tableRows[rowCol.row]);
                var cells = row.find('td');
                var cell = $(cells[rowCol.col]);
                cell.addClass('hasNonZeroDelta');
            });
        },
        applyColor = function (earlierTable, diffTable, laterTable) {
            var rowColArray = getNonZeroCellIndices(diffTable);
            highlightDeltas(rowColArray, earlierTable.find('tr'));
            highlightDeltas(rowColArray, diffTable.find('tr'));
            highlightDeltas(rowColArray, laterTable.find('tr'));
        },
        archiveSetsSelected = function (earlierArchiveID, laterArchiveID) {
            var product, callback, selectedArchiveDates, earlierTable, diffTable, laterTable;
            callback = function (response) {
                if (!response.Success) {
                    if (response.Message === common.sessionTimedOutMessage) {
                        return;
                    }
                    compareSmilesError.text(response.Message);
                    return;
                }
                clearComparisonTables();
                earlierTable = factory.createOptionContractParametersTable(response.Payload.Earlier, "earlierTable");
                diffTable = factory.createOptionContractParametersTable(response.Payload.Diff, "diffTable");
                laterTable = factory.createOptionContractParametersTable(response.Payload.Later, "laterTable");
                applyColor(earlierTable, diffTable, laterTable);
                earlier.append(earlierTable);
                diff.append(diffTable);
                later.append(laterTable);
                selectedArchiveDates = getSelectedArchiveDates();
                tabsContainer.fadeIn("slow");
                earlierTab.text(selectedArchiveDates.earlierDate);
                laterTab.text(selectedArchiveDates.laterDate);
                selectEarlierTab();
            };
            product = getProduct();
            if (!product) {
                return;
            }
            dataAccess.getOptionParametersArchiveSetComparisons(earlierArchiveID, laterArchiveID, product, callback);
        },
        assignEventHandlers = function () {
            earlierTab.click(selectEarlierTab);
            diffTab.click(selectDiffTab);
            laterTab.click(selectLaterTab);
            archiveSetsTraderSelect.change(getProductsForTrader);
            archiveSetsTraderProductsSelect.change(getParametersArchiveSetsForTraderByProduct);
        };
    return {
        initialize: function () {
            assignEventHandlers();
            factory.addListener("archiveSetsSelected", archiveSetsSelected);
            initializeTradersSelect();
        }
    };
});
