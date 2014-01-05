"use strict";
var uploadOptionParametersFactory = function (common, htmlHelper) {
    var createSubTab = function(subTabsContainer, tablesContainer, text, selected) {
            var tab, span;
            tab = $("<div>");
            tab.attr('id', text);
            tab.addClass('subTab');
            tab.addClass(selected === true ? 'selectedSubTab' : 'unselectedSubTab');  
            tab.click(function () {
                var that, tableId;
                that = $(this);
                subTabsContainer.find('.subTab').removeClass('selectedSubTab');           
                that.removeClass('unselectedSubTab');
                that.addClass('selectedSubTab');
                tableId = that.closest('.separationContainer').find(".selectedTab").attr('id')+ '_' + that.attr("id");
                tablesContainer.find('table').hide();
                $('#' + tableId).fadeIn('slow');
            });
            span = $('<span>');
            span.text(text);
            tab.append(span);
            return tab;
        },
        createSubTabsContainer = function(tablesContainer) {
            var container;
            container = htmlHelper.createContainer('', 'optionParametersComparisonContainer');
            container.append(createSubTab(container, tablesContainer, "Current", true));
            container.append(createSubTab(container, tablesContainer, "Change"));
            container.append(createSubTab(container, tablesContainer, "Previous"));
            return container;
        },
        createOptionContractParametersTableHeader = function () {
            var row;
            row = $("<tr/>");
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
        createOptionContractParametersTableRow = function (element) {
            var row, cell;
            row = $("<tr/>");
            cell = htmlHelper.appendCell(row, element.ContractCode);
            cell.attr('title', 'Expiration: '+ element.OptionExpiration);
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
        },
        createPreviousTable = function(optionParametersComparison) {
            var table = $("<table/>"),
                product = optionParametersComparison.Product;
            table.attr("id", product + '_' + "Previous");
            table.addClass("tablePrevious optionParameterTable");
            table.append(createOptionContractParametersTableHeader());
            optionParametersComparison.Earlier.forEach(function (element) {
                table.append(createOptionContractParametersTableRow(element));
            });
            return table;
        },
         createChangeTable = function(optionParametersComparison) {
            var table = $("<table/>"),
                product = optionParametersComparison.Product;
            table.attr("id", product + '_' + "Change");
            table.addClass("tableChange optionParameterTable");
            table.append(createOptionContractParametersTableHeader());
            optionParametersComparison.Diff.forEach(function (element) {
                table.append(createOptionContractParametersTableRow(element));
            });
            return table;
        },
         createCurrentTable = function(optionParametersComparison) {
            var table = $("<table/>"),
                product = optionParametersComparison.Product;
            table.attr("id", product + '_' + "Current");
            table.addClass("tableCurrent optionParameterTable");
            table.append(createOptionContractParametersTableHeader());
            optionParametersComparison.Later.forEach(function (element) {
                table.append(createOptionContractParametersTableRow(element));
            });
            return table;
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
                var row =$(tableRows[rowCol.row]);
                var cells = row.find('td');
                var cell = $(cells[rowCol.col]);
                cell.addClass('hasNonZeroDelta');
            });
        },
         applyColor = function (earlierTable, diffTable, laterTable) {
            var rowColArray = getNonZeroCellIndices(diffTable);
            highlightDeltas(rowColArray, earlierTable.find('tr') );
            highlightDeltas(rowColArray, diffTable.find('tr'));
            highlightDeltas(rowColArray, laterTable.find('tr'));
        },
        appendOptionContractParametersTables = function (parent, optionParametersComparison) {
            var currentTable, changeTable, previousTable;
            currentTable = createCurrentTable(optionParametersComparison);
            parent.append(currentTable);
            changeTable = createChangeTable(optionParametersComparison);
            parent.append(changeTable);
            previousTable = createPreviousTable(optionParametersComparison);
            parent.append(previousTable);
            applyColor(previousTable, changeTable, currentTable);
            parent.find('table').hide();
        };
    return {
        appendOptionParametersTables: function (tabsParent, comparisonsContainer, tablesContainer, payload) {
            if (!payload || payload.length === 0) {
                return;
            }
            var subTabsContainer = createSubTabsContainer(tablesContainer);
            comparisonsContainer.append(subTabsContainer);
            payload.forEach(function (optionParametersComparison) {
                var tab, span;
                tab = $("<div>");
                tab.attr('id', optionParametersComparison.Product);
                tab.addClass('unselectedTab');
                span = $('<span>');
                span.text(optionParametersComparison.Product);
                tab.append(span);
                tabsParent.append(tab);
                tab.click(function () {
                    var that, defaultTableId, defaultSubTab;
                    that = $(this);
                    defaultTableId = that.attr('id') + '_' + "Current";
                    defaultSubTab = $("#Current");
                    tabsParent.find('div').addClass('unselectedTab');
                    tabsParent.find('div').removeClass('selectedTab');
                    that.removeClass('unselectedTab');
                    that.addClass('selectedTab');                    
                    tablesContainer.find('table').hide();
                    $('#' + defaultTableId).fadeIn('slow');
                    subTabsContainer.find('.subTab').removeClass('selectedSubTab');           
                    defaultSubTab.removeClass('unselectedSubTab');
                    defaultSubTab.addClass('selectedSubTab');
                });
                appendOptionContractParametersTables(tablesContainer, optionParametersComparison);
            });
            tabsParent.find('div:first').removeClass('unselectedTab');
            tabsParent.find('div:first').addClass('selectedTab');
            $('#' + tabsParent.find('div:first').attr('id') + '_' + "Current").fadeIn('slow');
        },
    };
};