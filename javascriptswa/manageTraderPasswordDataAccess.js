/*globals define, $, postFunction*/
define(['common'], function (common) {
    "use strict";
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
        preventLogin: function (username, callback) {
            var url, data;
            url = 'PreventLogin';
            data = {
                username: username
            };
            common.postFunction(url, data, callback);
        },
        getTraderNamesAndLicenseTypeIDs: function (callback) {
            var url = 'GetTraderNamesAndLicenseTypeIDs';
            common.postFunction(url, null, callback);
        },
        logoutUser: function (username, callback) {
            var url, data;
            url = 'LogoutUser';
            data = {
                username: username
            };
            common.postFunction(url, data, callback);
        },
        setPasswordExpiryDays: function (username, days, callback) {
            var url, data;
            url = 'SetPasswordExpiryDays';
            data = {username: username, days : days};
            common.postFunction(url, data, callback);
        }
    };
});