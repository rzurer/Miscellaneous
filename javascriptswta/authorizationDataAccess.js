"use strict";
var authorizationDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        login: function (username, password, callback) {
            var data = { username: username, password: password },
                url = librarian.Login;
            common.postFunction(url, data, function (response) {
                callback(username, response);
            });
        },
        changePassword: function (username, newPassword, oldPassword, callback) {
            var data = { username: username, newPassword: newPassword, oldPassword: oldPassword },
                url = librarian.ChangePassword;
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        changeExpiredPassword: function (username, newPassword, oldPassword, callback) {
            var data = { username: username, newPassword: newPassword, oldPassword: oldPassword},
                url = librarian.ChangeExpiredPassword;
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        signOut: function (callback) {
            var url = librarian.SignOut;
            common.postFunction(url, null, callback);
        },
        getCurrentUsername: function (callback) {
            var url = librarian.GetCurrentUsername;
            common.postFunction(url, null, callback);
        },
        setKeepSessionAliveValue: function (keepSessionAlive) {
            var url = librarian.SetKeepSessionAliveValue;
            common.postFunction(url, { keepSessionAlive: keepSessionAlive });
        },
        getKeepSessionAliveValue: function (callback) {
            var url = librarian.GetKeepSessionAliveValue;
            common.postFunction(url, null, callback);
        }
    };
};