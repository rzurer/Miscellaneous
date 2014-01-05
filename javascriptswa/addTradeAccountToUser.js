/*globals $, define*/
"use strict";
define(['common', 'orderFillServiceManagementDataAccess', 'htmlHelper'], function (common, dataAccess, htmlHelper) {
    var fillUsernamesSelect = function (response) {
        if (response.Success && response.Payload) {
            htmlHelper.fillSelectFromList($('#ata_UsernamesSelect'), 'Select a user name', response.Payload);
        }
    },
        initializeSelects = function () {
            htmlHelper.initializeSelect($('#ata_UsernamesSelect'), 'Select a user');
            htmlHelper.initializeSelect($('#ata_ClearingFirmsSelect'), 'Select a clearing firm');
            htmlHelper.initializeSelect($('#ata_FcmAccountsSelect'), 'Select an FCM account');
        },

        fillFcmAccountsSelect = function (response) {
            var select;
            if (response.Success && response.Payload) {
                select = $('#ata_FcmAccountsSelect');
                htmlHelper.initializeSelect(select, 'Select an FCM account');
                response.Payload.forEach(function (element) {
                    select.append(htmlHelper.createOption(element.Account, element.Id));
                });
            }
        },
//        fillClearingFirmsSelect = function (response) {
//            var select, option;
//            if (response.Success && response.Payload) {
//                select = $('#ata_ClearingFirmsSelect');
//                htmlHelper.initializeSelect(select, 'Select a clearing firm');
//                response.Payload.forEach(function (element) {
//                    option = htmlHelper.createOption(element.Key, element.Key);
//                    option.attr('title', element.Value);
//                    select.append(option);
//                });
//            }
//            htmlHelper.initializeSelect($('#fcmAccountsSelect'), 'Select an FCM account');
//        },
//        getClearingFirmsForUser = function () {
//            var username = $('#ata_UsernamesSelect').val();
//            if (username.length === 0) {
//                htmlHelper.initializeSelect($('#ata_ClearingFirmsSelect'), 'Select a clearing firm');
//                return;
//            }
//            dataAccess.getClearingFirmsForUser(username, fillClearingFirmsSelect);
//        },
        fillAllClearingFirmsSelect = function (response) {
            var select, option;
            if (response.Success && response.Payload) {
                select = $('#ata_ClearingFirmsSelect');
                htmlHelper.initializeSelect(select, 'Select a clearing firm');
                response.Payload.forEach(function (clearingFirm) {
                    option = htmlHelper.createOption(clearingFirm, clearingFirm);
                    option.attr('title', clearingFirm);
                    select.append(option);
                });
            }
            htmlHelper.initializeSelect($('#fcmAccountsSelect'), 'Select an FCM account');
        },
        canSaveAccountAssociation = function () {
            return common.trimmedValueIsNullOrEmpty($('#ata_UsernamesSelect')) === false &&
                common.trimmedValueIsNullOrEmpty($('#ata_ClearingFirmsSelect')) === false &&
                common.trimmedValueIsNullOrEmpty($('#ata_FcmAccountsSelect')) === false;
        },
        getClearingFirmAccounts = function () {
            var clearingFirm = $('#ata_ClearingFirmsSelect').val();
            if (clearingFirm.length === 0) {
                htmlHelper.initializeSelect($('#ata_FcmAccountsSelect'), 'Select an FCM account');
                return;
            }
            dataAccess.getTradeAccountsByClearingFirm(clearingFirm, fillFcmAccountsSelect);
        },
        intitializeSelects = function () {
            $('#ata_UsernamesSelect').val('');
            $('#ata_FcmAccountsSelect').val('');
            $('#ata_ClearingFirmsSelect').val('');
        },
        createAccountAssociation = function () {
            var trader, fcmAccount, clearingFirm, callback, message, caller;
            caller = $(this);
            trader = $('#ata_UsernamesSelect').val();
            fcmAccount = $('#ata_FcmAccountsSelect option:selected').text();
            clearingFirm = $('#ata_ClearingFirmsSelect').val();
            callback = function (response) {
                message = response.Message;
                if (!response.Success) {
                    common.showToaster(caller, message, 0, 25, true, null, -1);
                    return;
                }
                common.showToaster(caller, message, 0, 25, false);
            };
            dataAccess.addClearingFirmAccountUserAssociation(trader, fcmAccount, clearingFirm, callback);
        },
        validateSave = function () {
            var addImage = $('#ata_AddButton');
            addImage.unbind('click');
            if (canSaveAccountAssociation()) {
                common.enableControl(addImage);
                addImage.click(createAccountAssociation);
                return;
            }
            common.disableControl(addImage);
        },
        assignEventHandlers = function () {
            $('#ata_CancelAddButton').click(that.hideMain);
            //$('#ata_UsernamesSelect').change(getClearingFirmsForUser);
            $('#ata_UsernamesSelect').change(validateSave);
            $('#ata_ClearingFirmsSelect').change(getClearingFirmAccounts);
            $('#ata_ClearingFirmsSelect').change(validateSave);
            $('#ata_FcmAccountsSelect').change(validateSave);
        },
        that = {
            applyStyles: function (styles) {
                if (styles) {
                    $('#ata_Container').addClass(styles.mainContainer);
                    $('#ata_UsersContainer').addClass(styles.usersContainer);
                    $('#ata_UsernamesSelect').addClass(styles.usernamesSelect);
                    $('#ata_ClearingFirmsContainer').addClass(styles.clearingFirmsContainer);
                    $('#ata_ClearingFirmsSelect').addClass(styles.clearingFirmsSelect);
                    $('#ata_FcmAccountsContainer').addClass(styles.fcmAccountsContainer);
                    $('#ata_FcmAccountsSelect').addClass(styles.fcmAccountsSelect);
                    $('#ata_CancelAddButton').addClass(styles.cancelButton);
                    $('#ata_AddButton').addClass(styles.addButton);
                }
            },
            hideMain: function () {
                $('#ata_Container').slideUp('slow');
            },
            showMain: function () {
                intitializeSelects();
                $('#ata_Container').slideDown('slow');
            },
            initialize: function () {
                assignEventHandlers();
                dataAccess.getUsernames(fillUsernamesSelect);
                dataAccess.getClearingFirms(fillAllClearingFirmsSelect);
                initializeSelects();
            }
        };
    return that;
});
