"use strict";
var copyOptionParametersDataAccess =  function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        getTradersToDownloadFrom: function (callback) {
            var url = librarian.GetTradersToDownloadFrom;
            common.postFunction(url, null, callback);
        },
        getNonDerivedCommoditiesForTrader: function (trader, callback) {
            var data = { trader: trader },
                url = librarian.GetNonDerivedCommoditiesForTrader;
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        previewOptionParametersFromTrader: function (trader, optionCode, callback) {
            var data = { trader: trader, optionCode: optionCode },
                url = librarian.PreviewOptionParametersFromTrader;
            common.postFunction(url, data, callback);
        },
        copyOptionParametersFromTrader: function (trader, optionCode, callback) {
            var data = { trader: trader, optionCode: optionCode },
                url = librarian.CopyOptionParametersFromTrader;
            common.postFunction(url, data, callback);
        },
        copyOptionParametersFromProduct: function (trader, sourceProduct, destinationProduct, callback) {
            var data = { trader: trader, sourceProduct: sourceProduct, destinationProduct: destinationProduct },
                url = librarian.CopyOptionParametersFromProduct;
            common.postFunction(url, data, callback);
        },
        previewOptionParametersFromProduct: function (trader, sourceProduct, destinationProduct, callback) {
            var data = { trader: trader, sourceProduct: sourceProduct, destinationProduct: destinationProduct },
                url = librarian.PreviewOptionParametersFromProduct;
            common.postFunction(url, data, callback);
        }
    };
};