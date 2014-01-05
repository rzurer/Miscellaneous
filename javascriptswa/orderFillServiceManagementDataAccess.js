/*globals define */
"use strict";
define(['common'], function (common) {
    return {
        getCmeSourceSessionsByClearingFirm: function (clearingFirm, callback) {
            common.postFunction("GetCmeSourceSessionsByClearingFirm", { clearingFirm: clearingFirm }, callback);
        },
        getOrderFillServiceProviders: function (callback) {
            common.postFunction("GetOrderFillServiceProviders", null, callback);
        },
        getOrderFillServiceProvidersWithTradeEntrySource: function (callback) {
            common.postFunction("GetOrderFillServiceProvidersWithTradeEntrySource", null, callback);
        },
        getClearingFirms: function (callback) {
            common.postFunction("GetClearingFirms", null, callback);
        },
        getClearingFirmsForUser: function (username, callback) {
            common.postFunction("GetClearingFirmsForUser", { username: username }, callback);
        },
        getTradeAccountsByClearingFirm: function (clearingFirm, callback) {
            common.postFunction("GetTradeAccountsByClearingFirm", { clearingFirm: clearingFirm }, callback);
        },
        getUserTradeAccounts: function (username, clearingFirm, callback) {
            common.postFunction("GetUserTradeAccounts", { username: username, clearingFirm: clearingFirm }, callback);
        },
        getUsernames: function (callback) {
            common.postFunction("GetUsernames", null, callback);
        },
        getInternalTradeAccounts: function (username, callback) {
            common.postFunction("GetInternalTradeAccounts", { username: username }, callback);
        },
        getOrderFillServiceUserTradeAccounts: function (callback) {
            common.postFunction("GetOrderFillServiceUserTradeAccounts", null, callback);
        },
        addClearingFirmAccountUserAssociation: function (trader, fcmAccount, clearingFirm, callback) {
            var data = {
                trader: trader,
                fcmAccount: fcmAccount,
                clearingFirm: clearingFirm
            };
            common.postFunction("AddClearingFirmAccountUserAssociation", data, callback);
        },
        createOrderFillServiceUserTradeAccountMapping: function (mapping, callback) {
            var data = {
                provider: mapping.Provider,
                username: mapping.Username,
                internalTradeAccount: mapping.InternalTradeAccount,
                extension: mapping.Extension,
                externalTradeAccountID: mapping.ExternalTradeAccountID
            };
            common.postFunction("CreateOrderFillServiceUserTradeAccountMapping", data, callback);
        },
        deleteOrderFillServiceUserTradeAccountMapping: function (mapping, callback) {
            var data = {
                provider: mapping.Provider,
                username: mapping.Username,
                internalTradeAccount: mapping.InternalTradeAccount,
                extension: mapping.Extension,
                externalTradeAccountID: mapping.ExternalTradeAccountID
            };
            common.postFunction("DeleteOrderFillServiceUserTradeAccountMapping", data, callback);
        },
        deleteOrderFillServiceUserTradeAccountExemption: function (exemption, callback) {
            var data = {
                provider: exemption.Provider,
                username: exemption.Username,
                internalTradeAccount: exemption.InternalTradeAccount,
                externalTradeAccountID: exemption.ExternalTradeAccountID,
                isvID: exemption.IsvID,
                sourceSessionID: exemption.SourceSessionID
            };
            common.postFunction("DeleteOrderFillServiceUserTradeAccountSystemExemption", data, callback);
        },
        createOrderFillServiceUserTradeAccountSystemExemption: function (exemption, callback) {
            var data,
                externalTradeAccountIDValue = !exemption.ExternalTradeAccountID || exemption.ExternalTradeAccountID.length === 0 ? 0 : exemption.ExternalTradeAccountID,
                isvIDValue = !exemption.IsvID || exemption.IsvID.length === 0 ? 0 : exemption.IsvID;
            data = {
                provider: exemption.Provider,
                username: exemption.Username,
                internalTradeAccount: exemption.InternalTradeAccount,
                externalTradeAccountID: externalTradeAccountIDValue,
                isvID: isvIDValue,
                sourceSessionID: exemption.SourceSessionID
            };
            common.postFunction("CreateOrderFillServiceUserTradeAccountSystemExemption", data, callback);
        },
        orderFillServiceUserTradeAccountSystemExemptionExists: function (mapping, callback) {
            var data = {
                provider: mapping.Provider,
                username: mapping.Username,
                internalTradeAccount: mapping.InternalTradeAccount,
                externalTradeAccountID: mapping.ExternalTradeAccountID
            };
            common.postFunction("OrderFillServiceUserTradeAccountSystemExemptionExists", data, callback);
        },
        getOrderFillServiceUserTradeAccountSystemExemptions: function (callback) {
            common.postFunction("GetOrderFillServiceUserTradeAccountSystemExemptions", null, callback);
        },
        getOrders: function (venue, callback) {
            var url, data;
            if (!venue) {
                return;
            }
            url = "GetOrders";
            data = { venue: venue };
            common.postFunction(url, data, callback);
        },
        getFills: function (tradeEntrySource, callback) {
            var url, data;
            if (!tradeEntrySource) {
                return;
            }
            url = "GetFills";
            data = { tradeEntrySource: tradeEntrySource };
            common.postFunction(url, data, callback);
        }
    };
});