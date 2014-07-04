/*globals $, define */
define(['userManagement/localDataStore', 'htmlHelper', 'common'], function (localDataStore, htmlHelper, common) {
    "use strict";
    var eventListener,
        eSignalMarketDataFeedProviderID = '5DBB7EA7-9EB8-478A-83E4-BB28EEAFA5F2',
        marketDataFeedProviderSelect = $("#marketDataFeedProviderSelect"),
        marketDataFeedSubscriptionLimitsSelect = $("#marketDataFeedSubscriptionLimitsSelect"),
        subscriptionLimitContainer = $('#subscriptionLimitContainer'),
        eSignalSpecific = $('#eSignalSpecific'),
        userNameTextEntry = $('#userNameTextEntry'),
        passwordTextEntry = $('#passwordTextEntry'),
        proxyAddressTextEntry = $('#proxyAddressTextEntry'),
        proxyPortTextEntry = $('#proxyPortTextEntry'),
        proxyUserNameTextEntry = $('#proxyUserNameTextEntry'),
        proxyPasswordTextEntry = $('#proxyPasswordTextEntry'),
        initializeMarketDataFeedProviderType = function () {
            var marketDataFeedProviderTypeID, marketDataFeedInformation;
            marketDataFeedInformation = localDataStore.getMarketDataFeedInformation();
            marketDataFeedProviderTypeID = marketDataFeedInformation.MarketDataFeedProviderTypeID;
            marketDataFeedProviderSelect.val(marketDataFeedProviderTypeID);
            userNameTextEntry.val(marketDataFeedInformation.MarketDataFeedUserName);
            passwordTextEntry.val(marketDataFeedInformation.MarketDataFeedPassword);
            proxyAddressTextEntry.val(marketDataFeedInformation.MarketDataFeedProxyAddress);
            proxyPortTextEntry.val(marketDataFeedInformation.MarketDataFeedProxyPort);
            proxyUserNameTextEntry.val(marketDataFeedInformation.MarketDataFeedProxyUserName);
            proxyPasswordTextEntry.val(marketDataFeedInformation.MarketDataFeedProxyPassword);
            //DO NOT put setMarketDataFeedProviderInformationn here
        },
        initializeMarketDataFeedSubscriptionLimit = function () {
            var marketDataFeedInformation, marketDataFeedSubscriptionLimitID;
            marketDataFeedInformation = localDataStore.getMarketDataFeedInformation();
            marketDataFeedSubscriptionLimitID = marketDataFeedInformation.MarketDataFeedSubscriptionLimitID;
            marketDataFeedSubscriptionLimitsSelect.val(marketDataFeedSubscriptionLimitID);
            marketDataFeedSubscriptionLimitsSelect.trigger('change', [null, null, 'initializeMarketDataFeedSubscriptionLimit']);
        },
        setMarketDataFeedProviderInformation = function (licenseTypeID, callback) {
            var marketDataFeedProviderTypeID, propertyValuePairs, updateFunction, persistCallback, marketDataFeedProviderType;
            if (!localDataStore.canModify(licenseTypeID)) {
                marketDataFeedProviderSelect.val('');
            }
            marketDataFeedProviderTypeID = marketDataFeedProviderSelect.val();
            persistCallback = function () {
                if (!marketDataFeedProviderTypeID) {
                    marketDataFeedSubscriptionLimitsSelect.val('');
                    marketDataFeedSubscriptionLimitsSelect.trigger('change', [null, callback, 'setMarketDataFeedProviderInformation1']);
                    subscriptionLimitContainer.hide();
                } else {
                    subscriptionLimitContainer.show();
                }
                if (marketDataFeedProviderTypeID && marketDataFeedProviderTypeID.toUpperCase() === eSignalMarketDataFeedProviderID) {
                    eSignalSpecific.fadeIn('slow');
                    userNameTextEntry.focus();
                    common.safeCallback(callback);
                    return;
                }
                common.safeCallback(callback);
                eSignalSpecific.fadeOut('slow');
            };
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedProviderTypeID', value: marketDataFeedProviderTypeID}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                marketDataFeedProviderType = localDataStore.getMarketDataFeedInformation().MarketDataFeedProviderType;
                propertyValuePairs = [{ property: 'MarketDataFeedProviderType', value: marketDataFeedProviderType}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, persistCallback, 'setMarketDataFeedProviderInformation']);
        },
        fillMarketDataFeedProviderSelect = function (licenseTypeID, callback) {
            var marketDataFeedInformation, marketDataFeedProviders;
            marketDataFeedProviders = localDataStore.getMarketDataFeedProviders(licenseTypeID);
            htmlHelper.fillSelectFromKeyValuePairs(marketDataFeedProviderSelect, "Choose a market data feed provider", marketDataFeedProviders, '< none >');
            marketDataFeedInformation = localDataStore.getMarketDataFeedInformation();
            marketDataFeedProviderSelect.val(marketDataFeedInformation.MarketDataFeedProviderTypeID);
            setMarketDataFeedProviderInformation(licenseTypeID, callback);
        },
        fillMarketDataFeedSubscriptionLimitsSelect = function (marketDataFeedSubscriptionLimits) {
            htmlHelper.fillSelectFromKeyValuePairs(marketDataFeedSubscriptionLimitsSelect, "Choose a market data feed subscription limit", marketDataFeedSubscriptionLimits, '< none >');
        },
        populateMarketDataFeedSubscriptionLimits = function (response) {
            localDataStore.setMarketDataFeedSubscriptionLimits(response, fillMarketDataFeedSubscriptionLimitsSelect);
        },
        initializeControls = function (callback) {
            initializeMarketDataFeedProviderType();
            initializeMarketDataFeedSubscriptionLimit();
            common.safeCallback(callback);
        },
        setMarketDataFeedSubscriptionLimitsInformation = function (e, callback) {
            var marketDataFeedSubscriptionLimitID, marketDataFeedSubscriptionLimit, propertyValuePairs, updateFunction;
            marketDataFeedSubscriptionLimitID = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedSubscriptionLimitID', value: marketDataFeedSubscriptionLimitID}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                marketDataFeedSubscriptionLimit = localDataStore.getMarketDataFeedInformation().MarketDataFeedSubscriptionLimit;
                propertyValuePairs = [{ property: 'MarketDataFeedSubscriptionLimit', value: marketDataFeedSubscriptionLimit}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, callback, 'setMarketDataFeedSubscriptionLimitsInformation']);
        },
        setMarketDataFeedUserName = function () {
            var propertyValuePairs, marketDataFeedUserName, updateFunction;
            marketDataFeedUserName = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedUserName', value: marketDataFeedUserName}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setMarketDataFeedUserName']);
        },
        setMarketDataFeedPassword = function () {
            var propertyValuePairs, marketDataFeedPassword, updateFunction;
            marketDataFeedPassword = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedPassword', value: marketDataFeedPassword}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, "setMarketDataFeedPassword"]);
        },
        setMarketDataFeedProxyAddress = function () {
            var propertyValuePairs, marketDataFeedProxyAddress, updateFunction;
            marketDataFeedProxyAddress = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedProxyAddress', value: marketDataFeedProxyAddress}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setMarketDataFeedProxyAddress']);
        },
        setMarketDataFeedProxyPort = function () {
            var propertyValuePairs, marketDataFeedProxyPort, updateFunction;
            marketDataFeedProxyPort = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedProxyPort', value: marketDataFeedProxyPort}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setMarketDataFeedProxyPort']);
        },
        setMarketDataFeedProxyUserName = function () {
            var propertyValuePairs, marketDataFeedProxyUserName, updateFunction;
            marketDataFeedProxyUserName = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedProxyUserName', value: marketDataFeedProxyUserName}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setMarketDataFeedProxyUserName']);
        },
        setMarketDataFeedProxyPassword = function () {
            var propertyValuePairs, marketDataFeedProxyPassword, updateFunction;
            marketDataFeedProxyPassword = $(this).val();
            updateFunction = function (userInfo) {
                propertyValuePairs = [{ property: 'MarketDataFeedProxyPassword', value: marketDataFeedProxyPassword}];
                localDataStore.updateUserInfo(propertyValuePairs, userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, null, 'setMarketDataFeedProxyPassword']);
        },
        isAlphanumericOrPeriodOrUnderscore = function (e) {
            return common.isLetterOrNumberOrSpecifiedKeyCode(e, [95, 46]);
        },
        assignEventHandlers = function () {
            marketDataFeedSubscriptionLimitsSelect.off('change', setMarketDataFeedSubscriptionLimitsInformation);
            marketDataFeedSubscriptionLimitsSelect.on('change', setMarketDataFeedSubscriptionLimitsInformation);
            marketDataFeedProviderSelect.off('change', setMarketDataFeedProviderInformation);
            marketDataFeedProviderSelect.on('change', setMarketDataFeedProviderInformation);
            userNameTextEntry.off('keypress');
            userNameTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            userNameTextEntry.off('blur', setMarketDataFeedUserName);
            userNameTextEntry.on('blur', setMarketDataFeedUserName);
            passwordTextEntry.off('keypress');
            passwordTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            passwordTextEntry.off('blur', setMarketDataFeedPassword);
            passwordTextEntry.on('blur', setMarketDataFeedPassword);
            proxyPortTextEntry.off('keypress');
            proxyPortTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            proxyPortTextEntry.off('blur', setMarketDataFeedProxyPort);
            proxyPortTextEntry.on('blur', setMarketDataFeedProxyPort);
            proxyAddressTextEntry.off('keypress');
            proxyAddressTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            proxyAddressTextEntry.off('blur', setMarketDataFeedProxyAddress);
            proxyAddressTextEntry.on('blur', setMarketDataFeedProxyAddress);
            proxyUserNameTextEntry.off('keypress');
            proxyUserNameTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            proxyUserNameTextEntry.off('blur', setMarketDataFeedProxyUserName);
            proxyUserNameTextEntry.on('blur', setMarketDataFeedProxyUserName);
            proxyPasswordTextEntry.off('keypress');
            proxyPasswordTextEntry.on('keypress', isAlphanumericOrPeriodOrUnderscore);
            proxyPasswordTextEntry.off('blur', setMarketDataFeedProxyPassword);
            proxyPasswordTextEntry.on('blur', setMarketDataFeedProxyPassword);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("RefreshMarketDataFeedProviders", fillMarketDataFeedProviderSelect);
            eventListener.addListener("RefreshMarketDataFeedProviders", fillMarketDataFeedProviderSelect);
        };
    return {
        assignEventHandlers: assignEventHandlers,
        initializeEventListener: initializeEventListener,
        populateMarketDataFeedSubscriptionLimits: populateMarketDataFeedSubscriptionLimits,
        initializeControls: initializeControls
    };
});
