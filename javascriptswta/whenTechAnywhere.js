"use strict";
var whenTechAnywhere = function () {
    var wta = {};
    return {
        initialize: function (session, urlLibrarian, bypassTopLevelTiles) {
            wta.session = session;
            wta.urlLibrarian = urlLibrarian;
            wta.common = common();
            wta.htmlHelper = htmlHelper(wta.common);
            
            wta.authorizationDataAccess = authorizationDataAccess(wta.common);
            wta.authorizationDataAccess.initialize(wta.urlLibrarian);
            
            wta.permissions = permissions(wta.common, wta.authorizationDataAccess);
            wta.permissions.initialize(wta.urlLibrarian, wta.session, bypassTopLevelTiles);
            
            wta.copyOptionParametersDataAccess = copyOptionParametersDataAccess(wta.common);
            wta.copyOptionParametersDataAccess.initialize(wta.urlLibrarian);
            wta.copyOptionParametersFactory = copyOptionParametersFactory(wta.common, wta.htmlHelper);

            wta.copyOptionParametersFromTrader = copyOptionParametersFromTrader(wta.common, wta.htmlHelper, wta.copyOptionParametersDataAccess, wta.copyOptionParametersFactory, wta.permissions);
            wta.copyOptionParametersFromTrader.initialize(wta.urlLibrarian);

            wta.copyOptionParametersFromProduct = copyOptionParametersFromProduct(wta.common, wta.htmlHelper, wta.copyOptionParametersDataAccess, wta.authorizationDataAccess, wta.copyOptionParametersFactory, wta.permissions);
            wta.copyOptionParametersFromProduct.initialize(wta.urlLibrarian);
            
            wta.updateInterestRatesDataAccess = updateInterestRatesDataAccess(wta.common);
            wta.yieldCurvesFactory = yieldCurvesFactory(wta.common, wta.htmlHelper);
            wta.updateInterestRates = updateInterestRates(wta.common, wta.htmlHelper, wta.updateInterestRatesDataAccess, wta.yieldCurvesFactory, wta.permissions);
            wta.updateInterestRates.initialize(wta.urlLibrarian, wta.session.loggedInUsername);
            
            wta.uploadFutureParametersDataAccess = uploadFutureParametersDataAccess(wta.common);
            wta.uploadFutureParametersFactory = uploadFutureParametersFactory(wta.common, wta.htmlHelper);
            wta.uploadFutureParameters = uploadFutureParameters(dragDropControl(eventListener()), wta.uploadFutureParametersDataAccess, wta.uploadFutureParametersFactory, wta.permissions);
            wta.uploadFutureParameters.initialize(wta.urlLibrarian);
            
            wta.uploadOptionParametersDataAccess = uploadOptionParametersDataAccess(wta.common);
            wta.uploadOptionParametersFactory = uploadOptionParametersFactory(wta.common, wta.htmlHelper);
            wta.uploadOptionParameters = uploadOptionParameters(dragDropControl(eventListener()), wta.uploadOptionParametersDataAccess, wta.uploadOptionParametersFactory, wta.permissions);
            wta.uploadOptionParameters.initialize(wta.urlLibrarian);
            
            wta.profitAndLossDataAccess = profitAndLossDataAccess(wta.common);
            wta.profitAndLossFactory = profitAndLossFactory(wta.common, wta.htmlHelper);
            wta.profitAndLoss = profitAndLoss(wta.profitAndLossDataAccess, wta.profitAndLossFactory, wta.common, wta.permissions);
            wta.profitAndLoss.initialize(wta.urlLibrarian);
            
            wta.productSpecificationsCalendar = productSpecificationsCalendar(wta.urlLibrarian, wta.common);
            wta.productSpecificationsDataAccess = productSpecificationsDataAccess(wta.common);
            wta.productSpecificationsFactory = productSpecificationsFactory(wta.common, wta.htmlHelper, wta.urlLibrarian);
            wta.productSpecifications = productSpecifications(wta.common, wta.productSpecificationsDataAccess, wta.productSpecificationsFactory, wta.productSpecificationsCalendar, wta.permissions);
            wta.productSpecifications.initialize(wta.urlLibrarian);
            
            wta.traderPermissionsDataAccess = traderPermissionsDataAccess(wta.common);
            wta.traderPermissions = traderPermissions(wta.traderPermissionsDataAccess, wta.permissions);
            wta.traderPermissions.initialize(wta.urlLibrarian);
        },
        getFunction: function (name) {
            return wta[name];
        },
        submitFutureParametersUploadForm: function () {
            return wta.uploadFutureParameters.submitFutureParametersUploadForm();
        },
        submitOptionParametersUploadForm: function () {
            return wta.uploadOptionParameters.submitOptionParametersUploadForm();
        },
        uploadOptionParametersFromExcelFile: function (args) {
            return wta.uploadOptionParameters.uploadOptionParametersFromExcelFile(args);
        },
        uploadFutureParametersFromExcelFile: function (args) {
            return wta.uploadFutureParameters.uploadFutureParametersFromExcelFile(args);
        }
    };
};