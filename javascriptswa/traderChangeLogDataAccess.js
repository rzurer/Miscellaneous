/*globals define */
"use strict";
define(['common'], function (common) {
    return {
        getAllTraders: function (callback) {
            common.postFunction("GetAllTraders", null, callback);
        },
        getTraderChangeLog: function (daysBack, trader, callback) {
            var data = {
                daysBack: daysBack,
                trader: trader
            };
            common.postFunction("GetTraderChangeLog", data, callback);
        }
    };
});