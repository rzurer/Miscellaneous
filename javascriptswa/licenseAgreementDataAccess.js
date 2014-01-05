/*globals define */
"use strict";
define(['common'], function (common) {
    return {
        getCompanyLicenseAgreements: function (callback) {
            common.postFunction("GetCompanyLicenseAgreements", null, callback);
        },
        acceptCompanyLicenseAgreement: function (companyId, callback) {
            common.postFunction("AcceptCompanyLicenseAgreement", { companyId: companyId }, callback);
        },
        rejectCompanyLicenseAgreement: function (companyId, callback) {
            common.postFunction("RejectCompanyLicenseAgreement", { companyId: companyId }, callback);
        }
    };
});