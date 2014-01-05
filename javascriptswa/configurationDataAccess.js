"use strict";
define(['common'], function (common) {
    return {
        getUsernames: function (callback) {
            var url = "GetUsernames";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getEnabledUsers: function (callback) {
            var url = "GetEnabledUsers";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        traderIsEnabledToUseExcelRTDServer: function (trader, callback) {
            var url = "TraderIsEnabledToUseExcelRTDServer",
                data = { trader: trader };
            common.postFunction(url, data, function (response) {
                if (!response.Success) {
                    throw response.Message;
                }
                callback(response.Payload === "ExcelRTDServerIsEnabled");
            });
        },
        enableOrDisableTraderWithExcelRTDServer: function (enable, trader, callback) {
            var url = "EnableOrDisableTraderWithExcelRTDServer",
                data = {enable : enable, trader: trader };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        }
    };
});