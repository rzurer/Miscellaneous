/*globals $, define, console*/
"use strict";
define(['common'], function (common) {
    return {
        updatePageAccess: function (pageId, roleId, canView, callback) {
            var data = {
                pageId: pageId,
                roleId: roleId,
                canView: canView
            };
            common.postFunction("UpdatePageAccess", data, callback);
        },
        createPageAccess: function (categoryId, url, description, roleIds, callback) {
            var data = {
                categoryId: categoryId,
                url: url,
                description: description,
                roleIds: roleIds
            };
            common.postFunction("CreatePageAccess", data, callback);
        },
        getPageAccessInfos: function (callback) {
            common.postFunction("GetPageAccessInfos", null, callback);
        },
        deletePageAccess: function (pageId, callback) {
            var data = {
                pageId: pageId
            };
            common.postFunction("DeletePageAccess", data, callback);
        },
        updatePage: function (pageId, categoryId, url, description, callback) {
            var data = {
                pageId: pageId,
                categoryId: categoryId,
                url: url,
                description: description
            };
            common.postFunction("UpdatePage", data, callback);
        },
        createRole: function (name, description, callback) {
            var data = {
                name: name,
                description: description
            };
            //common.postFunction("CreateRole", data, callback);
            callback({ Success: true, Message: "success", Payload: { Key: 42, Value: name} });
        },
        createPageCategory: function (category, callback) {
            var data = {
                category: category
            };
            //callback({ Success: true, Message: "success", Payload: { Key: 42, Value: category} });
            common.postFunction("CreatePageCategory", data, callback);
        }
    };
});