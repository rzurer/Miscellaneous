/*globals console, $, define*/
define(['userManagement/localDataStore', 'htmlHelper', 'arrayHelper', 'common', 'checkboxControl', 'pigeonKeeper'],
    function (localDataStore, htmlHelper, arrayHelper, common, checkboxControl, pigeonKeeper) {
        "use strict";
        var eventListener,
            copyScreenSheetsContainer = $('#copyScreenSheetsContainer'),
            screenSheetsHeaderContainer = $('#screenSheetsHeaderContainer'),
            currentUserScreenSheetsTableContainer = $('#currentUserScreenSheetsTableContainer'),
            copyScreenSheetsTableContainer = $('#copyScreenSheetsTableContainer'),
            screenSheetsToaster = $('#screenSheetsToaster'),
            copyScreenSheetsForOptionSelect = $('#copyScreenSheetsForOptionSelect'),
            copyScreenSheetsFromUserSelect = $('#copyScreenSheetsFromUserSelect'),
            createEditInPlaceControl = function (id, text, width, classname) {
                var control = {},
                    enterEditMode = function (ctrl) {
                        ctrl.oldValue = ctrl.write.val();
                        ctrl.read.hide();
                        ctrl.write.show();
                        ctrl.write.focus();
                        ctrl.write.select();
                    },
                    leaveEditMode = function (ctrl) {
                        ctrl.read.show();
                        ctrl.write.hide();
                    };
                control.id = id;
                control.revert = function () {
                    control.write.val(control.oldValue);
                    control.read.text(control.oldValue.replace(/\s/g, '\xA0'));
                    enterEditMode(control);
                };
                control.hasChanged = function () {
                    return control.write.val() !== control.oldValue;
                };
                control.oldValue = '';
                control.container = $('<div>').addClass('edit-in-place');
                control.container.attr("id", control.id);
                control.read = $('<span>').attr("title", "Click to edit").addClass('read').css('width', width + 'px');
                control.read.text(text.replace(/\s/g, '\xA0'));
                if (classname) {
                    control.read.addClass(classname);
                }
                control.read.click(function () {
                    enterEditMode(control);
                });
                control.write = $('<input>').attr('type', "text").addClass('write').css('width', (width - 4) + 'px').val(text);
                control.write.blur(function () {
                    var value;
                    value = control.write.val();
                    if (value.trim().length === 0) {
                        common.showToaster(control.write, "A sheet name may not be empty.", 0, 30, true, screenSheetsToaster);
                        control.write.focus();
                        return;
                    }
                    if (control.hasChanged()) {
                        renameScreenSheet(control);
                    }
                    leaveEditMode(control);
                });
                control.write.keyup(function () {
                    if (control.write.val().trim().length > 0) {
                        control.read.text(control.write.val().trim().replace(/\s/g, '\xA0'));
                    }
                });
                control.container.append(control.read, control.write);
                return control;
            },
            createScreenSheetsHeaderControl = function (currentUsername, persistedTabVisible) {
                var header, persistedScreenSheetsTab, copyScreenSheetsTab, showPersistedTab, showCopyTab;
                header = $('<div>').attr('id', 'screenSheetsNavigation');
                persistedScreenSheetsTab = $('<div>').text(currentUsername + '\'s Screen Sheets').css('width', '430px').addClass('persistedScreenSheetsTab');
                copyScreenSheetsTab = $('<div>').text('Screen Sheets to Copy').css('width', '430px').addClass('copyScreenSheetsTab');
                header.append(persistedScreenSheetsTab);
                header.append(copyScreenSheetsTab);
                copyScreenSheetsTab.addClass('disabledLabel');
                showPersistedTab = function () {
                    persistedScreenSheetsTab.removeClass('disabledLabel');
                    copyScreenSheetsTab.addClass('disabledLabel');
                    currentUserScreenSheetsTableContainer.show();
                    copyScreenSheetsContainer.hide();
                };
                showCopyTab = function () {
                    copyScreenSheetsTab.removeClass('disabledLabel');
                    persistedScreenSheetsTab.addClass('disabledLabel');
                    currentUserScreenSheetsTableContainer.hide();
                    copyScreenSheetsContainer.show();
                };
                copyScreenSheetsTab.bind('click', showCopyTab);
                persistedScreenSheetsTab.bind('click', showPersistedTab);
                if (persistedTabVisible) {
                    showPersistedTab();
                } else {
                    showCopyTab();
                }
                return header;
            },
            createTristateCheckboxCell = function (controlId, checkboxState, clickHandler, classname) {
                var cell;
                cell = htmlHelper.createCell(20);
                cell.append(checkboxControl.createTriStateCheckbox(controlId, checkboxState, clickHandler, classname));
                return cell;
            },
            createCheckboxCell = function (controlId, checkboxState, clickHandler, className) {
                var cell;
                cell = htmlHelper.createCell(20);
                cell.append(checkboxControl.createCheckbox(controlId, checkboxState, clickHandler, className));
                return cell;
            },
            getCommodityHeaderCheckboxSelectors = function () {
                var selectors = [];
                $('.commodityHeader').each(function () {
                    selectors.push('#' + this.id);
                });
                return selectors;
            },
            adjustCopyScreenSheets = function () {
                var screenSheets, indicesToRemove, i, userOptions, commodityCode;
                screenSheets = localDataStore.getCopyScreenSheets();
                userOptions = localDataStore.getWriteOnlyUserInfo().UserOptions;
                indicesToRemove = [];
                for (i = 0; i < screenSheets.length; i += 1) {
                    commodityCode = screenSheets[i].CommodityCode;
                    if (userOptions.indexOf(commodityCode) === -1) {
                        indicesToRemove.push(i);
                    }
                }
                indicesToRemove.forEach(function (index) {
                    screenSheets.splice(index, 1);
                });
            },
            getCommoditySheetNameCheckboxSelectors = function (commodityCode) {
                var selectors = [];
                $(".customCheckbox[id^='" + commodityCode + "_']").each(function () {
                    selectors.push('#' + this.id);
                });
                return selectors;
            },
            createClickHandler = function (selectorFunc, arg) {
                return function (e, checked, runCount) {
                    selectorFunc(arg).forEach(function (selector) {
                        $(selector).trigger('click', [checked, runCount, 'createClickHandler']);
                    });
                };
            },
            createScreenSheetsHeaderRow = function (currentUsername, copyFromUser, copyFromOption, checkboxState, wantCheckboxes, screenSheetsExistToCopy) {
                var row, checkboxCell, copyfromUserText, copyFromOptionText;
                row = htmlHelper.createRow('screenSheetsHeaderRow');
                if (!screenSheetsExistToCopy) {
                    return row;
                }
                if (wantCheckboxes) {
                    checkboxCell = createTristateCheckboxCell(copyFromUser, checkboxState, createClickHandler(getCommodityHeaderCheckboxSelectors));
                    row.append(checkboxCell);
                } else {
                    htmlHelper.appendCell(row);
                }
                copyfromUserText = copyFromUser ? copyFromUser + "'s Screen Sheets" : 'Screen Sheets';
                copyFromOptionText = copyFromOption ? " for " + copyFromOption : '';
                htmlHelper.appendCell(row, copyfromUserText + copyFromOptionText);
                htmlHelper.appendCell(row);
                htmlHelper.appendCell(row, currentUsername + "'s Screen Sheets");
                htmlHelper.appendCell(row);
                return row;
            },
            createCommodityCodeSubheaderRow = function (commodityCode, screenSheetsExistToCopy, checkboxState, wantCheckboxes) {
                var row, cell, checkboxCell;
                row = htmlHelper.createRow('commodityCodeSubheaderRow');
                cell = htmlHelper.createCell(null, null, true);
                if (screenSheetsExistToCopy && wantCheckboxes) {
                    checkboxCell = createTristateCheckboxCell(commodityCode, checkboxState, createClickHandler(getCommoditySheetNameCheckboxSelectors, commodityCode), 'commodityHeader');
                    cell.append(checkboxCell);
                }
                row.append(cell);
                cell = htmlHelper.createCell(null, commodityCode, true).addClass('textAlignLeft');
                cell.attr('colspan', 4);
                row.append(cell);
                return row;
            },
            initialize = function () {
                var callback, allCopyFromUsers, index, currentUsername;
                currentUsername = localDataStore.getCurrentUsername();
                eventListener.fire("ShowLoadingMessage");
                screenSheetsHeaderContainer.empty();
                screenSheetsHeaderContainer.append(createScreenSheetsHeaderControl(currentUsername, true));
                currentUserScreenSheetsTableContainer.empty();
                copyScreenSheetsTableContainer.empty();
                callback = function () {
                    allCopyFromUsers = localDataStore.getAllCopyFromUsers();
                    index = allCopyFromUsers.indexOf(currentUsername);
                    allCopyFromUsers.splice(index, 1);
                    htmlHelper.fillSelectFromList(copyScreenSheetsFromUserSelect, "Copy all screen sheets from user.", allCopyFromUsers);
                    htmlHelper.fillSelectFromList(copyScreenSheetsForOptionSelect, "Copy screen sheets for option code.", localDataStore.getAllOptionCodesHavingScreenSheets());
                    displayScreenSheetsTable();
                    eventListener.fire("HideLoadingMessage");
                };
                eventListener.fire("GetAppropriateScreenSheets", [callback]);
            },
            addCopyScreenSheet = function (copyScreenSheetToAdd, callback) {
                var copyScreenSheetsToAdd, copyScreenSheets, index;
                copyScreenSheets = localDataStore.getCopyScreenSheets();
                copyScreenSheetsToAdd = localDataStore.getCopyScreenSheetsToAdd();
                index = common.getIndexOfArrayItem(copyScreenSheetsToAdd, "SheetID", copyScreenSheetToAdd.SheetID);
                if (index === -1) {
                    copyScreenSheetsToAdd.push(copyScreenSheetToAdd);
                }
                index = common.getIndexOfArrayItem(copyScreenSheets, "SheetID", copyScreenSheetToAdd.SheetID);
                if (index === -1) {
                    copyScreenSheets.push(copyScreenSheetToAdd);
                }
                common.safeCallback(callback);
            },
            removeCopyScreenSheets = function (sheets, callback) {
                var copyScreenSheetsToRemove, index, copyScreenSheets;
                copyScreenSheetsToRemove = localDataStore.getCopyScreenSheetsToRemove();
                copyScreenSheets = localDataStore.getCopyScreenSheets();
                sheets.forEach(function (sheet) {
                    index = common.getIndexOfArrayItem(copyScreenSheetsToRemove, "SheetID", sheet.SheetID);
                    if (index === -1) {
                        copyScreenSheetsToRemove.push(sheet);
                    }
                    index = common.getIndexOfArrayItem(copyScreenSheets, "SheetID", sheet.SheetID);
                    if (index !== -1) {
                        copyScreenSheets.splice(index, 1);
                    }
                });
                common.safeCallback(callback);
            },
            removeCopyScreenSheet = function (copyScreenSheetToRemove, callback) {
                var copyScreenSheetsToRemove, index, copyScreenSheets;
                copyScreenSheets = localDataStore.getCopyScreenSheets();
                copyScreenSheetsToRemove = localDataStore.getCopyScreenSheetsToRemove();
                index = common.getIndexOfArrayItem(copyScreenSheetsToRemove, "SheetID", copyScreenSheetToRemove.SheetID);
                if (index === -1) {
                    copyScreenSheetsToRemove.push(copyScreenSheetToRemove);
                }
                index = common.getIndexOfArrayItem(copyScreenSheets, "SheetID", copyScreenSheetToRemove.SheetID);
                if (index !== -1) {
                    copyScreenSheets.splice(index, 1);
                }
                common.safeCallback(callback);
            },
            deleteScreenSheet = function (sheetID) {
                var updateFunction;
                updateFunction = function (userInfo) {
                    var indexOfDeleted, indexOfRenamed;
                    indexOfRenamed = common.getIndexOfArrayItem(userInfo.ScreenSheetsToRename, "Key", Number(sheetID));
                    if (indexOfRenamed !== -1) {
                        userInfo.ScreenSheetsToRename.splice(indexOfRenamed, 1);
                    }
                    indexOfDeleted = userInfo.ScreenSheetsToDelete.indexOf(sheetID);
                    if (indexOfDeleted === -1) {
                        userInfo.ScreenSheetsToDelete.push(sheetID);
                    }
                    return userInfo;
                };
                eventListener.fire("Persist", [updateFunction, displayScreenSheetsTable, 'deleteScreenSheet']);
            },
            renameScreenSheet = function (control) {
                var sheetID, sheetName, updateFunction, index, persistedScreenSheets, persistedScreenSheetNames, canRename;
                sheetID = control.id;
                sheetName = control.write.val();
                if (!sheetName || sheetName.length === 0) {
                    control.revert();
                    common.showToaster(control.write, "Empty sheet names are not allowed.", 0, 30, true, screenSheetsToaster);
                }
                sheetName = sheetName.trim();
                if (!sheetName || sheetName.length === 0) {
                    control.revert();
                    common.showToaster(control.write, "Empty sheet names are not allowed.", 0, 30, true, screenSheetsToaster);
                }
                persistedScreenSheets = localDataStore.getCopyFromUserScreenSheets(localDataStore.getCurrentUsername());
                index = common.getIndexOfArrayItem(persistedScreenSheets, "SheetID", Number(sheetID));
                if (index === -1) {
                    control.revert();
                    common.showToaster(control.write, "The screen sheet you are renaming does not exist.", 0, 30, true, screenSheetsToaster);
                    return;
                }
                persistedScreenSheetNames = persistedScreenSheets.map(function (screenSheet) {
                    return screenSheet.SheetName;
                });
                canRename = true;
                persistedScreenSheetNames.forEach(function (persistedScreenSheetName) {
                    if (persistedScreenSheetName.toUpperCase() === sheetName.toUpperCase() && control.hasChanged()) {
                        canRename = false;
                    }
                });
                if (!canRename) {
                    control.revert();
                    common.showToaster(control.write, "Duplicate sheet names are not allowed.", 0, 30, true, screenSheetsToaster);
                    return;
                }
                updateFunction = function (userInfo) {
                    index = common.getIndexOfArrayItem(userInfo.ScreenSheetsToRename, "Key", sheetID);
                    if (index === -1) {
                        userInfo.ScreenSheetsToRename.push({ Key: sheetID, Value: sheetName });
                    } else {
                        userInfo.ScreenSheetsToRename[index].Value = sheetName;
                    }
                    return userInfo;
                };
                eventListener.fire("Persist", [updateFunction, displayScreenSheetsTable, 'renameScreenSheet']);
            },
            getCopyFromUser = function (sheetID) {
                var index, screenSheets;
                screenSheets = localDataStore.getCopyScreenSheets();
                index = common.getIndexOfArrayItem(screenSheets, 'SheetID', sheetID);
                return index === -1 ? '' : screenSheets[index].CopyFromUser;
            },
            addRemoveCopyScreenSheet = function (target, oldCopyFromUser, oldScreenSheetID, commodityCode, screenSheetname) {
                var screenSheetID, copyFromUser, oldScreenSheet, newScreenSheet, copyScreenSheetsToRemove;
                screenSheetID = target.val();
                copyFromUser = htmlHelper.getSelectedOptionText(target);
                if (!copyFromUser) {
                    copyScreenSheetsToRemove = [];
                    var copyScreenSheets = localDataStore.getCopyScreenSheets();
                    copyScreenSheets.forEach(function (sheet) {
                        if (sheet.SheetName === screenSheetname) {
                            copyScreenSheetsToRemove.push(sheet);
                        }
                    });
                    removeCopyScreenSheets(copyScreenSheetsToRemove, displayScreenSheetsTable);
                }
                oldScreenSheet = { CopyFromUser: oldCopyFromUser, SheetID: Number(oldScreenSheetID), CommodityCode: commodityCode, SheetName: screenSheetname };
                newScreenSheet = { CopyFromUser: copyFromUser, SheetID: Number(screenSheetID), CommodityCode: commodityCode, SheetName: screenSheetname };
                if (screenSheetID) {
                    if (oldScreenSheetID) {
                        removeCopyScreenSheet(oldScreenSheet, displayScreenSheetsTable);
                    }
                    addCopyScreenSheet(newScreenSheet, displayScreenSheetsTable);
                } else {
                    removeCopyScreenSheet(oldScreenSheet, displayScreenSheetsTable);
                }
            },
            createCopyScreenSheetFromUserSelect = function (currentUsername, screenSheetPair, commodityCode, copyFromUsernameSheetIdPairs) {
                var sheetName, select, oldCopyFromUser, pair, oldScreenSheetID, index;
                sheetName = screenSheetPair.copyFromUserSheetName || '';
                select = $('<select>').addClass('styledSmall left120W').attr('id', common.getUniqueTime());
                if (screenSheetPair.isPersisted) {
                    common.disableControl(select);
                    return select;
                }
                index = common.getIndexOfArrayItem(copyFromUsernameSheetIdPairs, "Value", currentUsername);
                if (index !== -1) {
                    copyFromUsernameSheetIdPairs.splice(index, 1);
                }
                htmlHelper.fillSelectFromKeyValuePairs(select, '', copyFromUsernameSheetIdPairs);
                oldCopyFromUser = getCopyFromUser(screenSheetPair.copyFromUserSheetID);
                pair = copyFromUsernameSheetIdPairs[common.getIndexOfArrayItem(copyFromUsernameSheetIdPairs, 'Value', oldCopyFromUser)];
                oldScreenSheetID = pair ? pair.Key : '';
                select.val(oldScreenSheetID);
                select.on('change', function () {
                    addRemoveCopyScreenSheet(select, oldCopyFromUser, oldScreenSheetID, commodityCode, sheetName);
                });
                return select;
            },
            constructCheckboxCell = function (screenSheetPair, copyFromUser, commodityCode, wantCheckboxes) {
                var checkboxState, clickHandler, copyFromUserSheetID, copyFromUserSheetName;
                copyFromUserSheetName = screenSheetPair.copyFromUserSheetName;
                if (!wantCheckboxes || !copyFromUserSheetName || copyFromUserSheetName.length === 0) {
                    return null;
                }
                pigeonKeeper.initialize(displayScreenSheetsTable);
                copyFromUserSheetID = screenSheetPair.copyFromUserSheetID;
                clickHandler = function (e, checked, runCount) {
                    var screenSheetToCopy;
                    screenSheetToCopy = { CopyFromUser: copyFromUser, SheetID: Number(copyFromUserSheetID), CommodityCode: commodityCode, SheetName: copyFromUserSheetName };
                    pigeonKeeper.setRunCallbackAfter(runCount);
                    if (checked === true) {
                        pigeonKeeper.create(common.wrapFunction(addCopyScreenSheet, screenSheetToCopy))();
                        return;
                    }
                    pigeonKeeper.create(common.wrapFunction(removeCopyScreenSheet, screenSheetToCopy))();
                };
                checkboxState = { checkedState: screenSheetPair.isCopy ? 2 : 0, wantDisabled: screenSheetPair.isPersisted };
                return createCheckboxCell(commodityCode + "_" + copyFromUserSheetID, checkboxState, clickHandler);
            },
            createScreenSheetNamesRow = function (currentUsername, commodityCode, copyFromUser, screenSheetPair, wantCheckboxes) {
                var copyFromUserSheetName, currentUserSheetID, cell, currentUserSheetName, row, checkboxCell, copyFromUsernameSheetIdPairs;
                copyFromUsernameSheetIdPairs = screenSheetPair.copyFromUsernameSheetIdPairs;
                if (copyFromUsernameSheetIdPairs.length === 0 || (copyFromUsernameSheetIdPairs.length === 1 && copyFromUsernameSheetIdPairs[0].Value === currentUsername && screenSheetPair.isPersisted === false)) {
                    return null;
                }
                currentUserSheetName = screenSheetPair.currentUserSheetName;
                copyFromUserSheetName = screenSheetPair.copyFromUserSheetName;
                row = htmlHelper.createRow('screenSheetNamesRow');
                checkboxCell = constructCheckboxCell(screenSheetPair, copyFromUser, commodityCode, wantCheckboxes);
                row.append(checkboxCell || htmlHelper.createCell(20));
                cell = htmlHelper.appendCell(row, '', 380);
                cell.append($('<span>').text(copyFromUserSheetName));
                if (!wantCheckboxes) {
                    cell.append(createCopyScreenSheetFromUserSelect(currentUsername, screenSheetPair, commodityCode, copyFromUsernameSheetIdPairs));
                }
                htmlHelper.appendCell(row).addClass('screenSheetsSpacerCell');
                if (currentUserSheetName && currentUserSheetName.length > 0 && screenSheetPair.isPersisted) {
                    cell = htmlHelper.appendCell(row);
                    cell.append(createEditInPlaceControl(screenSheetPair.currentUserSheetID, currentUserSheetName, 380).container);
                } else {
                    htmlHelper.appendCell(row, currentUserSheetName, 380);
                }
                cell = htmlHelper.createCell(20);
                currentUserSheetID = Number(screenSheetPair.currentUserSheetID);
                if (screenSheetPair.isPersisted && localDataStore.getScreenSheetsToDelete().indexOf(currentUserSheetID) === -1) {
                    cell.append(common.createDeleteButton("Delete screen sheet", function () {
                        deleteScreenSheet(currentUserSheetID);
                    }));
                }
                row.append(cell);
                return row;
            },
            getAllScreenSheetPairs = function (commodityScreenSheetPairsDictionary) {
                var commodityCodes, allScreenSheetPairs;
                commodityCodes = arrayHelper.getProperties(commodityScreenSheetPairsDictionary);
                allScreenSheetPairs = [];
                commodityCodes.forEach(function (commodityCode) {
                    allScreenSheetPairs = allScreenSheetPairs.concat(commodityScreenSheetPairsDictionary[commodityCode]);
                });
                return allScreenSheetPairs;
            },
            getCheckboxState = function (screenSheetPairs) {
                var runCount, checkedCount, persistedCount, uncheckedCount, length, wantDisabled;
                runCount = 0;
                persistedCount = 0;
                checkedCount = 0;
                uncheckedCount = 0;
                length = screenSheetPairs.length;
                screenSheetPairs.forEach(function (screenSheetPair) {
                    if (screenSheetPair.isPersisted === true) {
                        persistedCount += 1;
                    }
                    if (screenSheetPair.isCopy === false && screenSheetPair.isPersisted === false) {
                        uncheckedCount += 1;
                        runCount += 1;
                    }
                    if (screenSheetPair.isCopy === true && screenSheetPair.isPersisted === false) {
                        checkedCount += 1;
                        runCount += 1;
                    }
                });
                wantDisabled = length === persistedCount;
                if (uncheckedCount === (length - persistedCount)) {
                    return { checkedState: 0, runCount: runCount, wantDisabled: wantDisabled };
                }
                if (checkedCount === (length - persistedCount)) {
                    return { checkedState: 2, runCount: runCount, wantDisabled: wantDisabled };
                }
                return { checkedState: 1, runCount: runCount, wantDisabled: wantDisabled };
            },
            createCurrentUserScreenSheetsHeaderRow = function () {
                var row;
                row = htmlHelper.createRow("currentUserScreenSheetsHeaderRow");
                htmlHelper.appendCell(row, "Sheet Name", 400, false, 'textAlignLeft');
                return row;
            },
            createCurrentUserCommodityCodeSubheaderRow = function (commodityCode) {
                var row, cell;
                row = htmlHelper.createRow('commodityCodeSubheaderRow currentUserCommodityCodeSubheaderRow');
                cell = htmlHelper.appendCell(row, commodityCode, '', true);
                cell.attr('colspan', 4);
                return row;
            },
            createCurrentUserScreenSheetNamesRow = function (sheetID, sheetName) {
                var cell, row, screenSheetsToRename, screenSheetsToDelete, text, deleteIndex, renameIndex, screenSheetsToDeleteExist, screenSheetsToRenameExist;
                screenSheetsToRename = localDataStore.getScreenSheetsToRename();
                screenSheetsToDelete = localDataStore.getScreenSheetsToDelete();
                deleteIndex = screenSheetsToDelete.indexOf(Number(sheetID));
                renameIndex = common.getIndexOfArrayItem(screenSheetsToRename, 'Key', Number(sheetID));
                row = htmlHelper.createRow('screenSheetNamesRow');
                if (deleteIndex === -1) {
                    cell = htmlHelper.appendCell(row);
                    cell.append(createEditInPlaceControl(sheetID, sheetName, 380).container);
                } else {

                    htmlHelper.appendCell(row, sheetName.replace(/\s/g, '\xA0'), 380, false, 'readonlyScreenSheetNameCell');
                }
                cell = htmlHelper.appendCell(row);
                if (screenSheetsToDelete.indexOf(sheetID) === -1) {
                    cell.append(common.createDeleteButton("Delete screen sheet", function () {
                        deleteScreenSheet(sheetID);
                    }));
                }
                row.append(cell);
                text = '';
                htmlHelper.appendCell(row).addClass('screenSheetsSpacerCell');
                screenSheetsToRenameExist = screenSheetsToRename && screenSheetsToRename.length > 0 && renameIndex !== -1;
                screenSheetsToDeleteExist = screenSheetsToDelete && screenSheetsToDelete.length > 0 && screenSheetsToDelete && deleteIndex !== -1;
                if (screenSheetsToRenameExist) {
                    text = screenSheetsToRename[renameIndex].Value.replace(/\s/g, '\xA0');
                }
                if (screenSheetsToDeleteExist) {
                    text = sheetName.replace(/\s/g, '\xA0');
                }
                cell = htmlHelper.appendCell(row, text, 380);
                if (screenSheetsToDeleteExist) {
                    cell.css('text-decoration', 'line-through');
                }
                if (screenSheetsToRenameExist) {
                    cell.css({ 'font-style': 'italic', 'font-family': 'Verdana' });

                }
                return row;

            },
            createCurrentUserScreenSheetsTable = function (currentUsername) {
                var table, persistedScreenSheetsDictionary, commodityCodes;
                currentUserScreenSheetsTableContainer.empty();
                table = htmlHelper.createTable('currentUserScreenSheetsTable');
                table.append(createCurrentUserScreenSheetsHeaderRow());
                persistedScreenSheetsDictionary = getPersistedScreenSheetsDictionary(currentUsername);
                commodityCodes = arrayHelper.getProperties(persistedScreenSheetsDictionary).sort();
                commodityCodes.forEach(function (commodityCode) {
                    table.append(createCurrentUserCommodityCodeSubheaderRow(commodityCode));
                    persistedScreenSheetsDictionary[commodityCode].forEach(function (sheet) {
                        table.append(createCurrentUserScreenSheetNamesRow(sheet.SheetID, sheet.SheetName));
                    });
                });
                currentUserScreenSheetsTableContainer.append(table);
            },
            createScreenSheetsTable = function (currentUsername, copyFromUser, copyFromOption, commodityScreenSheetPairsDictionary, callback) {
                var table, commodityCodes, allScreenSheetPairs, constructCommodityCodeSubheaderRow, checkboxState, wantCheckboxes, screenSheetsExistToCopy, screenSheetsHeaderRow;
                copyScreenSheetsTableContainer.empty();
                wantCheckboxes = copyFromUser && copyFromUser.length && copyFromUser.trim().length > 0;
                table = htmlHelper.createTable('copyScreenSheetsTable');
                constructCommodityCodeSubheaderRow = function (commodityCode) {
                    var screenSheetPairs, constructScreenSheetNamesRow, commodityCodeSubheaderRow, screenSheetNamesRow;
                    screenSheetPairs = commodityScreenSheetPairsDictionary[commodityCode];
                    screenSheetsExistToCopy = arrayHelper.hasDefinedProperties(screenSheetPairs, 'copyFromUserSheetName');
                    checkboxState = getCheckboxState(screenSheetPairs);
                    commodityCodeSubheaderRow = createCommodityCodeSubheaderRow(commodityCode, screenSheetsExistToCopy, checkboxState, wantCheckboxes);
                    table.append(commodityCodeSubheaderRow);
                    constructScreenSheetNamesRow = function (screenSheetPair) {
                        screenSheetNamesRow = createScreenSheetNamesRow(currentUsername, commodityCode, copyFromUser, screenSheetPair, wantCheckboxes);
                        if (screenSheetNamesRow) {
                            table.append(screenSheetNamesRow);
                        }
                    };
                    screenSheetPairs.forEach(constructScreenSheetNamesRow);
                };
                allScreenSheetPairs = getAllScreenSheetPairs(commodityScreenSheetPairsDictionary);
                screenSheetsExistToCopy = arrayHelper.hasDefinedProperties(allScreenSheetPairs, 'copyFromUserSheetName');
                checkboxState = getCheckboxState(allScreenSheetPairs);
                screenSheetsHeaderRow = createScreenSheetsHeaderRow(currentUsername, copyFromUser, copyFromOption, checkboxState, wantCheckboxes, screenSheetsExistToCopy);
                if (!screenSheetsHeaderRow) {
                    return;
                }
                table.append(screenSheetsHeaderRow);
                commodityCodes = arrayHelper.getProperties(commodityScreenSheetPairsDictionary).sort();
                commodityCodes.forEach(constructCommodityCodeSubheaderRow);
                copyScreenSheetsTableContainer.append(table);
                common.safeCallback(callback);
            },
            createScreenSheetsTables = function (currentUsername, copyFromUser, copyFromOption, commodityScreenSheetPairsDictionary, callback) {
                createScreenSheetsTable(currentUsername, copyFromUser, copyFromOption, commodityScreenSheetPairsDictionary, callback);
                createCurrentUserScreenSheetsTable(currentUsername);
            },
            getCopyFromUsersFromScreenSheets = function (screenSheets) {
                var copyFromUsers;
                copyFromUsers = [];
                if (screenSheets) {
                    screenSheets.forEach(function (screenSheetToCopy) {
                        arrayHelper.addUnique(copyFromUsers, screenSheetToCopy.CopyFromUser);
                    });
                }
                return copyFromUsers;
            },
            getCommodityCodesFromScreenSheets = function (screenSheets) {
                var commodityCodes;
                commodityCodes = [];
                if (screenSheets) {
                    screenSheets.forEach(function (screenSheet) {
                        arrayHelper.addUnique(commodityCodes, screenSheet.CommodityCode);
                    });
                }
                return commodityCodes;
            },
            getScreenSheetNamesDictionaryForCommodity = function (copyFromUserSheets, currentUserPersistedSheets, screenSheetsToDelete, currentUserCopiedSheets) {
                var screenSheetNames, array, screenSheetNamesDictionary, additionalSheet;
                screenSheetNamesDictionary = {};
                screenSheetNames = [];
                if ((copyFromUserSheets && copyFromUserSheets.length > 0) || (currentUserPersistedSheets && currentUserPersistedSheets.length > 0)) {
                    array = arrayHelper.getDefinedPropertyValues(copyFromUserSheets, 'SheetName', true);
                    array.forEach(function (item) {
                        if (screenSheetNames.indexOf(item) === -1) {
                            screenSheetNames.push(item);
                        }
                    });
                    array = arrayHelper.getDefinedPropertyValues(currentUserPersistedSheets, 'SheetName', true);
                    array.forEach(function (item) {
                        if (screenSheetNames.indexOf(item) === -1) {
                            screenSheetNames.push(item);
                        }
                    });
                }
                screenSheetNames.forEach(function (name) {
                    if (!screenSheetNamesDictionary.hasOwnProperty(name)) {
                        screenSheetNamesDictionary[name] = [];
                    }
                    if (copyFromUserSheets && copyFromUserSheets.length > 0) {
                        copyFromUserSheets.forEach(function (sheet) {
                            if (sheet.SheetName === name) {
                                sheet.isCopy = false;
                                sheet.isPersisted = false;
                                screenSheetNamesDictionary[name].push(sheet);
                            }
                        });
                    }
                    if (currentUserPersistedSheets && currentUserPersistedSheets.length > 0) {
                        currentUserPersistedSheets.forEach(function (sheet) {
                            if (sheet.SheetName === name) {
                                sheet.isCopy = false;
                                sheet.isPersisted = true;
                                screenSheetNamesDictionary[name].push(sheet);
                                if (screenSheetsToDelete.indexOf(sheet.SheetID) !== -1) {
                                    additionalSheet = { CommodityCode: sheet.CommodityCode, CopyFromUser: sheet.CopyFromUser, SheetID: sheet.SheetID, SheetName: sheet.SheetName, isCopy: false, isPersisted: false };
                                    screenSheetNamesDictionary[name].push(additionalSheet);
                                }
                            }
                        });
                    }
                    if (currentUserCopiedSheets && currentUserCopiedSheets.length > 0) {
                        currentUserCopiedSheets.forEach(function (sheet) {
                            if (sheet.SheetName === name) {
                                sheet.isCopy = true;
                                sheet.isPersisted = false;
                                screenSheetNamesDictionary[name].push(sheet);
                            }
                        });
                    }
                });
                return screenSheetNamesDictionary;
            },
            getSheetName = function (sheetId, sheetName) {
                var index, screenSheetsToRename = localDataStore.getScreenSheetsToRename();
                index = common.getIndexOfArrayItem(screenSheetsToRename, 'Key', sheetId);
                if (index === -1) {
                    return sheetName;
                }
                return screenSheetsToRename[index].Value;
            },
            getCopyFromUsernameSheetIdPairs = function (screenSheets) {
                var copyFromUsernameSheetIDPairs, key, value, index;
                copyFromUsernameSheetIDPairs = [];
                screenSheets.forEach(function (sheet) {
                    key = sheet.SheetID;
                    value = sheet.CopyFromUser;
                    index = common.getIndexOfArrayItem(copyFromUsernameSheetIDPairs, 'Value', value);
                    if (index === -1) {
                        copyFromUsernameSheetIDPairs.push({ Key: key, Value: value });
                    }
                });
                return copyFromUsernameSheetIDPairs;
            },
            createScreenSheetPair = function (currentUsername, screenSheets) {
                var screenSheetPair = {};
                screenSheetPair.copyFromUsernameSheetIdPairs = getCopyFromUsernameSheetIdPairs(screenSheets);
                screenSheets.forEach(function (sheet) {
                    if (sheet.isPersisted && !sheet.isCopy) {
                        screenSheetPair.isCopy = false;
                        screenSheetPair.isPersisted = true;
                        screenSheetPair.currentUserSheetName = sheet.SheetName;
                        screenSheetPair.copyFromUserSheetName = '';
                        screenSheetPair.currentUserSheetID = sheet.SheetID;
                        screenSheetPair.copyFromUserSheetID = '';
                    }
                    if (!sheet.isScheduledForDeletion) {
                        screenSheetPair.isCopy = false;
                        screenSheetPair.isPersisted = true;
                        screenSheetPair.currentUserSheetName = sheet.SheetName;
                        screenSheetPair.copyFromUserSheetName = '';
                        screenSheetPair.currentUserSheetID = sheet.SheetID;
                        screenSheetPair.copyFromUserSheetID = '';
                    }
                    if (!sheet.isPersisted && !sheet.isCopy) {
                        screenSheetPair.isCopy = false;
                        screenSheetPair.isPersisted = false;
                        screenSheetPair.currentUserSheetName = '';
                        screenSheetPair.copyFromUserSheetName = sheet.SheetName;
                        screenSheetPair.currentUserSheetID = '';
                        screenSheetPair.copyFromUserSheetID = sheet.SheetID;
                    }
                    if (!sheet.isPersisted && sheet.isCopy) {
                        screenSheetPair.isCopy = true;
                        screenSheetPair.isPersisted = false;
                        screenSheetPair.currentUserSheetName = currentUsername !== sheet.CopyFromUser ? sheet.SheetName : '';
                        screenSheetPair.copyFromUserSheetName = sheet.SheetName;
                        screenSheetPair.currentUserSheetID = '';
                        screenSheetPair.copyFromUserSheetID = sheet.SheetID;
                    }
                });
                return screenSheetPair;
            },
            createScreenSheetPairs = function (currentUsername, screenSheetNamesDictionary) {
                var screenSheetPairs, screenSheetNames, i, sheetsToAdd;
                screenSheetPairs = [];
                screenSheetNames = common.getPropertiesArray(screenSheetNamesDictionary).sort();
                screenSheetNames.forEach(function (screenSheetName) {
                    var screenSheets, sheet, sheetName;
                    screenSheets = screenSheetNamesDictionary[screenSheetName];
                    sheetsToAdd = [];
                    for (i = 0; i < screenSheets.length; i += 1) {
                        sheet = screenSheets[i];
                        sheetName = getSheetName(sheet.SheetID, sheet.SheetName);
                        if (sheet.SheetName !== sheetName) {
                            sheet.isPersisted = false;
                            sheet.isCopy = true;
                            if (common.getIndexOfArrayItem(sheetsToAdd, "SheetID", sheet.SheetID) === -1) {
                                sheetsToAdd.push({ CopyFromUser: sheet.CopyFromUser, SheetID: sheet.SheetID, CommodityCode: sheet.CommodityCode, SheetName: sheetName, isScheduledForDeletion: true });
                            }
                        }
                    }
                    screenSheetPairs.push(createScreenSheetPair(currentUsername, screenSheets));
                    if (sheetsToAdd.length > 0) {
                        screenSheetPairs.push(createScreenSheetPair(currentUsername, sheetsToAdd));
                    }
                });
                return screenSheetPairs;
            },
            getScreenSheetsDictionary = function (commodityCode, copyFromUserDictionary, currentUserPersistedScreenSheetsDictionary, screenSheetsToDelete, currentUserCopyScreenSheetsDictionary) {
                var copyFromUserSheets, currentUserPersistedSheets, currentUserCopiedSheets;
                copyFromUserSheets = copyFromUserDictionary[commodityCode];
                currentUserPersistedSheets = currentUserPersistedScreenSheetsDictionary[commodityCode];
                currentUserCopiedSheets = currentUserCopyScreenSheetsDictionary[commodityCode];
                return getScreenSheetNamesDictionaryForCommodity(copyFromUserSheets, currentUserPersistedSheets, screenSheetsToDelete, currentUserCopiedSheets);
            },
            getScreenSheetsForCommodityCode = function (screenSheets, commodityCode) {
                var screenSheetsForCommodity;
                screenSheetsForCommodity = [];
                if (!screenSheets) {
                    return screenSheetsForCommodity;
                }
                screenSheets.forEach(function (screenSheet) {
                    if (screenSheet.CommodityCode === commodityCode) {
                        screenSheetsForCommodity.push(screenSheet);
                    }
                });
                return screenSheetsForCommodity;
            },
            getScreenSheetsToCopy = function (copyFromUser, copyFromOption) {
                var screenSheetsToCopy;
                screenSheetsToCopy = [];
                if (!copyFromUser && !copyFromOption) {
                    screenSheetsToCopy = [];
                }
                if (copyFromUser && !copyFromOption) {
                    screenSheetsToCopy = localDataStore.getCopyFromUserScreenSheets(copyFromUser);
                }
                if (!copyFromUser && copyFromOption) {
                    screenSheetsToCopy = getScreenSheetsForCommodityCode(localDataStore.getAllScreenSheets(), copyFromOption);
                }
                if (copyFromUser && copyFromOption) {
                    screenSheetsToCopy = localDataStore.getCopyFromUserScreenSheets(copyFromUser);
                    screenSheetsToCopy = getScreenSheetsForCommodityCode(screenSheetsToCopy, copyFromOption);
                }
                if (copyFromOption) {
                    screenSheetsToCopy = getScreenSheetsForCommodityCode(screenSheetsToCopy, copyFromOption);
                }
                return screenSheetsToCopy;
            },
            getPersistedScreenSheetsDictionary = function (currentUsername) {
                var sheets = localDataStore.getCopyFromUserScreenSheets(currentUsername);
                return sheets ? arrayHelper.toDictionary(sheets, 'CommodityCode') : {};
            },
            getCopyFromUserDictionary = function (screenSheetsToCopy) {
                return screenSheetsToCopy ? arrayHelper.toDictionary(screenSheetsToCopy, 'CommodityCode') : {};
            },
            getCurrentUserCopyScreenSheetsDictionary = function () {
                var usersCopyScreenSheets = localDataStore.getCopyScreenSheets();
                return usersCopyScreenSheets ? arrayHelper.toDictionary(usersCopyScreenSheets, 'CommodityCode') : {};
            },
            createCommodityScreenSheetPairsDictionary = function (currentUsername, copyFromUser, copyFromOption) {
                var screenSheetsToCopy, copyFromUserDictionary, persistedScreenSheetsDictionary, screenSheetNamesDictionary, screenSheetsToDelete,
                    currentUserCopyScreenSheetsDictionary, commodityCodes, commodityScreenSheetPairsDictionary;
                screenSheetsToCopy = getScreenSheetsToCopy(copyFromUser, copyFromOption);
                copyFromUserDictionary = getCopyFromUserDictionary(screenSheetsToCopy);
                persistedScreenSheetsDictionary = getPersistedScreenSheetsDictionary(currentUsername);
                screenSheetsToDelete = localDataStore.getScreenSheetsToDelete();
                currentUserCopyScreenSheetsDictionary = getCurrentUserCopyScreenSheetsDictionary();
                commodityCodes = getCommodityCodesFromScreenSheets(screenSheetsToCopy);
                commodityScreenSheetPairsDictionary = {};
                commodityCodes.forEach(function (commodityCode) {
                    screenSheetNamesDictionary = getScreenSheetsDictionary(commodityCode, copyFromUserDictionary, persistedScreenSheetsDictionary, screenSheetsToDelete, currentUserCopyScreenSheetsDictionary);
                    commodityScreenSheetPairsDictionary[commodityCode] = createScreenSheetPairs(currentUsername, screenSheetNamesDictionary);
                });
                return commodityScreenSheetPairsDictionary;
            },
            displayScreenSheetsTable = function () {
                var currentUsername, copyFromUser, copyFromOption, commodityScreenSheetPairsDictionary, updateFunction, callback;
                copyFromUser = copyScreenSheetsFromUserSelect.val();
                copyFromOption = copyScreenSheetsForOptionSelect.val();
                currentUsername = localDataStore.getCurrentUsername();
                commodityScreenSheetPairsDictionary = createCommodityScreenSheetPairsDictionary(currentUsername, copyFromUser, copyFromOption);
                callback = function () {
                    updateFunction = function (userInfo) {
                        localDataStore.clearCopyScreenSheetsToRemove();
                        localDataStore.clearCopyScreenSheetsToAdd();
                        return userInfo;
                    };
                    eventListener.fire("Persist", [updateFunction, null, 'displayScreenSheetsTable']);
                };
                createScreenSheetsTables(currentUsername, copyFromUser, copyFromOption, commodityScreenSheetPairsDictionary, callback);
            },
            copyScreenSheetsFromUserSelectChange = function () {
                var copyFromUser, copyFromOption, allCopyFromUsers, index, currentUsername;
                copyFromUser = $(this).val();
                copyFromOption = copyScreenSheetsForOptionSelect.val();

                currentUsername = localDataStore.getCurrentUsername();
                allCopyFromUsers = localDataStore.getAllCopyFromUsers();
                index = allCopyFromUsers.indexOf(currentUsername);
                allCopyFromUsers.splice(index, 1);
                htmlHelper.fillSelectFromList(copyScreenSheetsFromUserSelect, "Copy all screen sheets from user.", allCopyFromUsers);
                
                htmlHelper.fillSelectFromList(copyScreenSheetsForOptionSelect, "Copy screen sheets for option code.", localDataStore.getAllOptionCodesHavingScreenSheets());
                copyScreenSheetsFromUserSelect.val(copyFromUser);
                copyScreenSheetsForOptionSelect.val(copyFromOption);
                displayScreenSheetsTable();
            },
            copyScreenSheetsForOptionSelectChange = function () {
                var copyFromUser, copyFromOption, selectedCopyFromUsers;
                copyFromOption = $(this).val();
                copyFromUser = copyScreenSheetsFromUserSelect.val();
                htmlHelper.fillSelectFromList(copyScreenSheetsForOptionSelect, "Copy screen sheets for option code.", localDataStore.getWriteOnlyUserInfo().UserOptions);
                copyScreenSheetsForOptionSelect.val(copyFromOption);
                if (!copyFromOption) {
                    htmlHelper.fillSelectFromList(copyScreenSheetsFromUserSelect, "Copy all screen sheets from user.", localDataStore.getAllCopyFromUsers());
                    copyScreenSheetsFromUserSelect.val(copyFromUser);
                    displayScreenSheetsTable();
                    return;
                }
                selectedCopyFromUsers = getCopyFromUsersFromScreenSheets(getScreenSheetsForCommodityCode(localDataStore.getAllScreenSheets(), copyFromOption));
                htmlHelper.fillSelectFromList(copyScreenSheetsFromUserSelect, "Copy all screen sheets from user.", selectedCopyFromUsers);
                copyScreenSheetsFromUserSelect.val(copyFromUser);
                displayScreenSheetsTable();
            },
            assignEventHandlers = function () {
                copyScreenSheetsFromUserSelect.off('change');
                copyScreenSheetsFromUserSelect.on('change', copyScreenSheetsFromUserSelectChange);
                copyScreenSheetsForOptionSelect.off('change');
                copyScreenSheetsForOptionSelect.on('change', copyScreenSheetsForOptionSelectChange);
            },
            initializeEventListener = function (listener) {
                eventListener = listener;
                eventListener.removeListener("ShowCopyScreenSheets", initialize);
                eventListener.addListener("ShowCopyScreenSheets", initialize);
                eventListener.removeListener("AdjustCopyScreenSheets", adjustCopyScreenSheets);
                eventListener.addListener("AdjustCopyScreenSheets", adjustCopyScreenSheets);
            };
        return {
            initializeEventListener: initializeEventListener,
            assignEventHandlers: assignEventHandlers
        };
    });
