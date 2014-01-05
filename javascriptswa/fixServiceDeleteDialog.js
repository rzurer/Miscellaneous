/*globals $, console, alert, define */
"use strict";
define(['common', 'fixServiceDataAccess'], function (common, dataAccess) {
    var getSelectedService, getNumberOfConfigurations, successCallback, uiControls,
        createDeleteWarning = function () {
            var configurationCount = getNumberOfConfigurations(),
                deleteFixServicePart = '<div>This action will delete the FIX Service instance</div><div class="importantName">' + getSelectedService() + '</div>',
                areYouSurePart = '<div class="seriousWarning">This action is irreversible!!<br/>Are you sure you want to proceed?</div>';
            if (configurationCount === 0) {
                return deleteFixServicePart + areYouSurePart;
            }
            if (configurationCount === 1) {
                return deleteFixServicePart + '<div>along with the associated configuration.</div>' +  areYouSurePart;
            }
            return deleteFixServicePart + '<div>along with <b>' + configurationCount + '</b> associated configurations.</div>' + areYouSurePart;
        },
        deleteServiceCallback = function (response) {
            var target = uiControls.deleteFixServiceImage;
            if (response.Success) {
                common.showToaster(target, response.Message, 0, 30, false);
                dataAccess.getServices(successCallback);
                uiControls.deleteEditImage.toggle(false);
                return;
            }
            common.showToaster(target, response.Message, 0, 30, true, null, 1500);
        },
        doDeleteService = function (evt) {
            var proceed, pos;
            pos = common.getMouseCoordinates(evt);
            proceed = function () {
                dataAccess.deleteService(getSelectedService(), deleteServiceCallback);
            };
            common.confirmDialog(uiControls.confirmDialog, createDeleteWarning(), "Delete FIX Service Instance", pos.Y, pos.X, proceed);
        };
    return {
        deleteService: function (getServiceID, getConfigurationCount, onDeleteSuccess, controls) {
            uiControls = controls;
            getSelectedService = getServiceID;
            getNumberOfConfigurations = getConfigurationCount;
            successCallback = onDeleteSuccess;
            return doDeleteService;
        }
    };
});