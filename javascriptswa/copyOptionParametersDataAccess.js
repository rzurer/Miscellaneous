"use strict";
define(['common'], function (common) {
    return {
        getParametersArchiveSetsForTraderByProduct : function(trader, product, callback){
            var data = { trader: trader, product: product },
                url = "GetParametersArchiveSetsForTraderByProduct";
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        getOptionParametersArchiveSetComparisons: function (earlierArchiveID, laterArchiveID, product, callback) {
            var data = { earlierArchiveID: earlierArchiveID,laterArchiveID : laterArchiveID, product: product },
                url = "GetOptionParametersArchiveSetComparisons";
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        getTradersHavingArchiveSetsAsOf: function (callback) {
            var data = { },
                url = "GetTradersHavingArchiveSetsAsOf";
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        getProductsForTradersHavingArchiveSetsAsOf: function (trader, callback) {
            var data = { trader: trader },
                url = "GetProductsForTradersHavingArchiveSetsAsOf";
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        }
    };
});