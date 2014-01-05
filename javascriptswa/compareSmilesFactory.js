"use strict";
define(['common', 'htmlHelper', 'eventListener'], function (common, htmlHelper, eventListener) {
    var that,
        getArchiveSetCells = function() {
            return $('#archiveSetsTable td');
        },
        getLastSelectedArchiveSetCell = function() {
            return $('#archiveSetsTable td.lastSelected');
        },
        getSelectedArchiveSetIds = function() {
            var cells, ids;
            cells = $('#archiveSetsTable td');
            ids = [];
            cells.each(function() {
                var cell = $(this);
                if (cell.hasClass("selectedArchiveCell")) {
                    ids.push(cell.attr("id"));
                }
            });
            return ids;
        },
        cellClick = function() {
            var lastSelected, selectedIds, earlierArchiveID, laterArchiveID;
            if ($(this).hasClass("selectedArchiveCell")) {
                return;
            }
            getArchiveSetCells().removeClass("selectedArchiveCell");
            lastSelected = getLastSelectedArchiveSetCell();
            lastSelected.removeClass("lastSelected");
            lastSelected.addClass("selectedArchiveCell");
            $(this).removeClass("unselectedCell");
            $(this).addClass("lastSelected");
            $(this).addClass("selectedArchiveCell");
            selectedIds = getSelectedArchiveSetIds();
            if (!selectedIds || selectedIds.length !== 2) {
                return;
            }
            earlierArchiveID = Math.min(selectedIds[0], selectedIds[1]);
            laterArchiveID = Math.max(selectedIds[0], selectedIds[1]);
            eventListener.fire("archiveSetsSelected", [earlierArchiveID, laterArchiveID]);
        },
        createArchiveSetsTableHeader = function() {
            var row;
            row = $("<tr/>");
            htmlHelper.appendCell(row, "Archive Sets", '', true, "archiveSetHeader");
            return row;
        },
        createArchiveSetTableRow = function(archiveSet) {
            var row, cell;
            row = $("<tr/>");
            cell = htmlHelper.appendCell(row, archiveSet.Value, 120, false, 'unselectedCell');
            cell.attr('id', archiveSet.Key);
            cell.bind("click", cellClick);
            return row;
        },
        createOptionContractParametersTableHeader = function() {
            var row;
            row = $("<tr/>");
            htmlHelper.appendCell(row, "COM", null, true);
            htmlHelper.appendCell(row, "CNTR", null, true);
            htmlHelper.appendCell(row, "FUT", null, true);
            htmlHelper.appendCell(row, "VOL", null, true);
            htmlHelper.appendCell(row, "VDIFF", null, true);
            htmlHelper.appendCell(row, "PIVT", null, true);
            htmlHelper.appendCell(row, "VSLP", null, true);
            htmlHelper.appendCell(row, "VADJ", null, true);
            htmlHelper.appendCell(row, "A", null, true);
            htmlHelper.appendCell(row, "B", null, true);
            htmlHelper.appendCell(row, "C", null, true);
            htmlHelper.appendCell(row, "D", null, true);
            htmlHelper.appendCell(row, "E", null, true);
            htmlHelper.appendCell(row, "F", null, true);
            htmlHelper.appendCell(row, "G", null, true);
            htmlHelper.appendCell(row, "H", null, true);
            htmlHelper.appendCell(row, "INT", null, true);
            htmlHelper.appendCell(row, "SKSLP", null, true);
            htmlHelper.appendCell(row, "YLD", null, true);
            return row;
        },
        createOptionContractParametersTableRow = function(element) {
            var row, cell;
            row = $("<tr/>");
            htmlHelper.appendCell(row, element.OptionCode);
            cell = htmlHelper.appendCell(row, element.ContractCode);
            cell.attr('title', 'Expiration: ' + element.OptionExpiration);
            htmlHelper.appendCell(row, element.UnderlyingPrice);
            htmlHelper.appendCell(row, element.Volatility);
            htmlHelper.appendCell(row, element.VolatilityOffsetToBase);
            htmlHelper.appendCell(row, element.PivotValue);
            htmlHelper.appendCell(row, element.VolatilitySlope);
            htmlHelper.appendCell(row, element.VolatilityAdjustment);
            htmlHelper.appendCell(row, element.ParameterA);
            htmlHelper.appendCell(row, element.ParameterB);
            htmlHelper.appendCell(row, element.ParameterC);
            htmlHelper.appendCell(row, element.ParameterD);
            htmlHelper.appendCell(row, element.ParameterE);
            htmlHelper.appendCell(row, element.ParameterF);
            htmlHelper.appendCell(row, element.ParameterG);
            htmlHelper.appendCell(row, element.ParameterH);
            htmlHelper.appendCell(row, element.InterestRate);
            htmlHelper.appendCell(row, element.SkewSlope);
            htmlHelper.appendCell(row, element.DividendYield);
            return row;
        };
    that = {
        addListener: function (type, listener) {
            eventListener.addListener(type, listener);
        },
        removeListener: function (type, listener) {
            eventListener.removeListener(type, listener);
        },
        createOptionContractParametersTable: function (array, className) {
            var table = $("<table/>");
            table.attr("id", "optionContractParametersTable");
            if (className) {
                table.addClass(className);
            }
            table.append(createOptionContractParametersTableHeader());
            array.forEach(function (element) {
                table.append(createOptionContractParametersTableRow(element));
            });
            return table;
        },
        createArchiveSetsTable: function (archiveSets) {
            var table;
            table = $("<table/>");
            table.attr("id", "archiveSetsTable");
            table.append(createArchiveSetsTableHeader());
            archiveSets.forEach(function (archiveSet) {
                table.append(createArchiveSetTableRow(archiveSet));
            });
            return table;
        }
    };
    return that;
});