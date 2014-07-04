/*globals $, define,  postFunction*/
define(['manageTraderPasswordDataAccess', 'htmlHelper', 'common'], function (dataAccess, htmlHelper, common) {
    "use strict";
    var tradersSelectSSO = $("#tradersSelectSSO"),
        messageLabel = $("#messageLabel"),
        setPasswordExpiryDaysSelect = $('#setPasswordExpiryDaysSelect'),
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
            var message, color;
            color = response.Success ? 'green' : 'red';
            message = response.Message || response.Payload;
            messageLabel.text('');
            messageLabel.css("color", color);
            messageLabel.text(message);
        },
        getUsernames = function () {
            var callback = function (response) {
                if (!response.Success) {
                    display(response);
                }
                htmlHelper.fillSelectFromKeyValuePairs(tradersSelectSSO, "Choose a trader", response.Payload, "< none >");
            };
            dataAccess.getTraderNamesAndLicenseTypeIDs(callback);
        },
        preventLogin = function (e) {
            var message, title, username;
            username = getSelectedTraderNameSSO();
            message = "This will prevent the user " + username + " from logging into WhenTech Markets. Are you sure you want to proceed? Do you understand the implications? For more info contact WhenTech QA.";
            title = "Prevent Login";
            messageLabel.text('');
            common.confirmDialog(getConfirmDialog(), message, title, e.pageY, e.pageX, function () {
                dataAccess.preventLogin(username, display);
            });
        },
        getPasswordExpiryDays = function () {
            return setPasswordExpiryDaysSelect.val();
        },
        setPasswordExpiryDays = function () {
            var passwordExpiryDays, username, callback;
            passwordExpiryDays = getPasswordExpiryDays();
            username = getSelectedTraderNameSSO();
            dataAccess.setPasswordExpiryDays(username, passwordExpiryDays, display);
        },
        logoutUser = function (e) {
            var message, title, username;
            username = getSelectedTraderNameSSO();
            message = "This will automatically logout the user " + username + " from WhenTech Markets. Are you sure you want to proceed? Do you understand the implications? For more info contact WhenTech QA.";
            title = "Logout User";
            messageLabel.text('');
            common.confirmDialog(getConfirmDialog(), message, title, e.pageY, e.pageX, function () {
                dataAccess.logoutUser(username, display);
            });
        },
        assignNewPassword = function (e) {
            var licenseTypeID, traderName, message, title;
            message = "This is a client system account used by APIs. Are you sure you want to reset the password? Do you understand the implications? For more info contact WhenTech QA.";
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
            $("#preventLoginButton").unbind('click');
            $("#logOutUserButton").unbind('click');
            $('#setPasswordExpiryDaysButton').unbind('click');
            if (tradersSelectSSO.val()) {
                $("#resetPasswordButtonSSO").bind('click', assignNewPassword);
                $("#resetPasswordButtonSSO").css('opacity', '1.0');
                $("#preventLoginButton").bind('click', preventLogin);
                $("#preventLoginButton").css('opacity', '1.0');
                $("#logOutUserButton").bind('click', logoutUser);
                $("#logOutUserButton").css('opacity', '1.0');
                $('#setPasswordExpiryDaysButton').bind('click', setPasswordExpiryDays);
                $('#setPasswordExpiryDaysButton').css('opacity', '1.0');
                $('#setPasswordExpiryDaysSelect').css('opacity', '1.0');
                $('#setPasswordExpiryDaysSelect').removeAttr('disabled');
            } else {
                $("#resetPasswordButtonSSO").css('opacity', '0.5');
                $("#preventLoginButton").css('opacity', '0.5');
                $("#logOutUserButton").css('opacity', '0.5');
                $("#logOutUserButton").css('opacity', '0.5');
                $('#setPasswordExpiryDaysButton').css('opacity', '0.5');
                $('#setPasswordExpiryDaysSelect').css('opacity', '0.5');
                $('#setPasswordExpiryDaysSelect').attr('disabled', 'disabled');
            }
        },
        assignEventHandlers = function () {
            $("#resetPasswordButtonSSO").bind('click', assignNewPassword);
            $("#preventLoginButton").bind('click', preventLogin);
            $("#logOutUserButton").bind('click', logoutUser);
            $('#setPasswordExpiryDaysButton').bind('click', setPasswordExpiryDays);
            tradersSelectSSO.change(validateSSOInputs);
            validateSSOInputs();
        };
    return {
        initialize: function (isRunningInProduction) {
            initializeControls(isRunningInProduction);
            assignEventHandlers();
            getUsernames();
        }
    };
});