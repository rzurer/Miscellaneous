/*globals define, window*/
"use strict";
define(['common'], function (common) {
    return {
        getExchanges: function (callback) {
            var url = "GetExchanges";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getLastFourBusinessDays: function (callback) {
            var url = "GetLastFourBusinessDays";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        runSettlementsOnExchange: function (settlementDate, exchangeCode, sequenceNumber, callback) {
            var url = "RunSettlementsOnExchange",
                data = { settlementDate: settlementDate, exchangeCode: exchangeCode, sequenceNumber: Number(sequenceNumber) };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        runSettlementsOnExchangeFromFile: function (exchangeCode, sequenceNumber, filePath, callback) {
            var url = "RunSettlementsOnExchangeFromFile",
                data = { exchangeCode: exchangeCode, sequenceNumber: Number(sequenceNumber), filePath: filePath };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        runSelectedSettlementsOnExchange: function (settlementDate, exchangeCode, sequenceNumber, options, futures, callback) {
            var url = "RunSelectedSettlementsOnExchange",
                data = { settlementDate: settlementDate, exchangeCode: exchangeCode, sequenceNumber: Number(sequenceNumber), options: options, futures: futures };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        runSelectedSettlementsOnExchangeFromFile: function (exchangeCode, sequenceNumber, options, futures, filePath, callback) {
            var url = "RunSelectedSettlementsOnExchangeFromFile",
                data = {exchangeCode: exchangeCode, sequenceNumber: Number(sequenceNumber), options: options, futures: futures, filePath: filePath };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        removeFile: function (filePath, callback) {
            var url = "RemoveFile",
                data = { filePath: filePath };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        checkWhetherSettlementsHaveBeenUpdated: function (callback) {
            var url = "CheckWhetherSettlementsHaveBeenUpdated";
            common.postFunctionAlternate(url, null, callback);
        },
        uploadSPANSettlementsFile: function (exchangeCode, sequenceNumber, wantSelectedProducts) {
            window.location = "UploadSPANFile?upload=spansettlements&exchangeCode=" + exchangeCode + "&sequenceNumber=" + sequenceNumber + "&wantSelectedProducts=" + wantSelectedProducts;
        }
    };
});