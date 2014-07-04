/*globals $, console, define*/
define(['common', 'htmlHelper', 'validationControl', 'userManagement/valuationServiceAccounts', 'userManagement/localDataStore', 'arrayHelper'], function (common, htmlHelper, validationControl, valuationServiceAccounts, localDataStore, arrayHelper) {
    "use strict";
    var eventListener,
        eSignalMarketDataFeedProviderID = '5DBB7EA7-9EB8-478A-83E4-BB28EEAFA5F2',
        reviewLicense = $('#reviewLicense'),
        reviewToaster = $('#reviewToaster'),
        reviewOptions = $('#reviewOptions'),
        reviewFutures = $('#reviewFutures'),
        reviewExpirationDate = $('#reviewExpirationDate'),
        reviewCancellationReason = $('#reviewCancellationReason'),
        reviewComment = $('#reviewComment'),
        reviewSelectedOptions = $('#reviewSelectedOptions'),
        reviewSelectedFutures = $('#reviewSelectedFutures'),
        reviewMarketDataFeedProvider = $("#reviewMarketDataFeedProvider"),
        reviewMarketDataFeedSubscriptionLimit = $("#reviewMarketDataFeedSubscriptionLimit"),
        reviewESignalSpecificInformation = $('#reviewESignalSpecificInformation'),
        reviewESignalUserName = $('#reviewESignalUserName'),
        reviewESignalPassword = $('#reviewESignalPassword'),
        reviewESignalProxyAddress = $('#reviewESignalProxyAddress'),
        reviewESignalProxyPort = $('#reviewESignalProxyPort'),
        reviewESignalProxyUserName = $('#reviewESignalProxyUserName'),
        reviewESignalProxyPassword = $('#reviewESignalProxyPassword'),
        reviewValuationServiceAccounts = $('#reviewValuationServiceAccounts'),
        activeUserReview = $(".activeUserReview"),
        reviewCopyBasicOptionSetups = $('#reviewCopyBasicOptionSetups'),
        reviewCopyBasicFuturesSetups = $('#reviewCopyBasicFuturesSetups'),
        reviewCopyScreenSheets = $('#reviewCopyScreenSheets'),
        reviewScreenSheetsToDelete = $('#reviewScreenSheetsToDelete'),
        reviewScreenSheetsToRename = $('#reviewScreenSheetsToRename'),
        updateUserButton = $('#updateUserButton'),
        reviewValidations = $('#reviewValidations'),
        reviewValidationsContainer = $('#reviewValidationsContainer'),
        cancellationReasonContainer = $('#cancellationReasonContainer'),
        changeBasicInformationButton = $("#changeBasicInformationButton"),
        changeProductsButton = $("#changeProductsButton"),
        changeScreenSheetsToCopyButton = $("#changeScreenSheetsToCopyButton"),
        changeScreenSheetsToDeleteButton = $("#changeScreenSheetsToDeleteButton"),
        changeScreenSheetsToRenameButton = $("#changeScreenSheetsToRenameButton"),
        changeCopyBasicSetupsButton = $("#changeCopyBasicSetupsButton"),
        valuationServiceControls = $('.valuationServiceReview'),
        getCancellationReason = function () {
            var cancellationReasonID, licenseTypeID, cancellationReason, reason;
            cancellationReason = '';
            cancellationReasonID = localDataStore.getCancellationReasonID();
            licenseTypeID = localDataStore.getLicenseTypeID();
            if (!licenseTypeID || licenseTypeID === 'new' || Number(licenseTypeID) > 0) {
                cancellationReasonContainer.hide();
            }
            if (licenseTypeID === '0') {
                cancellationReasonContainer.show();
                reason = localDataStore.getCancellationReason();
                cancellationReason = cancellationReasonID ? reason : null;
            }
            return cancellationReason;
        },
        reviewMarketDataProvider = function () {
            var marketDataFeedInformation = localDataStore.getMarketDataFeedInformation();
            reviewMarketDataFeedProvider.text(marketDataFeedInformation.MarketDataFeedProviderType || "None");
            reviewMarketDataFeedSubscriptionLimit.text(marketDataFeedInformation.MarketDataFeedSubscriptionLimit || "N/A");
            reviewESignalSpecificInformation.hide();
            if (marketDataFeedInformation.MarketDataFeedProviderTypeID && marketDataFeedInformation.MarketDataFeedProviderTypeID.toUpperCase() === eSignalMarketDataFeedProviderID) {
                reviewESignalSpecificInformation.show();
                reviewESignalUserName.text(marketDataFeedInformation.MarketDataFeedUserName);
                reviewESignalPassword.text(marketDataFeedInformation.MarketDataFeedPassword);
                reviewESignalProxyAddress.text(marketDataFeedInformation.MarketDataFeedProxyAddress);
                reviewESignalProxyPort.text(marketDataFeedInformation.MarketDataFeedProxyPort);
                reviewESignalProxyUserName.text(marketDataFeedInformation.MarketDataFeedProxyUserName);
                reviewESignalProxyPassword.text(marketDataFeedInformation.MarketDataFeedProxyPassword);
            }
        },
        reviewValuationService = function () {
            var valuationServiceAccountsTable, serviceAccounts;
            reviewValuationServiceAccounts.empty();
            serviceAccounts = localDataStore.getValuationServiceAccounts();
            valuationServiceAccountsTable = valuationServiceAccounts.createValuationServiceAccountsTable(serviceAccounts);
            reviewValuationServiceAccounts.append(valuationServiceAccountsTable);
            reviewValuationServiceAccounts.show();
        },
        reviewProducts = function (perisistedOptions, persistedFutures) {
            var options, futures, userOptions, userFutures, span;
            options = [];
            futures = [];
            reviewOptions.hide();
            reviewFutures.hide();
            reviewSelectedOptions.empty();
            reviewSelectedFutures.empty();
            userOptions = localDataStore.getWriteOnlyUserInfo().UserOptions;
            userOptions.forEach(function (userOption) {
                if (options.indexOf(userOption) === -1) {
                    options.push(userOption);
                }
            });
            perisistedOptions.forEach(function (persistedOption) {
                if (options.indexOf(persistedOption) === -1) {
                    options.push(persistedOption);
                }
            });
            if (options && options.length > 0) {
                options.sort();
                options.forEach(function (option) {
                    span = $('<span>').text(option);
                    if (perisistedOptions.indexOf(option) === -1) {
                        span.addClass('addedProduct');
                    }
                    if (userOptions.indexOf(option) === -1) {
                        span.addClass('deletedProduct');
                    }
                    reviewSelectedOptions.append(span);
                });
                reviewOptions.show();
            }
            userFutures = localDataStore.getWriteOnlyUserInfo().UserFutures;
            userFutures.forEach(function (userFuture) {
                if (futures.indexOf(userFuture) === -1) {
                    futures.push(userFuture);
                }
            });
            persistedFutures.forEach(function (persistedFuture) {
                if (futures.indexOf(persistedFuture) === -1) {
                    futures.push(persistedFuture);
                }
            });
            if (futures && futures.length > 0) {
                futures.sort();
                futures.forEach(function (future) {
                    span = $('<span>').text(future);
                    if (persistedFutures.indexOf(future) === -1) {
                        span.addClass('addedProduct');
                    }
                    if (userFutures.indexOf(future) === -1) {
                        span.addClass('deletedProduct');
                    }
                    reviewSelectedFutures.append(span);
                });
                reviewFutures.show();
            }
        },
        createCopyBasicSetupHeaderRow = function (securityType) {
            var row;
            row = htmlHelper.createRow('basicSetupReviewHeaderRow');
            htmlHelper.appendCell(row, securityType, 60);
            htmlHelper.appendCell(row, "User", 80);
            return row;
        },
        createCopyBasicSetupRow = function (basicSetup) {
            var row;
            row = htmlHelper.createRow('basicSetupRow');
            htmlHelper.appendCell(row, basicSetup.Key);
            htmlHelper.appendCell(row, basicSetup.Value, '', false, 'redLabel');
            return row;
        },
        createBasicSetupTable = function (basicSetups, securityType) {
            var table, tableClassName;
            tableClassName = securityType === 'Option' ? 'basicOptionSetupReviewTable basicSetupReviewTable' : 'basicFutureSetupReviewTable basicSetupReviewTable';
            table = htmlHelper.createTable(tableClassName);
            table.append(createCopyBasicSetupHeaderRow(securityType));
            basicSetups.forEach(function (basicSetup) {
                table.append(createCopyBasicSetupRow(basicSetup));
            });
            return table;
        },
        createScreenSheetsHeaderRow = function () {
            var row;
            row = htmlHelper.createRow('screenSheetsReviewHeaderRow');
            htmlHelper.appendCell(row, "Option", 60);
            htmlHelper.appendCell(row, "User", 80);
            htmlHelper.appendCell(row, "Sheet Name", 120);
            return row;
        },
        createScreenSheetRow = function (screenSheet) {
            var row;
            row = htmlHelper.createRow('screenSheetRow');
            htmlHelper.appendCell(row, screenSheet.CommodityCode, false, '', 'optionCell');
            htmlHelper.appendCell(row, screenSheet.CopyFromUser, '', false, 'userCell');
            htmlHelper.appendCell(row, screenSheet.SheetName, '', false, 'sheetNameCell');
            return row;
        },
        createScreenSheetsTable = function (options, optionScreenSheetDictionary) {
            var table, screenSheets, row, i;
            table = htmlHelper.createTable('copyScreenSheetsReviewTable');
            table.append(createScreenSheetsHeaderRow());
            options.forEach(function (option) {
                row = htmlHelper.createRow('screenSheetRow');
                screenSheets = optionScreenSheetDictionary[option];
                for (i = 0; i < screenSheets.length; i += 1) {
                    table.append(createScreenSheetRow(screenSheets[i]));
                }
            });
            return table;
        },
        createOptionScreenSheetDictionary = function () {
            var screenSheets, dictionary;
            dictionary = {};
            screenSheets = localDataStore.getCopyScreenSheets();
            screenSheets.forEach(function (screenSheet) {
                var option = screenSheet.CommodityCode;
                if (!dictionary.hasOwnProperty(option)) {
                    dictionary[option] = [];
                }
                dictionary[option].push(screenSheet);
            });
            return dictionary;
        },
        reviewCopySheets = function () {
            var table, optionScreenSheetDictionary, options, divider, length, optionsLeft, optionsCenter, optionsRight;
            reviewCopyScreenSheets.empty();
            optionScreenSheetDictionary = createOptionScreenSheetDictionary();
            options = common.getPropertiesArray(optionScreenSheetDictionary).sort();
            length = options.length;
            if (length === 0) {
                return;
            }
            divider = Math.floor(length / 3);
            optionsLeft = options.slice(0, divider);
            optionsCenter = options.slice(optionsLeft.length, optionsLeft.length + divider);
            optionsRight = options.slice(optionsLeft.length + optionsCenter.length);
            if (optionsLeft.length > 0) {
                table = createScreenSheetsTable(optionsLeft, optionScreenSheetDictionary);
                reviewCopyScreenSheets.append(table);
            }
            if (optionsCenter.length > 0) {
                table = createScreenSheetsTable(optionsCenter, optionScreenSheetDictionary);
                reviewCopyScreenSheets.append(table);
            }
            table = createScreenSheetsTable(optionsRight, optionScreenSheetDictionary);
            reviewCopyScreenSheets.append(table);
        },
        reviewCopyBasicSetups = function () {
            var optionSetups, futureSetups, userOptions, userfutures, indicesToRemove, i, commodityCode, setUpArrays;
            reviewCopyBasicFuturesSetups.empty();
            reviewCopyBasicOptionSetups.empty();
            optionSetups = localDataStore.getCopyBasicOptionSetups();
            userOptions = localDataStore.getWriteOnlyUserInfo().UserOptions;
            indicesToRemove = [];
            for (i = 0; i < optionSetups.length; i += 1) {
                commodityCode = optionSetups[i].Key;
                if (userOptions.indexOf(commodityCode) === -1) {
                    indicesToRemove.push(i);
                }
            }
            indicesToRemove.forEach(function (index) {
                optionSetups.splice(index, 1);
            });
            userfutures = localDataStore.getWriteOnlyUserInfo().UserFutures;
            futureSetups = localDataStore.getCopyBasicFutureSetups();

            indicesToRemove = [];
            for (i = 0; i < futureSetups.length; i += 1) {
                commodityCode = futureSetups[i].Key;
                if (userfutures.indexOf(commodityCode) === -1) {
                    indicesToRemove.push(i);
                }
            }
            indicesToRemove.forEach(function (index) {
                futureSetups.splice(index, 1);
            });
            optionSetups = common.sortArrayByStringProperty(optionSetups, 'Key');
            setUpArrays = arrayHelper.splitArray(optionSetups, 5);
            setUpArrays.forEach(function (setUpArray) {
                if (setUpArray.length > 0) {

                    reviewCopyBasicOptionSetups.append(createBasicSetupTable(setUpArray, 'Option'));
                }
            });
            futureSetups = common.sortArrayByStringProperty(futureSetups, 'Key');
            setUpArrays = arrayHelper.splitArray(futureSetups, 5);
            setUpArrays.forEach(function (setUpArray) {
                if (setUpArray.length > 0) {
                    reviewCopyBasicFuturesSetups.append(createBasicSetupTable(setUpArray, 'Future'));
                }
            });
        },
        renderReviewScreenSheetsToRename = function (allScreenSheets) {
            var screenSheetsToRename, screenSheetsScheduledForRenaming, username;
            screenSheetsToRename = localDataStore.getScreenSheetsToRename();
            reviewScreenSheetsToRename.empty();
            if (!screenSheetsToRename) {
                return;
            }
            screenSheetsScheduledForRenaming = [];
            username = localDataStore.getCurrentUsername();
            allScreenSheets = localDataStore.getCopyFromUserScreenSheets(username);
            screenSheetsToRename.forEach(function (screenSheetToRename) {
                var index, screenSheet;
                index = common.getIndexOfArrayItem(allScreenSheets, 'SheetID', screenSheetToRename.Key);
                if (index !== -1) {
                    screenSheet = allScreenSheets[index];
                    screenSheetsScheduledForRenaming.push({ commodityCode: screenSheet.CommodityCode, oldName: screenSheet.SheetName, newName: screenSheetToRename.Value });
                }
            });
            if (screenSheetsScheduledForRenaming.length > 0) {
                reviewScreenSheetsToRename.append(createScreenSheetsToRenameOrDeleteTable(screenSheetsScheduledForRenaming, function (s) { return s.commodityCode; }, function (s) { return s.oldName + ' ==> ' + s.newName; }));
            }
        },
        createScreenSheetsToRenameOrDeleteHeaderRow = function () {
            var row;
            row = htmlHelper.createRow('screenSheetsToRenameOrDeleteHeaderRow');
            htmlHelper.appendCell(row, 'Option');
            htmlHelper.appendCell(row, 'Sheet Name');
            return row;
        },
        createScreenSheetsToRenameOrDeleteRow = function (option, sheetName) {
            var row;
            row = htmlHelper.createRow('screenSheetsToRenameOrDeleteRow');
            htmlHelper.appendCell(row, option);
            htmlHelper.appendCell(row, sheetName);
            return row;
        },
        createScreenSheetsToRenameOrDeleteTable = function (screenSheets, getCommodityCode, getSheetName) {
            var table;
            table = htmlHelper.createTable('screenSheetsToRenameOrDeleteTable');
            table.append(createScreenSheetsToRenameOrDeleteHeaderRow());
            screenSheets.forEach(function (screenSheet) {
                table.append(createScreenSheetsToRenameOrDeleteRow(getCommodityCode(screenSheet), getSheetName(screenSheet)));
            });
            return table;
        },
        renderReviewScreenSheetsToDelete = function (allScreenSheets) {
            var screenSheetIDsToDelete, screenSheetsScheduledForDeletion, username;
            screenSheetIDsToDelete = localDataStore.getScreenSheetsToDelete();
            reviewScreenSheetsToDelete.empty();
            if (!screenSheetIDsToDelete) {
                return;
            }
            screenSheetsScheduledForDeletion = [];
            username = localDataStore.getCurrentUsername();
            allScreenSheets = localDataStore.getCopyFromUserScreenSheets(username);
            screenSheetIDsToDelete.forEach(function (screenSheetID) {
                var index;
                index = common.getIndexOfArrayItem(allScreenSheets, 'SheetID', screenSheetID);
                if (index !== -1) {
                    screenSheetsScheduledForDeletion.push(allScreenSheets[index]);
                }
            });
            if (screenSheetsScheduledForDeletion.length > 0) {
                reviewScreenSheetsToDelete.append(createScreenSheetsToRenameOrDeleteTable(screenSheetsScheduledForDeletion, function (s) { return s.CommodityCode; }, function (s) { return s.SheetName; }));
            }
        },
        reviewScreenSheetsScheduledForRenamingOrDeletion = function () {
            var callback = function () {
                var allScreenSheets = localDataStore.getCopyFromUserScreenSheets(localDataStore.getCurrentUsername());
                renderReviewScreenSheetsToDelete(allScreenSheets);
                renderReviewScreenSheetsToRename(allScreenSheets);
            };
            eventListener.fire("GetAppropriateScreenSheets", [callback]);
        },
        reviewBasicInformation = function () {
            var color, expirationDateError, cancellationReason, comment, licenseTypeID, licenseType, licenseExpiration;
            licenseTypeID = localDataStore.getLicenseTypeID();
            licenseType = localDataStore.getLicenseType();
            licenseExpiration = localDataStore.getLicenseExpiration();
            reviewLicense.text(licenseTypeID && Number(licenseTypeID) >= 0 ? licenseType : "No license selected!");
            reviewLicense.css('color', licenseTypeID ? 'black' : 'red');
            if (licenseTypeID === '0') {
                reviewExpirationDate.text("N/A");
                reviewExpirationDate.css('color', 'black');
                reviewLicense.text('None');
            } else {
                expirationDateError = !licenseExpiration ? "No expiration date selected!" : '';
                color = expirationDateError ? 'red' : 'black';
                reviewExpirationDate.css('color', color);
                reviewExpirationDate.text(expirationDateError || licenseExpiration);
            }
            cancellationReason = getCancellationReason();
            reviewCancellationReason.text(cancellationReason || "No cancellation reason selected!");
            color = cancellationReason ? 'black' : 'red';
            reviewCancellationReason.css('color', color);
            reviewComment.text('Cancellation');
            comment = localDataStore.getLicenseComment();
            comment = !comment || comment.trim().length === 0 ? "No comment" : comment.trim();
            reviewComment.text(comment);
        },
        hideValidations = function () {
            reviewValidations.hide();
            reviewValidations.empty();
            reviewValidationsContainer.empty();
        },

        doReviewProducts = function () {
            var currentUsername, getFuturesCallback, getOptionsCallback;
            currentUsername = localDataStore.getCurrentUsername;
            getFuturesCallback = function (futures) {
                getOptionsCallback = function (options) {
                    eventListener.fire("HideLoadingMessage");
                    reviewProducts(options, futures);
                };
                eventListener.fire("GetOptionsForUser", [currentUsername, getOptionsCallback]);
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("GetFuturesForUser", [currentUsername, getFuturesCallback]);
        },
        createReview = function () {
            var licenseTypeID;
            reviewCopyBasicOptionSetups.empty();
            reviewCopyBasicFuturesSetups.empty();
            hideValidations();
            licenseTypeID = localDataStore.getLicenseTypeID();
            if (!localDataStore.currentUserIsDefined()) {
                return;
            }
            reviewBasicInformation();
            if (licenseTypeID === '0' || !localDataStore.canModify(licenseTypeID)) {
                activeUserReview.hide();
                return;
            }
            activeUserReview.show();
            doReviewProducts();
            reviewMarketDataProvider();
            reviewCopyBasicSetups();
            reviewCopySheets();
            if (localDataStore.canUseValuationService(licenseTypeID)) {
                reviewValuationService();
                valuationServiceControls.show();
            } else {
                valuationServiceControls.hide();
            }
            reviewScreenSheetsScheduledForRenamingOrDeletion();
        },
        onIgnoredValidationsChanged = function () {
            if (validationControl.getValidations().length === 0) {
                localDataStore.ignoreWarnings();
                return;
            }
            localDataStore.unignoreWarnings();
        },
        showValidations = function (validations) {
            hideValidations();
            reviewValidations.append(validationControl.create(validations, null, eventListener));
            reviewValidationsContainer.append(reviewValidations);
            reviewValidations.slideDown("slow");
        },
        showBasicInformation = function () {
            eventListener.fire("ShowBasicInformation");
            eventListener.fire("HideAddValuationServiceAccounts");
        },
        chooseUserProducts = function () {
            eventListener.fire("Products");
        },
        showBasicSetups = function () {
            eventListener.fire("ShowBasicSetups");
        },
        showScreenSheets = function () {
            eventListener.fire("ShowScreenSheets");
        },
        updateOrSubmitUser = function () {
            var target, finishedCallback, callback, updateAction, userInfo;
            target = $(this);
            target.removeClass('pointerCursor');
            target.addClass('waitCursor');
            finishedCallback = function () {
                target.removeClass('waitCursor');
                target.addClass('pointerCursor');
                eventListener.fire("HideLoadingMessage");
            };
            callback = function (payload, message) {
                if (common.isArray(payload)) {
                    showValidations(payload);
                    finishedCallback();
                    return;
                }
                userInfo = payload;
                localDataStore.unignoreWarnings();
                localDataStore.setUserInfo(userInfo);
                if (userInfo.Name === "ICE00") {
                    eventListener.fire("RefreshICE00Products");
                }
                common.showToaster(target, message, null, 130, false, reviewToaster, 1500, finishedCallback, "bigToaster");
                eventListener.fire("UserUpdated");
                createReview();
            };
            updateAction = localDataStore.getLoggedInUserPermissions().canUpdateUser ? "UpdateUser" : 'SubmitUser';
            eventListener.fire(updateAction, [callback, localDataStore.shouldIgnoreWarnings()]);
        },
        disallowValidation = function () {
            updateUserButton.off('click');
            common.disableControls([updateUserButton]);
        },
        allowValidation = function () {
            updateUserButton.off('click');
            updateUserButton.on('click', updateOrSubmitUser);
            updateUserButton.text(localDataStore.getLoggedInUserPermissions().canUpdateUser ? "Save" : 'Submit');
            common.enableControl(updateUserButton);
        },
        assignEventHandlers = function () {
            changeBasicInformationButton.off('click');
            changeBasicInformationButton.on('click', showBasicInformation);
            changeProductsButton.off('click');
            changeProductsButton.on('click', chooseUserProducts);
            changeScreenSheetsToCopyButton.off('click');
            changeScreenSheetsToDeleteButton.off('click');
            changeScreenSheetsToRenameButton.off('click');
            changeCopyBasicSetupsButton.off('click');
            changeScreenSheetsToCopyButton.on('click', showScreenSheets);
            changeScreenSheetsToDeleteButton.on('click', showScreenSheets);
            changeScreenSheetsToRenameButton.on('click', showScreenSheets);
            changeCopyBasicSetupsButton.on('click', showBasicSetups);
            updateUserButton.off('click');
            updateUserButton.on('click', updateOrSubmitUser);
            updateUserButton.text(localDataStore.getLoggedInUserPermissions().canUpdateUser ? "Save" : 'Submit');
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("IgnoredValidationsChanged", onIgnoredValidationsChanged);
            eventListener.addListener("IgnoredValidationsChanged", onIgnoredValidationsChanged);
            eventListener.removeListener("Review", createReview);
            eventListener.addListener("Review", createReview);
            eventListener.removeListener("DisallowValidation", disallowValidation);
            eventListener.addListener("DisallowValidation", disallowValidation);
            eventListener.removeListener("AllowValidation", allowValidation);
            eventListener.addListener("AllowValidation", allowValidation);
        };
    return {
        initializeEventListener: initializeEventListener,
        assignEventHandlers: assignEventHandlers
    };
});