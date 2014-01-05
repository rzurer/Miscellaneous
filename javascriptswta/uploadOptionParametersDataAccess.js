"use strict";
var uploadOptionParametersDataAccess = function (common) {
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
        uploadOptionParametersFromExcelFile: function (uploadFilename, worksheetName, callback) {
            var url, data;
            url = librarian.UploadOptionParametersFromExcelFile;
            data = { uploadFilename: uploadFilename,  worksheetName: worksheetName };
            common.postFunction(url, data, function (response) {
                callback(response);
            });
        }
    };
};