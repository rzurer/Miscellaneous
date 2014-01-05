/*globals define, console */
"use strict";
define(['common'], function (common) {
    var urlLibrarian = {};
    return {
        setUrlLibrarian: function (librarian) {
            urlLibrarian = librarian;
        },
        getProductsForTrader: function (username, executionProvider, callback) {
            var url, data;
            url = urlLibrarian.GetProductsForUserUrl;
            data = {
                username: username,
                executionProvider: executionProvider
            };
            common.postFunction(url, data, callback);
        },
        getExecutingFirms: function (callback) {
            var url;
            url = urlLibrarian.GetExecutingFirmsUrl;
            common.postFunction(url, null, callback);
        },
        getTradeAccountsByClearingFirm: function (clearingFirm, callback) {
            var url, data;
            url = urlLibrarian.GetTradeAccountsByClearingFirmUrl;
            data = {
                clearingFirm: clearingFirm
            };
            common.postFunction(url, data, callback);
        },
        retrieveExternalUsername: function (username, callback) {
            var url, data;
            url = urlLibrarian.GetExternalUsernameUrl;
            data = {username: username};
            common.postFunction(url, data, callback);
        },
        getClearingFirmAccountsForUser: function (username, clearingFirm, callback) {
            var url, data;
            url = urlLibrarian.GetUserTradeAccountsUrl;
            data = { username: username, clearingFirm: clearingFirm };
            common.postFunction(url, data, callback);
        },
        getFillAccountNames : function (callback) {
            var url = urlLibrarian.GetFillAccountNamesUrl;
            common.postFunction(url, null, callback);
        },
        getUsernames: function (callback) {
            var url = urlLibrarian.GetUsernamesUrl;
            common.postFunction(url, null, callback);
        },
        getClearingFirms: function (callback) {
            var url = urlLibrarian.GetClearingFirmsUrl;
            common.postFunction(url, null, callback);
        },
        deleteFillAccount: function (username, orderRoutingProvider, externalUsername, fillAccountName, fcmAccountId, callback) {
            var data, url;
            url = urlLibrarian.DeleteFillAccountUrl;
            data = {
                username: username,
                executionProvider: orderRoutingProvider,
                externalUsername: externalUsername,
                internalTradeAccount: fillAccountName,
                internalTradeAccountId: fcmAccountId
            };
            common.postFunction(url, data, callback);
        },
        deleteOrderAccount: function (trader, product, fcmAccountId, callback) {
            var data, url;
            url = urlLibrarian.DeleteOrderAccountUrl;
            data = {
                trader: trader,
                product: product,
                fcmAccountId: fcmAccountId
            };
            common.postFunction(url, data, callback);
        },
        addFillAccount: function (orderRoutingUser, fillAccountName, fcmAccountId, callback) {
            var url, data;
            url = urlLibrarian.AddFillAccountUrl;
            data = {
                username: orderRoutingUser.username,
                executionProvider: orderRoutingUser.orderRoutingProvider,
                externalUsername: orderRoutingUser.externalUsername,
                internalTradeAccount: fillAccountName,
                internalTradeAccountId: fcmAccountId
            };
            common.postFunction(url, data, callback);
            return false;
        },
        addOrderAccount: function (orderRoutingUser, product, fcmAccountId, executionProvider, callback) {
            var url, data;
            url = urlLibrarian.AddOrderAccountUrl;
            data = {
                trader: orderRoutingUser.username,
                product: product,
                executionProvider: executionProvider,
                fcmAccountId: fcmAccountId
            };
            common.postFunction(url, data, callback);
            return false;
        },
        deleteOrderRoutingUser: function (username, executionProvider, externalUsername, callback) {
            var data, url;
            url = urlLibrarian.DeleteOrderRoutingUserUrl;
            data = {
                username: username,
                executionProvider: executionProvider,
                externalUsername: externalUsername
            };
            common.postFunction(url, data, callback);
        },
        fixOrderRoutingUser: function (username, executionProvider, errorMessages, marketDataFeedProviderType, eSignalSubscriptionLimit, eSignalUsername, eSignalPassword, callback) {
            var data, url;
            url = urlLibrarian.FixOrderRoutingUserUrl;
            data = {
                username: username,
                executionProvider: executionProvider,
                errorMessages: errorMessages,
                marketDataFeedProviderType: marketDataFeedProviderType,
                eSignalSubscriptionLimit: eSignalSubscriptionLimit,
                eSignalUsername: eSignalUsername,
                eSignalPassword: eSignalPassword,
            };
            common.postFunction(url, data, callback);
        },
        addOrderRoutingUser: function (username, clearingFirm, executionProvider, externalUsername, senderCompId, callback) {
            var data, url;
            url = urlLibrarian.AddOrderRoutingUserUrl;
            data = {
                trader: username,
                clearingFirm: clearingFirm,
                executionProvider: executionProvider,
                externalUsername: externalUsername,
                senderCompId: senderCompId
            };
            common.postFunction(url, data, callback);
        },
        addClearingFirmAccountUserAssociation: function (trader, fcmAccount, clearingFirm, callback) {
            var data, url;
            url = urlLibrarian.AddClearingFirmAccountUserAssociationUrl;
            data = {
                trader: trader,
                fcmAccount: fcmAccount,
                clearingFirm: clearingFirm
            };
            common.postFunction(url, data, callback);
        },
        externalUsernameExistsForOrderRoutingProvider: function (externalUsername, executionProvider, callback) {
            var data, url;
            url = urlLibrarian.ExternalUsernameExistsForOrderRoutingProviderUrl;
            data = {
                externalUsername: externalUsername,
                executionProvider: executionProvider
            };
            common.postFunction(url, data, callback);
        },
        getOrderRoutingUsers: function (url, callback) {
            common.postFunction(url, null, callback);
        }
    };
});