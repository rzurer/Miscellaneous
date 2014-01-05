/*jslint browser: true*/
/*global $*/
"use strict";
var uploadOptionParameters = function (dragDropControl, dataAccess, factory, permissions) {
    var librarian,
        uploadOptionParametersTile = $('#uploadOptionParametersTile'),
        tiles = $("#tiles"),
        uploadOptionParametersWorkspace = $('#uploadOptionParametersWorkspace'),
        uploadOptionParametersError = $('#uploadOptionParametersError'),
        opusFileInputButton = $('#opusFileInputButton'),
        opusFileInputWrapper = $('#opusFileInputWrapper'),
        uploadOptionParametersStatus = $('#uploadOptionParameterStatus'),
        updateOptionParametersCloseButton = $('#updateOptionParametersCloseButton'),
        opusDragDropControlContainer = $('#opusDragDropControlContainer'),
        tablesContainer = $("#optionParametersTablesContainer"),
        helpUploadOptionParametersImage = $('#helpUploadOptionParametersImage'),
        helpUploadOptionParametersContainer = $("#helpUploadOptionParametersContainer"),
        comparisonsContainer = $("#comparisonsContainer"),
        navigation = $('#opusNavigation'),
        helpButtons = $("#helpUploadOptionParametersContainer .expandCollapseImage"),
        worksheetNameControl = $('#opusWorksheetName'),
        getWorksheetName = function () {
            return worksheetNameControl.val();
        },
        setWorksheetName = function (worksheetName) {
            worksheetNameControl.val(worksheetName);
        },
        getFileInput = function () {
            return $('#opusFileInput');
        },
        displayError = function (error) {
            uploadOptionParametersError.text(error);
        },
        displayStatus = function (status) {
            uploadOptionParametersStatus.text(status);
        },
        clearError = function () {
            uploadOptionParametersError.text('');
        },
        clearStatus = function () {
            uploadOptionParametersStatus.text('');
        },
        displayOptionParametersTable = function (response) {
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            factory.appendOptionParametersTables(navigation, comparisonsContainer, tablesContainer, response.Payload);
            if (response,success && response.Message) {
                displayStatus(response.Message);
            }
        },
        clear = function () {
            navigation.empty();
            comparisonsContainer.empty();
            tablesContainer.empty();
            clearError();
            clearStatus();
        },
        uploadOptionParametersFromExcelFile = function (response) {
            var uploadFilename, worksheetName;
            refreshFileInput();
            clear();
            if (!permissions.signOutOrDisplayError(response, displayError)) {
                return;
            }
            uploadFilename = response.Payload;
            worksheetName = getWorksheetName();
            dataAccess.uploadOptionParametersFromExcelFile(uploadFilename, worksheetName, displayOptionParametersTable);
        },
        getFileToUpload = function () {
            return getFileInput().get(0).files["0"];
        },
        onFileInputChanged = function () {
            var fileToUpload = getFileToUpload();
            dataAccess.upload(fileToUpload, uploadOptionParametersFromExcelFile);
        },
        refreshFileInput = function () {
            var clone = getFileInput().clone();
            getFileInput().remove();
            opusFileInputWrapper.append(clone);
            clone.change(onFileInputChanged);
        },
        onFileDropped = function (files) {
            dataAccess.upload(files["0"], uploadOptionParametersFromExcelFile);
        },
        onDragZoneEntered = function () {
            clear();
            if (!window.FileReader) {
                displayError("File upload using drag and drop is only supported in Chrome, Firefox and Internet Explorer 10");
            }
        },
        uploadOptionParametersTileClick = function () {
            tiles.fadeOut('slow', function () {
                uploadOptionParametersWorkspace.fadeIn("slow");
                dragDropControl.ready(opusDragDropControlContainer);
                dragDropControl.addListener('fileDropped', onFileDropped);
                dragDropControl.addListener('dragZoneEntered', onDragZoneEntered);
                if (!!window.FileReader) {
                    $('#opusUploadForm').hide();
                    $('#opusFileInput').show();
                } else {
                    $('#opusUploadForm').show();
                    $('#opusFileInput').hide();
                }
            });
        },
        toggleHelp = function () {
            var title;
            helpUploadOptionParametersContainer.slideToggle('normal');
            title = helpUploadOptionParametersImage.attr('title');
            if (title.indexOf("Show") >= 0) {
                helpUploadOptionParametersImage.attr('title', "Hide help");
            }
            if (title.indexOf("Hide") >= 0) {
                helpUploadOptionParametersImage.attr('title', "Show help");
            }
        },
        collapseHelp = function () {
            helpUploadOptionParametersContainer.hide();
            $('.collapsibleContent').hide();
            $('.expandCollapseImage').attr({ 'title': "Show help", 'src': librarian.ShowHelpImage });
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
        closeWorkspace = function () {
            collapseHelp();
            clear();
            uploadOptionParametersWorkspace.fadeOut('slow', function () {
                tiles.fadeIn('slow');
            });
        },
        assignEventHandlers = function () {
            getFileInput().change(onFileInputChanged);
            opusFileInputButton.click(clear);
            uploadOptionParametersTile.click(uploadOptionParametersTileClick);
            helpUploadOptionParametersImage.click(toggleHelp);
            helpButtons.click(collapseExpandSection);
            updateOptionParametersCloseButton.click(closeWorkspace);
        };
    return {
        submitOptionParametersUploadForm: function () {
            $("#hiddenOpusWorksheetName").val(getWorksheetName());
            $('#opusUploadForm').submit();
        },
        navigateMethod: function () {
            uploadOptionParametersTileClick();
        },
        uploadOptionParametersFromExcelFile: function (args) {
            uploadOptionParametersTileClick();
            setWorksheetName(args.worksheetName);
            dataAccess.uploadOptionParametersFromExcelFile(args.uploadFilename, args.worksheetName, displayOptionParametersTable);
        },
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
            opusFileInputButton.css('background-image', 'url(' + librarian.ClickToLoadFromDiskImage + ')');
            opusDragDropControlContainer.css('background-image', 'url(' + librarian.DragAnExcelDocumentHereImage + ')');
            assignEventHandlers();
            dataAccess.initialize(urlLibrarian);
        }
    };
};