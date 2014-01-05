/*globals postFunction*/
"use strict";
define(['common'], function (common) {
    return {
        assignNewPassword: function (trader, licenseTypeID, callback) {
            var url, data;
            url = 'AssignNewPassword';
            data = {
                trader: trader,
                licenseTypeID: licenseTypeID
            };
            common.postFunction(url, data, callback);
        },
        getTraderNamesAndLicenseTypeIDs: function (callback) {
            var url = 'GetTraderNamesAndLicenseTypeIDs';
            common.postFunction(url, null, callback);
        }
    };
});