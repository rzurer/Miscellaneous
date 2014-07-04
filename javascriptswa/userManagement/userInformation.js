/*globals define*/
define([], function () {
    "use strict";
    var createUserInformation = function () {
        return {
            AssociatedTraders: [],
            CancellationReasonID: '',
            CancellationReason: '',
            Comments: {},
            CompanyName: '',
            CopyBasicFutureSetups: [],
            CopyBasicOptionSetups: [],
            CopyScreenSheets: [],
            ScreenSheetsToDelete: [],
            ScreenSheetsToRename: [],
            Email: '',
            FirstName: '',
            GroupsInWhichTraderIsMember: [],
            LastName: '',
            LicenseComment: '',
            LicenseExpiration: '',
            LicenseType: '',
            LicenseTypeID: "",
            MarketDataFeedPassword: '',
            MarketDataFeedProviderType: '',
            MarketDataFeedProviderTypeID: '',
            MarketDataFeedProxyAddress: '',
            MarketDataFeedProxyPassword: '',
            MarketDataFeedProxyPort: '',
            MarketDataFeedProxyUserName: '',
            MarketDataFeedSubscriptionLimit: '',
            MarketDataFeedSubscriptionLimitID: '',
            MarketDataFeedUserName: '',
            MembersOfTradersGroup: [],
            MobilePhone: '',
            Name: '',
            OptionBaseOptionPairs: [],
            PermissionsRosters: [],
            SalesForceAccountID: '',
            SalesForceAssetID: '',
            UserFutures: [],
            UserOptions: [],
            ValuationServiceAccounts: [],
            WorkPhone: ''
        };
    };
    return {
        createUserInformation: createUserInformation
    };
});


