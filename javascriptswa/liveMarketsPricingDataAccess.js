/*globals define */
"use strict";
define(['common'], function (common) {
    return {
        getLiveMarketsPricingStatuses: function (callback) {
            var url = "GetLiveMarketsPricingStatuses";
            common.postFunction(url, null, callback);
        },
        updateLiveMarketsPricingForUser: function (username, enabled, callback) {
            var url, data;
            url = "UpdateLiveMarketsPricingForUser";
            data = { username: username, enabled: enabled };
            common.postFunction(url, data, callback);
        },
        getUsersEnabledWithLiveMarketPricing : function (callback) {
            var url = "GetUsersEnabledWithLiveMarketPricing";
            common.postFunction(url, null, callback);
        }
    };
});

