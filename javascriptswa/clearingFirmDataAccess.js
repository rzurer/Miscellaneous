/*globals postFunction*/
"use strict";
define(['common'], function (common) {
    return {
        getTradeAccountsByClearingFirm: function (clearingFirm, callback) {
            var url, data;
            url = 'GetTradeAccountsByClearingFirm';
            data = {
                clearingFirm: clearingFirm
            };
            common.postFunction(url, data, callback);
        },
        addClearingFirmAccountToClearingFirm: function (clearingFirm, account, executingFirm, accountComment, callback) {
            var url, data;
            url = 'AddClearingFirmAccountToClearingFirm';
            data = {
                clearingFirm: clearingFirm,
                account: account,
                executingFirm: executingFirm,
                accountComment: accountComment
            };
            common.postFunction(url, data, callback);
        },
        getAddClearingFirmAccountViewModel: function (callback) {
            var url = 'GetAddClearingFirmAccountViewModel';
            common.postFunction(url, null, callback);
        }
    };
});