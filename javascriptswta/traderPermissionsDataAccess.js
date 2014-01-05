"use strict";
var traderPermissionsDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        getLoggedInTradersPermissions: function (callback) {
            var url;
            url = librarian.GetLoggedInTradersPermissions;
            common.postFunction(url, null , callback);
        }
    };
};