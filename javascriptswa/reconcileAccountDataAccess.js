"use strict";
define(['common'], function (common) {
    return {
        retrieveTradersAndProductsByReconcileAccount: function (accountNumber, callback) {
            var data = { accountNumber: accountNumber },
                url = "RetrieveTradersAndProductsByReconcileAccount";
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        retrieveAllReconcileAccounts: function (callback) {
            var url = "RetrieveAllReconcileAccounts";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        }
    };
});