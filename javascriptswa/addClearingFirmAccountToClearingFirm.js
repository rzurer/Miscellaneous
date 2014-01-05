/*globals $, define*/
"use strict";
define(['common', 'clearingFirmDataAccess'], function (common, dataAccess) {
    var getClearingFirmsAutoComplete = function () {
        return $("#clearingFirmsAutoComplete");
    },
        getExecutingFirmsAutoComplete = function () {
            return $("#executingFirmsAutoComplete");
        },
        getToaster = function () {
            return $("#toaster");
        },
        getClearingFirmAccount = function () {
            return $("#clearingFirmAccount");
        },
        getCancelAddClearingFirmAccountButton = function () {
            return $("#cancelAddClearingFirmAccountButton");
        },
        getAddClearingFirmAccountButton = function () {
            return $("#addClearingFirmAccountButton");
        },
        getAccountComment = function () {
            return $("#accountComment");
        },
        getEntryControls = function () {
            return $('.entry');
        },
        getAccountExists = function () {
            return $("#accountExists").val();
        },
        setAccountExists = function (exists) {
            $("#accountExists").val(exists);
        },
        clearingFirmExists = function (clearingFirm) {
            var source = common.getLowercaseArray(getClearingFirmsAutoComplete().autocomplete("option", "source"));
            return source.indexOf(clearingFirm.toLowerCase()) >= 0;
        },
        tradeAccountsForClearingFirm = [],
        disableAndClearEntryControls = function () {
            var entryControls;
            entryControls = getEntryControls();
            entryControls.each(function (control) {
                common.disableControl($(control));
            });
            entryControls.val("");
            entryControls.attr("disabled", "disabled");
            common.setNormalBorderAndCallback(getClearingFirmAccount());
            common.setNormalBorderAndCallback(getClearingFirmsAutoComplete());
            getClearingFirmsAutoComplete().val("");
        },
        enableEntryControls = function () {
            var entryControls;
            entryControls = getEntryControls();
            entryControls.each(function (control) {
                common.disableControl($(control));
            });
            entryControls.removeAttr("disabled");
        },
        getClearingFirmHasBeenSelected = function () {
            return getClearingFirmsAutoComplete().val().length > 0;
        },
        coordinateControls = function () {
            if (getClearingFirmHasBeenSelected()) {
                enableEntryControls();
            } else {
                disableAndClearEntryControls();
            }
        },
        enableDisableSaveButton = function () {
            var addButton, accountIsNotEmpty, accountExists, clearingFirmHasBeenSelected;
            addButton = getAddClearingFirmAccountButton();
            clearingFirmHasBeenSelected = getClearingFirmHasBeenSelected();
            accountIsNotEmpty = getClearingFirmAccount().val().trim().length > 0;
            accountExists = getAccountExists();
            if (accountExists === 'false' && accountIsNotEmpty === true && clearingFirmHasBeenSelected === true) {
                common.enableControlAndSetClick(addButton, addButtonClick);
            } else {
                common.disableControls([addButton]);
            }
        },
        fillTradeAccountsForClearingFirmCallback = function (response) {
            if (response.Success && response.Payload) {
                tradeAccountsForClearingFirm = response.Payload.map(function (element) {
                    return element.Account.toLowerCase();
                });
                getClearingFirmAccount().focus();
            } else {
                tradeAccountsForClearingFirm = [];
            }
        },
        fillClearingFirmsAutocomplete = function (sourceArray) {
            var autocomplete, callback;
            autocomplete = getClearingFirmsAutoComplete();
            autocomplete.attr('title', "Choose a clearing firm");
            callback = function () {
                coordinateControls();
                if (getClearingFirmHasBeenSelected()) {
                    dataAccess.getTradeAccountsByClearingFirm(autocomplete.val(), fillTradeAccountsForClearingFirmCallback);
                }
                enableDisableSaveButton();
            };
            autocomplete.blur(function () {
                common.verifyItemExists(autocomplete);
                callback();
                return false;
            });
            autocomplete.keyup(function () {
                common.verifyItemExists(autocomplete);
                return false;
            });
            common.setAutocomplete(autocomplete, 0, sourceArray, null, true, true);
        },
        fillExecutingFirmsAutocomplete = function (sourceArray) {
            var autocomplete = getExecutingFirmsAutoComplete();
            autocomplete.attr('title', "Choose an executing firm");
            sourceArray.unshift(common.nonePlaceholder);
            autocomplete.blur(function () {
                common.verifyItemExists(autocomplete);
                return false;
            });
            autocomplete.keyup(function () {
                common.verifyItemExists(autocomplete);
                return false;
            });
            common.setAutocomplete(autocomplete, 0, sourceArray, null, true, true);
        },
        verifyClearingFirmAccountDoesNotExist = function () {
            var clearingFirmAccount, account, message;
            clearingFirmAccount = getClearingFirmAccount();
            account = clearingFirmAccount.val().trim().toLowerCase();
            if (account.length > 0 && tradeAccountsForClearingFirm.indexOf(account) >= 0) {
                message = "The account '" + account + "' already exists";
                common.showToaster(clearingFirmAccount, message, 0, 120, true, null, -1);
                common.setErrorBorderAndFocus(clearingFirmAccount);
                setAccountExists('true');
            } else {
                setAccountExists('false');
                getToaster().text('');
                getToaster().hide();
                common.setNormalBorderAndCallback(clearingFirmAccount);
            }
            enableDisableSaveButton();
        },
        addButtonClick = function () {
            var account, executingFirm, accountComment, callback, clearingFirm, addButton;
            addButton = getAddClearingFirmAccountButton();
            account = getClearingFirmAccount().val();
            executingFirm = getExecutingFirmsAutoComplete().val();
            accountComment = getAccountComment().val();
            accountComment = accountComment === common.nonePlaceholder ? '' : accountComment;
            callback = function (response) {
                var text = response.Message;
                if (!response.Success) {
                    common.showToaster(addButton, text, 0, 25, true, null, -1);
                    return;
                }
                common.showToaster(addButton, text, 0, 25, false, null, 2500);
                disableAndClearEntryControls();
                enableDisableSaveButton(clearingFirm.length > 0);
            };
            clearingFirm = getClearingFirmsAutoComplete().val();
            if (clearingFirmExists(clearingFirm)) {
                dataAccess.addClearingFirmAccountToClearingFirm(clearingFirm, account, executingFirm, accountComment, callback);
            } else {
                var message = "Clearing firm does not exist";
                common.showToaster(addButton, message, 0, 25, true, null, -1);
            }
            return false;
        },
        assignCancelAddClearingFirmAccountButton = function () {
            var clickFunction = function () {
                disableAndClearEntryControls();
                enableDisableSaveButton();
                return false;
            };
            getCancelAddClearingFirmAccountButton().click(clickFunction);
        },
        fillAndShowAutoCompletes = function (response) {
            fillClearingFirmsAutocomplete(response.Payload.ClearingFirms);
            fillExecutingFirmsAutocomplete(response.Payload.ExecutingFirms);
        };
    return {
        applyStyles: function (styles, cancelClick) {
            if (styles) {
                var container, executingFirmsContainer, cancelAddButton, addButton;
                container = $('#addClearingFirmAccountToClearingFirmContainer');
                executingFirmsContainer = $('#executingFirmsContainer');
                addButton = getAddClearingFirmAccountButton();
                cancelAddButton = getCancelAddClearingFirmAccountButton();
                cancelAddButton.click(cancelClick);
                container.addClass(styles.mainContainer);
                container.find('label').addClass(styles.mainContainerLabel);
                container.find('input').addClass(styles.mainContainerInput);
                executingFirmsContainer.addClass(styles.executingFirmsContainer);
                $('#accountCommentContainer label').addClass(styles.accountCommentContainerLabel);
                $('#accountComment').addClass(styles.accountComment);
                cancelAddButton.addClass(styles.cancelButton);
                cancelAddButton.attr('title', "Cancel");
                addButton.addClass(styles.addButton);
                addButton.attr('title', "Add account to clearing firm");
                $('#clearingFirmLabel').addClass(styles.clearingFirmLabel);
            }
        },
        initialize: function () {
            var callback;
            common.trapEnterKey($('form'));
            assignCancelAddClearingFirmAccountButton();
            getClearingFirmAccount().keyup(function () {
                verifyClearingFirmAccountDoesNotExist();
            });
            getClearingFirmAccount().blur(function () {
                verifyClearingFirmAccountDoesNotExist();
            });
            disableAndClearEntryControls();
            callback = function (response) {
                if (!response.Success) {
                    common.showToaster(null, response.Message, 0, 25, true, null, -1);
                    return;
                }
                fillAndShowAutoCompletes(response);
            };
            dataAccess.getAddClearingFirmAccountViewModel(callback);
        }
    };
});
