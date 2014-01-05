/*global  $*/
"use strict";
var traderPermissions = function (dataAccess, permissions) {
    var traderPermissionsTile = $("#traderPermissionsTile"),
        traderPermissionsCloseButton = $("#traderPermissionsCloseButton"),
        traderPermissionsError = $('#traderPermissionsError'),
        traderPermissionsWorkspace = $('#traderPermissions'),
        traderPermissionsTableContainer = $('#traderPermissionsTableContainer'),
        tiles = $('#tiles'),
        hideError = function () {
            traderPermissionsError.text('');
        },
        displayError = function (error) {
            traderPermissionsError.text(error);
        },
        clear = function () {
            hideError();
        },
        closeWorkspace = function () {
            traderPermissionsWorkspace.fadeOut('slow', function () {
                clear();
                tiles.fadeIn('slow');
            });
        },
        traderPermissionsTileClick = function () {
            var callback;
            tiles.fadeOut('slow', function () {
                traderPermissionsWorkspace.fadeIn("slow");
            });
            callback = function (response) {
                if (!permissions.signOutOrDisplayError(response, displayError)) {
                    return;
                };
                traderPermissionsTableContainer.empty();
                traderPermissionsTableContainer.append(response.Payload);
            };
            dataAccess.getLoggedInTradersPermissions(callback);
        },
        assignEventHandlers = function () {
            traderPermissionsTile.click(traderPermissionsTileClick);
            traderPermissionsCloseButton.click(closeWorkspace);
        };
    return {
        initialize: function (urlLibrarian) {
            dataAccess.initialize(urlLibrarian);
            assignEventHandlers();
        }
    };

};