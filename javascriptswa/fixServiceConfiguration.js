/*globals $, console, alert, define */
"use strict";
define(['common', 'fixServiceDataAccess', 'fixServiceDeleteDialog', 'htmlHelper'], function (common, dataAccess, deleteDialog, htmlHelper) {
    var result,
        selectedService = function () {
            return $('#fixServiceSelect').val();
        },
        configurationCount = function () {
            return $('#fixServiceConfigurationTable tr').length - 1;
        },
        getConfigurationHeader = function () {
            return $('#fixServiceConfigurationTable tr.configurationHeader');
        },
        selectedServiceDescription = function () {
            return $('#fixServiceSelect').attr('title');
        },
        deleteServiceDialogControls = {
            deleteFixServiceImage: $('#deleteFixServiceImage'),
            deleteEditImage: $('.deleteEditImage'),
            confirmDialog: $("#confirmDialog")
        },
        createTextInput = function (className, maxlength, text, placeholder) {
            if (className === 'ipAddress') {
                return htmlHelper.createIPAddressInput(null, text, maxlength, className, placeholder);
            }
            if (className === 'port') {
                return htmlHelper.createNumericInput(null, text, maxlength, className, placeholder);
            }
            return htmlHelper.createTextInput(null, text, maxlength, className, placeholder);
        },
        createLabel = function (text) {
            return htmlHelper.createLabel(text, 'readonly');
        },
        addTextEntryCell = function (row, text, width, className, maxlength, placeholder) {
            var textInput = createTextInput(className, maxlength, text, placeholder),
                label = createLabel(text, className);
            htmlHelper.appendReadWriteCell(row, width, textInput, width - 3, label);
        },
        addCheckboxEntryCell = function (row, text, width, className) {
            var checkbox = htmlHelper.createCheckboxInput(text, className + ' writable'),
                readOnlyCheckbox = htmlHelper.createCheckboxInput(text, "readonly", true);
            htmlHelper.appendReadWriteCell(row, width, checkbox, null, readOnlyCheckbox);
        },
        composeFIXServiceConfiguration = function (serviceID, senderCompID, senderSubID, username, password, description, ipAddress, port, isActive) {
            return {
                ServiceID: serviceID,
                SenderCompID: senderCompID,
                SenderSubID: senderSubID,
                Username: username,
                Password: password,
                Description: description,
                IPAddress: ipAddress,
                Port: Number(port),
                IsActive: isActive
            };
        },
        createNewFIXServiceConfiguration = function (row) {
            var serviceID = selectedService(),
                senderCompID = row.find('td > input.senderCompID').val(),
                senderSubID = row.find('td > input.senderSubID').val(),
                username = row.find('td > input.username').val(),
                password = row.find('td > input.password').val(),
                description = row.find('td > input.description').val(),
                ipAddress = row.find('td > input.ipAddress').val(),
                port = row.find('td > input.port').val(),
                isActive = row.find('td > input.isActive').is(':checked');
            return composeFIXServiceConfiguration(serviceID, senderCompID, senderSubID, username, password, description, ipAddress, port, isActive);
        },
        createFIXServiceConfiguration = function (row) {
            var serviceID = selectedService(),
                senderCompID = row.find('td.senderCompID').text(),
                senderSubID = row.find('td.senderSubID').text(),
                username = row.find('td > input.username').val(),
                password = row.find('td > input.password').val(),
                description = row.find('td > input.description').val(),
                ipAddress = row.find('td > input.ipAddress').val(),
                port = row.find('td > input.port').val(),
                isActive = row.find('td > input.isActive').is(':checked');
            return composeFIXServiceConfiguration(serviceID, senderCompID, senderSubID, username, password, description, ipAddress, port, isActive);
        },
        cancelAddConfigurationUpdate = function () {
            getConfigurationHeader().next("tr:first").remove();
        },
        createCancelAddConfigurationImage = function () {
            var cancelImage = $('#cancelAddFixServiceButton').clone();
            cancelImage.show();
            cancelImage.removeAttr('id');
            cancelImage.attr('title', 'cancel');
            cancelImage.click(cancelAddConfigurationUpdate);
            return cancelImage;
        },
        createSaveAddedConfigurationImage = function (row) {
            var saveImage = $('#addFixServiceButton').clone();
            saveImage.removeAttr('id');
            saveImage.show();
            saveImage.addClass('saveNewConfiguration');
            saveImage.attr('title', 'save congfiguration');
            saveImage.click(saveNewConfiguration(row));
            return saveImage;
        },
        addNewActionsCell = function (row, width) {
            var cell = htmlHelper.createCell(width);
            cell.append(createSaveAddedConfigurationImage(row));
            cell.append(createCancelAddConfigurationImage());
            row.append(cell);
        },
        createNewConfigurationRow = function () {
            var row = htmlHelper.createRow("first");
            addTextEntryCell(row, selectedService(), 0, false, "serviceID nonEditableCell");
            addTextEntryCell(row, null, 130, "senderCompID", 128, "senderCompID");
            addTextEntryCell(row, null, 130, "senderSubID", 128, "senderSubID");
            addTextEntryCell(row, null, 130, "username", 128, "username");
            addTextEntryCell(row, null, 130, "password", 128, "password");
            addTextEntryCell(row, null, 130, "description", 128, "description");
            addTextEntryCell(row, null, 110, "ipAddress", 15, "ipAddress");
            addTextEntryCell(row, null, 60, "port", 9, "port");
            addCheckboxEntryCell(row, 'true', 50, "isActive", 5);
            addNewActionsCell(row, 100);
            return row;
        },
        prepareToEditConfiguration = function (row) {
            cancelConfigurationUpdate();
            row.find('input[type="text"]').show();
            row.find('input[type="checkbox"].writable').show();
            row.find('input[type="checkbox"].readonly').hide();
            row.find("label").hide();
            common.enableControlAndSetClick(row.find('img.saveConfiguration'), saveConfiguration(row));
            common.enableControlAndSetClick(row.find('img.cancelSaveConfiguration'), cancelConfigurationUpdate);
            common.enableControlAndSetClick(row.find('img.deleteConfiguration'), deleteConfiguration(row));
        },
        editAddedConfiguration = function (row) {
            prepareToEditConfiguration(row);
            common.focusAndSelect(row.find('td > input.senderCompID'));
        },
        addConfiguration = function () {
            var row = createNewConfigurationRow();
            getConfigurationHeader().after(row);
            editAddedConfiguration(row);
        },
        createSaveDeleteConfigurationCallback = function (target) {
            return function (response) {
                common.showToaster(target, response.Message, 0, 30, false, null, 1000);
                selectFixService();
            };
        },
        deleteConfiguration = function (row) {
            return function () {
                var configuration, target, position, proceed;
                target = row.find('img.deleteConfiguration');
                position = target.position();
                configuration = createFIXServiceConfiguration(row);
                proceed = function () {
                    dataAccess.deleteFIXServiceConfiguration(configuration.ServiceID, configuration.SenderCompID, configuration.SenderSubID,
                        createSaveDeleteConfigurationCallback(target));
                };
                common.confirmDialog($("#confirmDialog"),
                    "<p/><p/><p>Are you sure you want to delete this configuration?",
                    "Delete FIX Service Configuration</p>", position.top, position.left, proceed);
            };
        },
        addErrorMessageToErrors = function (array, source, error) {
            var errorMessage = !source || source.trim().length === 0 ? error : '';
            if (errorMessage.length > 0) {
                array.push(errorMessage);
            }
        },
        getFIXServiceConfigurationValidationErrors = function (configuration) {
            var errorMessage = '',
                errorMessages = [];
            addErrorMessageToErrors(errorMessages, configuration.ServiceID, "ServiceID is required.");
            addErrorMessageToErrors(errorMessages, configuration.SenderCompID, "SenderCompID is required.");
            addErrorMessageToErrors(errorMessages, configuration.SenderSubID, "SenderSubID is required.");
            addErrorMessageToErrors(errorMessages, configuration.Username, "Username is required.");
            addErrorMessageToErrors(errorMessages, configuration.Password, "Password is required.");
            addErrorMessageToErrors(errorMessages, configuration.Description, "Description is required.");
            addErrorMessageToErrors(errorMessages, configuration.IPAddress, "IPAddress is required.");
            addErrorMessageToErrors(errorMessages, configuration.ServiceID, "ServiceID is required.");
            if (configuration.Port <= 0) {
                errorMessages.push("Port must be greater than zero.");
            }
            errorMessages.forEach(function (error) {
                errorMessage += error + ' ';
            });
            return errorMessage;
        },
        doSaveConfiguration = function (fixServiceConfiguration, target) {
            var errorMessage = getFIXServiceConfigurationValidationErrors(fixServiceConfiguration);
            if (errorMessage.length > 0) {
                common.showToaster(target, errorMessage, 0, 30, true, null, 2000);
                return;
            }
            dataAccess.updateFIXServiceConfiguration(fixServiceConfiguration, createSaveDeleteConfigurationCallback(target));
        },
        saveNewConfiguration = function (row) {
            return function () {
                var target = row.find('img.saveNewConfiguration');
                doSaveConfiguration(createNewFIXServiceConfiguration(row), target);
            };
        },
        saveConfiguration = function (row) {
            return function () {
                var target = row.find('img.saveConfiguration');
                doSaveConfiguration(createFIXServiceConfiguration(row), target);
            };
        },
        cancelConfigurationUpdate = function () {
            var table = $('#fixServiceConfigurationTable'),
                textInputs = table.find('input[type="text"]'),
                writableCheckboxInputs = table.find('input[type="checkbox"].writable'),
                readOnlyCheckboxInputs = table.find('input[type="checkbox"].readonly');
            textInputs.each(function () {
                $(this).val($(this).next('label').text());
            });
            textInputs.hide();
            writableCheckboxInputs.each(function () {
                var readonlyCheckbox = $(this).next('input[type="checkbox"].readonly');
                if (readonlyCheckbox.is(":checked")) {
                    $(this).attr("checked", "checked");
                } else {
                    $(this).removeAttr("checked");
                }
            });
            writableCheckboxInputs.hide();
            table.find('label').show();
            readOnlyCheckboxInputs.show();
            table.find('img.cancelSaveConfiguration').each(function () {
                common.disableControls([$(this)]);
            });
            table.find('img.saveConfiguration').each(function () {
                common.disableControls([$(this)]);
            });
        },
        editConfiguration = function (row) {
            prepareToEditConfiguration(row);
            common.focusAndSelect(row.find('td > input.username'));
        },
        createCancelSaveConfigurationImage = function () {
            var cancelImage = $('#cancelAddFixServiceButton').clone();
            cancelImage.show();
            cancelImage.removeAttr('id');
            cancelImage.attr('title', 'cancel');
            cancelImage.addClass('cancelSaveConfiguration');
            cancelImage.click(cancelConfigurationUpdate);
            common.disableControls([cancelImage]);
            return cancelImage;
        },
        createSaveConfigurationImage = function (row) {
            var saveImage = $('#addFixServiceButton').clone();
            saveImage.removeAttr('id');
            saveImage.show();
            saveImage.attr('title', 'save congfiguration');
            saveImage.addClass('saveConfiguration');
            saveImage.click(saveConfiguration(row));
            common.disableControls([saveImage]);
            return saveImage;
        },
        createEditConfigurationImage = function (row) {
            var editImage = $('#editConfigurationImage').clone();
            editImage.removeAttr('id');
            editImage.show();
            editImage.attr('title', 'edit congfiguration');
            editImage.click(function () {
                editConfiguration(row, 'td > input.senderCompId');
            });
            return editImage;
        },
        createDeleteConfigurationImage = function (row) {
            var deleteImage = $('#deleteFixServiceImage').clone();
            deleteImage.removeClass('deleteEditImage');
            deleteImage.addClass('deleteConfiguration');
            deleteImage.removeAttr('id');
            deleteImage.show();
            deleteImage.attr('title', 'delete congfiguration');
            deleteImage.click(deleteConfiguration(row));
            return deleteImage;
        },
        createAddConfigurationImage = function () {
            var addImage = $('#addFixServiceImage').clone();
            addImage.removeAttr('id');
            addImage.show();
            addImage.attr('title', 'add configuration');
            addImage.addClass('addConfiguration');
            addImage.click(addConfiguration);
            return addImage;
        },
        addActionsCell = function (row, width) {
            var cell = htmlHelper.createCell(width);
            cell.append(createEditConfigurationImage(row));
            cell.append(createSaveConfigurationImage(row));
            cell.append(createCancelSaveConfigurationImage());
            cell.append(createDeleteConfigurationImage(row));
            row.append(cell);
        },
        activeFilter = "all",
        getActiveFilter = function () {
            return activeFilter;
        },
        setActiveFilter = function (value) {
            activeFilter = value;
        },
        getFilterCondition = function (checkbox) {
            if (activeFilter === "active") {
                return checkbox.attr('checked') === 'checked';
            }
            if (activeFilter === "inactive") {
                return !checkbox.attr('checked');
            }
            return true;
        },
        filterConfigurations = function () {
            $('#fixServiceConfigurationTable tr').each(function () {
                var checkbox, row;
                row = $(this);
                if (!row.hasClass('configurationHeader')) {
                    checkbox = row.find('input[type="checkbox"].isActive');
                    row.toggle(getFilterCondition(checkbox));
                }
            });
        },
        createFixServiceConfigurationHeader = function () {
            var cell, header, checkbox;
            header = htmlHelper.createRow("configurationHeader");
            htmlHelper.appendCell(header, "ServiceID", 0, true);
            htmlHelper.appendCell(header, "SenderCompID", 130, true);
            htmlHelper.appendCell(header, "SenderSubID", 130, true);
            htmlHelper.appendCell(header, "Username", 130, true);
            htmlHelper.appendCell(header, "Password", 130, true);
            htmlHelper.appendCell(header, "Description", 130, true);
            htmlHelper.appendCell(header, "IPAddress", 110, true);
            htmlHelper.appendCell(header, "Port", 60, true);
            cell = htmlHelper.appendCell(header, null, 50, true);
            cell.attr('title', 'filter by active status');

            checkbox = htmlHelper.createTristateCheckbox(getActiveFilter, setActiveFilter, filterConfigurations, "activeConfigurationFilter");
            cell.append(checkbox);

            cell = htmlHelper.appendCell(header, null, 100, true);
            cell.append(createAddConfigurationImage());
            return header;
        },
        createConfigurationRow = function (configuration, className) {
            var row = htmlHelper.createRow(className);
            htmlHelper.appendCell(row, configuration.ServiceID, 0, false, "serviceID nonEditableCell");
            htmlHelper.appendCell(row, configuration.SenderCompID, 130, false, "senderCompID nonEditableCell");
            htmlHelper.appendCell(row, configuration.SenderSubID, 130, false, "senderSubID nonEditableCell");
            addTextEntryCell(row, configuration.Username, 130, "username", 128);
            addTextEntryCell(row, configuration.Password, 130, "password", 128);
            addTextEntryCell(row, configuration.Description, 130, "description", 128);
            addTextEntryCell(row, configuration.IPAddress, 110, "ipAddress", 15);
            addTextEntryCell(row, configuration.Port, 60, "port", 9);
            addCheckboxEntryCell(row, configuration.IsActive, 50, "isActive", 5);
            addActionsCell(row, 100);
            return row;
        },
        populateFixServiceConfigurationTable = function (fixServiceConfigurations) {
            var table = $('#fixServiceConfigurationTable');
            table.empty();
            fixServiceConfigurations.forEach(function (configuration, index) {
                var className = index === 0 ? 'first' : null;
                table.append(createConfigurationRow(configuration, className));
            });
            table.prepend(createFixServiceConfigurationHeader());
            filterConfigurations();
        },
        coordinateControls = function (serviceID) {
            var fixServicesSelect = $('#fixServiceSelect'),
                deleteFixServiceImage = $('#deleteFixServiceImage'),
                editFixServiceImage = $('#editFixServiceImage'),
                addFixServiceButton = $('#addFixServiceButton'),
                editFixServiceDescriptionButton = $('#editFixServiceDescriptionButton'),
                cancelAddFixServiceButton = $('#cancelAddFixServiceButton'),
                title = $("select option:selected").attr('title');
            fixServicesSelect.attr('title', title);
            deleteFixServiceImage.attr('title', 'Delete ' + serviceID);
            editFixServiceImage.attr('title', 'Change ' + serviceID + ' description');
            addFixServiceButton.attr('title', 'Add');
            editFixServiceDescriptionButton.attr('title', 'Change');
            cancelAddFixServiceButton.attr('title', 'Cancel');
            $('.deleteEditImage').toggle(serviceID.length > 0);
        },
        selectFixService = function () {
            var serviceID, callback;
            serviceID = selectedService();
            callback = function (response) {
                coordinateControls(serviceID);
                populateFixServiceConfigurationTable(response.Payload);
            };
            dataAccess.getFIXServiceConfigurations(serviceID, callback);
        },
        hideAddFixServiceControls = function () {
            toggleFixServiceControls(true);
            $('#addEditFixService').hide();
        },
        addServiceCallback = function (response) {
            var target = $('#addFixServiceImage');
            if (response.Success) {
                common.showToaster(target, response.Message, 0, 30, false);
                dataAccess.getServices(result.displayServices);
                hideAddFixServiceControls();
                $('.deleteEditImage').toggle(false);
                return;
            }
            common.showToaster(target, response.Message, 0, 30, true, null, 1500);
        },
        addService = function () {
            var serviceIDInput = $('#serviceID'),
                descriptionInput = $('#description'),
                serviceID = serviceIDInput.val().trim(),
                description = descriptionInput.val().trim(),
                errorCallback = function () { common.focusAndSelect(serviceIDInput); },
                existingServiceIDs = [],
                errorMessage = '',
                errorMessages = [],
                showErrorToaster = function (message) {
                    common.showToaster($(this), message, 0, 30, true, null, 1500, errorCallback);
                };
            $('#fixServiceSelect').children('option').each(function () {
                existingServiceIDs.push($(this).val().toLowerCase());
            });
            if (serviceID.length === 0) {
                errorMessages.push("The service id is required.");
            }
            if (description.length === 0) {
                errorMessages.push("The description is required.");
            }
            if (serviceID.length > 0 && existingServiceIDs.indexOf(serviceID.toLowerCase()) >= 0) {
                errorMessages.push("The service id you have entered is already taken.");
            }
            if (errorMessages.length > 0) {
                errorMessages.forEach(function (message) {
                    errorMessage += message + " ";
                });
                showErrorToaster.apply(this, [errorMessage]);
                return;
            }
            dataAccess.updateService(serviceID, description, addServiceCallback);
        },
        updateFixServicesSelect = function (response) {
            var descriptionInput = $('#description'),
                fixServiceSelect = $('#fixServiceSelect');
            if (response.Success && response.Payload) {
                response.Payload.forEach(function (element) {
                    var option = $('option[value="' + element.ID + '"]');
                    option.attr('title', element.Description);
                    if (option.val() === fixServiceSelect.val()) {
                        fixServiceSelect.attr('title', element.Description);
                        descriptionInput.val(element.Description);
                    }
                });
            }
        },
        editServiceCallback = function (response) {
            var target = $('#addFixServiceImage');
            if (response.Success) {
                common.showToaster(target, response.Message, 0, 30, false);
                dataAccess.getServices(updateFixServicesSelect);
                hideAddFixServiceControls();
                return;
            }
            common.showToaster(target, response.Message, 0, 30, true, null, 1500);
        },
        editServiceDescription = function () {
            var serviceIDInput = $('#serviceID'),
                descriptionInput = $('#description'),
                serviceID = serviceIDInput.val().trim(),
                description = descriptionInput.val().trim(),
                errorCallback = function () { common.focusAndSelect(serviceIDInput); },
                errorMessage = '',
                showErrorToaster = function (message) {
                    common.showToaster($(this), message, 0, 30, true, null, 1500, errorCallback);
                };
            if (description.length === 0) {
                errorMessage = "The description is required.";
            }
            if (errorMessage.length > 0) {
                showErrorToaster.apply(this, [errorMessage]);
                return;
            }
            dataAccess.updateService(serviceID, description, editServiceCallback);
        },
        toggleFixServiceControls = function (shouldEnable) {
            var fixServiceSelect = $('#fixServiceSelect'),
                deleteFixServiceImage = $('#deleteFixServiceImage'),
                editFixServiceImage = $('#editFixServiceImage'),
                addFixServiceImage = $('#addFixServiceImage'),
                controls = [fixServiceSelect, deleteFixServiceImage, editFixServiceImage, addFixServiceImage];
            if (shouldEnable) {
                assignDeleteEditAddClickEvents();
                controls.forEach(function (element) {
                    common.enableControl(element);
                });
                return;
            }
            common.disableControls(controls);
        },
        adjustInputs = function (serviceId, description) {
            $('#labelServiceID').text(serviceId);
            $('#serviceID').val(serviceId);
            $('#description').val(description);
        },
        showEditFixServiceControls = function () {
            adjustInputs(selectedService(), selectedServiceDescription());
            toggleFixServiceControls(false);
            $('#editFixServiceDescriptionButton').show();
            $('#addEditFixService').show();
            $('#labelServiceID').show();
            $('#addFixServiceButton').hide();
            $('#serviceID').hide();
            common.focusAndSelect($('#description'));
        },
        showAddFixServiceControls = function () {
            adjustInputs('', '');
            toggleFixServiceControls(false);
            $('#addFixServiceButton').show();
            $('#addEditFixService').show();
            $('#serviceID').show();
            $('#editFixServiceDescriptionButton').hide();
            $('#labelServiceID').hide();
            common.focusAndSelect($('#serviceID'));
        },
        assignDeleteEditAddClickEvents = function () {
            var deleteFixServiceImage = $('#deleteFixServiceImage'),
                editFixServiceImage = $('#editFixServiceImage'),
                addFixServiceImage = $('#addFixServiceImage');
            deleteFixServiceImage.unbind('click');
            deleteFixServiceImage.click(deleteDialog.deleteService(selectedService, configurationCount, deleteSuccessCallback, deleteServiceDialogControls));
            editFixServiceImage.unbind('click');
            editFixServiceImage.click(showEditFixServiceControls);
            addFixServiceImage.unbind('click');
            addFixServiceImage.click(showAddFixServiceControls);
        },
        assignEventHandlers = function () {
            $('#fixServiceSelect').change(selectFixService);
            $('#addFixServiceButton').click(addService);
            $('#editFixServiceDescriptionButton').click(editServiceDescription);
            $('#cancelAddFixServiceButton').click(hideAddFixServiceControls);
            assignDeleteEditAddClickEvents();
        },
        fillFixServicesSelect = function (response) {
            var fixServicesSelect, selectMessage;
            fixServicesSelect = $('#fixServiceSelect');
            fixServicesSelect.empty();
            selectMessage = 'Select a fix service instance';
            fixServicesSelect.append(htmlHelper.createOption('<select>', '', selectMessage));
            fixServicesSelect.attr('title', selectMessage);
            if (response.Success && response.Payload) {
                response.Payload.forEach(function (element) {
                    fixServicesSelect.append(htmlHelper.createOption(element.ID, element.ID, element.Description));
                });
            }
        },
        deleteSuccessCallback = function (response) {
            fillFixServicesSelect(response);
            selectFixService();
        };
    result = {
        initialize: function () {
            common.trapEnterKey($('form'));
            $('#addFixServiceImage').attr('title', 'Add a new FIX service instance');
            assignEventHandlers();
        },
        displayServices: function (response) {
            fillFixServicesSelect(response);
        }
    };
    return result;
});