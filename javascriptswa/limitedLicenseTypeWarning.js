/*globals $, define*/
"use strict";
define(["blockingPopup"], function (blockingPopup) {
    var createWarningMessage = function () {
        var warningMessage = $('<div>');
        warningMessage.addClass('limitedPermissionsWarning');
        warningMessage.html('<span>This user has the Eval-Broker Desk or Broker Desk license.</span><br/><br/><span>Please talk to the WhenTech Sales Team before making any changes.</span>');
        return warningMessage;
    };
    return {
        display: function (hasLimitedPermissions) {
            if (hasLimitedPermissions === 'True') {
                blockingPopup.initialize();
                blockingPopup.showPopup(createWarningMessage());
            }
        }
    };
});