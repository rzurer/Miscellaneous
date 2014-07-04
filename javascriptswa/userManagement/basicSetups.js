/*globals console, $, define*/
define(['userManagement/localDataStore', 'htmlHelper', 'common'], function (localDataStore, htmlHelper, common) {
    "use strict";
    var eventListener,
        basicSetupsContainer = $("#basicSetupsContainer"),
        copyBasicSetupsFromUserSelect = $("#copyBasicSetupsFromUserSelect"),
        clearAllBasicSetupsButton = $("#clearAllBasicSetupsButton"),
        copyBasicSetupsFromUserLabel = $("#copyBasicSetupsFromUserLabel"),
        selectedSpanClassName = 'redLabel',
        selectedContainerClassName = 'selectedProduct',
        unselectedContainerClassName = 'unselectedProduct',
        getUnselectedSpanClassName = function (securityType) {
            return securityType === 'Option' ? 'greenLabel' : 'blueLabel';
        },
        formatControl = function (span, securityType, isSelected) {
            var container, unselectedSpanClassName, spanClassName, containerClassName;
            container = span.closest('div');
            unselectedSpanClassName = getUnselectedSpanClassName(securityType);
            span.removeClass(unselectedSpanClassName + ' ' + selectedSpanClassName);
            container.removeClass(selectedContainerClassName + ' ' + unselectedContainerClassName);
            spanClassName = isSelected ? selectedSpanClassName : unselectedSpanClassName;
            containerClassName = isSelected ? selectedContainerClassName : unselectedContainerClassName;
            span.addClass(spanClassName);
            container.addClass(containerClassName);
        },
        selectDeselectProduct = function (securityType) {
            var span, copyFromUser, product;
            span = $(this).prev('span.copyBasicSetupLabel');
            copyFromUser = $(this).val();
            product = span.text();
            formatControl(span, securityType, copyFromUser);
            if (copyFromUser) {
                addCopyBasicSetup(securityType, copyFromUser, product);
                return;
            }
            removeCopyBasicSetup(securityType, product);
        },
        createCopyBasicSetupControl = function (product, traders, securityType) {
            var container, span, select;
            container = $('<div>').addClass('copyBasicSetupControl');
            span = $('<span>').text(product).addClass('copyBasicSetupLabel ' + getUnselectedSpanClassName(securityType));
            select = htmlHelper.createSelect('', 'styledSmall copyBasicSetupSelect');
            select.bind('change', function () {
                selectDeselectProduct.apply(this, [securityType]);
            });
            htmlHelper.fillSelectFromList(select, 'Copy From', traders);
            container.append(span);
            container.append(select);
            return container;
        },
        createCopyBasicSetupControls = function (dictionary, securityType) {
            var prop, controls;
            controls = [];
            for (prop in dictionary) {
                if (dictionary.hasOwnProperty(prop)) {
                    controls.push(createCopyBasicSetupControl(prop, dictionary[prop], securityType));
                }
            }
            return controls;
        },
        createCopyBasicSetupsTable = function (dictionary, tableClassname, securityType) {
            var controls;
            controls = createCopyBasicSetupControls(dictionary, securityType);
            return htmlHelper.createFixedColumnsTable(controls, 4, 'copyBasicSetupsTable ' + tableClassname);
        },
        createCopyBasicOptionSetupsTable = function () {
            var optionsTable;
            $('.optionsTable').remove();
            optionsTable = createCopyBasicSetupsTable(localDataStore.getOptionCopyFromUsersBasicSetupsDictionary(), 'optionsTable', 'Option');
            applyExistingCopySetups(localDataStore.getCopyBasicOptionSetups(), optionsTable, 'Option');
            basicSetupsContainer.append(optionsTable);
            $('.futuresTable').hide();
            $('.optionsTab').trigger('click');
        },
        createCopyBasicFutureSetupsTable = function () {
            var futuresTable;
            $('.futuresTable').remove();
            futuresTable = createCopyBasicSetupsTable(localDataStore.getFutureCopyFromUsersBasicSetupsDictionary(), 'futuresTable', 'Future');
            applyExistingCopySetups(localDataStore.getCopyBasicFutureSetups(), futuresTable, 'Future');
            basicSetupsContainer.append(futuresTable);
            $('.optionsTable').hide();
            $('.futuresTab').trigger('click');
        },
        removeCopyBasicOptionSetup = function (product) {
            var updateFunction, index;
            updateFunction = function (userInfo) {
                index = common.getIndexOfArrayItem(userInfo.CopyBasicOptionSetups, "Key", product);
                if (index !== -1) {
                    userInfo.CopyBasicOptionSetups.splice(index, 1);
                }
                return userInfo;
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicOptionSetupsTable, 'removeCopyBasicOptionSetup']);
        },
        refreshCopyBasicOptionSetupsTable = function () {
            var optionsCsv, callback, trader;
            optionsCsv = common.arrayToCsv(localDataStore.getWriteOnlyUserInfo().UserOptions.sort());
            callback = function (response) {
                if (!response.Success) {
                    eventListener.fire("FailedResponse", [response.Message]);
                    return;
                }
                localDataStore.setCopyFromUserBasicOptionSetupsDictionary(response.Payload.CopyFromUserOptionsDictionary);
                localDataStore.setOptionCopyFromUsersBasicSetupsDictionary(response.Payload.OptionCopyFromUsersDictionary);
                createCopyBasicOptionSetupsTable();
                eventListener.fire("HideLoadingMessage");
            };
            trader = localDataStore.getCurrentUsername();
            eventListener.fire("GetBasicOptionSetupsDictionaries", [trader, optionsCsv, callback]);
        },

        refreshCopyBasicFutureSetupsTable = function () {
            var futuresCsv, callback, trader;
            futuresCsv = common.arrayToCsv(localDataStore.getWriteOnlyUserInfo().UserFutures.sort());
            callback = function (response) {
                if (!response.Success) {
                    eventListener.fire("FailedResponse", [response.Message]);
                    return;
                }
                localDataStore.setCopyFromUserBasicFutureSetupsDictionary(response.Payload.CopyFromUserFuturesDictionary);
                localDataStore.setFutureCopyFromUsersBasicSetupsDictionary(response.Payload.FutureCopyFromUsersDictionary);

                createCopyBasicFutureSetupsTable();
                eventListener.fire("HideLoadingMessage");
            };
            trader = localDataStore.getCurrentUsername();
            eventListener.fire("GetBasicFutureSetupsDictionaries", [trader, futuresCsv, callback]);
        },
        removeCopyBasicFutureSetup = function (product, copyFromUser) {
            var updateFunction, index;
            updateFunction = function (userInfo) {
                index = common.getIndexOfArrayItem(userInfo.CopyBasicFutureSetups, "Key", product);
                if (index !== -1) {
                    userInfo.CopyBasicFutureSetups.splice(index, 1);
                }
                userInfo.CopyBasicFutureSetups.push({ Key: product, Value: copyFromUser });
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicFutureSetupsTable, 'removeCopyBasicFutureSetup']);
        },
        removeCopyBasicSetup = function (securityType, product) {
            if (securityType === 'Option') {
                removeCopyBasicOptionSetup(product);
                return;
            }
            removeCopyBasicFutureSetup(product);
        },
        updateUserOptionsAndFuturesForBaseOptionCode = function (optionCode, baseOptionCode, userInfo) {
            var optionUnderliers, underlierUnderliers;
            if (baseOptionCode && userInfo.UserOptions.indexOf(baseOptionCode) === -1) {
                userInfo.UserOptions.push(baseOptionCode);
                userInfo.OptionBaseOptionPairs.push({ Key: optionCode, Value: baseOptionCode });
                optionUnderliers = localDataStore.getOptionUnderliers(baseOptionCode);
                if (optionUnderliers && optionUnderliers.length > 0) {
                    optionUnderliers.forEach(function (underlier) {
                        userInfo.UserFutures.push(underlier);
                        underlierUnderliers = localDataStore.getFutureUnderliers(underlier);
                        if (underlierUnderliers && underlierUnderliers.length > 0) {
                            underlierUnderliers.forEach(function (underlierUnderlier) {
                                userInfo.UserFutures.push(underlierUnderlier);
                            });
                        }
                    });
                }
            }
        },
        addCopyBasicOptionSetup = function (keyValuePair) {
            var updateFunction, index, callback, username, optionCode;
            username = keyValuePair.Value;
            optionCode = keyValuePair.Key;
            callback = function (baseOptionCode) {
                updateFunction = function (userInfo) {
                    updateUserOptionsAndFuturesForBaseOptionCode(optionCode, baseOptionCode, userInfo);
                    index = common.getIndexOfArrayItem(userInfo.CopyBasicOptionSetups, "Key", keyValuePair.Key);
                    if (index !== -1) {
                        userInfo.CopyBasicOptionSetups.splice(index, 1);
                    }
                    userInfo.CopyBasicOptionSetups.push(keyValuePair);
                    return userInfo;
                };
                eventListener.fire("Persist", [updateFunction, refreshCopyBasicOptionSetupsTable, 'addCopyBasicOptionSetup']);
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("GetBaseOptionForUser", [username, optionCode, callback]);
        },
        addCopyBasicFutureSetup = function (keyValuePair) {
            var updateFunction, index;
            updateFunction = function (userInfo) {
                index = common.getIndexOfArrayItem(userInfo.CopyBasicFutureSetups, "Key", keyValuePair.Key);
                if (index !== -1) {
                    userInfo.CopyBasicFutureSetups.splice(index, 1);
                }
                userInfo.CopyBasicFutureSetups.push(keyValuePair);
                return userInfo;
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicFutureSetupsTable, 'addCopyBasicFutureSetup']);
        },
        removeOrAddCopyBasicOptionSetups = function (copyFromUser, products, removeOnly) {
            var updateFunction, index, callback, baseOptionCode;
            if (!products || products.length === 0) {
                return;
            }
            callback = function (optionBaseOptionsPairs) {
                updateFunction = function (userInfo) {
                    products.forEach(function (product) {
                        index = common.getIndexOfArrayItem(optionBaseOptionsPairs, 'Key', product);
                        if (index !== -1) {
                            baseOptionCode = optionBaseOptionsPairs[index].Value;
                        }
                        if (baseOptionCode && userInfo.UserOptions.indexOf(baseOptionCode) === -1) {
                            updateUserOptionsAndFuturesForBaseOptionCode(product, baseOptionCode, userInfo);
                            userInfo.OptionBaseOptionPairs.push({ Key: product, Value: baseOptionCode });
                        }
                        index = common.getIndexOfArrayItem(userInfo.CopyBasicOptionSetups, "Key", product);
                        if (index !== -1) {
                            userInfo.CopyBasicOptionSetups.splice(index, 1);
                        }
                        if (!removeOnly) {
                            userInfo.CopyBasicOptionSetups.push({ Key: product, Value: copyFromUser });
                        }
                    });
                    return userInfo;
                };
                eventListener.fire("ShowLoadingMessage");
                eventListener.fire("Persist", [updateFunction, refreshCopyBasicOptionSetupsTable, 'removeOrAddCopyBasicOptionSetups']);
            };
            eventListener.fire("GetBaseOptionsForUser", [copyFromUser, callback]);
        },
        removeOrAddCopyBasicFutureSetups = function (copyFromUser, products, removeOnly) {
            var updateFunction, index;
            if (!products || products.length === 0) {
                return;
            }
            updateFunction = function (userInfo) {
                products.forEach(function (product) {
                    index = common.getIndexOfArrayItem(userInfo.CopyBasicFutureSetups, "Key", product);
                    if (index !== -1) {
                        userInfo.CopyBasicFutureSetups.splice(index, 1);
                    }
                    if (!removeOnly) {
                        userInfo.CopyBasicFutureSetups.push({ Key: product, Value: copyFromUser });
                    }
                });
                return userInfo;
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicFutureSetupsTable, 'removeOrAddCopyBasicFutureSetups']);
        },
        removeAllCopyBasicOptionSetups = function () {
            var updateFunction;
            updateFunction = function (userInfo) {
                userInfo.CopyBasicOptionSetups = [];
                return userInfo;
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicOptionSetupsTable, 'removeAllCopyBasicOptionSetups']);
        },
        removeAllCopyBasicFutureSetups = function () {
            var updateFunction;
            updateFunction = function (userInfo) {
                userInfo.CopyBasicFutureSetups = [];
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, refreshCopyBasicFutureSetupsTable, 'removeAllCopyBasicFutureSetups']);
        },
        fillCopyBasicSetupsFromUserSelect = function (securityType) {
            var list, changeHandler, clearAllSetupsButtonHandler;
            if (securityType === 'Option') {
                list = common.getPropertiesArray(localDataStore.getCopyFromUserBasicOptionSetupsDictionary());
                changeHandler = copyAllOptionSetupsFromUser;
                clearAllSetupsButtonHandler = removeAllCopyBasicOptionSetups;
            } else {
                list = common.getPropertiesArray(localDataStore.getCopyFromUserBasicFutureSetupsDictionary());
                changeHandler = copyAllFutureSetupsFromUser;
                clearAllSetupsButtonHandler = removeAllCopyBasicFutureSetups;
            }
            htmlHelper.fillSelectFromList(copyBasicSetupsFromUserSelect, '', list, '< select >');
            copyBasicSetupsFromUserSelect.off('change');
            copyBasicSetupsFromUserSelect.on('change', changeHandler);
            clearAllBasicSetupsButton.off('click');
            clearAllBasicSetupsButton.on('click', clearAllSetupsButtonHandler);
        },
        appendHeader = function (container, headerWidth, optionsDictionary, futuresDictionary) {
            var securityTypeHeader, optionsTab, futuresTab, hasFutures, hasOptions, keys;
            securityTypeHeader = $('<div>').attr('id', 'productsNavigation').css('width', headerWidth);
            optionsTab = $('<div>').text('Copy Basic Options Setup').css('width', '47.5%').addClass('optionsTab');
            futuresTab = $('<div>').text('Copy Basic Futures Setup').css('width', '47.5%').addClass('futuresTab');
            securityTypeHeader.append(optionsTab);
            securityTypeHeader.append(futuresTab);
            futuresTab.addClass('disabledLabel');
            keys = Object.keys(optionsDictionary);
            hasOptions = keys.length > 1 || (keys.length === 1 && keys[0]);
            optionsTab.bind('click', function () {
                optionsTab.removeClass('disabledLabel');
                futuresTab.addClass('disabledLabel');
                if (hasOptions) {
                    $('.optionsTable').show();
                } else {
                    $('.optionsTable').hide();
                }
                $('.futuresTable').hide();
                fillCopyBasicSetupsFromUserSelect("Option");
                copyBasicSetupsFromUserLabel.text('Copy basic option setups from:');
            });
            keys = Object.keys(futuresDictionary);
            hasFutures = keys.length > 1 || (keys.length === 1 && keys[0]);
            futuresTab.bind('click', function () {
                optionsTab.addClass('disabledLabel');
                futuresTab.removeClass('disabledLabel');
                $('.optionsTable').hide();
                if (hasFutures) {
                    $('.futuresTable').show();
                } else {
                    $('.futuresTable').hide();
                }
                fillCopyBasicSetupsFromUserSelect("Future");
                copyBasicSetupsFromUserLabel.text('Copy basic future setups from:');
            });
            container.append(securityTypeHeader);
        },
        applyExistingCopySetups = function (setups, table, securityType) {
            if (!setups || setups.length === 0) {
                return;
            }
            setups.forEach(function (setup) {
                var select, spans, span;
                spans = table.find('span');
                spans.each(function () {
                    span = $(this);
                    if (setup.Key === span.text()) {
                        select = span.next('select.copyBasicSetupSelect');
                        select.val(setup.Value);
                        formatControl(span, securityType, true);
                    }
                });
            });
        },
        createCopyBasicSetupsTables = function (copyBasicOptionSetups, copyBasicFutureSetups) {
            var optionsTable, futuresTable, optionsDictionary, futuresDictionary;
            basicSetupsContainer.empty();
            optionsDictionary = localDataStore.getOptionCopyFromUsersBasicSetupsDictionary();
            futuresDictionary = localDataStore.getFutureCopyFromUsersBasicSetupsDictionary();
            optionsTable = createCopyBasicSetupsTable(optionsDictionary, 'optionsTable', 'Option');
            futuresTable = createCopyBasicSetupsTable(futuresDictionary, 'futuresTable', 'Future');
            applyExistingCopySetups(copyBasicOptionSetups, optionsTable, 'Option');
            applyExistingCopySetups(copyBasicFutureSetups, futuresTable, 'Future');
            appendHeader(basicSetupsContainer, 880, optionsDictionary, futuresDictionary);
            optionsTable.hide();
            futuresTable.hide();
            basicSetupsContainer.append(optionsTable);
            basicSetupsContainer.append(futuresTable);
            $('.optionsTab').trigger('click');
        },
        addCopyBasicSetup = function (securityType, copyFromUser, product) {
            var keyValuePair;
            keyValuePair = { Key: product, Value: copyFromUser };
            if (securityType === 'Option') {
                addCopyBasicOptionSetup(keyValuePair);
                return;
            }
            addCopyBasicFutureSetup(keyValuePair);
        },
        getBasicFutureSetupsDictionary = function (trader, futuresCsv, copyBasicOptionSetups, copyBasicFutureSetups) {
            var callback;
            callback = function (response) {
                if (!response.Success) {
                    eventListener.fire("FailedResponse", [response.Message]);
                    return;
                }
                fillCopyBasicSetupsFromUserSelect("Option");
                localDataStore.setCopyFromUserBasicFutureSetupsDictionary(response.Payload.CopyFromUserFuturesDictionary);
                localDataStore.setFutureCopyFromUsersBasicSetupsDictionary(response.Payload.FutureCopyFromUsersDictionary);
                createCopyBasicSetupsTables(copyBasicOptionSetups, copyBasicFutureSetups);
                eventListener.fire("HideLoadingMessage");
            };
            eventListener.fire("GetBasicFutureSetupsDictionaries", [trader, futuresCsv, callback]);
        },
        copyAllOptionSetupsFromUser = function () {
            var products, copyFromUser;
            copyFromUser = $(this).val();
            if (!copyFromUser) {
                return;
            }
            products = localDataStore.getCopyOptionSetups(copyFromUser);
            removeOrAddCopyBasicOptionSetups(copyFromUser, products);
        },
        copyAllFutureSetupsFromUser = function () {
            var products, copyFromUser;
            copyFromUser = $(this).val();
            if (!copyFromUser) {
                return;
            }
            products = localDataStore.getCopyFutureSetups(copyFromUser);
            removeOrAddCopyBasicFutureSetups(copyFromUser, products);
        },
        showInitialCopyBasicSetups = function () {
            var trader, optionsCsv, futuresCsv, callback, getWriteOnlyUserInfo, copyBasicOptionSetups, copyBasicFutureSetups;
            eventListener.fire("ShowLoadingMessage");
            if (localDataStore.getCopyFromUserBasicOptionSetupsDictionary() && localDataStore.getCopyFromUserBasicFutureSetupsDictionary()) {
                refreshCopyBasicFutureSetupsTable();
                refreshCopyBasicOptionSetupsTable();
                eventListener.fire("HideLoadingMessage");
                return;
            }
            trader = localDataStore.getCurrentUsername();
            getWriteOnlyUserInfo = localDataStore.getWriteOnlyUserInfo();
            optionsCsv = common.arrayToCsv(getWriteOnlyUserInfo.UserOptions.sort());
            futuresCsv = common.arrayToCsv(getWriteOnlyUserInfo.UserFutures.sort());
            callback = function (response) {
                if (!response.Success) {
                    eventListener.fire("FailedResponse", [response.Message]);
                    return;
                }
                copyBasicOptionSetups = localDataStore.getCopyBasicOptionSetups();
                copyBasicFutureSetups = localDataStore.getCopyBasicFutureSetups();
                localDataStore.setCopyFromUserBasicOptionSetupsDictionary(response.Payload.CopyFromUserOptionsDictionary);
                localDataStore.setOptionCopyFromUsersBasicSetupsDictionary(response.Payload.OptionCopyFromUsersDictionary);
                getBasicFutureSetupsDictionary(trader, futuresCsv, copyBasicOptionSetups, copyBasicFutureSetups);
            };
            eventListener.fire("GetBasicOptionSetupsDictionaries", [trader, optionsCsv, callback]);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("ShowCopyBasicSetups", showInitialCopyBasicSetups);
            eventListener.addListener("ShowCopyBasicSetups", showInitialCopyBasicSetups);
        };
    return {
        initializeEventListener: initializeEventListener
    };
});
