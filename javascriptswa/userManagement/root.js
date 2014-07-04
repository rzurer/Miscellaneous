/*globals $, console, document, define */
define(['userManagement/dataAccess',
        'userManagement/localDataStore',
        'userManagement/basicUserInformation',
        'userManagement/companyContacts',
        'userManagement/menu',
        'userManagement/review',
        'userManagement/products',
//'userManagement/permissions',
        'userManagement/basicSetups',
        'userManagement/screenSheets',
        'userManagement/valuationServiceAccounts',
        'userManagement/marketDataFeedProvider',
        'userManagement/userSearch',
        'userManagement/viewUserAccount',
        'userManagement/userChangeLog',
        'validationControl',
        'common',
        'htmlHelper',
        'eventListener'],
    function (dataAccess,
        localDataStore,
        basicUserInformation,
        companyContacts,
        menu,
        review,
        products,
    //permissions,
        basicSetups,
        screenSheets,
        valuationServiceAccounts,
        marketDataFeedProvider,
        userSearch,
        viewUserAccount,
        userChangeLog,
        validationControl,
        common,
        htmlHelper,
        eventListener) {
        "use strict";
        var newUserContainer = $('#newUserContainer'),
            manageUserAccount = $('#manageUserAccount'),
            viewDataTitle = $('#viewDataTitle'),
            logTitle = $('#logTitle'),
            logImage = $('#logImage'),
            liveImage = $('#liveImage'),
            modifyDataTitle = $('#modifyDataTitle'),
            sandboxImage = $('#sandboxImage'),
            manageUserAccountErrors = $('#manageUserAccountErrors'),
            viewUserInformation = $('#viewUserInformation'),
            userChangeLogContainer = $("#userChangeLogContainer"),
            userChangeLogControl = $("#userChangeLog"),
            newUserValidations = $('#newUserValidations'),
            newUserValidationsContainer = $('#newUserValidationsContainer'),
            newUserImage = $('#newUserImage'),
            newUsernameInput = $('#newUsernameInput'),
            newUsernameContainer = $('#newUsernameContainer'),
            newUserEmailAddressContainer = $('#newUserEmailAddressContainer'),
            newUserEmailAddressInput = $('#newUserEmailAddressInput'),
            manageUserAccountSelectContainer = $("#manageUserAccountSelectContainer"),
            usersSelect = $("#usersSelect"),
            backToManageUserAccountButton = $('#backToManageUserAccountButton'),
            showLoadingMessage = function () {
                var container;
                common.clearPopup();
                container = $('#processingContainer').clone();
                container.show();
                common.getPopup().append(container);
                common.showPopup(100, 450, true);
            },
            hideLoadingMessage = function () {
                common.clearPopup();
                common.disablePopup();
            },
            initializeControls = function (callback) {
                companyContacts.initializeControls(function () {
                    marketDataFeedProvider.initializeControls(function () {
                        basicUserInformation.initializeControls(callback);
                    });
                });
            },
            configureMenu = function () {
                var licenseTypeID, username;
                licenseTypeID = localDataStore.getLicenseTypeID();
                username = localDataStore.getCurrentUsername();
                eventListener.fire("ConfigureForLicense", [licenseTypeID]);
                eventListener.fire("ShowOrHideMenu", [username]);
            },
            assignAndDisplayUserInformation = function (response) {
                viewUserInformation.hide();
                if (!response.Success) {
                    displayErrorMessage(response.Message);
                    return;
                }
                localDataStore.setUserInfo(JSON.parse(response.Payload));
                localDataStore.setCopyFromUserBasicFutureSetupsDictionary(null);
                localDataStore.setCopyFromUserBasicOptionSetupsDictionary(null);
                localDataStore.setCopyFromUserScreenSheetsDictionary(null);
                initializeControls(function () {
                    hideLoadingMessage();
                    configureMenu();
                    eventListener.fire("ShowBasicInformation");
                    eventListener.fire("HideAddValuationServiceAccounts");
                    usersSelect.val(localDataStore.getCurrentUsername());
                });
            },
            displayNewUserControls = function () {
                var saveNewUser;
                saveNewUser = function () {
                    if (newUsernameInput.val() && newUsernameInput.val().trim() && newUserEmailAddressInput.val() && newUserEmailAddressInput.val().trim()) {
                        newUserImage.trigger('click');
                    }
                };
                newUsernameInput.val('');
                newUserEmailAddressInput.val('');
                common.trapEnterKey(newUserEmailAddressInput);
                common.trapEnterKey(newUsernameInput);
                common.fireOnEnterKeyDown(newUsernameInput, saveNewUser);
                common.fireOnEnterKeyDown(newUserEmailAddressInput, saveNewUser);
                newUsernameContainer.show();
                newUserContainer.show();
                newUserEmailAddressContainer.show();
                newUsernameInput.focus();
            },
            hideValidations = function () {
                newUserValidations.empty();
                newUserValidations.hide();
                newUserValidationsContainer.empty();
            },
            showValidations = function (validations, successCallback) {
                var validationsDisplay;
                hideValidations();
                validationsDisplay = validationControl.create(validations, successCallback);
                if (validationsDisplay) {
                    newUserValidations.append(validationsDisplay);
                    newUserValidationsContainer.append(newUserValidations);
                    newUserValidations.slideDown("slow");
                }
            },
            showExistingUserInformation = function (val, show, wantReadOnly) {
                var userID, licenseTypeID, username;
                usersSelect.val(val);
                localDataStore.setCurrentUsername(val);
                userID = usersSelect.val();
                if (!userID) {
                    usersSelect.trigger('change');
                    return;
                }
                if (show) {
                    showLoadingMessage();
                    hideValidations();
                    newUsernameContainer.hide();
                    newUserEmailAddressContainer.hide();
                    username = htmlHelper.getSelectedOptionTextVerbatim(usersSelect);
                    localDataStore.setCurrentUsername(username);
                    licenseTypeID = localDataStore.getLicenseTypeID();
                    if (wantReadOnly) {
                        dataAccess.getUserInformation(username, licenseTypeID, getReadOnlyUserInformation);

                    } else {
                        dataAccess.getUserInformation(username, licenseTypeID, assignAndDisplayUserInformation);
                    }
                }
            },
            getReadOnlyUserInformation = function () {
                var callback, username;
                username = usersSelect.val();
                callback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    viewUserInformation.show();
                    viewUserAccount.displayUserInformation(response.Payload);
                    hideLoadingMessage();
                };
                if (!username) {
                    viewUserInformation.hide();
                    return;
                }
                dataAccess.getReadOnlyUserInformation(username, callback);
                eventListener.fire("InitializeSearchControls");

            },
            setUser = function (val, show, wantReadOnly) {
                usersSelect.val(val);
                localDataStore.setCurrentUsername(val);
                if (show && wantReadOnly) {
                    getReadOnlyUserInformation();
                }
            },
            showUserInformation = function () {
                var userID, licenseTypeID, username, text;
                eventListener.fire("InitializeSearchControls");
                userID = usersSelect.val();
                showLoadingMessage();
                hideValidations();
                newUsernameContainer.hide();
                newUserEmailAddressContainer.hide();
                text = htmlHelper.getSelectedOptionTextVerbatim(usersSelect);
                username = !userID || userID === 'create-new-user' ? '' : text;
                localDataStore.setCurrentUsername(username);
                if (!userID || userID === 'create-new-user') {
                    eventListener.fire("HideAll");
                    hideLoadingMessage();
                    configureMenu();
                    if (text === '<new>') {
                        displayNewUserControls();
                    }
                    return;
                }
                licenseTypeID = localDataStore.getLicenseTypeID();
                dataAccess.getUserInformation(username, licenseTypeID, assignAndDisplayUserInformation);
            },
            showCompanyContacts = function (callback) {
                dataAccess.getCompanyContacts(localDataStore.getCurrentUsername(), callback);
            },
            getAppropriateScreenSheets = function (optionsCsv, callback) {
                dataAccess.getAppropriateScreenSheets(optionsCsv, callback);
            },
            getBasicFutureSetupsDictionaries = function (username, futuresCsv, callback) {
                dataAccess.getBasicFutureSetupsDictionaries(username, futuresCsv, callback);
            },
            getBasicOptionSetupsDictionaries = function (username, optionsCsv, callback) {
                dataAccess.getBasicOptionSetupsDictionaries(username, optionsCsv, callback);
            },
            persist = function (updateFunction, callback) {
                var currentUserInfo, updatedUserInfo, persistCallback, current, updated;
                persistCallback = function (response) {
                    var userInfo;
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    userInfo = JSON.parse(response.Payload);
                    localDataStore.setUserInfo(userInfo);
                    common.safeCallback(callback, userInfo);
                };
                currentUserInfo = localDataStore.getCurrentUserInfo();
                current = JSON.stringify(currentUserInfo);
                updatedUserInfo = updateFunction ? updateFunction(currentUserInfo) : currentUserInfo;
                updated = JSON.stringify(updatedUserInfo);
                if (!updateFunction || (current !== updated)) {
                    localDataStore.unignoreWarnings();
                    dataAccess.persistUserInformationToSandbox(updatedUserInfo, persistCallback);
                    return;
                }
                common.safeCallback(callback);
            },
            displayErrorMessage = function (message) {
                manageUserAccountErrors.text(message);
                hideLoadingMessage();
            },
            updateUser = function (saveCallback, ignoreWarnings) {
                var callback, payload, message, writeOnlyUserInfo;
                callback = function (response) {
                    message = response.Message;
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    payload = JSON.parse(response.Payload);
                    dataAccess.getUsersHavingProducts(localDataStore.setUsersHavingProducts);
                    saveCallback(payload, message);
                };
                showLoadingMessage();
                writeOnlyUserInfo = localDataStore.getWriteOnlyUserInfo();
                dataAccess.updateUser(writeOnlyUserInfo, ignoreWarnings, callback);
            },
            submitUser = function (saveCallback, ignoreWarnings) {
                var callback, payload, message, writeOnlyUserInfo;
                callback = function (response) {
                    message = response.Message;
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    payload = JSON.parse(response.Payload);
                    saveCallback(payload, message);
                };
                showLoadingMessage();
                writeOnlyUserInfo = localDataStore.getWriteOnlyUserInfo();
                dataAccess.submitUser(writeOnlyUserInfo, ignoreWarnings, callback);
            },
            getOptionsForUser = function (username, callback) {
                dataAccess.getProductsForTrader(username, function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    callback(response.Payload.UserOptions);
                });
            },
            getFuturesForUser = function (username, callback) {
                dataAccess.getProductsForTrader(username, function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    callback(response.Payload.UserFutures);
                });
            },
            fillUsersSelect = function (callback) {
                var retrieveCallback, getNamesCallback;
                retrieveCallback = function (usernames) {
                    htmlHelper.fillSelectFromList(usersSelect, "Choose a user", usernames);
                    usersSelect.find('option').first().after($('<option>').text('<new>').val('create-new-user'));
                    common.safeCallback(callback);
                    hideLoadingMessage();
                    manageUserAccountSelectContainer.fadeIn('normal');
                };
                getNamesCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    localDataStore.setUserInformationDictionary(response.Payload, retrieveCallback);
                };
                dataAccess.getNonSpecAccountUsernames(getNamesCallback);
            },
            fillReadOnlyUsersSelect = function (callback) {
                var retrieveCallback, currentUsername;
                retrieveCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    htmlHelper.fillSelectFromList(usersSelect, "Choose a user", response.Payload);
                    common.safeCallback(callback);
                    hideLoadingMessage();
                    manageUserAccountSelectContainer.fadeIn('normal');
                    currentUsername = localDataStore.getCurrentUsername();
                    if (currentUsername) {
                        usersSelect.val(currentUsername);
                        usersSelect.trigger('change');
                    }
                };
                dataAccess.getNonSpecAccountUsernames(retrieveCallback, true);
            },
            fillSelects = function () {
                dataAccess.getMarketDataFeedSubscriptionLimits(marketDataFeedProvider.populateMarketDataFeedSubscriptionLimits);
                dataAccess.getLicenseTypes(basicUserInformation.populateLicenseTypes);
                dataAccess.getCancellationReasons(basicUserInformation.populateCancellationReasons);
                fillUsersSelect(function () {
                    viewUserInformation.hide();
                });
            },
            initialOrRefreshScreenSheets = function (callback) {
                var optionsCsv, getSheetsCallback;
                getSheetsCallback = function (response) {
                    if (!response.Success) {
                        eventListener.fire("FailedResponse", [response.Message]);
                        return;
                    }
                    localDataStore.setCopyFromUserScreenSheetsDictionary(response.Payload.CopyFromUserScreenSheetsDictionary);
                    common.safeCallback(callback);
                };
                optionsCsv = common.arrayToCsv(localDataStore.getUserOptions());
                getAppropriateScreenSheets(optionsCsv, getSheetsCallback);
            },
            getOptionsForICE00 = function (callback) {
                dataAccess.getProductsForTrader("ICE00", function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    callback(response.Payload.UserOptions);
                });
            },
            getFuturesForICE00 = function (callback) {
                dataAccess.getProductsForTrader("ICE00", function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    callback(response.Payload.UserFutures);
                });
            },
            refreshICE00Products = function () {
                getFuturesForICE00(localDataStore.setICE00Futures);
                getOptionsForICE00(localDataStore.setICE00Options);
            },
            initializeLocalDataStore = function (level) {
                localDataStore.setLoggedInUserPermissions(level);
                dataAccess.getMarketDataFeedProviders(localDataStore.setMarketDataFeedProviders);
                dataAccess.getValuationServiceSessions(localDataStore.setValuationServiceDictionary);
                dataAccess.getProductsAndUnderliers(localDataStore.setProductsAndUnderliers);
                dataAccess.getUsersHavingProducts(localDataStore.setUsersHavingProducts);
                dataAccess.getICEProducts(localDataStore.setICEProducts);
                dataAccess.getProductNameDictionaries(localDataStore.setProductNameDictionaries);
                refreshICE00Products();
                dataAccess.getBaseOptionsForUser("ICE00", localDataStore.setICE00OptionBaseOptionsPairs);
            },
            revertToLive = function () {
                var username = localDataStore.getCurrentUsername();
                dataAccess.revertToLive(username, assignAndDisplayUserInformation);
            },
            getBaseOptionForUser = function (username, optionCode, callback) {
                var getBaseOptionForUserCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    common.safeCallback(callback, response.Payload.BaseOptionCode);
                };
                dataAccess.getBaseOptionForUser(username, optionCode, getBaseOptionForUserCallback);
            },
            getBaseOptionsForUser = function (username, callback) {
                var getBaseOptionsForUserCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    common.safeCallback(callback, response.Payload);
                };
                dataAccess.getBaseOptionsForUser(username, getBaseOptionsForUserCallback);
            },
            searchByFirstNameLastName = function (wantReadOnly, searchTerm, callback) {
                dataAccess.searchByFirstNameLastName(wantReadOnly, searchTerm, callback);
            },
            getUserChangLogUsernames = function (callback) {
                var getUsernamesCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    common.safeCallback(function () {
                        callback(response.Payload);
                    });
                };
                dataAccess.getUserChangLogUsernames(getUsernamesCallback);
            },
            initializeEventListener = function () {
                eventListener.removeListener("Persist", persist);
                eventListener.addListener("Persist", persist);
                eventListener.removeListener("HideLoadingMessage", hideLoadingMessage);
                eventListener.addListener("HideLoadingMessage", hideLoadingMessage);
                eventListener.removeListener("ShowLoadingMessage", showLoadingMessage);
                eventListener.addListener("ShowLoadingMessage", showLoadingMessage);
                eventListener.removeListener("FailedResponse", displayErrorMessage);
                eventListener.addListener("FailedResponse", displayErrorMessage);
                eventListener.removeListener('ShowCompanyContacts', showCompanyContacts);
                eventListener.addListener('ShowCompanyContacts', showCompanyContacts);
                eventListener.removeListener('GetAppropriateScreenSheets', initialOrRefreshScreenSheets);
                eventListener.addListener('GetAppropriateScreenSheets', initialOrRefreshScreenSheets);
                eventListener.removeListener('GetBasicFutureSetupsDictionaries', getBasicFutureSetupsDictionaries);
                eventListener.addListener('GetBasicFutureSetupsDictionaries', getBasicFutureSetupsDictionaries);
                eventListener.removeListener('GetBasicOptionSetupsDictionaries', getBasicOptionSetupsDictionaries);
                eventListener.addListener('GetBasicOptionSetupsDictionaries', getBasicOptionSetupsDictionaries);
                eventListener.removeListener("GetOptionsForUser", getOptionsForUser);
                eventListener.addListener("GetOptionsForUser", getOptionsForUser);
                eventListener.removeListener("GetFuturesForUser", getFuturesForUser);
                eventListener.addListener("GetFuturesForUser", getFuturesForUser);
                eventListener.removeListener("SubmitUser", submitUser);
                eventListener.addListener("SubmitUser", submitUser);
                eventListener.removeListener("UpdateUser", updateUser);
                eventListener.addListener("UpdateUser", updateUser);
                eventListener.removeListener("RefreshICE00Products", refreshICE00Products);
                eventListener.addListener("RefreshICE00Products", refreshICE00Products);
                eventListener.removeListener("RevertToLive", revertToLive);
                eventListener.addListener("RevertToLive", revertToLive);
                eventListener.removeListener("GetBaseOptionForUser", getBaseOptionForUser);
                eventListener.addListener("GetBaseOptionForUser", getBaseOptionForUser);
                eventListener.removeListener("GetBaseOptionsForUser", getBaseOptionsForUser);
                eventListener.addListener("GetBaseOptionsForUser", getBaseOptionsForUser);
                eventListener.removeListener("SearchByFirstNameLastName", searchByFirstNameLastName);
                eventListener.addListener("SearchByFirstNameLastName", searchByFirstNameLastName);
                eventListener.removeListener("ShowExistingUserInformation", showExistingUserInformation);
                eventListener.addListener("ShowExistingUserInformation", showExistingUserInformation);
                eventListener.removeListener("ShowExistingUserInformation", setUser);
                eventListener.addListener("ShowExistingUserInformation", setUser);
                eventListener.removeListener("GetUserChangeLogUsernames", getUserChangLogUsernames);
                eventListener.addListener("GetUserChangeLogUsernames", getUserChangLogUsernames);
                eventListener.removeListener("RetrieveUserChangeLogs", retrieveUserChangeLogs);
                eventListener.addListener("RetrieveUserChangeLogs", retrieveUserChangeLogs);
            },
            initializeEventListeners = function () {
                initializeEventListener();
                basicSetups.initializeEventListener(eventListener);
                basicUserInformation.initializeEventListener(eventListener);
                companyContacts.initializeEventListener(eventListener);
                marketDataFeedProvider.initializeEventListener(eventListener);
                localDataStore.initializeEventListener(eventListener);
                menu.initializeEventListener(eventListener);
                products.initializeEventListener(eventListener);
                review.initializeEventListener(eventListener);
                screenSheets.initializeEventListener(eventListener);
                valuationServiceAccounts.initializeEventListener(eventListener);
                userSearch.initializeEventListener(eventListener);
                userChangeLog.initializeEventListener(eventListener);
            },
            tryCreateNewUser = function () {
                var validateNewUserCallback, username, email, successCallback, propertyValuePairs, persistCallback, fillUsersSelectCallback, initializeControlsCallback;
                username = newUsernameInput.val();
                email = newUserEmailAddressInput.val();
                if (!username || !username.trim() || !email || !email.trim()) {
                    newUsernameInput.trigger('blur');
                    newUserEmailAddressInput.trigger('blur');
                    return;
                }
                initializeControlsCallback = function () {
                    configureMenu();
                    eventListener.fire("ShowBasicInformation");
                    eventListener.fire("HideAddValuationServiceAccounts");
                    hideLoadingMessage();
                };
                username = username.toUpperCase();
                persistCallback = function () {
                    fillUsersSelectCallback = function () {
                        usersSelect.val(username);
                        showLoadingMessage();
                        hideValidations();
                        newUsernameContainer.hide();
                        newUserEmailAddressContainer.hide();
                        localDataStore.setCurrentUsername(username);
                        localDataStore.setCurrentUserEmail(email);
                        initializeControls(initializeControlsCallback);
                    };
                    fillUsersSelect(fillUsersSelectCallback);
                };
                validateNewUserCallback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    successCallback = function () {
                        propertyValuePairs = [{ property: 'Name', value: username }, { property: 'LicenseTypeID', value: '0' }, { property: 'LicenseType', value: 'None' }, { property: 'Email', value: email}];
                        localDataStore.addToUserInformationDictionary(username, propertyValuePairs, function (userInfo) {
                            localDataStore.setCurrentUsername(username);
                            persist(null, function () {
                                persistCallback(userInfo);
                            });
                        });
                    };
                    showValidations(response.Payload, successCallback);
                };
                dataAccess.validateNewUser({ Name: username, Email: email }, validateNewUserCallback);
            },
            hideUserChangeLog = function () {
                userChangeLogControl.hide();
                userChangeLogContainer.hide();
                manageUserAccount.slideDown('slow');
            },
            assignEventHandlers = function () {
                common.clearRequiredValidationHandler('blur', [newUsernameInput, newUserEmailAddressInput]);
                common.addRequiredValidationHandler('blur', { border: '1px solid rgb(229, 229, 229', errorBorder: '1px solid rgb(255, 0, 0' }, [newUsernameInput, newUserEmailAddressInput]);
                if (common.isIE() === false) {
                    usersSelect.on("keydown", function () {
                        return false;
                    });
                }
                newUserImage.off('click', tryCreateNewUser);
                newUserImage.on('click', tryCreateNewUser);
                newUsernameInput.off("keypress", common.isLetter);
                newUsernameInput.on("keypress", common.isLetter);
                backToManageUserAccountButton.off("click");
                backToManageUserAccountButton.on("click", hideUserChangeLog);

            },
            assignAllEventHandlers = function () {
                assignEventHandlers();
                basicUserInformation.assignEventHandlers();
                marketDataFeedProvider.assignEventHandlers();
                review.assignEventHandlers();
                screenSheets.assignEventHandlers();
                valuationServiceAccounts.assignEventHandlers();
            },
            enableTabControl = function (control, image, clickHandler) {
                modifyDataTitle.off('click', clickHandler);
                control.removeClass('modifyModeUnselected');
                control.addClass('modifyModeSelected');
                image.addClass('modifyImageSelected');
                image.removeClass('modifyImageUnselected');
            },
            disableTabControl = function (control, image, clickHandler) {
                control.off('click', clickHandler);
                control.on('click', clickHandler);
                control.addClass('modifyModeUnselected');
                control.removeClass('modifyModeSelected');
                image.addClass('modifyImageUnselected');
                image.removeClass('modifyImageSelected');
            },
            enterModifyMode = function () {
                companyContacts.assignEventHandlers();
                userSearch.assignEventHandlers(false);
                usersSelect.off('change', getReadOnlyUserInformation);
                usersSelect.off('change', showUserInformation);
                usersSelect.on('change', showUserInformation);
                enableTabControl(modifyDataTitle, sandboxImage, enterModifyMode);
                disableTabControl(viewDataTitle, liveImage, enterViewMode);
                disableTabControl(logTitle, logImage, enterLogMode);
                manageUserAccountSelectContainer.fadeIn('normal');
                fillUsersSelect(function () {
                    viewUserInformation.hide();
                });
                usersSelect.trigger('change');
            },
            enterViewMode = function () {
                companyContacts.assignEventHandlers(true);
                userSearch.assignEventHandlers(true);
                usersSelect.off('change', showUserInformation);
                usersSelect.off('change', getReadOnlyUserInformation);
                usersSelect.on('change', getReadOnlyUserInformation);
                enableTabControl(viewDataTitle, liveImage, enterViewMode);
                disableTabControl(modifyDataTitle, sandboxImage, enterModifyMode);
                disableTabControl(logTitle, logImage, enterLogMode);
                manageUserAccountSelectContainer.fadeIn('normal');
                newUserContainer.hide();
                fillReadOnlyUsersSelect();
                eventListener.fire("ShowOrHideMenu", [""]);
                eventListener.fire("HideAll");
            },
            retrieveUserChangeLogs = function (daysBack, username) {
                var callback = function (response) {
                    if (!response.Success) {
                        displayErrorMessage(response.Message);
                        return;
                    }
                    eventListener.fire("ShowUserChangeLog", [response.Payload]);
                };
                dataAccess.getUserChangeLog(daysBack, username, callback);
            },
            enterLogMode = function () {
                enableTabControl(logTitle, logImage, enterLogMode);
                disableTabControl(viewDataTitle, liveImage, enterViewMode);
                disableTabControl(modifyDataTitle, sandboxImage, enterModifyMode);
                manageUserAccountSelectContainer.fadeOut('normal');
                retrieveUserChangeLogs(1, '');
                userChangeLog.initializeControls();
                eventListener.fire("ShowOrHideMenu", [""]);
                eventListener.fire("HideAll");
            },
            initialize = function (level, username) {
                var currentUsername;
                currentUsername = username ? username : '';
                showLoadingMessage();
                initializeEventListeners();
                initializeLocalDataStore(level);
                assignAllEventHandlers();
                fillSelects();
                localDataStore.setCurrentUsername(currentUsername);
                enterViewMode();
            };
        return {
            initialize: initialize
        };
    });

