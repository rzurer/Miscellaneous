/*globals $, console, define */
"use strict";
define(function () {
    var exports,
        clearingFirmAccountsForClearingFirm = [];
    exports = {
        setClearingFirmAccountsForClearingFirm: function (array) {
            clearingFirmAccountsForClearingFirm = array;
        },
        getClearingFirmAccount: function (fcmAccount) {
            var result;
            clearingFirmAccountsForClearingFirm.forEach(function (clearingFirmAccount) {
                if (clearingFirmAccount.fcmAccount === fcmAccount) {
                    result = clearingFirmAccount;
                }
            });
            return result;
        },
        createClearingFirmAccount: function (clearingFirm, fcmAccount, fcmAccountId) {
            return {
                clearingFirm: clearingFirm,
                fcmAccount: fcmAccount,
                fcmAccountId: fcmAccountId
            };
        },
        createNativeClearingFirmAccounts: function (source) {
            var clearingFirmAccounts;
            clearingFirmAccounts = [];
            source.forEach(function (element) {
                var clearingFirmAccount;
                clearingFirmAccount = exports.createClearingFirmAccount(element.Firm, element.Account, element.Id);
                clearingFirmAccounts.push(clearingFirmAccount);
            });
            return clearingFirmAccounts;
        },
        createOrderAccount: function (product, clearingFirmAccount) {
            return {
                product: product,
                clearingFirmAccount: clearingFirmAccount
            };
        },
        createFillAccount: function (fillAccountName, clearingFirmAccount) {
            return {
                fillAccountName: fillAccountName,
                clearingFirmAccount: clearingFirmAccount
            };
        },
        createOrderRoutingUser: function (username, orderRoutingProvider, externalUsername,
            clearingFirm, orderAccounts, fillAccounts) {
            return {
                username: username,
                orderRoutingProvider: orderRoutingProvider,
                externalUsername: externalUsername,
                clearingFirm: clearingFirm,
                orderAccounts: orderAccounts,
                fillAccounts: fillAccounts,
                fcmAccounts: []
            };
        },
        addFillAccountToFillAccountsArray: function (orderRoutingUser, fcmAccountId, fillAccountName, fcmAccount) {
            var clearingFirmAccount, fillAccount;
            clearingFirmAccount = exports.createClearingFirmAccount(orderRoutingUser.clearingFirm, fcmAccount, fcmAccountId);
            fillAccount = exports.createFillAccount(fillAccountName, clearingFirmAccount);
            orderRoutingUser.fillAccounts.push(fillAccount);
        },
        addOrderAccountToOrderAccountsArray: function (orderRoutingUser, fcmAccount, fcmAccountId, product) {
            var clearingFirmAccount, orderAccount;
            clearingFirmAccount = exports.createClearingFirmAccount(orderRoutingUser.clearingFirm, fcmAccount, fcmAccountId);
            orderAccount = exports.createOrderAccount(product, clearingFirmAccount);
            orderRoutingUser.orderAccounts.push(orderAccount);
        },
        deleteFillAccountFromFillAccountsArray: function (orderRoutingUser, fcmAccountId) {
            var temp = [];
            orderRoutingUser.fillAccounts.forEach(function (fillAccount) {
                if (fillAccount.clearingFirmAccount.fcmAccountId !== fcmAccountId) {
                    temp.push(fillAccount);
                }
            });
            orderRoutingUser.fillAccounts = temp;
        },
        deleteOrderAccountFromOrderAccountsArray: function (orderRoutingUser, product) {
            var temp = [];
            orderRoutingUser.orderAccounts.forEach(function (orderAccount) {
                if (orderAccount.product !== product) {
                    temp.push(orderAccount);
                }
            });
            orderRoutingUser.orderAccounts = temp;
        },
        getProducts: function (orderAccounts) {
            return orderAccounts.map(function (orderAccount) {
                return orderAccount.product;
            });
        },
        fillAccountExists: function (fillAccounts, fillAccountId) {
            var i, element;
            for (i = 0; i < fillAccounts.length; i += 1) {
                element = fillAccounts[i];
                if (element.clearingFirmAccount.fcmAccountId === fillAccountId.toString()) {
                    return true;
                }
            }
            return false;
        }
    };
    return exports;
});

