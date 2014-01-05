/*globals define*/
"use strict";
define(['common'], function (common) {
    return {
        getAdministratorRoles: function (callback) {
            var url = "GetAdministratorRoles";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        getAdministrators: function (callback) {
            var url = "GetAdministrators";
            common.postFunction(url, null, function (response) {
                callback(response);
            });
        },
        createAdministrator: function (username, accessLevel, firstName, lastName, email, company, callback) {
            var url = "CreateAdministrator",
                data = { username: username, accessLevel: Number(accessLevel), firstName: firstName, lastName: lastName, email: email, company: company };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        updateAdministrator: function (administrator, callback) {
            var url = "UpdateAdministrator";
            common.postFunction(url, administrator, function (response) {
                callback(response);
            });
        },
        assignNewAdministratorPassword: function (username, email, callback) {
            var url = "AssignNewAdministratorPassword",
                data = { username: username, email: email };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        },
        deleteAdministrator: function (username, callback) {
            var url = "DeleteAdministrator",
                data = { username: username };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        }
    };
});