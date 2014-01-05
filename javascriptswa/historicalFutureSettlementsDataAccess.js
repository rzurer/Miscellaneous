/*globals define, window*/
"use strict";
define(['common'], function (common) {
    return {
        getHistoricalFutureSettlements: function (callback) {
            var url = "GetHistoricalFutureSettlements";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        updateFutureSettlementPrice: function (settlement, callback) {
            var url = "UpdateFutureSettlementPrice";
            common.postFunction(url, settlement, function (response) {
                callback(response);
            });
        },
        getContractCodesAroundSettlementDate: function (commodityCode, settlementDate, callback) {
            var url = "GetContractCodesAroundSettlementDate",
                data = { commodityCode: commodityCode, settlementDate: settlementDate };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        insertFutureSettlement: function (settlement, callback) {
            var url = "InsertFutureSettlement";
            common.postFunction(url, settlement, function (response) {
                callback(response);
            });
        }
    };
});