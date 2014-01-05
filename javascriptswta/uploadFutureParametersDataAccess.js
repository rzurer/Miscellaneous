"use strict";
var uploadFutureParametersDataAccess = function (common) {
    var librarian;
    return {
        initialize: function (urlLibrarian) {
            librarian = urlLibrarian;
        },
        upload: function (file, callback) {
            var url;
            url = librarian.Upload;
            common.uploadLocalFile(url, file, callback);
        },
        uploadFutureParametersFromExcelFile: function (uploadFilename, interpolationType, worksheetName, callback) {
            var url, data;
            url = librarian.UploadFutureParametersFromExcelFile;
            data = { uploadFilename: uploadFilename, interpolationType: interpolationType, worksheetName: worksheetName };
            common.postFunction(url, data, callback);
        }
    };
};