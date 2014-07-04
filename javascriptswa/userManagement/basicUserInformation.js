/*globals console, $, define*/
define(['userManagement/localDataStore', 'userManagement/comments', 'htmlHelper', 'common'], function (localDataStore, comments, htmlHelper, common) {
    "use strict";
    var eventListener,
        salesForceBaseUrl = 'https://na5.salesforce.com/',
        gracePeriodLabel = $('#gracePeriodLabel'),
        licenseExpirationDate = $('#licenseExpirationDate'),
        licenseTypesSelect = $('#licenseTypesSelect'),
        cancellationReasonsSelect = $('#cancellationReasonsSelect'),
        commentEntry = $("#commentEntry"),
        salesForceLink = $('#salesForceLink'),
        commentsImage = $("#commentsImage"),
        firstName = $("#firstName"),
        lastName = $("#lastName"),
        email = $("#email"),
        workPhone = $("#workPhone"),
        mobilePhone = $("#mobilePhone"),
        firstNameContainer = $("#firstNameContainer"),
        lastNameContainer = $("#lastNameContainer"),
        salesForceLinkContainer = $("#salesForceLinkContainer"),
        emailContainer = $("#emailContainer"),
        workPhoneContainer = $("#workPhoneContainer"),
        mobilePhoneContainer = $("#mobilePhoneContainer"),
        licenseInformation = $("#licenseInformation"),
        cancellationInformation = $('#cancellationInformation'),
        activeUserContainer = $('#activeUserContainer'),
        fillLicenseTypesSelect = function (licenseTypes) {
            htmlHelper.fillSelectFromKeyValuePairs(licenseTypesSelect, "Choose a license type", licenseTypes);
            common.disableControl(licenseExpirationDate);
        },
        populateLicenseTypes = function (response) {
            localDataStore.setLicenseMap(response, fillLicenseTypesSelect);
        },
        fillCancellationReasonsSelect = function (cancellationReasons) {
            htmlHelper.fillSelectFromKeyValuePairs(cancellationReasonsSelect, "Choose a license type", cancellationReasons);
        },
        populateCancellationReasons = function (response) {
            localDataStore.setCancellationReasons(response, fillCancellationReasonsSelect);
        },
        initializeLicenseTypeID = function () {
            var licenseTypeID;
            licenseTypeID = localDataStore.getLicenseTypeID();
            licenseTypesSelect.val(licenseTypeID);
            if (licenseTypeID === '0') {
                licenseTypesSelect.val(licenseTypeID);
                return;
            }
            if (!licenseTypeID) {
                licenseTypesSelect.val('');
                licenseInformation.hide();
            }

        },
        initializeLicenseType = function () {
            var licenseType, propertyValuePairs, updateFunction, persistCallback;
            persistCallback = function () {
                eventListener.fire("DisallowValidation");
                initializeValuationServiceAccounts(function () {
                    initializeMarketDataProvider(function () {
                        initializeExpirationDate(function () {
                            eventListener.fire("AllowValidation");
                        });
                    });
                });
            };
            licenseType = htmlHelper.getSelectedOptionText(licenseTypesSelect);
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'LicenseType', value: licenseType}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, persistCallback, 'initializeLicenseType']);
        },
        setExpirationDate = function (callback) {
            var propertyValuePairs, expirationDate, updateFunction;
            expirationDate = licenseExpirationDate.val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'LicenseExpiration', value: expirationDate}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                common.safeCallback(callback);
                return userInfo;
            };
            if (expirationDate !== null) {
                eventListener.fire("Persist", [updateFunction, callback, 'setExpirationDate']);
            }
            common.safeCallback(callback);
        },
        enableExpirationDatePicker = function (maxDate) {
            licenseExpirationDate.datepicker("destroy");
            common.enableControl(licenseExpirationDate);
            licenseExpirationDate.datepicker({
                changeYear: true,
                dateFormat: "mm/dd/yy",
                minDate: 0,
                maxDate: maxDate,
                onClose: function (dateText, inst) {
                    $(inst.input).val(dateText);
                    setExpirationDate();
                }
            });
        },
        disableExpirationDatePicker = function () {
            licenseExpirationDate.val('');
            licenseExpirationDate.datepicker("destroy");
            licenseExpirationDate.val('N/A');
            common.disableControl(licenseExpirationDate);
        },
        initializeExpirationDatePicker = function () {
            var licenseTypeID, maxDate;
            licenseTypeID = localDataStore.getLicenseTypeID();
            if (!licenseTypeID || licenseTypeID === '0') {
                disableExpirationDatePicker(licenseTypeID);
            } else {
                maxDate = localDataStore.getMaximumExpirationDays(licenseTypeID);
                enableExpirationDatePicker(maxDate);
            }
        },
        initializeExpirationDate = function (callback) {
            var licenseExpiration;
            licenseExpiration = localDataStore.getLicenseExpiration();
            licenseExpirationDate.val(licenseExpiration);
            setExpirationDate(callback);
        },
        initializeGracePeriod = function () {
            var licenseTypeID;
            licenseTypeID = localDataStore.getLicenseTypeID();
            gracePeriodLabel.text(localDataStore.getGracePeriod(licenseTypeID));
        },
        initializeUserSalesforceLink = function () {
            var saleForceAssetId = localDataStore.getSalesForceAssetID();
            if (!saleForceAssetId) {
                salesForceLinkContainer.hide();
                salesForceLink.attr('href', '#');
                return;
            }
            salesForceLink.attr('href', salesForceBaseUrl + saleForceAssetId);
            salesForceLinkContainer.show();
        },
        initializeFirstName = function () {
            var userFirstName = localDataStore.getUserFirstName();
            if (!userFirstName) {
                firstName.text('');
                firstNameContainer.hide();
                return;
            }
            firstName.text(userFirstName);
            firstNameContainer.show();
        },
        initializeLastName = function () {
            var userLastName = localDataStore.getUserLastName();
            if (!userLastName) {
                lastName.text('');
                lastNameContainer.hide();
                return;
            }
            lastName.text(userLastName);
            lastNameContainer.show();
        },
        initializeEmail = function () {
            var userEmail = localDataStore.getUserEmail();
            if (!userEmail) {
                email.text('');
                emailContainer.hide();
                return;
            }
            email.text(userEmail);
            emailContainer.show();
        },
        initializeWorkPhone = function () {
            var userWorkPhone = localDataStore.getUserWorkPhone();
            if (!userWorkPhone) {
                workPhone.text('');
                workPhoneContainer.hide();
                return;
            }
            workPhone.text(userWorkPhone);
            workPhoneContainer.show();
        },
        initializeMobilePhone = function () {
            var userMobilePhone = localDataStore.getUserMobilePhone();
            if (!userMobilePhone) {
                mobilePhone.text('');
                mobilePhoneContainer.hide();
                return;
            }
            mobilePhone.text(userMobilePhone);
            mobilePhoneContainer.show();
        },
        initializeCancellationReason = function () {
            var licenseTypeID, cancellationReasonID;
            licenseTypeID = localDataStore.getLicenseTypeID();
            cancellationReasonsSelect.val('');
            if (licenseTypeID === "0") {
                cancellationInformation.show();
                cancellationReasonID = localDataStore.getCancellationReasonID();
                cancellationReasonsSelect.val(cancellationReasonID);
                return;
            }
            cancellationReasonsSelect.val('');
            cancellationInformation.hide();
        },
        initializeCommentsImage = function () {
            if (!localDataStore.currentUserIsDefined()) {
                commentsImage.hide();
                return;
            }
            commentsImage.show();
            commentEntry.val(localDataStore.getLicenseComment());
        },
        initializeValuationServiceAccounts = function (callback) {
            var licenseTypeID;
            licenseTypeID = localDataStore.getLicenseTypeID();
            eventListener.fire("RefreshValuationAccounts", [licenseTypeID, callback]);
        },
        initializeMarketDataProvider = function (callback) {
            var licenseTypeID;
            licenseTypeID = localDataStore.getLicenseTypeID();
            eventListener.fire("RefreshMarketDataFeedProviders", [licenseTypeID, callback]);
        },
        showOrHideActiveUserControls = function () {
            var licenseTypeID = localDataStore.getLicenseTypeID();
            if (localDataStore.canModify(licenseTypeID)) {
                activeUserContainer.show();
            } else {
                activeUserContainer.hide();
            }
        },
        initializeControls = function (callback) {
            initializeLicenseTypeID();
            initializeExpirationDatePicker();
            initializeGracePeriod();
            initializeUserSalesforceLink();
            initializeFirstName();
            initializeLastName();
            initializeEmail();
            initializeWorkPhone();
            initializeMobilePhone();
            initializeCancellationReason();
            initializeCommentsImage();
            initializeLicenseType();
            showOrHideActiveUserControls();
            common.safeCallback(callback);
        },
        changeLicenseType = function () {
            var updateFunction, licenseTypeID, licenseType, propertyValuePairs;
            licenseTypeID = $(this).val();
            eventListener.fire("ConfigureForLicense", [licenseTypeID]);
            if (!licenseTypeID) {
                propertyValuePairs = [{ property: 'LicenseType', value: '' }, { property: 'LicenseTypeID', value: ''}];
                localDataStore.updateUserInfo(propertyValuePairs);
                initializeControls();
                return;
            }
            updateFunction = function (userInfo) {
                licenseType = htmlHelper.getSelectedOptionText($(this));
                propertyValuePairs = [{ property: 'LicenseType', value: licenseType }, { property: 'LicenseTypeID', value: licenseTypeID }, { property: 'LicenseExpiration', value: licenseType}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                eventListener.fire("AdjustCopyScreenSheets");
                return userInfo;
            };
            licenseExpirationDate.val('');
            eventListener.fire("Persist", [updateFunction, initializeControls, 'changeLicenseType']);
        },
        changeCancellationReason = function () {
            var updateFunction, cancellationReasonID, propertyValuePairs;
            cancellationReasonID = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'CancellationReasonID', value: cancellationReasonID}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'changeCancellationReason']);
        },
        displayComments = function (event) {
            var top, left;
            $('.commentsContainer').remove();
            if (!comments) {
                return;
            }
            top = event.pageY;
            left = event.pageX;
            comments.createAndDisplayCommentsContainer(top, left, localDataStore.getUserComments());
        },
        setComment = function () {
            var propertyValuePairs, licenseComment, updateFunction;
            licenseComment = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'LicenseComment', value: licenseComment}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setComment']);
        },
        assignEventHandlers = function () {
            licenseTypesSelect.off('change', changeLicenseType);
            licenseTypesSelect.on("keydown", function () { return false; });
            licenseTypesSelect.on('change', changeLicenseType);
            licenseExpirationDate.off('blur', setExpirationDate);
            licenseExpirationDate.attr("readonly", "readonly");
            licenseExpirationDate.on('blur', setExpirationDate);
            cancellationReasonsSelect.off('change', changeCancellationReason);
            cancellationReasonsSelect.on('change', changeCancellationReason);
            commentsImage.off('click', displayComments);
            commentsImage.on('click', displayComments);
            commentEntry.off('blur', setComment);
            commentEntry.on('blur', setComment);
        },
        userUpdated = function () {
            commentEntry.val(localDataStore.getLicenseComment());
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener('ShowOrHideActiveUserControls', showOrHideActiveUserControls);
            eventListener.addListener('ShowOrHideActiveUserControls', showOrHideActiveUserControls);
            eventListener.removeListener('UserUpdated', userUpdated);
            eventListener.addListener('UserUpdated', userUpdated);
        };
    return {
        initializeEventListener: initializeEventListener,
        assignEventHandlers: assignEventHandlers,
        initializeControls: initializeControls,
        populateLicenseTypes: populateLicenseTypes,
        populateCancellationReasons: populateCancellationReasons,
        fillLicenseTypesSelect: fillLicenseTypesSelect,
        fillCancellationReasonsSelect: fillCancellationReasonsSelect
    };
});