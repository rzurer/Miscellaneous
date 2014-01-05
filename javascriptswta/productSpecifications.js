/*global  $*/
"use strict";
var productSpecifications = function (common, dataAccess, factory, calendar, permissions) {
    var productSpecificationsTile = $("#productSpecificationsTile"),
        productSpecificationsCloseButton = $("#productSpecificationsCloseButton"),
        productSpecificationsWorkspace = $('#productSpecifications'),
        productSpecificationsError = $('#productSpecificationsError'),
        productSpecificationsTableContainer = $('#productSpecificationsTableContainer'),
        tiles = $('#tiles'),
        hideError = function () {
            productSpecificationsError.text('');
        },
        displayError = function (error) {
            productSpecificationsError.text(error);
        },
        clear = function () {
            hideError();
            $('#calendarContainer').empty();
            productSpecificationsTableContainer.empty();
        },
        getProductSpecificationsTable = function () {
            return $('#productSpecificationsTable');
        },
        searchTermMatchesTextFilter = function (row, searchTerm) {
            var symbol, productDescription, term;
            symbol = row.find('td.psSymbol').text().toLowerCase();
            productDescription = row.find('td.psProductDescription').text().toLowerCase();
            term = searchTerm.toLowerCase();
            return symbol.indexOf(term) >= 0 || productDescription.indexOf(term) >= 0;
        },
        applyFilter = function () {
            var rows, row, noFilter, i, productFilter, securityTypeFilter, exchangeFilter, textFilter, shouldShowRow, productMatches, securityTypeMatches, exchangeMatches, textMatches;
            productFilter = $('#psProductSelect').val();
            securityTypeFilter = $('#psSecurityTypeSelect').val();
            exchangeFilter = $('#psExchangeSelect').val();
            textFilter = $('#nameFilterInput').val();
            rows = getProductSpecificationsTable().find('tr');
            noFilter = 'All';
            for (i = 1; i < rows.length; i += 1) {
                row = $(rows[i]);
                productMatches = row.find('td.traderHasProductListed').text() === 'true';
                securityTypeMatches = row.find('td.psSecurityType').text() === securityTypeFilter;
                exchangeMatches = row.find('td.psExchange').text() === exchangeFilter;
                textMatches = searchTermMatchesTextFilter(row, textFilter);

                if (productFilter === noFilter && securityTypeFilter === noFilter && exchangeFilter === noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = true;
                }

                if (productFilter !== noFilter && securityTypeFilter === noFilter && exchangeFilter === noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = productMatches;
                }
                if (productFilter === noFilter && securityTypeFilter !== noFilter && exchangeFilter === noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = securityTypeMatches;
                }
                if (productFilter === noFilter && securityTypeFilter === noFilter && exchangeFilter !== noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = exchangeMatches;
                }
                if (productFilter === noFilter && securityTypeFilter === noFilter && exchangeFilter === noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = textMatches;
                }

                if (productFilter !== noFilter && securityTypeFilter !== noFilter && exchangeFilter === noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = productMatches && securityTypeMatches;
                }
                if (productFilter !== noFilter && securityTypeFilter === noFilter && exchangeFilter !== noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = productMatches && exchangeMatches;
                }
                if (productFilter !== noFilter && securityTypeFilter === noFilter && exchangeFilter === noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = productMatches && textMatches;
                }
                if (productFilter === noFilter && securityTypeFilter !== noFilter && exchangeFilter !== noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = securityTypeMatches && exchangeMatches;
                }
                if (productFilter === noFilter && securityTypeFilter !== noFilter && exchangeFilter === noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = securityTypeMatches && textMatches;
                }
                if (productFilter === noFilter && securityTypeFilter === noFilter && exchangeFilter !== noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = productMatches && textMatches;
                }

                if (productFilter === noFilter && securityTypeFilter !== noFilter && exchangeFilter !== noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = securityTypeMatches && exchangeMatches && textMatches;
                }
                if (productFilter !== noFilter && securityTypeFilter === noFilter && exchangeFilter !== noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = productMatches && exchangeMatches && textMatches;
                }
                if (productFilter !== noFilter && securityTypeFilter !== noFilter && exchangeFilter === noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = productMatches && securityTypeMatches && textMatches;
                }
                if (productFilter !== noFilter && securityTypeFilter !== noFilter && exchangeFilter !== noFilter && textFilter.trim().length === 0) {
                    shouldShowRow = productMatches && securityTypeMatches && exchangeMatches;
                }

                if (productFilter !== noFilter && securityTypeFilter !== noFilter && exchangeFilter !== noFilter && textFilter.trim().length > 0) {
                    shouldShowRow = productMatches && securityTypeMatches && exchangeMatches && textMatches;
                }
                if (shouldShowRow) {
                    row.show();
                } else {
                    row.hide();
                }
            }
        },
        closeWorkspace = function () {
            productSpecificationsWorkspace.fadeOut('slow', function () {
                clear();
                tiles.fadeIn('slow');
            });
        },
        productSpecificationsTileClick = function () {
            tiles.fadeOut('slow', function () {
                productSpecificationsWorkspace.fadeIn("slow");
            });
            var callback = function (response) {
                if (!permissions.signOutOrDisplayError(response, displayError)) {
                    return;
                };
                factory.appendProductSpecificationsTable(productSpecificationsTableContainer, response.Payload);
                $('#psProductSelect').change(applyFilter);
                $('#psSecurityTypeSelect').change(applyFilter);
                $('#psExchangeSelect').change(applyFilter);
                $('#nameFilterInput').keyup(applyFilter);
            };
            dataAccess.retrieveProductSpecifications(callback);
        },
        assignEventHandlers = function () {
            productSpecificationsTile.click(productSpecificationsTileClick);
            productSpecificationsCloseButton.click(closeWorkspace);
        },
        displayHolidayAndContractSpecificationsForProduct = function (response) {
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            var parent, contractSpecificationYears, holidays, productCode, derivativeType, holidayScheduleID, holidayScheduleName, target;
            parent = $('#calendarContainer');
            parent.empty();
            contractSpecificationYears = response.Payload.ContractSpecificationYears;
            holidays = response.Payload.Holidays;
            productCode = response.Payload.Parameters.productCode;
            derivativeType = response.Payload.Parameters.securityType;
            holidayScheduleID = response.Payload.Parameters.holidayScheduleID;
            holidayScheduleName = response.Payload.Parameters.holidayScheduleName;
            target = $("#" + productCode + "_" + holidayScheduleID);
            if (contractSpecificationYears.length === 0) {
                common.showToaster("No active contracts exist for " + productCode, { isError: true, parent: target });
                return;
            }
            calendar.renderCalendars(parent, productCode, holidays, contractSpecificationYears, derivativeType, holidayScheduleName);
            parent.appendTo(common.getPopup());
            parent.show();
            var top = target.offset().top;
            common.showPopup(top - 200, 200);
        };
    return {
        initialize: function (urlLibrarian) {
            dataAccess.initialize(urlLibrarian);
            factory.initialize(urlLibrarian, dataAccess.getHolidayAndContractSpecificationsForProduct, displayHolidayAndContractSpecificationsForProduct);
            assignEventHandlers();
        }
    };
};