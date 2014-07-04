/*globals define*/
define([], function () {
    "use strict";
    var callbacksReceived,
        runAfter,
        callback,
        initialize = function (mainCallback) {
            callback = mainCallback;
            runAfter = 0;
            callbacksReceived = 0;
        },
        setRunCallbackAfter = function (runAfterCount) {
            if (runAfter === 0) {
                runAfter = runAfterCount;
            }
        },
        incrementCallbackCount = function () {
            callbacksReceived += 1;
            if (callbacksReceived === runAfter) {
                callback();
            }
        },
        create = function (func) {
            return function () {
                func(incrementCallbackCount);
            };
        };
    return { initialize: initialize, setRunCallbackAfter: setRunCallbackAfter, create: create };
});