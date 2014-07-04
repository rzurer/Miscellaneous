/*globals $, window, define*/
define(['userManagement/localDataStore', 'common', 'htmlHelper'], function (localDataStore, common, htmlHelper) {
    "use strict";
    var eventListener,
        productsContainer = $("#productsContainer"),
        productsToaster = $('#productsToaster'),
        copyProductsFromUserSelect = $("#copyProductsFromUserSelect"),
        clearAllProductsButton = $("#clearAllProductsButton"),
        copyProductsFromUserLabel = $("#copyProductsFromUserLabel"),
        searchProducts = function (e) {
            var searchTerm, searchClass, matches, match, partialMatches;
            searchTerm = $(this).val().toUpperCase();
            $(this).removeClass('searchSuccessful');
            searchClass = '';
            if ($('#optionsTable').is(":visible")) {
                searchClass = '#optionsTable span.optionControl';
            }
            if ($('#futuresTable').is(":visible")) {
                searchClass = '#futuresTable span.futureControl';
            }
            if ($('#copyOptionParametersTable').is(":visible")) {
                searchClass = '#copyOptionParametersTable span.optionControl';
            }
            if ($('#copyFuturesParametersTable').is(":visible")) {
                searchClass = '#copyFuturesParametersTable span.futureControl';
            }
            $(searchClass).removeClass('partiallyMatchedProduct');
            $(searchClass).removeClass('foundProduct');
            if (searchTerm) {
                partialMatches = $(searchClass).filter(function () { return $(this).text().indexOf(searchTerm) === 0; });
                if (partialMatches.length > 0) {
                    partialMatches.each(function () {
                        $(this).addClass('foundProduct');
                    });
                }
            }
            matches = $(searchClass).filter(function () { return $(this).text() === searchTerm; });
            if (matches.length === 1) {
                match = matches.first();
                match.addClass('foundProduct');
                $(this).addClass('searchSuccessful');
                if (e.which === 13) {
                    $(this).removeClass('searchSuccessful');
                    $(this).val('');
                    $(searchClass).removeClass('foundProduct');
                    match.trigger('click');
                }
            }
        },
        appendHeaderAndSearchControl = function (container, headerWidth, optionsTable, futuresTable, productSearchId, optionsTableVisible) {
            var securityTypeHeader, optionsTab, showOptionsTab, futuresTab, showFuturesTab, productSearchControl, productSearch, productSearchLabel;
            securityTypeHeader = $('<div>').attr('id', 'productsNavigation').css('width', headerWidth);
            optionsTab = $('<div>').text('Options').css('width', '430px').addClass('optionsTab');
            futuresTab = $('<div>').text('Futures').css('width', '430px').addClass('futuresTab');
            securityTypeHeader.append(optionsTab);
            securityTypeHeader.append(futuresTab);
            futuresTab.addClass('disabledLabel');
            productSearchControl = $('<div>').addClass('productSearchControl').css('width', (headerWidth - 28) + 'px');
            productSearchLabel = $('<span>').addClass('entryFieldLabel').text("Search:");
            productSearchControl.append(productSearchLabel);
            productSearch = $('<input>').attr({ type: 'text', id: productSearchId }).addClass('styled');
            productSearch.bind("keyup", searchProducts);
            productSearchControl.append(productSearch);
            showOptionsTab = function () {
                optionsTab.removeClass('disabledLabel');
                futuresTab.addClass('disabledLabel');
                productSearchControl.css('background-color', '#EBF7E9');
                fillCopyProductsFromUserSelect("Option");
                assignEventHandlers("Option");
                copyProductsFromUserLabel.text('Copy options from:');
                optionsTable.show();
                futuresTable.hide();
                productSearch.focus();
            };
            showFuturesTab = function () {
                optionsTab.addClass('disabledLabel');
                futuresTab.removeClass('disabledLabel');
                productSearchControl.css('background-color', "#E1EDFC");
                copyProductsFromUserLabel.text('Copy futures from:');
                fillCopyProductsFromUserSelect("Future");
                assignEventHandlers("Future");
                optionsTable.hide();
                futuresTable.show();
                productSearch.focus();
            };
            optionsTab.bind('click', showOptionsTab);
            futuresTab.bind('click', showFuturesTab);
            if (optionsTableVisible) {
                showOptionsTab();
            } else {
                showFuturesTab();
            }
            container.append(securityTypeHeader);
            container.append(productSearchControl);
        },
        showProductName = function () {
            var target, productCode, productName;
            target = $(this);
            productCode = target.find('.productSpan').text();
            productName = localDataStore.getOptionName(productCode);
            common.showToaster(target, productName, -5, 75, false, $('#productNameToaster'), -1, '', 'dimGrayColor');
        },
        hideProductName = function () {
            $('#productNameToaster').hide();
        },
        create = function (allOptions, allFutures, userOptions, userFutures, columnCount, cellWidth, headerWidth, optionsTableId, futuresTableId, productSearchId, optionsTableVisible) {
            var container, optionSpans, futureSpans, futuresTable, optionsTable, span, productName;
            optionSpans = allOptions ? allOptions.map(function (option) {
                return $('<span>').addClass('optionControl productSpan').text(option);
            }) : [];
            optionSpans.forEach(function (item) {
                span = $(item);
                if (userOptions.indexOf(span.text()) !== -1) {
                    span.addClass('selectedProduct');
                }
            });
            futureSpans = allFutures ? allFutures.map(function (future) {
                return $('<span>').addClass('futureControl productSpan').text(future);
            }) : [];
            futureSpans.forEach(function (item) {
                span = $(item);
                productName = localDataStore.getFutureName(span.text());
                if (userFutures.indexOf(span.text()) !== -1) {
                    span.addClass('selectedProduct');
                }
            });
            futuresTable = htmlHelper.createFixedColumnsTable(futureSpans, columnCount, 'productsTable', selectDeselectProduct, showProductName, hideProductName);
            futuresTable.attr('id', futuresTableId);
            futuresTable.find('td').css('width', cellWidth + 'px');
            optionsTable = htmlHelper.createFixedColumnsTable(optionSpans, columnCount, 'productsTable', selectDeselectProduct, showProductName, hideProductName);
            optionsTable.find('td').css('width', cellWidth + 'px');
            optionsTable.attr('id', optionsTableId);
            container = $('<div>');
            container.append(appendHeaderAndSearchControl(container, headerWidth, optionsTable, futuresTable, productSearchId, optionsTableVisible));
            container.append(optionsTable);
            container.append(futuresTable);
            return {
                container: container
            };
        },
        filterUserOptions = function () {
            var ice00Options, filteredOptions, userOptions, propertyValuePairs;
            userOptions = localDataStore.getUserOptions();

            ice00Options = localDataStore.getICE00Options();
            filteredOptions = [];
            ice00Options.forEach(function (ice00Option) {
                if (userOptions.indexOf(ice00Option) !== -1) {
                    filteredOptions.push(ice00Option);
                }
            });
            propertyValuePairs = [{ property: 'UserOptions', value: filteredOptions}];
            localDataStore.updateUserInfo(propertyValuePairs);
        },
        filterUserFutures = function () {
            var ice00Futures, filteredFutures, userFutures, propertyValuePairs;
            userFutures = localDataStore.getUserFutures();
            filteredFutures = [];
            ice00Futures = localDataStore.getICE00Futures();
            ice00Futures.forEach(function (ice00Future) {
                if (userFutures.indexOf(ice00Future) !== -1) {
                    filteredFutures.push(ice00Future);
                }
            });
            propertyValuePairs = [{ property: 'UserFutures', value: filteredFutures}];
            localDataStore.updateUserInfo(propertyValuePairs);
        },
        initializeProductsDisplay = function (optionsTableVisible) {
            var currentUserProducts, columnCount, cellWidth, headerWidth, allOptions, allFutures, userFutures, userOptions;
            productsContainer.empty();
            if (!localDataStore.currentUserIsDefined()) {
                return;
            }
            columnCount = 11;
            cellWidth = 70;
            headerWidth = 803;
            if (localDataStore.isFreeLicense()) {
                allOptions = localDataStore.getICEOptions();
                allFutures = localDataStore.getICEFutures();
                filterUserOptions();
                filterUserFutures();
            } else {
                allOptions = common.getPropertiesArray(localDataStore.getOptionUnderliersDictionary());
                allFutures = common.getPropertiesArray(localDataStore.getFutureUnderliersDictionary());
            }
            userFutures = localDataStore.getUserFutures();
            userOptions = localDataStore.getUserOptions();
            currentUserProducts = create(allOptions, allFutures, userOptions, userFutures, columnCount, cellWidth, headerWidth, 'optionsTable', 'futuresTable', 'productSearch', optionsTableVisible);
            productsContainer.empty();
            productsContainer.append(currentUserProducts.container);
            $('#productSearch').focus();
            eventListener.fire("HideLoadingMessage");
        },
        userOptionContainsDerivedProduct = function (derivedProducts) {
            var i, userOptions, result;
            if (derivedProducts.length === 0) {
                return false;
            }
            result = false;
            userOptions = localDataStore.getUserOptions();
            for (i = 0; i < derivedProducts.length; i += 1) {
                if (userOptions.indexOf(derivedProducts[i]) >= 0) {
                    result = true;
                }
            }
            return result;
        },
        getDerivedProducts = function (product) {
            var derivedProducts;
            derivedProducts = [];
            localDataStore.getOptionBaseOptionPairs().forEach(function (keyValuePair) {
                if (keyValuePair.Value === product) {
                    derivedProducts.push(keyValuePair.Key);
                }
            });
            return derivedProducts;
        },
        getUnderlierProducts = function (securityType, underlier) {
            var underlierOptions, underlierFutures, underlierProducts, item, j, k;
            underlierProducts = [];
            underlierOptions = localDataStore.getUnderlierOptions(underlier);
            if (underlierOptions && underlierOptions.length > 0) {
                for (k = 0; k < underlierOptions.length; k += 1) {
                    item = underlierOptions[k];
                    underlierProducts.push(item);
                }
                if (securityType === 'Option') {
                    return underlierProducts;
                }
            }
            underlierFutures = localDataStore.getUnderlierFutures(underlier);
            if (underlierFutures && underlierFutures.length > 0) {
                for (j = 0; j < underlierFutures.length; j += 1) {
                    item = underlierFutures[j];
                    if (underlierProducts.indexOf(item) === -1 && item !== underlier) {
                        underlierProducts.push(item);
                    }
                }
            }
            return underlierProducts;
        },
        removeAllOptions = function () {
            var updateFunction, callback;
            localDataStore.invalidateBasicSetupsDictionaries();
            updateFunction = function (userInfo) {
                userInfo.CopyScreenSheets = [];
                userInfo.UserOptions = [];
                userInfo.CopyBasicOptionSetups = [];
                localDataStore.setUserInfo(userInfo);
                return userInfo;
            };
            callback = function () {
                var scrollTop = $(window).scrollTop();
                initializeProductsDisplay(true);
                $(window).scrollTop(scrollTop);
            };
            eventListener.fire("Persist", [updateFunction, callback, 'removeAllOptions']);
        },
        getUnderlierInfo = function (future) {
            var underlierOptions, underlierFutures, userOptions, userFutures, index, underliesOption, futures;
            underlierOptions = localDataStore.getUnderlierOptions(future);
            underlierFutures = localDataStore.getUnderlierFutures(future);
            if ((!underlierOptions || underlierOptions.length === 0) && (!underlierFutures || underlierFutures.length === 0)) {
                return { future: future, underliesOption: false, futures: [] };
            }
            underliesOption = false;
            userOptions = localDataStore.getUserOptions();
            userOptions.forEach(function (userOption) {
                index = underlierOptions.indexOf(userOption);
                if (index !== -1) {
                    underliesOption = true;
                }
            });
            futures = [];
            userFutures = localDataStore.getUserFutures();
            userFutures.forEach(function (userFuture) {
                index = underlierFutures.indexOf(userFuture);
                if (index !== -1) {
                    futures.push(userFuture);
                }
            });
            return { future: future, underliesOption: underliesOption, futures: futures };
        },
        doRemoveAllFutures = function (futures) {
            var futuresUnderlyingNothingInfos, futuresUnderlyingOptionInfos, futuresUnderlyingFutureInfos, callback, updateFunction,
                futuresToRemove, futuresUnderlyingOptions, userFutures, index, info, canRemoveFuture, copyBasicFutureSetups;
            localDataStore.invalidateBasicSetupsDictionaries();
            callback = function () {
                var scrollTop = $(window).scrollTop();
                initializeProductsDisplay(false);
                $(window).scrollTop(scrollTop);

            };
            updateFunction = function (userInfo) {
                futuresUnderlyingOptionInfos = [];
                futuresUnderlyingFutureInfos = [];
                futuresUnderlyingNothingInfos = [];
                futures.forEach(function (future) {
                    info = getUnderlierInfo(future);
                    if (info.underliesOption) {
                        futuresUnderlyingOptionInfos.push(info);
                    }
                    if (!info.underliesOption && info.futures.length > 0) {
                        futuresUnderlyingFutureInfos.push(info);
                    }
                    if (!info.underliesOption && info.futures.length === 0) {
                        futuresUnderlyingNothingInfos.push(info);
                    }
                });
                futuresToRemove = [];
                futuresUnderlyingOptions = futuresUnderlyingOptionInfos.map(function (item) { return item.future; });
                futuresUnderlyingFutureInfos.forEach(function (futuresUnderlyingFutureInfo) {
                    canRemoveFuture = true;
                    futuresUnderlyingFutureInfo.futures.forEach(function (future) {
                        if (futuresUnderlyingOptions.indexOf(future) !== -1) {
                            canRemoveFuture = false;
                        }
                    });
                    if (canRemoveFuture) {
                        futuresToRemove.push(futuresUnderlyingFutureInfo.future);
                    }
                });
                futuresUnderlyingNothingInfos.forEach(function (futureUnderlyingNothing) {
                    if (futuresToRemove.indexOf(futureUnderlyingNothing.future) === -1) {
                        futuresToRemove.push(futureUnderlyingNothing.future);
                    }
                });
                userFutures = userInfo.UserFutures;
                copyBasicFutureSetups = userInfo.CopyBasicFutureSetups;
                futuresToRemove.forEach(function (future) {
                    index = common.getIndexOfArrayItem(copyBasicFutureSetups, "Key", future);
                    if (index !== -1) {
                        copyBasicFutureSetups.splice(index, 1);
                    }
                    index = userFutures.indexOf(future);
                    if (index !== -1) {
                        userFutures.splice(index, 1);
                    }
                });
                localDataStore.setUserInfo(userInfo);
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, callback, 'doRemoveAllFutures']);
        },
        removeAllFutures = function () {
            var callback, currentUsername;
            localDataStore.setFutureCopyFromUsersBasicSetupsDictionary(null);
            localDataStore.getCopyFromUserBasicFutureSetupsDictionary(null);
            currentUsername = localDataStore.getCurrentUsername();
            callback = function (futures) {
                futures = futures.concat(localDataStore.getUserFutures());
                doRemoveAllFutures(futures);
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("GetFuturesForUser", [currentUsername, callback]);
        },
        doAddOptions = function (userInfo, products) {
            var index, underliers, optionUnderliers, underlierUnderliers, userOptions, userFutures, i;
            userOptions = localDataStore.getUserOptions();
            userFutures = localDataStore.getUserFutures();
            products.forEach(function (product) {
                index = userOptions.indexOf(product);
                if (index === -1) {
                    userOptions.push(product);
                }
            });
            underliers = [];
            products.forEach(function (product) {
                optionUnderliers = localDataStore.getOptionUnderliers(product);
                if (optionUnderliers && optionUnderliers.length) {
                    for (i = 0; i < optionUnderliers.length; i += 1) {
                        underliers.push(optionUnderliers[i]);
                    }
                }
            });
            underliers.forEach(function (underlier) {
                index = userFutures.indexOf(underlier);

                if (index === -1) {
                    userFutures.push(underlier);
                }
                underlierUnderliers = localDataStore.getFutureUnderliers(underlier);
                underlierUnderliers.forEach(function (underlierUnderlier) {
                    index = userFutures.indexOf(underlierUnderlier);
                    if (index === -1) {
                        userFutures.push(underlierUnderlier);
                    }
                });
            });
            return userInfo;
        },
        doAddFutures = function (userInfo, products) {
            var userFutures, index, underliers, futureUnderliers, i;
            userFutures = localDataStore.getUserFutures();
            products.forEach(function (product) {
                index = userFutures.indexOf(product);
                if (index === -1) {
                    userFutures.push(product);
                }
            });
            underliers = [];
            products.forEach(function (product) {
                futureUnderliers = localDataStore.getFutureUnderliers(product);
                if (futureUnderliers && futureUnderliers.length) {
                    for (i = 0; i < futureUnderliers.length; i += 1) {
                        underliers.push(futureUnderliers[i]);
                    }
                }
            });
            underliers.forEach(function (underlier) {
                index = userFutures.indexOf(underlier);
                if (index === -1) {
                    userFutures.push(underlier);
                }
            });
            return userInfo;
        },
        addProducts = function (products, securityType, position, target) {
            var updateFunction, callback, addOptions, addFutures, excluded, filtered, iceOptions, iceFutures, message;
            if (!products || products.length === 0) {
                eventListener.fire("HideLoadingMessage");
                return;
            }
            message = '';
            addOptions = function (userInfo) {
                var iceOOOptions, iceOOOptionBaseOptionsPairs, index, baseOption;
                if (!localDataStore.isFreeLicense()) {
                    return doAddOptions(userInfo, products);
                }
                filtered = [];
                excluded = [];
                iceOOOptions = localDataStore.getICE00Options();
                iceOptions = localDataStore.getICEOptions();
                iceOOOptionBaseOptionsPairs = localDataStore.getICE00OptionBaseOptionsPairs();
                products.forEach(function (product) {
                    if (iceOOOptions.indexOf(product) !== -1) {
                        filtered.push(product);
                        index = common.getIndexOfArrayItem(iceOOOptionBaseOptionsPairs, 'Key', product);
                        if (index !== -1) {
                            baseOption = iceOOOptionBaseOptionsPairs[index].Value;
                            if (filtered.indexOf(baseOption) === -1) {
                                filtered.push(baseOption);
                            }
                        }
                    } else {
                        if (iceOptions.indexOf(product) !== -1) {
                            excluded.push(product);
                        }
                    }
                });
                if (excluded.length === 1) {
                    message = 'The option ' + excluded[0] + ' cannot be added because it must exist in the ICE00 account';
                }
                if (excluded.length > 1) {
                    message = 'The options ' + common.arrayToCsv(excluded) + ' cannot be added because they must exist in the ICE00 account';
                }
                return doAddOptions(userInfo, filtered);
            };
            addFutures = function (userInfo) {
                var iceOOFutures;
                if (!localDataStore.isFreeLicense()) {
                    return doAddFutures(userInfo, products);
                }
                filtered = [];
                excluded = [];
                iceOOFutures = localDataStore.getICE00Futures();
                iceFutures = localDataStore.getICEFutures();
                products.forEach(function (product) {
                    if (iceOOFutures.indexOf(product) !== -1) {
                        filtered.push(product);
                    } else {
                        if (iceFutures.indexOf(product) !== -1) {
                            excluded.push(product);
                        }
                    }
                });
                if (excluded.length === 1) {
                    message = 'The future ' + excluded[0] + ' cannot be added because it must exist in the ICE00 account';
                }
                if (excluded.length > 1) {
                    message = 'The futures ' + common.arrayToCsv(excluded) + ' cannot be added because they must exist in the ICE00 account';
                }
                return doAddFutures(userInfo, filtered);
            };
            if (securityType === 'Option') {
                updateFunction = addOptions;
            } else {
                updateFunction = addFutures;
            }
            localDataStore.invalidateBasicSetupsDictionaries();
            callback = function () {
                var toasterClassname, topOffset, leftOffset, scrollTop;
                scrollTop = $(window).scrollTop();
                initializeProductsDisplay(securityType === 'Option');
                $(window).scrollTop(scrollTop);
                if (message) {
                    toasterClassname = target ? '' : 'bigToaster';
                    topOffset = target ? 0 : position.top;
                    leftOffset = target ? 150 : position.left + 30;
                    common.showToaster(target, message, topOffset, leftOffset, true, productsToaster, 3000, null, toasterClassname);
                }
            };
            eventListener.fire("Persist", [updateFunction, callback, 'addProducts']);
        },
        copyAllOptionsFromUser = function () {
            var username, callback, that;
            that = $(this);
            username = that.val();
            callback = function (options) {
                addProducts(options, 'Option', null, copyProductsFromUserSelect);
                that.val(username);
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("GetOptionsForUser", [username, callback]);
        },
        copyAllFuturesFromUser = function () {
            var username, callback;
            username = $(this).val();
            callback = function (futures) {
                addProducts(futures, 'Future', null, copyProductsFromUserSelect);
                $(this).val(username);
            };
            eventListener.fire("ShowLoadingMessage");
            eventListener.fire("GetFuturesForUser", [username, callback]);
        },
        fillCopyProductsFromUserSelect = function (securityType) {
            var list = securityType === 'Option' ? localDataStore.getUsersHavingOptions() : localDataStore.getUsersHavingFutures();
            htmlHelper.fillSelectFromList(copyProductsFromUserSelect, '', list, '< select >');
        },
        assignEventHandlers = function (securityType) {
            var changeHandler, removeAllProductsButtonHandler;
            if (securityType === 'Option') {
                changeHandler = copyAllOptionsFromUser;
                removeAllProductsButtonHandler = removeAllOptions;
            } else {
                changeHandler = copyAllFuturesFromUser;
                removeAllProductsButtonHandler = removeAllFutures;
            }
            copyProductsFromUserSelect.off('change');
            copyProductsFromUserSelect.on('change', changeHandler);
            clearAllProductsButton.off('click');
            clearAllProductsButton.on('click', removeAllProductsButtonHandler);
        },
        removeProduct = function (product, securityType) {
            var updateFunction, callback, optionsTableVisible, index, commoditiesList;
            localDataStore.invalidateBasicSetupsDictionaries();
            optionsTableVisible = securityType === 'Option';
            callback = function () {
                var scrollTop = $(window).scrollTop();
                initializeProductsDisplay(optionsTableVisible);
                $(window).scrollTop(scrollTop);
            };
            updateFunction = function (userInfo) {
                commoditiesList = securityType === 'Option' ? localDataStore.getUserOptions() : localDataStore.getUserFutures();
                index = commoditiesList.indexOf(product);
                if (index !== -1) {
                    commoditiesList.splice(index, 1);
                }
                return userInfo;
            };
            eventListener.fire("Persist", [updateFunction, callback, 'removeProduct']);
        },
        getUnderlierUserProducts = function (underlierProducts, userProducts) {
            var result = [];
            if (!underlierProducts || underlierProducts.length === 0 || !userProducts || userProducts.length === 0) {
                return result;
            }
            underlierProducts.forEach(function (product) {
                if (userProducts.indexOf(product) !== -1) {
                    result.push(product);
                }
            });
            return result;
        },
        getUserProducts = function (securityType, underlier) {
            var userOptions, userFutures, userProducts, i, j, item;
            userOptions = localDataStore.getUserOptions();
            if (securityType === 'Option') {
                return userOptions;
            }
            userProducts = [];
            if (userOptions && userOptions.length) {
                for (i = 0; i < userOptions.length; i += 1) {
                    item = userOptions[i];
                    userProducts.push(item);
                }
            }
            userFutures = localDataStore.getUserFutures();
            if (userFutures && userFutures.length) {
                for (j = 0; j < userFutures.length; j += 1) {
                    item = userFutures[j];
                    if (item !== underlier) {
                        userProducts.push(item);
                    }
                }
            }
            return userProducts;
        },
        getUnderlierErrorMessage = function (underlier, securityType, callback) {
            var underlierProducts, userProducts, underlierUserProducts, i, nextToLast, last, productsMessage, productCode;
            if (securityType === 'Option') {
                callback(underlier, securityType);
                return '';
            }
            underlierProducts = getUnderlierProducts(securityType, underlier);
            userProducts = getUserProducts(securityType, underlier);
            underlierUserProducts = getUnderlierUserProducts(underlierProducts, userProducts);
            if (!underlierUserProducts || underlierUserProducts.length === 0) {
                callback(underlier, securityType);
                return '';
            }
            productsMessage = '';
            if (underlierUserProducts.length === 1) {
                return "The product '" + underlier + "' cannot be removed because it underlies the product '" + underlierUserProducts[0] + "'. ";
            }
            nextToLast = underlierUserProducts[underlierUserProducts.length - 2];
            last = underlierUserProducts[underlierUserProducts.length - 1];
            for (i = 0; i < underlierUserProducts.length - 2; i += 1) {
                productCode = underlierUserProducts[i];
                productsMessage += "'" + productCode + "', ";
            }
            productsMessage += "'" + nextToLast + "' and '" + last + "'.";
            productsMessage = "The product '" + underlier + "' cannot be removed because it underlies the products " + productsMessage + "'.";
            return productsMessage;
        },
        getIsBaseOptionErrorMessage = function (baseOption, callback) {
            var derivedProducts, productCode, productsMessage, nextToLast, last, i, userOptions, iceOOOptionBaseOptionsPairs, index, indexOfUserOption, derivedProduct;
            derivedProducts = getDerivedProducts(baseOption);
            if (localDataStore.isFreeLicense()) {
                userOptions = localDataStore.getUserOptions();
                iceOOOptionBaseOptionsPairs = localDataStore.getICE00OptionBaseOptionsPairs();
                index = common.getIndexOfArrayItem(iceOOOptionBaseOptionsPairs, 'Value', baseOption);
                if (index !== -1) {
                    indexOfUserOption = userOptions.indexOf(iceOOOptionBaseOptionsPairs[index].Key);
                    if (indexOfUserOption !== -1) {
                        derivedProduct = userOptions[indexOfUserOption];
                        if (derivedProducts.indexOf(derivedProduct) === -1) {
                            derivedProducts.push(derivedProduct);
                        }
                    }
                }
            }
            if (derivedProducts.length === 0 || !userOptionContainsDerivedProduct(derivedProducts)) {
                callback(baseOption, "Option");
                return '';
            }
            productsMessage = '';
            if (derivedProducts.length === 1) {
                return "The product '" + baseOption + "' cannot be removed because the parameters for the product '" + derivedProducts[0] + "' are based upon it. ";
            }
            nextToLast = derivedProducts[derivedProducts.length - 2];
            last = derivedProducts[derivedProducts.length - 1];
            for (i = 0; i < derivedProducts.length - 2; i += 1) {
                productCode = derivedProducts[i];
                productsMessage += "'" + productCode + "', ";
            }
            productsMessage += "'" + nextToLast + "' and '" + last + "'.";
            return "The product '" + baseOption + "' cannot be removed because the parameters for the products " + productsMessage + "are based upon it.";
        },
        selectDeselectProduct = function () {
            var span, errorMessage, product, securityType;
            errorMessage = '';
            span = $(this).find('span');
            product = span.text();
            securityType = span.hasClass('optionControl') ? 'Option' : 'Future';
            if (!span.hasClass('selectedProduct') && !span.hasClass('unselectedProduct')) {
                span.addClass('selectedProduct');
                addProducts([product], securityType, span.position());
                return;
            }
            if (span.hasClass('selectedProduct')) {
                if (securityType === 'Future') {
                    errorMessage = getUnderlierErrorMessage(product, securityType, removeProduct);
                }
                if (securityType === 'Option') {
                    errorMessage += getIsBaseOptionErrorMessage(product, removeProduct);
                }
                if (errorMessage) {
                    common.showToaster(span, errorMessage, null, 25, true, productsToaster, 3000, null, 'bigToaster');
                    return;
                }
                span.css('border', 'none');
                span.removeClass('selectedProduct');
                span.addClass('unselectedProduct');
                return;
            }
            if (span.hasClass('unselectedProduct')) {
                span.removeClass('unselectedProduct');
                span.addClass('selectedProduct');
            }
            addProducts([product], securityType, span.position());
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("ShowProducts", initializeProductsDisplay);
            eventListener.addListener("ShowProducts", initializeProductsDisplay);
        };
    return {
        initializeEventListener: initializeEventListener
    };
});