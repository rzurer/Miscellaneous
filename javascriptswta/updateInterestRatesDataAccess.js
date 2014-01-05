"use strict";
var updateInterestRatesDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        getExistingInterestRateYieldCurves: function (callback) {
            var url = librarian.GetExistingInterestRateYieldCurves;
            common.postFunction(url, null, function (response) {
                if (callback) {
                    callback(response);
                }
            });
        },
        updateInterestRateYieldCurve: function (curve, callback) {
            var url, data;
            url = librarian.UpdateInterestRateYieldCurve;
            data = { json: JSON.stringify(curve) };
            common.postFunction(url, data, function (response) {
                if (callback) {
                    callback(response);
                }
            });
        },
        validateInterestRateYieldCurve: function (curve, callback) {
            var url, data;
            url = librarian.ValidateInterestRateYieldCurve;
            data = { json: JSON.stringify(curve) };
            common.postFunction(url, data, function (response) {
                if (callback) {
                    callback(response);
                }
            });
        },
        checkWhetherInterestRatesHaveBeenUpdated: function  (callback) {
            var url;
            url = librarian.CheckWhetherInterestRatesHaveBeenUpdated;         
            common.postFunction(url, null, function (response) {
                if (callback) {
                    callback(response);
                }
            });
        }        
    };
};