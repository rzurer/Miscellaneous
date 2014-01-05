"use strict";
var profitAndLossDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        getProfitAndLossByTrader: function (fromDate, toDate, callback) {
            var url, data;
            url = librarian.GetProfitAndLossByTrader;
            data = {fromDate: fromDate, toDate: toDate };
            common.postFunction(url, data, callback);
        }
    };
};