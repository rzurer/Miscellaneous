/*globals $, define */
define(['common', 'htmlHelper', 'userManagement/localDataStore', 'editInPlaceControl'], function (common, htmlHelper, localDataStore, editInPlaceControl) {
    "use strict";
    var eventListener,
        delimiter = '__',
        editInPlaceControls = [],
        deleteButtonSuffix = '_deleteButton',
        sessionOwnersSelect = $('#sessionOwnersSelect'),
        valuationServiceAccountsContainer = $('#valuationServiceAccountsContainer'),
        sourceSessionsSelect = $('#sourceSessionsSelect'),
        externalUsernameInput = $("#externalUsernameInput"),
        valuationServiceAccountsTableContainer = $('#valuationServiceAccountsTableContainer'),
        addValuationServiceAccountImage = $("#addValuationServiceAccountImage"),
        addValuationServiceAccountButton = $("#addValuationServiceAccountButton"),
        addValuationServiceAccountContainer = $('#addValuationServiceAccountContainer'),
        getDeleteButtonId = function (id) {
            return id + deleteButtonSuffix;
        },
        isAlphanumericOrHyphenOrUnderscore = function (e) {
            return common.isLetterOrNumberOrSpecifiedKeyCode(e, [95, 45]);
        },
        leaveExternalUsernameInput = function (target) {
            var externalUsername, sessionOwner, id, indexOfDelimiter, updateFunction;
            externalUsername = target.val();
            id = target.parent().attr('id');
            indexOfDelimiter = id.indexOf(delimiter);
            sessionOwner = id.substring(0, indexOfDelimiter);
            $(".valuationServiceAccountsTable .edit-in-place[id^='" + sessionOwner + delimiter + "']").each(function () {
                $(this).find('span.read').text(externalUsername);
                $(this).find('input.write').val(externalUsername);
            });
            updateFunction = function (userInfo) {
                var account, i, accounts;
                accounts = userInfo.ValuationServiceAccounts;
                for (i = 0; i < accounts.length; i += 1) {
                    account = accounts[i];
                    if (account.SessionOwner === sessionOwner) {
                        account.ExternalUsername = externalUsername;
                    }
                }
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'leaveExternalUsernameInput']);
        },
        fillSourceSessionsSelect = function () {
            var sessionOwner, sourceSessionsInUse, unusedSourceSessions, sourceSessions, valuationServiceAccounts;
            if (!localDataStore.currentUserIsDefined()) {
                return;
            }
            sessionOwner = $(this).val();
            unusedSourceSessions = [];
            valuationServiceAccounts = localDataStore.getValuationServiceAccounts();
            sourceSessionsInUse = valuationServiceAccounts.map(function (account) {
                return account.SourceSession;
            });
            sourceSessions = localDataStore.getSourceSessions(sessionOwner);
            if (!sourceSessions) {
                htmlHelper.initializeSelect(sourceSessionsSelect, "Choose Source Session");
                return;
            }
            sourceSessions.forEach(function (sourceSession) {
                if (sourceSessionsInUse.indexOf(sourceSession) === -1) {
                    unusedSourceSessions.push(sourceSession);
                }
            });
            htmlHelper.fillSelectFromList(sourceSessionsSelect, "Choose Source Session", unusedSourceSessions);
        },
        getUnusedSessionOwners = function (valuationServiceAccounts) {
            var unusedSessionOwners, sourceSessions, sourceSessionsInUse;
            unusedSessionOwners = [];
            sourceSessionsInUse = valuationServiceAccounts.map(function (account) {
                return account.SourceSession;
            });
            localDataStore.getSessionOwners().forEach(function (sessionOwner) {
                sourceSessions = localDataStore.getSourceSessions(sessionOwner);
                sourceSessions.forEach(function (sourceSession) {
                    if (sourceSessionsInUse.indexOf(sourceSession) === -1 && unusedSessionOwners.indexOf(sessionOwner) === -1) {
                        unusedSessionOwners.push(sessionOwner);
                    }
                });
            });
            return unusedSessionOwners;
        },
        enableOrDisableAddValuationServiceAccountButton = function (unusedSessionOwners) {
            if (unusedSessionOwners.length === 0) {
                addValuationServiceAccountImage.off('click');
                common.disableControls([addValuationServiceAccountImage]);
            } else {
                addValuationServiceAccountImage.off('click');
                addValuationServiceAccountImage.on('click', showValuationServiceAccountEntry);
                common.enableControl(addValuationServiceAccountImage);
            }
        },
        fillSessionOwnersSelect = function () {
            var unusedSessionOwners, valuationServiceAccounts;
            htmlHelper.initializeSelect(sourceSessionsSelect, "Choose Source Session");
            if (!localDataStore.currentUserIsDefined()) {
                valuationServiceAccountsTableContainer.hide();
                return;
            }
            valuationServiceAccounts = localDataStore.getValuationServiceAccounts();
            if (!valuationServiceAccounts) {
                valuationServiceAccountsTableContainer.hide();
                return;
            }
            unusedSessionOwners = getUnusedSessionOwners(valuationServiceAccounts);
            htmlHelper.fillSelectFromList(sessionOwnersSelect, "Choose Session Owner", unusedSessionOwners);
            enableOrDisableAddValuationServiceAccountButton(unusedSessionOwners);
        },
        resetValuationServiceAccountControls = function () {
            var border = '1px solid rgb(229, 229, 229';
            sessionOwnersSelect.val('');
            sourceSessionsSelect.val('');
            externalUsernameInput.val('');
            sessionOwnersSelect.css('border', border);
            sourceSessionsSelect.css('border', border);
            externalUsernameInput.css('border', border);
        },
        createValuationAccountRow = function (account, deleteCallback) {
            var row, cell, id, deleteButton, control, onLeaveEdit;
            row = htmlHelper.createRow('valuationServiceAccountsRow');
            htmlHelper.appendCell(row, account.SessionOwner);
            htmlHelper.appendCell(row, account.SourceSession.trim());
            if (deleteCallback) {
                cell = htmlHelper.appendCell(row);
                id = account.SessionOwner + delimiter + account.SourceSession;
                onLeaveEdit = function () {
                    leaveExternalUsernameInput($(this));
                };
                control = editInPlaceControl.create(id, account.ExternalUsername, 100, null, isAlphanumericOrHyphenOrUnderscore, onLeaveEdit, null, true);
                editInPlaceControls.push(control);
                cell.append(control.container);
                cell = htmlHelper.appendCell(row);
                deleteButton = common.createDeleteButton("Delete this valuation service account", deleteCallback, 'deleteValuationAccountButton');
                deleteButton.attr('id', getDeleteButtonId(id));
                cell.append(deleteButton);
                return row;
            }
            htmlHelper.appendCell(row, account.ExternalUsername);
            return row;
        },
        createValuationAccountHeaderRow = function (deleteCallback) {
            var row = htmlHelper.createRow('valuationServiceAccountsHeaderRow');
            htmlHelper.appendCell(row, "Session Owner", '', true);
            htmlHelper.appendCell(row, "Sender Comp ID", '', true);
            htmlHelper.appendCell(row, "External Username", '', true);
            if (deleteCallback) {
                htmlHelper.appendCell(row, "", '', true);
            }
            return row;
        },
        createValuationAccountEmptyHeaderRow = function () {
            var row = htmlHelper.createRow('valuationServiceAccountsHeaderRow');
            htmlHelper.appendCell(row, "No Valuation Service Accounts Exist");
            return row;
        },
        createValuationServiceAccountsTable = function (accounts, deleteCallback) {
            var table;
            editInPlaceControls = [];
            table = htmlHelper.createTable('valuationServiceAccountsTable');
            if (accounts.length === 0) {
                table.append(createValuationAccountEmptyHeaderRow());
                return table;
            }
            table.append(createValuationAccountHeaderRow(deleteCallback));
            accounts.forEach(function (account) {
                table.append(createValuationAccountRow(account, deleteCallback));
            });
            return table;
        },
        displayValuationServiceAccountsTable = function (accounts, deleteCallback) {
            valuationServiceAccountsTableContainer.empty();
            valuationServiceAccountsTableContainer.append(createValuationServiceAccountsTable(accounts, deleteCallback));
            valuationServiceAccountsTableContainer.show();
        },
        deleteValuationServiceAccount = function () {
            var updateFunction, callback, id, indexOfDelimiter, indexOfDeleteButtonSuffix, sessionOwner, sourceSession;
            resetValuationServiceAccountControls();
            id = $(this).attr('id');
            indexOfDelimiter = id.indexOf(delimiter);
            indexOfDeleteButtonSuffix = id.indexOf(deleteButtonSuffix);
            sessionOwner = id.substring(0, indexOfDelimiter);
            sourceSession = id.substring(indexOfDelimiter + delimiter.length, indexOfDeleteButtonSuffix);
            callback = function () {
                var accounts = localDataStore.getValuationServiceAccounts();
                addValuationServiceAccountContainer.slideUp('slow');
                displayValuationServiceAccountsTable(accounts, deleteValuationServiceAccount);
                fillSessionOwnersSelect();
            };
            updateFunction = function (userInfo) {
                var account, i, accounts, indexOfAccount;
                indexOfAccount = -1;
                accounts = userInfo.ValuationServiceAccounts;
                for (i = 0; i < accounts.length; i += 1) {
                    account = accounts[i];
                    if (account.SessionOwner === sessionOwner && account.SourceSession === sourceSession) {
                        indexOfAccount = i;
                    }
                }
                if (indexOfAccount === -1) {
                    return userInfo;
                }
                accounts.splice(indexOfAccount, 1);
                userInfo.ValuationServiceAccounts = accounts;
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, callback, 'deleteValuationServiceAccount']);

        },
        showValuationServiceAccountEntry = function () {
            var callback, updateFunction, valuationServiceAccounts;
            if (addValuationServiceAccountContainer.is(':visible')) {
                addValuationServiceAccountContainer.slideUp('slow');
                return;
            }
            updateFunction = function (userInfo) {
                return userInfo;
            };
            callback = function () {
                resetValuationServiceAccountControls();
                valuationServiceAccounts = localDataStore.getValuationServiceAccounts();
                displayValuationServiceAccountsTable(valuationServiceAccounts, deleteValuationServiceAccount);
                addValuationServiceAccountContainer.slideDown('slow');
                fillSessionOwnersSelect();
            };
            eventListener.fire("Persist", [updateFunction, callback, 'showValuationServiceAccountEntry']);
        },
        createValuationServiceAccount = function () {
            var sessionOwner, sourceSession, externalUsername, data, border, errorBorder;
            border = '1px solid rgb(229, 229, 229';
            errorBorder = '1px solid rgb(255, 0, 0';
            data = { border: border, errorBorder: errorBorder };
            common.clearRequiredValidationHandler('change', [sessionOwnersSelect, sourceSessionsSelect]);
            common.clearRequiredValidationHandler('blur', [externalUsernameInput]);
            common.addRequiredValidationHandler('change', data, [sessionOwnersSelect, sourceSessionsSelect]);
            common.addRequiredValidationHandler('blur', data, [externalUsernameInput]);
            sessionOwnersSelect.unbind('change', fillSourceSessionsSelect);
            sessionOwnersSelect.trigger('change');
            sessionOwnersSelect.bind('change', fillSourceSessionsSelect);
            sourceSessionsSelect.trigger('change');
            externalUsernameInput.trigger('blur');
            sessionOwner = sessionOwnersSelect.val();
            sourceSession = sourceSessionsSelect.val();
            externalUsername = externalUsernameInput.val();
            if (!sessionOwner || !sourceSession || !externalUsername) {
                return null;
            }
            common.clearRequiredValidationHandler('change', [sessionOwnersSelect, sourceSessionsSelect]);
            common.clearRequiredValidationHandler('blur', [externalUsernameInput]);
            return { ExternalUsername: externalUsername, SessionOwner: sessionOwner, SourceSession: sourceSession };
        },
        addValuationServiceAccount = function () {
            var account, updateFunction, callback, valuationServiceAccounts;
            account = createValuationServiceAccount();
            if (account) {
                callback = function () {
                    externalUsernameInput.val('');
                    fillSessionOwnersSelect();
                    addValuationServiceAccountContainer.slideUp('slow');
                    valuationServiceAccounts = localDataStore.getValuationServiceAccounts();
                    displayValuationServiceAccountsTable(valuationServiceAccounts, deleteValuationServiceAccount);
                };
                updateFunction = function (userInfo) {
                    var externalUsername, sessionOwner;
                    sessionOwner = account.SessionOwner;
                    externalUsername = account.ExternalUsername;
                    userInfo.ValuationServiceAccounts.forEach(function (valuationServiceAccount) {
                        if (valuationServiceAccount.SessionOwner === sessionOwner) {
                            valuationServiceAccount.ExternalUsername = externalUsername;
                        }
                    });
                    userInfo.ValuationServiceAccounts.push(account);
                    return userInfo;
                };
                eventListener.fire("Persist", [updateFunction, callback, 'addValuationServiceAccount']);
            }
        },
        hideAddValuationServiceAccountContainer = function () {
            addValuationServiceAccountContainer.hide();
        },
        initializeAccounts = function (licenseTypeID, callback) {
            var canUseValuationService, valuationServiceAccounts, updateFunction, persistCallback;
            canUseValuationService = localDataStore.canUseValuationService(licenseTypeID);
            hideAddValuationServiceAccountContainer();
            if (!canUseValuationService) {
                persistCallback = function () {
                    common.safeCallback(callback);
                    valuationServiceAccountsContainer.hide();
                };
                updateFunction = function (userInfo) {
                    userInfo.ValuationServiceAccounts = [];
                    localDataStore.setUserInfo(userInfo);
                    return userInfo;
                };
                eventListener.fire("Persist", [updateFunction, persistCallback, 'initializeAccounts']);
                return;
            }
            valuationServiceAccountsContainer.show();
            if (!localDataStore.currentUserIsDefined()) {
                valuationServiceAccountsContainer.hide();
                valuationServiceAccountsTableContainer.hide();
                common.safeCallback(callback);
                return;
            }
            valuationServiceAccounts = localDataStore.getValuationServiceAccounts();
            enableOrDisableAddValuationServiceAccountButton(getUnusedSessionOwners(valuationServiceAccounts));
            if (!valuationServiceAccounts || valuationServiceAccounts.length === 0) {
                valuationServiceAccountsTableContainer.hide();
                common.safeCallback(callback);
                displayValuationServiceAccountsTable(valuationServiceAccounts, deleteValuationServiceAccount);
                return;
            }
            common.safeCallback(callback);
            displayValuationServiceAccountsTable(valuationServiceAccounts, deleteValuationServiceAccount);
        },
        assignEventHandlers = function () {
            sessionOwnersSelect.off('change');
            sessionOwnersSelect.on('change', fillSourceSessionsSelect);
            addValuationServiceAccountButton.off('click');
            addValuationServiceAccountButton.on('click', addValuationServiceAccount);
            addValuationServiceAccountImage.off('click');
            addValuationServiceAccountImage.on('click', showValuationServiceAccountEntry);
            externalUsernameInput.off('keypress');
            externalUsernameInput.on('keypress', isAlphanumericOrHyphenOrUnderscore);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("RefreshValuationAccounts", initializeAccounts);
            eventListener.addListener("RefreshValuationAccounts", initializeAccounts);
            eventListener.removeListener("HideAddValuationServiceAccounts", hideAddValuationServiceAccountContainer);
            eventListener.addListener("HideAddValuationServiceAccounts", hideAddValuationServiceAccountContainer);
        };
    return {
        initializeEventListener: initializeEventListener,
        assignEventHandlers: assignEventHandlers,
        createValuationServiceAccountsTable: createValuationServiceAccountsTable
    };
});
