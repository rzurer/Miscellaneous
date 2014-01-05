/*jslint browser: true*/
/*global $, window, jQuery, SI*/
"use strict";
var uploadFutureParameters = function (dragDropControl, dataAccess, factory, permissions) {
    var librarian,
        tiles = $("#tiles"),
        uploadFutureParametersTile = $('#uploadFutureParametersTile'),
        uploadFutureParametersCloseButton = $('#uploadFutureParametersCloseButton'),
        uploadFutureParametersWorkspace = $('#uploadFutureParameters'),
        uploadFutureParametersError = $('#uploadFutureParametersError'),
        uploadFutureParametersStatus = $('#uploadFutureParametersStatus'),
        fpusDragDropControlContainer = $('#fpusDragDropControlContainer'),
        navigation = $('#fpusNavigation'),
        futureParameterTablesContainer = $('#futureParameterTablesContainer'),
        fpusFileInputButton = $('#fpusFileInputButton'),
        helpButtons = $("#helpUploadFutureParametersContainer .expandCollapseImage"),
        fpusFileInputWrapper = $('#fpusFileInputWrapper'),
        interpolationSelect = $('#interpolationSelect'),
        fpusFileUploadSelectionContainer = $('#fpusFileUploadSelectionContainer'),
        helpUploadFutureParametersImage = $("#helpUploadFutureParametersImage"),
        helpUploadFutureParametersContainer = $("#helpUploadFutureParametersContainer"),
        worksheetNameControl = $('#fpusWorksheetName'),
        getWorksheetName = function () {
            return worksheetNameControl = $('#fpusWorksheetName').val();
        },
        setWorksheetName = function (worksheetName) {
            worksheetNameControl.val(worksheetName);
        },
        getInterpolationType = function () {
            return interpolationSelect.val();
        },
        setInterpolationType = function (interpolationType) {
            interpolationSelect.val(interpolationType);
        },
        getFileInput = function () {
            return $('#fpusFileInput');
        },
        getFileToUpload = function () {
            return getFileInput().get(0).files["0"];
        },

        displayError = function (error) {
            uploadFutureParametersError.text(error);
        },
        displayStatus = function (status) {
            uploadFutureParametersStatus.text(status);
        },
        clearError = function () {
            uploadFutureParametersError.text('');
        },
        clearStatus = function () {
            uploadFutureParametersStatus.text('');
        },
        onFileInputChanged = function () {
            try {
                var fileToUpload = getFileToUpload();
                dataAccess.upload(fileToUpload, uploadFutureParametersFromExcelFile);
            } catch (err) {
                displayError("This browser does not support this functionality. Please use Chrome, Firefox or IE10");
            }
        },
        onFileDropped = function (files) {
            clear();
            dataAccess.upload(files["0"], uploadFutureParametersFromExcelFile);
        },
        refreshFileInput = function () {
            var clone = getFileInput().clone();
            getFileInput().remove();
            fpusFileInputWrapper.append(clone);
            clone.change(onFileInputChanged);
        },
        collapseHelp = function () {
            helpUploadFutureParametersContainer.hide();
            $('.collapsibleContent').hide();
            $('.expandCollapseImage').attr({ 'title': "Show help", 'src': librarian.ShowHelpImage });
        },
        clear = function () {
            navigation.empty();
            futureParameterTablesContainer.empty();
            clearStatus();
            clearError();
        },
        displayFutureParametersTable = function (response) {
            clear();
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            };
            if (response.Payload.length === 0) {
                displayError("Every product for which you are trying to upload future parameters either has a contract which expired more than six months ago or derives its parameters from another product.");
                return;
            }
            factory.appendFutureParameterTables(navigation, futureParameterTablesContainer, response.Payload);
            if (response.Message) {
                displayStatus(response.Message);
            }
        },
        uploadFutureParametersFromExcelFile = function (response) {
            clear();
            refreshFileInput();
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            };
            var uploadFilename = response.Payload;
            dataAccess.uploadFutureParametersFromExcelFile(uploadFilename, getInterpolationType(), getWorksheetName(), displayFutureParametersTable);
        },
        onDragZoneEntered = function () {
            clear();
            if (!window.FileReader) {
                displayError("File upload using drag and drop is only supported in Chrome, Firefox and Internet Explorer 10");
            }
        },
        uploadFutureParametersTileClick = function () {
            tiles.fadeOut('slow', function () {
                uploadFutureParametersWorkspace.fadeIn("slow");
                dragDropControl.ready(fpusDragDropControlContainer);
                dragDropControl.addListener('fileDropped', onFileDropped);
                dragDropControl.addListener('dragZoneEntered', onDragZoneEntered);
                factory.fillInterpolationSelect(interpolationSelect);
                if (!!window.FileReader) {
                    $('#fpusUploadForm').hide();
                    $('#fpusFileInput').show();
                } else {
                    $('#fpusUploadForm').show();
                    $('#fpusFileInput').hide();
                }
            });
        },
        closeWorkspace = function () {
            collapseHelp();
            clear();
            uploadFutureParametersWorkspace.fadeOut('slow', function () {
                tiles.fadeIn('slow');
            });
        },
        displayOrHideFileUploadSelectionContainer = function () {
            clear();
            if ($(this).val()) {
                fpusFileUploadSelectionContainer.fadeIn('slow');
                return;
            }
            fpusFileUploadSelectionContainer.fadeOut('slow');
        },
        toggleHelp = function () {
            var title;
            helpUploadFutureParametersContainer.slideToggle('normal');
            title = helpUploadFutureParametersImage.attr('title');
            if (title.indexOf("Show") >= 0) {
                helpUploadFutureParametersImage.attr('title', "Hide help");
            }
            if (title.indexOf("Hide") >= 0) {
                helpUploadFutureParametersImage.attr('title', "Show help");
            }
        },
        collapseExpandSection = function () {
            var title, image;
            image = $(this);
            title = image.attr('title');
            if (title.indexOf("Show") >= 0) {
                image.attr('title', "Hide help");
                image.attr('src', librarian.HideHelpImage);
            }
            if (title.indexOf("Hide") >= 0) {
                image.attr('title', "Show help");
                image.attr('src', librarian.ShowHelpImage);
            }
            $(this).closest('.section').find('.collapsibleContent').toggle('fast');
        },
        assignEventHandlers = function () {
            interpolationSelect.change(displayOrHideFileUploadSelectionContainer);
            getFileInput().change(onFileInputChanged);
            fpusFileInputButton.click(clear); //??
            uploadFutureParametersTile.click(uploadFutureParametersTileClick);
            uploadFutureParametersCloseButton.click(closeWorkspace);
            helpUploadFutureParametersImage.click(toggleHelp);
            helpButtons.click(collapseExpandSection);
        };
    return {
        submitFutureParametersUploadForm: function () {
            $("#hiddenInterpolationType").val(getInterpolationType());
            $("#hiddenFpusWorksheetName").val(getWorksheetName());
            $('#fpusUploadForm').submit();
        },
        navigateMethod: function() {
            uploadFutureParametersTileClick();
        },
        uploadFutureParametersFromExcelFile: function (args) {
            uploadFutureParametersTileClick();
            setWorksheetName(args.worksheetName);
            setInterpolationType(args.interpolationType);
            displayOrHideFileUploadSelectionContainer.apply(interpolationSelect);
            dataAccess.uploadFutureParametersFromExcelFile(args.uploadFilename, args.interpolationType, args.worksheetName, displayFutureParametersTable);
        },
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
            fpusFileInputButton.css('background-image', 'url(' + librarian.ClickToLoadFromDiskImage + ')');
            fpusDragDropControlContainer.css('background-image', 'url(' + librarian.DragAnExcelDocumentHereImage + ')');
            dataAccess.initialize(urlLibrarian);
            assignEventHandlers();
        }
    };
};
