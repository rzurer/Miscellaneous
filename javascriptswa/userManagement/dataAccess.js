/*globals define*/
define(['common'], function (common) {
    "use strict";
    return {
        getLicenseTypes: function (callback) {
            var url = "GetLicenseTypes";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getNonSpecAccountUsernames: function (callback, wantLiveOnly) {
            var data, url;
            url = "GetNonSpecAccountUsernames";
            data = wantLiveOnly ? { wantLiveOnly: true } : null;
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        getProductNameDictionaries: function (callback) {
            var url = "GetProductNameDictionaries";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getUsersHavingProducts: function (callback) {
            var url = "GetUsersHavingProducts";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getCancellationReasons: function (callback) {
            var url = "GetCancellationReasons";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getICEProducts: function (callback) {
            var url = "GetICEProducts";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getProductsAndUnderliers: function (callback) {
            var url = "GetProductsAndUnderliers";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getMarketDataFeedProviders: function (callback) {
            var url = "GetMarketDataFeedProviders";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getValuationServiceSessions: function (callback) {
            var url = "GetValuationServiceSessions";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getMarketDataFeedSubscriptionLimits: function (callback) {
            var url = "GetMarketDataFeedSubscriptionLimits";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getBasicOptionSetupsDictionaries: function (trader, optionsCsv, callback) {
            var url = "GetBasicOptionSetupsDictionaries";
            common.postFunction(url, { trader: trader, optionsCsv: optionsCsv }, function (response) {
                callback(response);
            });
        },
        getBasicFutureSetupsDictionaries: function (trader, futuresCsv, callback) {
            var url = "GetBasicFutureSetupsDictionaries";
            common.postFunction(url, { trader: trader, futuresCsv: futuresCsv }, function (response) {
                callback(response);
            });
        },
        persistUserInformationToSandbox: function (userInfo, callback) {
            var url = "PersistUserInformationToSandbox";
            common.postFunction(url, { username: userInfo.Name, userInfo: JSON.stringify(userInfo)}, function (response) {
                callback(response);
            });
        },
        getUserInformation: function (username, licenseTypeID, callback) {
            var url = "GetUserInformation";
            common.postFunction(url, { username: username, licenseTypeID: licenseTypeID }, function (response) {
                callback(response);
            });
        },
        validateNewUser: function (userInfo, callback) {
            var url = "ValidateNewUser";
            common.postFunction(url, { userInfo: JSON.stringify(userInfo) }, function (response) {
                callback(response);
            });
        },
        updateUserIgnoreWarnings: function (userInfo, callback) {
            var url = "UpdateUser";
            common.postFunction(url, { userInfo: JSON.stringify(userInfo), ignoreWarnings: true }, function (response) {
                callback(response);
            });
        },
        submitUser: function (userInfo, ignoreWarnings, callback) {
            var url = "SubmitUser";
            common.postFunction(url, { username: userInfo.Name, userInfo: JSON.stringify(userInfo), ignoreWarnings: ignoreWarnings }, function (response) {
                callback(response);
            });
        },
        updateUser: function (userInfo, ignoreWarnings, callback) {
            var url = "UpdateUser";
            common.postFunction(url, { userInfo: JSON.stringify(userInfo), ignoreWarnings: ignoreWarnings }, function (response) {
                callback(response);
            });
        },
        getCompanyContacts: function (username, callback) {
            var url = "GetCompanyContacts";
            common.postFunction(url, { username: username }, function (response) {
                callback(response);
            });
        },
        getAppropriateScreenSheets: function (productsCsv, callback) {
            var url = "GetAppropriateScreenSheets";
            common.postFunction(url, { productsCsv: productsCsv }, function (response) {
                callback(response);
            });
        },
        getProductsForTrader: function (username, callback) {
            var url = "GetProductsForTrader";
            common.postFunction(url, { username: username }, function (response) {
                callback(response);
            });
        },
        revertToLive: function (username, callback) {
            var url = "RevertToLive";
            common.postFunction(url, { username: username }, function (response) {
                callback(response);
            });
        },
        getBaseOptionForUser: function (username, optionCode, callback) {
            var url = "GetBaseOptionForUser";
            common.postFunction(url, { username: username, optionCode: optionCode }, function (response) {
                callback(response);
            });
        },
        getBaseOptionsForUser: function (username, callback) {
            var url = "GetBaseOptionsForUser";
            common.postFunction(url, { username: username }, function (response) {
                callback(response);
            });
        },
        searchByFirstNameLastName: function (wantReadOnly, searchTerm, callback) {
            var url = "SearchByFirstNameLastName";
            common.postFunction(url, { searchTerm: searchTerm }, function (response) {
                response.wantReadOnly = wantReadOnly;
                callback(response);
            });
        },
        getUserChangeLog: function (daysBack, username,  callback) {
            var url = "GetUserChangeLog";
            common.postFunction(url, { daysBack: daysBack, username: username }, function (response) {
                callback(response);
            });
        },
        getReadOnlyUserInformation: function (username, callback) {
            var url = "GetReadOnlyUserInformation";
            common.postFunction(url, { username: username }, function (response) {
                callback(response);
            });
        },
        getUserChangLogUsernames: function (callback) {
               var url = "GetUserChangLogUsernames";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        }
    };
});