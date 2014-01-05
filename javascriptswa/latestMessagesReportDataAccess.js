/*globals postFunction*/
"use strict";
define(['common'], function (common) {
    return {
        getFrontEndClearingProcessors: function (callback) {
            var url = 'GetFrontEndClearingProcessors';
            common.postFunction(url, null, callback);
        },
        getLatestMessages: function (processorID, callback) {
            var url, data;
            url = 'GetLatestMessages';
            data = {
                processorID: processorID
            };
            common.postFunction(url, data, callback);
        }
    };
});