/*globals $, define */
define(['userManagement/localDataStore', 'common'], function (localDataStore, common) {
    "use strict";
    var eventListener,
        menu = $("#userManagementMenu"),
        menuItems = $("#userManagementMenu span"),
        basicInformationButton = $("#basicInformationButton"),
        productsButton = $("#productsButton"),
        permissonsButton = $("#permissonsButton"),
        basicSetupsButton = $("#basicSetupsButton"),
        screenSheetsButton = $("#screenSheetsButton"),
        reviewAndSaveButton = $("#reviewAndSaveButton"),
        basicInformation = $("#basicInformation"),
        revertToLiveButton = $("#revertToLiveButton"),
        confirmDialog = $("#confirmDialog"),
        userChangeLog = $("#userChangeLog"),
        products = $("#products"),
        permissions = $("#permissions"),
        basicSetups = $("#basicSetups"),
        screenSheets = $("#screenSheets"),
        reviewAndSave = $("#reviewAndSave"),
        togglePressedState = function () {
            var buttonClicked = $(this);
            menuItems.each(function () {
                if (buttonClicked.attr('id') === $(this).attr('id')) {
                    $(this).addClass('pressed');
                } else {
                    $(this).removeClass('pressed');
                }
            });
        },
        hideAll = function () {
            basicInformation.hide();
            products.hide();
            reviewAndSave.hide();
            permissions.hide();
            basicSetups.hide();
            screenSheets.hide();
            userChangeLog.hide();
        },
        showBasicInformation = function () {
            basicInformation.slideDown('slow');
            eventListener.fire("HideAddValuationServiceAccounts");
            products.hide();
            reviewAndSave.hide();
            permissions.hide();
            basicSetups.hide();
            screenSheets.hide();
            userChangeLog.hide();
        },
        showProducts = function () {
            eventListener.fire("ShowProducts", [true]);
            basicInformation.hide();
            products.slideDown('slow', function () { $('#productSearch').focus(); });
            reviewAndSave.hide();
            permissions.hide();
            basicSetups.hide();
            screenSheets.hide();
            userChangeLog.hide();
        },
        showPermissions = function () {
            eventListener.fire("ShowPermissions");
            basicInformation.hide();
            products.hide();
            reviewAndSave.hide();
            permissions.slideDown('slow');
            basicSetups.hide();
            screenSheets.hide();
            userChangeLog.hide();
        },
        showBasicSetups = function () {
            basicInformation.hide();
            products.hide();
            reviewAndSave.hide();
            permissions.hide();
            basicSetups.slideDown('slow');
            screenSheets.hide();
            userChangeLog.hide();
            eventListener.fire("ShowCopyBasicSetups");
        },
        showScreenSheets = function () {
            eventListener.fire("ShowCopyScreenSheets");
            basicInformation.hide();
            products.hide();
            reviewAndSave.hide();
            permissions.hide();
            basicSetups.hide();
            screenSheets.slideDown('slow');
            userChangeLog.hide();
        },
        showReviewAndSave = function () {
            eventListener.fire("Review");
            basicInformation.hide();
            products.hide();
            reviewAndSave.slideDown('slow');
            permissions.hide();
            basicSetups.hide();
            screenSheets.hide();
            userChangeLog.hide();
        },
        showOrHide = function (username) {
            if (username) {
                menu.show();
                return;
            }
            menu.hide();
        },
        doShowScreenSheets = function () {
            screenSheetsButton.trigger('click');
        },
        doShowBasicSetups = function () {
            basicSetupsButton.trigger('click');
        },
        doShowBasicInformation = function () {
            basicInformationButton.trigger('click');
        },
        doShowProducts = function () {
            productsButton.trigger('click');
        },
        revertToLive = function () {
            var position, proceed;
            position = $(this).position();
            proceed = function () {
                eventListener.fire("RevertToLive");
            };
            common.confirmDialog(confirmDialog, "This action will revert all sandbox changes made to this user to the data stored in the live system.<p>Are you sure you want to proceed?", "Revert", position.top, position.left, proceed);
        },
        configure = function (licenseTypeID) {
            revertToLiveButton.off('click');
            revertToLiveButton.on('click', revertToLive);
            menuItems.off('click');
            menuItems.on('click', function () {
                $(".commentsContainer").hide();
                $(".toaster").hide();
                $(".bigToaster").hide();
            });
            basicInformationButton.on('click', togglePressedState);
            basicInformationButton.on('click', showBasicInformation);
            reviewAndSaveButton.on('click', togglePressedState);
            reviewAndSaveButton.on('click', showReviewAndSave);
            if (!localDataStore.canModify(licenseTypeID)) {
                common.disableControls([productsButton, permissonsButton, basicSetupsButton, screenSheetsButton]);
                return;
            }
            productsButton.on('click', togglePressedState);
            productsButton.on('click', showProducts);
            permissonsButton.on('click', togglePressedState);
            permissonsButton.on('click', showPermissions);
            screenSheetsButton.on('click', togglePressedState);
            screenSheetsButton.on('click', showScreenSheets);
            common.enableControls([productsButton, permissonsButton, screenSheetsButton]);
            if (!localDataStore.canModifyBasicSetups(licenseTypeID)) {
                common.disableControls([basicSetupsButton]);
                return;
            }
            basicSetupsButton.on('click', togglePressedState);
            basicSetupsButton.on('click', showBasicSetups);
            common.enableControls([basicSetupsButton]);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("ConfigureForLicense", configure);
            eventListener.addListener("ConfigureForLicense", configure);
            eventListener.removeListener("ShowOrHideMenu", showOrHide);
            eventListener.addListener("ShowOrHideMenu", showOrHide);
            eventListener.removeListener("HideAll", hideAll);
            eventListener.addListener("HideAll", hideAll);
            eventListener.removeListener("ShowBasicInformation", doShowBasicInformation);
            eventListener.addListener("ShowBasicInformation", doShowBasicInformation);
            eventListener.removeListener("Products", doShowProducts);
            eventListener.addListener("Products", doShowProducts);
            eventListener.removeListener("ShowBasicSetups", doShowBasicSetups);
            eventListener.addListener("ShowBasicSetups", doShowBasicSetups);
            eventListener.removeListener("ShowScreenSheets", doShowScreenSheets);
            eventListener.addListener("ShowScreenSheets", doShowScreenSheets);
        };
    return {
        initializeEventListener: initializeEventListener
    };
});
