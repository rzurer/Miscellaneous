/*globals console, define*/
define(['common', 'arrayHelper', 'userManagement/userInformation'], function (common, arrayHelper, userInformation) {
    "use strict";
    var eventListener,
        licenseMap,
        cancellationReasons,
        canUpdateUser,
        iceMarketDataFeedProviders,
        marketDataFeedProviders,
        marketDataFeedSubscriptionLimits,
        iceOptions,
        ice00Options,
        iceFutures,
        ice00Futures,
        userInformationDictionary,
        futureUnderliersDictionary,
        underlierFuturesDictionary,
        optionUnderliersDictionary,
        underlierOptionsDictionary,
        usersHavingOptions,
        usersHavingFutures,
        copyFromUserScreenSheetsDictionary,
        copyFromUserBasicFutureSetupsDictionary,
        copyFromUserBasicOptionSetupsDictionary,
        optionCopyFromUsersBasicSetupsDictionary,
        futureCopyFromUsersBasicSetupsDictionary,
        ice00OptionBaseOptionsPairs = [],
        valuationServiceDictionary = {},
        optionNameDictionary = {},
        futureNameDictionary = {},
        currentUsername = '',
        activeLicenseIds = [1, 2, 99, 101, 102, 103, 107, 202, 204, 206, 301, 400, 405, 410, 411, 413, 414, 415],
        nonModifiableLicenseTypeIds = [0, 5, 10, 90, 9999, 9990],
        noneLicenseTypeID = '0',
        freeLicenseTypeID = '415',
        warningsShouldBeIgnored = false,
        copyScreenSheetsToAdd = [],
        copyScreenSheetsToRemove = [],
        getCopyScreenSheetsToAdd = function () {
            return copyScreenSheetsToAdd;
        },
        getCopyScreenSheetsToRemove = function () {
            return copyScreenSheetsToRemove;
        },
        clearCopyScreenSheetsToRemove = function () {
            copyScreenSheetsToRemove = [];
        },
        clearCopyScreenSheetsToAdd = function () {
            copyScreenSheetsToAdd = [];
        },
        createUserInformation = function (name) {
            var copy;
            copy = userInformation.createUserInformation();
            copy.Name = name;
            return copy;
        },
        getCopyOptionSetups = function (copyFromUser) {
            return copyFromUserBasicOptionSetupsDictionary[copyFromUser];
        },
        getCopyFutureSetups = function (copyFromUser) {
            return copyFromUserBasicFutureSetupsDictionary[copyFromUser];
        },
        setICE00OptionBaseOptionsPairs = function (response) {
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            ice00OptionBaseOptionsPairs = response.Payload;
        },
        getICE00OptionBaseOptionsPairs = function () {
            return ice00OptionBaseOptionsPairs;
        },
        setUserInfo = function (userInfo, callback) {
            if (!userInformationDictionary) {
                userInformationDictionary = {};
            }
            userInformationDictionary[userInfo.Name] = userInfo;
            common.safeCallback(callback);
        },
        getCurrentUserInfo = function () {
            if (!userInformationDictionary) {
                userInformationDictionary = {};
            }
            return userInformationDictionary[currentUsername];
        },
        updateUserInfo = function (propertyValuePairs, userInfo, callback) {
            if (!propertyValuePairs) {
                return;
            }
            userInfo = userInfo || getCurrentUserInfo();
            propertyValuePairs.forEach(function (pair) {
                userInfo[pair.property] = pair.value;
            });
            common.safeCallback(callback, userInfo);
        },
        getFutureUnderliers = function (future) {
            return futureUnderliersDictionary[future] || [];
        },
        getOptionUnderliers = function (option) {
            return optionUnderliersDictionary[option] || [];
        },
        getUnderlierFutures = function (futureUnderlier) {
            return underlierFuturesDictionary[futureUnderlier] || [];
        },
        getUnderlierOptions = function (optionUnderlier) {
            return underlierOptionsDictionary[optionUnderlier] || [];
        },
        getFutureUnderliersDictionary = function () {
            return futureUnderliersDictionary;
        },
        getOptionUnderliersDictionary = function () {
            return optionUnderliersDictionary;
        },
        getUnderlierFuturesDictionary = function () {
            return underlierFuturesDictionary;
        },
        getUnderlierOptionsDictionary = function () {
            return underlierOptionsDictionary;
        },
        getSessionOwners = function () {
            return common.getPropertiesArray(valuationServiceDictionary);
        },
        getSourceSessions = function (sessionOwner) {
            return valuationServiceDictionary[sessionOwner];
        },
        getMarketDataFeedSubscriptionLimits = function () {
            return marketDataFeedSubscriptionLimits;
        },
        getMarketDataFeedProviders = function (licenseTypeID) {
            return licenseTypeID === freeLicenseTypeID ? iceMarketDataFeedProviders : marketDataFeedProviders;
        },
        getCancellationReasons = function () {
            return cancellationReasons;
        },
        get = function (propertyName) {
            var currentUserInfo = getCurrentUserInfo();
            return currentUserInfo && currentUserInfo.hasOwnProperty(propertyName) ? currentUserInfo[propertyName] : null;
        },
        getCancellationReasonID = function () {
            return get('CancellationReasonID');
        },
        getCancellationReason = function () {
            var cancellationReasonID, index, cancellationReason;
            cancellationReasonID = getCancellationReasonID();
            index = common.getIndexOfArrayItem(cancellationReasons, 'Key', Number(cancellationReasonID));
            cancellationReason = cancellationReasons[index];
            return cancellationReason ? cancellationReason.Value : '';
        },
        getUsernames = function () {
            if (!userInformationDictionary) {
                userInformationDictionary = {};
            }
            return common.getPropertiesArray(userInformationDictionary);
        },
        getLicenseTypes = function () {
            var licenseIds, licenseTypes, sortedLicenseTypes, indexOfNone, none;
            licenseIds = common.getPropertiesArray(licenseMap);
            licenseTypes = licenseIds.map(function (id) {
                return { Key: id, Value: licenseMap[id].description };
            });
            indexOfNone = common.getIndexOfArrayItem(licenseTypes, 'Key', '0');
            none = licenseTypes.splice(indexOfNone, 1)[0];
            sortedLicenseTypes = common.sortArrayByStringProperty(licenseTypes, 'Value');
            sortedLicenseTypes.splice(0, 0, none);
            return sortedLicenseTypes;
        },
        setUsersHavingProducts = function (response) {
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            usersHavingOptions = response.Payload.UsersHavingOptions;
            usersHavingFutures = response.Payload.UsersHavingFutures;
        },
        getCurrentUsername = function () {
            return get('Name');
        },
        getCurrentUserEmail = function () {
            return get('Email');
        },
        setCurrentUsername = function (username) {
            if (!userInformationDictionary) {
                userInformationDictionary = {};
            }
            var currentUserInfo = userInformationDictionary[username];
            if (!currentUserInfo) {
                userInformationDictionary[username] = { 'Name': username };
            }
            currentUsername = username;
        },
        setCurrentUserEmail = function (email) {
            var currentUserInfo = getCurrentUserInfo();
            currentUserInfo.Email = email;
        },
        getUsersHavingOptions = function () {
            return usersHavingOptions || [];
        },
        getUsersHavingFutures = function () {
            return usersHavingFutures || [];
        },
        setUserInformationDictionary = function (usernames, callback) {
            userInformationDictionary = {};
            usernames.forEach(function (username) {
                userInformationDictionary[username] = createUserInformation(username);
            });
            callback(common.getPropertiesArray(userInformationDictionary));
        },
        addToUserInformationDictionary = function (username, propertyValuePairs, callback) {
            if (!userInformationDictionary) {
                userInformationDictionary = {};
            }
            userInformationDictionary[username] = createUserInformation(username);
            updateUserInfo(propertyValuePairs, userInformationDictionary[username], callback);
        },
        setMarketDataFeedSubscriptionLimits = function (response, callback) {
            marketDataFeedSubscriptionLimits = [];
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            marketDataFeedSubscriptionLimits = response.Payload;
            callback(marketDataFeedSubscriptionLimits);
        },
        setMarketDataFeedProviders = function (response) {
            var i, item;
            marketDataFeedProviders = [];
            iceMarketDataFeedProviders = [];
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            marketDataFeedProviders = response.Payload;
            for (i = 0; i < marketDataFeedProviders.length; i += 1) {
                item = marketDataFeedProviders[i];
                if (item.Value === 'ICE') {
                    iceMarketDataFeedProviders.push(item);
                }
            }
        },
        setCancellationReasons = function (response, callback) {
            cancellationReasons = [];
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            cancellationReasons = response.Payload;
            callback(cancellationReasons);
        },
        setLicenseMap = function (response, callback) {
            licenseMap = {};
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            response.Payload.forEach(function (licenseInfo) {
                if (!licenseMap.hasOwnProperty(licenseInfo.ID)) {
                    licenseMap[licenseInfo.ID] = { gracePeriod: licenseInfo.GracePeriod, maximumExpirationDays: licenseInfo.MaximumExpirationDays, description: licenseInfo.Description };
                }
            });
            callback(getLicenseTypes());
        },
        setICEProducts = function (response) {
            iceOptions = [];
            iceFutures = [];
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            iceOptions = response.Payload.ICEOptions;
            iceFutures = response.Payload.ICEFutures;
        },
        setProductNameDictionaries = function (response) {
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            optionNameDictionary = response.Payload.OptionNameDictionary;
            futureNameDictionary = response.Payload.FutureNameDictionary;
        },
        getICEOptions = function () {
            return iceOptions;
        },
        getICEFutures = function () {
            return iceFutures;
        },
        setProductsAndUnderliers = function (response) {
            optionUnderliersDictionary = {};
            futureUnderliersDictionary = {};
            underlierOptionsDictionary = {};
            underlierFuturesDictionary = {};
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            optionUnderliersDictionary = response.Payload.OptionUnderliersDictionary;
            underlierOptionsDictionary = response.Payload.UnderlierOptionsDictionary;
            futureUnderliersDictionary = response.Payload.FutureUnderliersDictionary;
            underlierFuturesDictionary = response.Payload.UnderlierFuturesDictionary;
        },
        setValuationServiceDictionary = function (response) {
            valuationServiceDictionary = {};
            if (!response.Success) {
                eventListener.fire("FailedResponse", [response.Message]);
                return;
            }
            valuationServiceDictionary = response.Payload;
        },
        getMaximumExpirationDays = function (id) {
            var license = licenseMap[id];
            return license ? license.maximumExpirationDays : 0;
        },
        getGracePeriod = function (id) {
            var license = licenseMap[id];
            return id && license ? license.gracePeriod : 'N/A';
        },
        getUserComments = function () {
            return get('Comments');
        },
        getLicenseComment = function () {
            return get('LicenseComment');
        },
        getLicenseTypeID = function () {
            return get('LicenseTypeID');
        },
        getUserOptions = function () {
            return get('UserOptions') || [];
        },
        getUserFutures = function () {
            return get('UserFutures') || [];
        },
        getUserFuturesAndUnderliers = function (userFutures) {
            var futuresAndUnderliers, futureUnderliers, index;
            futuresAndUnderliers = [];
            userFutures.forEach(function (future) {
                index = futuresAndUnderliers.indexOf(future);
                if (index === -1) {
                    futuresAndUnderliers.push(future);
                }
                futureUnderliers = getFutureUnderliers(future);
                futureUnderliers.forEach(function (underlier) {
                    index = futuresAndUnderliers.indexOf(underlier);
                    if (index === -1) {
                        futuresAndUnderliers.push(underlier);
                    }
                });
            });
            return futuresAndUnderliers;
        },
        invalidateBasicSetupsDictionaries = function () {
            setOptionCopyFromUsersBasicSetupsDictionary(null);
            setCopyFromUserBasicOptionSetupsDictionary(null);
            setFutureCopyFromUsersBasicSetupsDictionary(null);
            setCopyFromUserBasicFutureSetupsDictionary(null);
        },
        getOptionCopyFromUsersBasicSetupsDictionary = function () {
            return optionCopyFromUsersBasicSetupsDictionary;
        },
        setOptionCopyFromUsersBasicSetupsDictionary = function (dictionary) {
            optionCopyFromUsersBasicSetupsDictionary = dictionary;
        },
        getFutureCopyFromUsersBasicSetupsDictionary = function () {
            return futureCopyFromUsersBasicSetupsDictionary;
        },
        setFutureCopyFromUsersBasicSetupsDictionary = function (dictionary) {
            futureCopyFromUsersBasicSetupsDictionary = dictionary;
        },
        getCopyFromUserBasicFutureSetupsDictionary = function () {
            return copyFromUserBasicFutureSetupsDictionary;
        },
        setCopyFromUserBasicFutureSetupsDictionary = function (dictionary) {
            copyFromUserBasicFutureSetupsDictionary = dictionary;
        },
        getCopyFromUserBasicOptionSetupsDictionary = function () {
            return copyFromUserBasicOptionSetupsDictionary;
        },
        setCopyFromUserBasicOptionSetupsDictionary = function (dictionary) {
            copyFromUserBasicOptionSetupsDictionary = dictionary;
        },
        setICE00Options = function (options) {
            ice00Options = options || [];
        },
        setICE00Futures = function (futures) {
            ice00Futures = futures || [];
        },
        getOptionName = function (optionCode) {
            return optionNameDictionary[optionCode];
        },
        getFutureName = function (futureCode) {
            return futureNameDictionary[futureCode];
        },
        getICE00Options = function () {
            return ice00Options;
        },
        getICE00Futures = function () {
            return ice00Futures;
        },
        setCopyFromUserScreenSheetsDictionary = function (dictionary) {
            copyFromUserScreenSheetsDictionary = dictionary;
        },
        isFreeLicense = function () {
            return get('LicenseTypeID') === '415';
        },
        getAppropriateScreenSheets = function (screenSheets) {
            var appropriateScreenSheets, options;
            if (!isFreeLicense()) {
                return screenSheets;
            }
            appropriateScreenSheets = [];
            if (screenSheets) {
                options = getICEOptions();
                screenSheets.forEach(function (screenSheet) {
                    if (options.indexOf(screenSheet.CommodityCode) !== -1) {
                        if (common.getIndexOfArrayItem(appropriateScreenSheets, "SheetID", screenSheet.SheetID) === -1) {
                            appropriateScreenSheets.push(screenSheet);
                        }
                    }
                });
            }
            return appropriateScreenSheets;
        },
        getCopyFromUserScreenSheets = function (copyFromUser) {
            var screenSheetsForUser;
            if (!copyFromUserScreenSheetsDictionary) {
                return [];
            }
            screenSheetsForUser = copyFromUser ? copyFromUserScreenSheetsDictionary[copyFromUser] : [];
            return getCurrentUsername() !== copyFromUser ? getAppropriateScreenSheets(screenSheetsForUser) : screenSheetsForUser;
        },
        getAppropriateCopyFromUsers = function (allCopyFromUsers) {
            var screenSheetsForUser, options, appropriateCopyFromUsers;
            if (!isFreeLicense()) {
                return allCopyFromUsers;
            }
            appropriateCopyFromUsers = [];
            allCopyFromUsers.forEach(function (copyFromUser) {
                var i, screenSheet;
                screenSheetsForUser = copyFromUserScreenSheetsDictionary[copyFromUser];
                if (screenSheetsForUser) {
                    options = getICEOptions();
                    for (i = 0; i < screenSheetsForUser.length; i += 1) {
                        screenSheet = screenSheetsForUser[i];
                        if (options.indexOf(screenSheet.CommodityCode) !== -1) {
                            appropriateCopyFromUsers.push(copyFromUser);
                            break;
                        }
                    }
                }
            });
            return appropriateCopyFromUsers;
        },
        getAllCopyFromUsers = function () {
            var allCopyFromUsers;
            if (!copyFromUserScreenSheetsDictionary) {
                return [];
            }
            allCopyFromUsers = common.getPropertiesArray(copyFromUserScreenSheetsDictionary).sort();
            return getAppropriateCopyFromUsers(allCopyFromUsers);
        },
        getAllScreenSheets = function () {
            var allScreenSheets;
            allScreenSheets = [];
            getAllCopyFromUsers().forEach(function (copyFromUser) {
                allScreenSheets = allScreenSheets.concat(getCopyFromUserScreenSheets(copyFromUser));
            });
            return allScreenSheets;
        },
        getAllOptionCodesHavingScreenSheets = function () {
            var optionCodes = [];
            getAllScreenSheets().forEach(function (screenSheet) {
                arrayHelper.addUnique(optionCodes, screenSheet.CommodityCode);
            });
            return optionCodes.sort();
        },
        getCopyBasicOptionSetups = function () {
            return get('CopyBasicOptionSetups') || [];
        },
        getCopyBasicFutureSetups = function () {
            return get('CopyBasicFutureSetups') || [];
        },
        getLicenseExpiration = function () {
            return get('LicenseExpiration');
        },
        getSalesForceAssetID = function () {
            return get('SalesForceAssetID');
        },
        getSalesForceAccountID = function () {
            return get('SalesForceAccountID');
        },
        getUserFirstName = function () {
            return get('FirstName');
        },
        getUserLastName = function () {
            return get('LastName');
        },
        getUserEmail = function () {
            return get('Email');
        },
        getUserWorkPhone = function () {
            return get('WorkPhone');
        },
        getUserCompanyName = function () {
            return get('CompanyName');
        },
        getUserMobilePhone = function () {
            return get('MobilePhone');
        },
        getOptionBaseOptionPairs = function () {
            return get('OptionBaseOptionPairs') || [];
        },
        getLicenseType = function () {
            return get('LicenseType');
        },
        currentUserIsDefined = function () {
            if (getCurrentUserInfo()) {
                return true;
            }
            return false;
        },
        getCopyScreenSheets = function () {
            return get('CopyScreenSheets') || [];
        },
        getScreenSheetsToDelete = function () {
            return get('ScreenSheetsToDelete') || [];
        },
        getScreenSheetsToRename = function () {
            return get('ScreenSheetsToRename') || [];
        },
        getValuationServiceAccounts = function () {
            return get('ValuationServiceAccounts') || [];
        },
        getPermissionsRosters = function () {
            return get('PermissionsRosters') || [];
        },
        getMembersOfTradersGroup = function () {
            return get('MembersOfTradersGroup') || [];
        },
        getGroupsInWhichTraderIsMember = function () {
            return get('GroupsInWhichTraderIsMember') || [];
        },
        getAssociatedTraders = function () {
            return get('AssociatedTraders') || [];
        },
        getMarketDataFeedProviderType = function (marketDataFeedProviderTypeID) {
            var index = common.getIndexOfArrayItem(marketDataFeedProviders, 'Key', marketDataFeedProviderTypeID);
            return index !== -1 ? marketDataFeedProviders[index].Value : '';
        },
        getMarketDataFeedSubscriptionLimit = function (marketDataFeedSubscriptionLimitID) {
            var index = common.getIndexOfArrayItem(marketDataFeedSubscriptionLimits, 'Key', marketDataFeedSubscriptionLimitID);
            return index !== -1 ? marketDataFeedSubscriptionLimits[index].Value : '';
        },
        getMarketDataFeedInformation = function () {
            var marketDataFeedProviderTypeID, marketDataFeedSubscriptionLimitID;
            marketDataFeedProviderTypeID = get('MarketDataFeedProviderTypeID');
            marketDataFeedSubscriptionLimitID = get('MarketDataFeedSubscriptionLimitID');
            return {
                MarketDataFeedProviderType: getMarketDataFeedProviderType(marketDataFeedProviderTypeID),
                MarketDataFeedProviderTypeID: marketDataFeedProviderTypeID,
                MarketDataFeedUserName: get('MarketDataFeedUserName'),
                MarketDataFeedPassword: get('MarketDataFeedPassword'),
                MarketDataFeedProxyAddress: get('MarketDataFeedProxyAddress'),
                MarketDataFeedProxyPort: get('MarketDataFeedProxyPort'),
                MarketDataFeedProxyUserName: get('MarketDataFeedProxyUserName'),
                MarketDataFeedProxyPassword: get('MarketDataFeedProxyPassword'),
                MarketDataFeedSubscriptionLimitID: marketDataFeedSubscriptionLimitID,
                MarketDataFeedSubscriptionLimit: getMarketDataFeedSubscriptionLimit(marketDataFeedSubscriptionLimitID)
            };
        },
        canUseValuationService = function (licenseTypeID) {
            if (!licenseTypeID || licenseTypeID === 'new') {
                return false;
            }
            return licenseTypeID && activeLicenseIds.indexOf(Number(licenseTypeID)) >= 0;
        },
        canModify = function (licenseTypeID) {
            if (!licenseTypeID || licenseTypeID === 'new') {
                return false;
            }
            return nonModifiableLicenseTypeIds.indexOf(Number(licenseTypeID)) === -1;
        },
        canModifyBasicSetups = function (licenseTypeID) {
            if (!licenseTypeID || licenseTypeID === 'new') {
                return false;
            }
            return licenseTypeID !== freeLicenseTypeID;
        },
        setLoggedInUserPermissions = function (level) {
            canUpdateUser = [1, 5, 0].indexOf(Number(level)) !== -1;
        },
        getLoggedInUserPermissions = function () {
            return { canUpdateUser: canUpdateUser };
        },
        getFuturesAppropriateForLicenseType = function (futures) {
            var licenseTypeID, result, filtered;
            filtered = getICEFutures();
            result = [];
            licenseTypeID = getLicenseTypeID();
            if (licenseTypeID === noneLicenseTypeID) {
                return result;
            }
            if (licenseTypeID === freeLicenseTypeID) {
                futures.forEach(function (future) {
                    if (filtered.indexOf(future) !== -1) {
                        result.push(future);
                    }
                });
                return result;
            }
            return futures;
        },
        getOptionsAppropriateForLicenseType = function (options) {
            var licenseTypeID, result, filtered;
            filtered = getICEOptions();
            result = [];
            licenseTypeID = getLicenseTypeID();
            if (licenseTypeID === noneLicenseTypeID) {
                return result;
            }
            if (licenseTypeID === freeLicenseTypeID) {
                options.forEach(function (option) {
                    if (filtered.indexOf(option) !== -1) {
                        result.push(option);
                    }
                });
                return result;
            }
            return options;
        },
        getWriteOnlyUserInfo = function () {
            var marketDataFeedInfo = getMarketDataFeedInformation();
            return {
                CancellationReasonID: getCancellationReasonID(),
                CopyBasicFutureSetups: getCopyBasicFutureSetups(),
                CopyBasicOptionSetups: getCopyBasicOptionSetups(),
                CopyScreenSheets: getCopyScreenSheets(),
                ScreenSheetsToDelete: getScreenSheetsToDelete(),
                ScreenSheetsToRename: getScreenSheetsToRename(),
                LicenseComment: getLicenseComment(),
                LicenseExpiration: getLicenseExpiration(),
                LicenseType: getLicenseType(),
                LicenseTypeID: getLicenseTypeID(),
                MarketDataFeedPassword: marketDataFeedInfo.MarketDataFeedPassword,
                MarketDataFeedProviderTypeID: marketDataFeedInfo.MarketDataFeedProviderTypeID,
                MarketDataFeedProviderType: marketDataFeedInfo.MarketDataFeedProviderType,
                MarketDataFeedProxyAddress: marketDataFeedInfo.MarketDataFeedProxyAddress,
                MarketDataFeedProxyPassword: marketDataFeedInfo.MarketDataFeedProxyPassword,
                MarketDataFeedProxyPort: marketDataFeedInfo.MarketDataFeedProxyPort,
                MarketDataFeedProxyUserName: marketDataFeedInfo.MarketDataFeedProxyUserName,
                MarketDataFeedSubscriptionLimitID: marketDataFeedInfo.MarketDataFeedSubscriptionLimitID,
                MarketDataFeedSubscriptionLimit: marketDataFeedInfo.MarketDataFeedSubscriptionLimit,
                MarketDataFeedUserName: marketDataFeedInfo.MarketDataFeedUserName,
                Name: getCurrentUsername(),
                Email: getCurrentUserEmail(),
                UserFutures: getUserFuturesAndUnderliers(getFuturesAppropriateForLicenseType(getUserFutures())),
                UserOptions: getOptionsAppropriateForLicenseType(getUserOptions()),
                ValuationServiceAccounts: getValuationServiceAccounts()
            };
        },
        unignoreWarnings = function () {
            warningsShouldBeIgnored = false;
        },
        ignoreWarnings = function () {
            warningsShouldBeIgnored = true;
        },
        shouldIgnoreWarnings = function () {
            return warningsShouldBeIgnored;
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
        };
    return {
        canModify: canModify,
        canModifyBasicSetups: canModifyBasicSetups,
        currentUserIsDefined: currentUserIsDefined,
        initializeEventListener: initializeEventListener,
        isFreeLicense: isFreeLicense,
        updateUserInfo: updateUserInfo,
        getAssociatedTraders: getAssociatedTraders,
        getCancellationReasonID: getCancellationReasonID,
        getCancellationReasons: getCancellationReasons,
        getCopyBasicFutureSetups: getCopyBasicFutureSetups,
        getCopyBasicOptionSetups: getCopyBasicOptionSetups,
        getCopyFromUserBasicFutureSetupsDictionary: getCopyFromUserBasicFutureSetupsDictionary,
        getCopyFromUserBasicOptionSetupsDictionary: getCopyFromUserBasicOptionSetupsDictionary,
        getOptionCopyFromUsersBasicSetupsDictionary: getOptionCopyFromUsersBasicSetupsDictionary,
        getFutureCopyFromUsersBasicSetupsDictionary: getFutureCopyFromUsersBasicSetupsDictionary,
        getAllCopyFromUsers: getAllCopyFromUsers,
        getCopyFromUserScreenSheets: getCopyFromUserScreenSheets,
        getCopyFutureSetups: getCopyFutureSetups,
        getCopyOptionSetups: getCopyOptionSetups,
        getCopyScreenSheets: getCopyScreenSheets,
        getCurrentUsername: getCurrentUsername,
        getFutureUnderliers: getFutureUnderliers,
        getFutureUnderliersDictionary: getFutureUnderliersDictionary,
        getGracePeriod: getGracePeriod,
        getGroupsInWhichTraderIsMember: getGroupsInWhichTraderIsMember,
        getICEFutures: getICEFutures,
        getICEOptions: getICEOptions,
        getLicenseComment: getLicenseComment,
        getLicenseExpiration: getLicenseExpiration,
        getLicenseType: getLicenseType,
        getLicenseTypeID: getLicenseTypeID,
        getLicenseTypes: getLicenseTypes,
        getMarketDataFeedInformation: getMarketDataFeedInformation,
        getScreenSheetsToDelete: getScreenSheetsToDelete,
        getScreenSheetsToRename: getScreenSheetsToRename,
        getMarketDataFeedProviders: getMarketDataFeedProviders,
        getMarketDataFeedSubscriptionLimits: getMarketDataFeedSubscriptionLimits,
        getMaximumExpirationDays: getMaximumExpirationDays,
        getMembersOfTradersGroup: getMembersOfTradersGroup,
        getOptionBaseOptionPairs: getOptionBaseOptionPairs,
        getOptionUnderliers: getOptionUnderliers,
        getOptionUnderliersDictionary: getOptionUnderliersDictionary,
        getPermissionsRosters: getPermissionsRosters,
        getSalesForceAssetID: getSalesForceAssetID,
        getSalesForceAccountID: getSalesForceAccountID,
        getSessionOwners: getSessionOwners,
        getSourceSessions: getSourceSessions,
        getUnderlierFutures: getUnderlierFutures,
        getUnderlierFuturesDictionary: getUnderlierFuturesDictionary,
        getUnderlierOptions: getUnderlierOptions,
        getUnderlierOptionsDictionary: getUnderlierOptionsDictionary,
        getUserComments: getUserComments,
        getUserCompanyName: getUserCompanyName,
        getUserEmail: getUserEmail,
        getUserFirstName: getUserFirstName,
        getUserOptions: getUserOptions,
        getUserFutures: getUserFutures,
        getUserLastName: getUserLastName,
        getUserMobilePhone: getUserMobilePhone,
        getUsernames: getUsernames,
        getUsersHavingFutures: getUsersHavingFutures,
        getUsersHavingOptions: getUsersHavingOptions,
        getUserWorkPhone: getUserWorkPhone,
        getValuationServiceAccounts: getValuationServiceAccounts,
        getWriteOnlyUserInfo: getWriteOnlyUserInfo,
        setCancellationReasons: setCancellationReasons,
        setCopyFromUserBasicFutureSetupsDictionary: setCopyFromUserBasicFutureSetupsDictionary,
        setCopyFromUserBasicOptionSetupsDictionary: setCopyFromUserBasicOptionSetupsDictionary,
        setICE00Options: setICE00Options,
        setICE00Futures: setICE00Futures,
        getICE00Options: getICE00Options,
        getICE00Futures: getICE00Futures,
        setOptionCopyFromUsersBasicSetupsDictionary: setOptionCopyFromUsersBasicSetupsDictionary,
        setFutureCopyFromUsersBasicSetupsDictionary: setFutureCopyFromUsersBasicSetupsDictionary,
        setCopyFromUserScreenSheetsDictionary: setCopyFromUserScreenSheetsDictionary,
        setICEProducts: setICEProducts,
        setProductNameDictionaries: setProductNameDictionaries,
        getOptionName: getOptionName,
        getFutureName: getFutureName,
        setLicenseMap: setLicenseMap,
        setMarketDataFeedProviders: setMarketDataFeedProviders,
        setMarketDataFeedSubscriptionLimits: setMarketDataFeedSubscriptionLimits,
        setProductsAndUnderliers: setProductsAndUnderliers,
        setUserInfo: setUserInfo,
        setUserInformationDictionary: setUserInformationDictionary,
        setUsersHavingProducts: setUsersHavingProducts,
        setValuationServiceDictionary: setValuationServiceDictionary,
        getCancellationReason: getCancellationReason,
        canUseValuationService: canUseValuationService,
        setCurrentUsername: setCurrentUsername,
        setLoggedInUserPermissions: setLoggedInUserPermissions,
        getLoggedInUserPermissions: getLoggedInUserPermissions,
        getCurrentUserInfo: getCurrentUserInfo,
        getCopyScreenSheetsToAdd: getCopyScreenSheetsToAdd,
        clearCopyScreenSheetsToAdd: clearCopyScreenSheetsToAdd,
        getCopyScreenSheetsToRemove: getCopyScreenSheetsToRemove,
        clearCopyScreenSheetsToRemove: clearCopyScreenSheetsToRemove,
        getAllScreenSheets: getAllScreenSheets,
        getCurrentUserEmail: getCurrentUserEmail,
        setCurrentUserEmail: setCurrentUserEmail,
        invalidateBasicSetupsDictionaries: invalidateBasicSetupsDictionaries,
        unignoreWarnings: unignoreWarnings,
        ignoreWarnings: ignoreWarnings,
        shouldIgnoreWarnings: shouldIgnoreWarnings,
        addToUserInformationDictionary: addToUserInformationDictionary,
        getAllOptionCodesHavingScreenSheets: getAllOptionCodesHavingScreenSheets,
        setICE00OptionBaseOptionsPairs: setICE00OptionBaseOptionsPairs,
        getICE00OptionBaseOptionsPairs: getICE00OptionBaseOptionsPairs
    };
});


