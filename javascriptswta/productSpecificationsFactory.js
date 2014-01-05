/*global  $, window*/
"use strict";
var productSpecificationsFactory = function (common, htmlHelper) {
    var getHolidayAndContractSpecificationsForProductFunction,
        getHolidayAndContractSpecificationsForProductFunctionCallback,
        librarian,
        createContractDefinitionButton = function (contractDefinitionURL) {
            var image;
            if (!contractDefinitionURL || contractDefinitionURL.length === 0) {
                return $('<span>');
            }
            image = htmlHelper.createRepeatingImageButton(librarian.WebsiteImage, 'Click to view contract definition', 'contractDefinitionLink');
            image.click(function (event) {
                window.open(contractDefinitionURL, 'Contract Definition');
                event.stopPropagation();
            });
            return image;
        },
        getUniqueExchanges = function (productSpecifications) {
            var exchanges = [];
            productSpecifications.forEach(function (element) {
                if (exchanges.indexOf(element.ExchangeCode) === -1) {
                    exchanges.push(element.ExchangeCode);
                }
            });
            return exchanges;
        },
        createProductSpecificationsHeader = function (productSpecifications) {
            var row, uniqueExchanges, nameFilterInput;
            row = $("<tr/>");
            uniqueExchanges = getUniqueExchanges(productSpecifications);
            uniqueExchanges.unshift("All");
            htmlHelper.appendHeaderCell(row, "", 0);
            htmlHelper.appendHeaderCell(row, "", 0);
            row.append(htmlHelper.createSelectHeaderCell("Product", 60, 'filterSelect styled', 'psProductSelect', ["All", "Mine"]));
            row.append(htmlHelper.createSelectHeaderCell("Type", 50, 'filterSelect styled', 'psSecurityTypeSelect', ["All", "Fut", "Opt"]));
            row.append(htmlHelper.createSelectHeaderCell("Exchange", 100, 'filterSelect styled', 'psExchangeSelect', uniqueExchanges));
            htmlHelper.appendHeaderCell(row, "<div><div>Exch</div><div>Code</div></div>", 50);
            htmlHelper.appendHeaderCell(row, "<div><div>Exp</div><div>Type</div></div>", 60);
            nameFilterInput = $("<input>").attr({ "id": "nameFilterInput", "type": "text" }).addClass("styled");
            htmlHelper.appendHeaderCell(row, $("<div>").attr({ "id": "nameFilter" }).append($("<span>").text("Name"), nameFilterInput), 400);
            htmlHelper.appendHeaderCell(row, "Underliers", 60);
            htmlHelper.appendHeaderCell(row, "<div><div>Tick</div><div>Value</div></div>", 60, 'rightAligned');
            htmlHelper.appendHeaderCell(row, "Url", 40, 'centerAligned');
            return row;
        },
        appendUnderliersCell = function (parentRow, productSpecification) {
            var cell, products, underliers;
            products = productSpecification.Underliers.map(function (underlier) { return underlier.Product; });
            underliers = productSpecification.Underliers.map(function (underlier) { return underlier.Product + '/' + underlier.Quantity; });
            cell = htmlHelper.appendCell(parentRow, products.join(', '), '', false, 'bold orangered');
            cell.attr("title", underliers.join(', '));
        },
        createProductSpecificationsRow = function (productSpecification) {
            var row, cell, securityTypeClassname, expirationTypeClassname;
            row = htmlHelper.createRow();
            row.attr("id", productSpecification.ProductCode + "_" + productSpecification.HolidayScheduleID);
            row.click(function () {
                getHolidayAndContractSpecificationsForProductFunction(productSpecification.ProductCode, productSpecification.SecurityType, productSpecification.HolidayScheduleID,
                    productSpecification.HolidayScheduleName, getHolidayAndContractSpecificationsForProductFunctionCallback);
            });
            htmlHelper.appendCell(row, productSpecification.TraderHasProductListed, 0, false, 'traderHasProductListed');
            htmlHelper.appendCell(row, "??", 0, false, 'holidayScheduleID');
            htmlHelper.appendCell(row, productSpecification.ProductCode, '', false, 'bold green psSymbol');
            securityTypeClassname = productSpecification.SecurityType === 'Fut' ? 'green psSecurityType' : 'red psSecurityType';
            htmlHelper.appendCell(row, productSpecification.SecurityType, '', false, securityTypeClassname);
            htmlHelper.appendCell(row, productSpecification.ExchangeCode, '', false, 'bold purple psExchange');
            htmlHelper.appendCell(row, productSpecification.ExchangeProductCode, '', false, 'bold');
            expirationTypeClassname = productSpecification.ExpirationType === 'CASH' ? 'green' : 'blue';
            htmlHelper.appendCell(row, productSpecification.ExpirationType, '', false, expirationTypeClassname);
            cell = htmlHelper.appendCell(row, productSpecification.ProductDescription, '', false, "psProductDescription");
            common.truncateText(cell, 60);
            appendUnderliersCell(row, productSpecification);
            htmlHelper.appendCell(row, productSpecification.TickValue, '', false, 'rightAligned');
            cell = htmlHelper.appendCell(row);
            cell.append(createContractDefinitionButton(productSpecification.ContractDefinitionURL));
            return row;
        },
        createProductSpecificationsTable = function (productSpecifications) {
            var table = $("<table>");
            table.attr("id", "productSpecificationsTable");
            table.append(createProductSpecificationsHeader(productSpecifications));
            productSpecifications.forEach(function (productSpecification) {
                table.append(createProductSpecificationsRow(productSpecification));
            });
            return table;
        };
    return {
        appendProductSpecificationsTable: function (parent, payload) {
            if (!payload || payload.length === 0) {
                return;
            }
            parent.append(createProductSpecificationsTable(payload));
        },
        initialize: function (urlLibrarian, getHolidayAndContractSpecificationsForProduct, getHolidayAndContractExpirationSchedulesForProductCallback) {
            librarian = urlLibrarian;
            getHolidayAndContractSpecificationsForProductFunction = getHolidayAndContractSpecificationsForProduct;
            getHolidayAndContractSpecificationsForProductFunctionCallback = getHolidayAndContractExpirationSchedulesForProductCallback;

        }
    };
};