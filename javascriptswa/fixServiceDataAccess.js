/*globals define, console */
"use strict";
define(['common'], function (common) {
    return {
        getServices: function (callback) {
            common.postFunction("GetServices", null, callback);
        },
        deleteService : function (serviceId, callback) {
            common.postFunction("DeleteService", { serviceId: serviceId }, callback);
        },
        updateService: function (serviceID, description, callback) {
            common.postFunction("UpdateService", { serviceID: serviceID, description: description}, callback);
        },
        getFIXServiceConfigurations: function (serviceID, callback) {
            common.postFunction("GetFIXServiceConfigurations", { serviceID: serviceID }, callback);
        },
        updateFIXServiceConfiguration: function (fixServiceConfiguration, callback) {
            common.postFunction("UpdateFIXServiceConfiguration", { fixServiceConfiguration: JSON.stringify(fixServiceConfiguration) }, callback);
        },
        deleteFIXServiceConfiguration: function (serviceID, senderCompID, senderSubId, callback) {
            common.postFunction("DeleteFIXServiceConfiguration", { serviceID: serviceID, senderCompID: senderCompID, senderSubId: senderSubId }, callback);
        }
    };
});