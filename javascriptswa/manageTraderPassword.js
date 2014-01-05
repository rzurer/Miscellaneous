/*globals postFunction*/
"use strict";
define(['manageTraderPasswordDataAccess', 'htmlHelper', 'common'], function (dataAccess, htmlHelper, common) {
    var tradersSelectSSO = $("#tradersSelectSSO"),
        messageLabel = $("#messageLabel"),
        getSelectedTraderNameSSO = function () {
            return $("#tradersSelectSSO option:selected").text();
        },
        getConfirmDialog = function () {
            return $("#confirmDialog");
        },
        getSelectedTraderLicenseTypeIDSSO = function () {
            return Number(tradersSelectSSO.val());
        },
        display = function (response) {
            if (!response.Success && response.Message !== "Trader is required." && response.Message.indexOf('more specific error') === -1 && response.Message.indexOf('Assigning a new password') === -1) {
                window.location.reload(); 
                return;
            }
            var color = response.Success ? 'green' : 'red',
            message = response.Message || response.Payload;
            messageLabel.text('');
            messageLabel.css("color", color);
            messageLabel.text(message);

        },
        getUsernames = function () {
            var callback = function (response) {
                if (!response.Success) {
                    display(response.Message);
                }
                htmlHelper.fillSelectFromKeyValuePairs(tradersSelectSSO, "Choose a trader", response.Payload, "< none >");
            };
            dataAccess.getTraderNamesAndLicenseTypeIDs(callback);
        },
        assignNewPassword = function (e) {
            var licenseTypeID, traderName, message, title;
            message = "This is a client system account used by APIs. Are you sure you want to reset the password.Do you understand the implications. For more info contact WhenTech QA";
            title = "Reset Client System Account Password";
            messageLabel.text('');
            traderName = getSelectedTraderNameSSO();
            licenseTypeID = getSelectedTraderLicenseTypeIDSSO();
            if (licenseTypeID === 90) {
                common.confirmDialog(getConfirmDialog(), message, title, e.pageY, e.pageX, function () {
                    dataAccess.assignNewPassword(traderName, licenseTypeID, display);
                });
                return;
            }
            dataAccess.assignNewPassword(traderName, licenseTypeID, display);
        },
        initializeControls = function (isRunningInProduction) {
            $("#resetPasswordButtonSSO").css('opacity', '0.5');
            $("#getTraderPasswordButton").hide();
            $("#emailPasswordButton").hide();
            $("#resetPasswordButton").hide();
            if (isRunningInProduction) {
                $("#emailPasswordButton").show();
                $("#resetPasswordButton").show();
                return;
            }
            $("#getTraderPasswordButton").show();
        },
        validateSSOInputs = function () {
            messageLabel.text('');
            $("#resetPasswordButtonSSO").unbind('click');
            if (getSelectedTraderNameSSO().length > 0) {
                $("#resetPasswordButtonSSO").bind('click', assignNewPassword);
                $("#resetPasswordButtonSSO").css('opacity', '1.0');
            } else {
                $("#resetPasswordButtonSSO").css('opacity', '0.5');
            }
        },
        assignEventHandlers = function () {
            $("#resetPasswordButtonSSO").bind('click', assignNewPassword);
            tradersSelectSSO.change(validateSSOInputs);
        };
    return {
        initialize: function (isRunningInProduction) {
            initializeControls(isRunningInProduction);
            assignEventHandlers();
            getUsernames();
        }
    };
});