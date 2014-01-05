"use strict";
var productSpecificationsDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        retrieveProductSpecifications: function (callback) {
            var url;
            url = librarian.RetrieveProductSpecifications;
            common.postFunction(url, null, callback);
        },
        getHolidayAndContractSpecificationsForProduct: function (productCode, securityType, holidayScheduleId, holidayScheduleName, callback) {
            var url;
            url = librarian.GetHolidayAndContractSpecificationsForProduct;
            common.postFunction(url, { productCode: productCode, securityType : securityType, holidayScheduleId : holidayScheduleId, holidayScheduleName: holidayScheduleName }, callback);
        }
    };
};