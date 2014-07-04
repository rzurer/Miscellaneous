/*globals define*/
define(['common', 'htmlHelper', 'userManagement/valuationServiceAccounts', 'userManagement/localDataStore', 'userManagement/companyContacts'], function (common, htmlHelper, valuationServiceAccounts, localDataStore, companyContacts) {
    "use strict";
    var eSignalMarketDataFeedProviderID = '5DBB7EA7-9EB8-478A-83E4-BB28EEAFA5F2',
        viewToaster = $('#viewToaster'),
        viewUsername = $('#viewUsername'),
        viewEmail = $('#viewEmail'),
        viewFirstName = $('#viewFirstName'),
        viewLastName = $('#viewLastName'),
        viewWorkPhone = $('#viewWorkPhone'),
        viewMobilePhone = $('#viewMobilePhone'),
        viewLicenseType = $('#viewLicenseType'),
        viewLicenseExpiration = $('#viewLicenseExpiration'),
        viewCancellationReasonContainer = $('#viewCancellationReasonContainer'),
        viewCancellationReason = $('#viewCancellationReason'),
        viewComment = $('#viewComment'),
        viewValuationServiceAccounts = $('#viewValuationServiceAccounts'),
        viewESignalSpecificInformation = $('#viewESignalSpecificInformation'),
        viewMarketDataFeedProviderType = $('#viewMarketDataFeedProviderType'),
        viewMarketDataFeedSubscriptionLimit = $('#viewMarketDataFeedSubscriptionLimit'),
        viewMarketDataFeedUserName = $('#viewMarketDataFeedUserName'),
        viewMarketDataFeedPassword = $('#viewMarketDataFeedPassword'),
        viewMarketDataFeedProxyAddress = $('#viewMarketDataFeedProxyAddress'),
        viewMarketDataFeedProxyPort = $('#viewMarketDataFeedProxyPort'),
        viewMarketDataFeedProxyUserName = $('#viewMarketDataFeedProxyUserName'),
        viewMarketDataFeedProxyPassword = $('#viewMarketDataFeedProxyPassword'),
        viewUserOptions = $('#viewUserOptions'),
        viewUserFutures = $('#viewUserFutures'),
        viewScreenSheets = $('#viewScreenSheets'),
        displayValuationServiceAccounts = function (serviceAccounts) {
            var valuationServiceAccountsTable;
            viewValuationServiceAccounts.empty();
            valuationServiceAccountsTable = valuationServiceAccounts.createValuationServiceAccountsTable(serviceAccounts);
            viewValuationServiceAccounts.append(valuationServiceAccountsTable);
        },
        viewProducts = function (userOptions, userFutures) {
            var spans;
            viewUserOptions.empty();
            viewUserFutures.empty();
            if (userOptions && userOptions.length > 0) {
                userOptions.sort();
                spans = [];
                userOptions.forEach(function (option) {
                    spans.push($('<span>').text(option));
                });
                viewUserOptions.append(htmlHelper.createFixedColumnsTable(spans, 13, "viewProductsTable"));
            }
            if (userFutures && userFutures.length > 0) {
                userFutures.sort();
                spans = [];
                userFutures.forEach(function (future) {
                    spans.push($('<span>').text(future));
                });
                viewUserFutures.append(htmlHelper.createFixedColumnsTable(spans, 13, "viewProductsTable"));
            }
        },
        viewUserScreenSheets = function (screenSheets) {
            var spans;
            viewScreenSheets.empty();
            if (screenSheets && screenSheets.length > 0) {
                spans = [];
                screenSheets.forEach(function (screenSheet) {
                    spans.push($('<span>').text(screenSheet.CommodityCode + '( ' + screenSheet.SheetName + ' )'));
                });
                viewScreenSheets.append(htmlHelper.createFixedColumnsTable(spans, 6, "viewScreenSheetsTable"));
            }
        },
        displayUserInformation = function (userInfo) {
            var licenseType = userInfo.LicenseType;         
            localDataStore.setUserInfo(userInfo);
            localDataStore.setCurrentUsername(userInfo.Name);
            companyContacts.initializeControls();
            viewUsername.text(userInfo.Name);
            viewEmail.text(userInfo.Email);
            viewFirstName.text(userInfo.FirstName);
            viewLastName.text(userInfo.LastName);
            viewWorkPhone.text(userInfo.WorkPhone);
            viewMobilePhone.text(userInfo.MobilePhone);
            viewLicenseType.text(licenseType);
            viewLicenseExpiration.text(userInfo.LicenseExpiration);
            if (licenseType !== 'None') {
                viewCancellationReasonContainer.hide();
            } else {
                viewCancellationReasonContainer.show();
                viewCancellationReason.text(userInfo.CancellationReason);
            }
            var licenseComment = userInfo.LicenseComment;
            viewComment.text(htmlHelper.truncateAndShow(licenseComment, 100, viewComment, viewToaster, 'narrowToaster'));
            displayValuationServiceAccounts(userInfo.ValuationServiceAccounts);
            viewMarketDataFeedProviderType.text(userInfo.MarketDataFeedProviderType || 'None');
            viewMarketDataFeedSubscriptionLimit.text(userInfo.MarketDataFeedSubscriptionLimit || 'N/A');
            if (userInfo.MarketDataFeedProviderTypeID && userInfo.MarketDataFeedProviderTypeID.toUpperCase() === eSignalMarketDataFeedProviderID) {
                viewESignalSpecificInformation.show();
                viewMarketDataFeedUserName.text(userInfo.MarketDataFeedUserName);
                viewMarketDataFeedPassword.text(userInfo.MarketDataFeedPassword);
                viewMarketDataFeedProxyAddress.text(userInfo.MarketDataFeedProxyAddress);
                viewMarketDataFeedProxyPort.text(userInfo.MarketDataFeedProxyPort);
                viewMarketDataFeedProxyUserName.text(userInfo.MarketDataFeedProxyUserName);
                viewMarketDataFeedProxyPassword.text(userInfo.MarketDataFeedProxyPassword);

            } else {
                viewESignalSpecificInformation.hide();
            }
            viewProducts(userInfo.UserOptions, userInfo.UserFutures);
            viewUserScreenSheets(userInfo.ScreenSheets);
        };
    return {
        displayUserInformation: displayUserInformation
    };
});


