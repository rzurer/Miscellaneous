/*globals $, define */
"use strict";
define(['common', "orderRoutingUserFactory", "orderRoutingUserDataAccess", "orderRoutingUserReports", "clearingFirmDataAccess"], function (common, factory, dataAccess, reports, clearingFirmDataAccess) {
    var createOrderRoutingUserFromElement = function (source) {
        var username, orderRoutingProvider, externalUsername, clearingFirm, orderAccounts, fillAccounts, fcmAccountCell;
        username = source.find(".userName").text().trim();
        orderRoutingProvider = source.find(".provider").text().trim();
        externalUsername = source.find(".externalUsername").text().trim();
        clearingFirm = source.find(".clearingFirm").text().trim();
        orderAccounts = [];
        source.find('.orderAccounts tr').each(function () {
            var product, fcmAccount, fcmAccountId, orderAccount, clearingFirmAccount;
            product = $(this).children('.productCode').text().trim();
            fcmAccountCell = $(this).children('.fcmAccount');
            fcmAccount = fcmAccountCell.text().trim();
            fcmAccountId = fcmAccountCell.children('span').attr('id');
            clearingFirmAccount = factory.createClearingFirmAccount(clearingFirm, fcmAccount, fcmAccountId);
            orderAccount = factory.createOrderAccount(product, clearingFirmAccount);
            if (product.length > 0 && clearingFirm.length > 0 && fcmAccount.length > 0 && fcmAccountId.length > 0) {
                orderAccounts.push(orderAccount);
            }
        });
        fillAccounts = [];
        source.find('.fillAccounts tr').each(function () {
            var fcmAccount, fcmAccountId, fillAccountName, fillAccount, clearingFirmAccount;
            fcmAccountCell = $(this).children('.fcmAccount');
            fcmAccount = fcmAccountCell.text().trim();
            fcmAccountId = fcmAccountCell.children('span').attr('id');
            clearingFirmAccount = factory.createClearingFirmAccount(clearingFirm, fcmAccount, fcmAccountId);
            fillAccountName = $(this).children('.fillAccount').text().trim();
            fillAccount = factory.createFillAccount(fillAccountName, clearingFirmAccount);
            if (fcmAccount.length > 0 && clearingFirm.length > 0 && fcmAccountId.length > 0) {
                fillAccounts.push(fillAccount);
            }
        });
        return factory.createOrderRoutingUser(username, orderRoutingProvider, externalUsername, clearingFirm, orderAccounts, fillAccounts);
    },
        showFcmAccountsControl = function (userDetailContainer, table, top, left) {
            var container;
            common.clearPopup();
            container = $('<div/>').attr('id', 'fcmAccountsControlContainer');
            container.append(userDetailContainer);
            container.append(table);
            container.show();
            common.getPopup().append(container);
            common.showPopup(top, left);
        },
        enableFillAccountButton = function (orderRoutingUser, fcmAccountId) {
            var addFillAccountButton, exists;
            exists = factory.fillAccountExists(orderRoutingUser.fillAccounts, fcmAccountId);
            if (!exists) {
                addFillAccountButton = $('.fcmAccountRow[id="' + fcmAccountId + '"]').find('td.addFillAccountButtonCell > img');
                addFillAccountButton.attr("title", "Associate a WhenTech account with a clearing firm account for fills");
                addFillAccountButton.css('opacity', "1.0");
                addFillAccountButton.click(function () {
                    $(".textDropdown").hide();
                    $("#fillAccountFcmAccounts_" + fcmAccountId).show('normal');
                    return false;
                });
            }
        },
        updateFillAccountsTable = function (userRow, orderRoutingUser) {
            var fillAccountsTable;
            fillAccountsTable = userRow.find("td.fillAccounts > table");
            fillAccountsTable.children().remove();
            orderRoutingUser.fillAccounts.forEach(function (fillAccount) {
                var row, cell, span;
                row = $('<tr/>');
                cell = $('<td/>');
                cell.addClass('fillAccount');
                cell.text(fillAccount.fillAccountName);
                row.append(cell);
                cell = $('<td/>');
                cell.addClass('fcmAccount');
                cell.text(fillAccount.clearingFirmAccount.fcmAccount);
                span = $('<span/>');
                span.addClass('hidden');
                span.attr("id", fillAccount.clearingFirmAccount.fcmAccountId);
                cell.append(span);
                row.append(cell);
                fillAccountsTable.append(row);
            });
        },
        updateOrderAccountsTable = function (userRow, orderRoutingUser) {
            var orderAccountsTable;
            orderAccountsTable = userRow.find("td.orderAccounts > table");
            orderAccountsTable.children().remove();
            orderRoutingUser.orderAccounts.forEach(function (orderAccount) {
                var row, cell, span;
                row = $('<tr/>');
                cell = $('<td/>');
                cell.addClass('productCode');
                cell.text(orderAccount.product);
                row.append(cell);
                cell = $('<td/>');
                cell.addClass('fcmAccount');
                cell.text(orderAccount.clearingFirmAccount.fcmAccount);
                span = $('<span/>');
                span.addClass('hidden');
                span.attr("id", orderAccount.clearingFirmAccount.fcmAccountId);
                cell.append(span);
                row.append(cell);
                orderAccountsTable.append(row);
            });
        },
        refreshReports = function (orderRoutingUser) {
            var userRow;
            userRow = $('#' + orderRoutingUser.username);
            updateOrderAccountsTable(userRow, orderRoutingUser);
            updateFillAccountsTable(userRow, orderRoutingUser);
        },
        createFillAccountsReportCallback = function (response) {
            if (response.Success) {
                reports.createFillAccountsReport(response.Payload.FillAccounts);
            }
        },
        createDeleteFillAccountCallback = function (orderRoutingUser, fcmAccountId, deleteButtonCell, fillAccountRow) {
            return function (response) {
                var text;
                text = response.Message;
                if (!response.Success) {
                    common.showToaster(deleteButtonCell, text, 0, 25, true, null, -1);
                    return;
                }
                common.showToaster(deleteButtonCell, text, 0, 25, false);
                fillAccountRow.remove();
                factory.deleteFillAccountFromFillAccountsArray(orderRoutingUser, fcmAccountId);
                enableFillAccountButton(orderRoutingUser, fcmAccountId);
                refreshReports(orderRoutingUser);
                dataAccess.getOrderRoutingUsers("GetOrderRoutingUsers", createFillAccountsReportCallback);
            };
        },
        addOrderAccountButtonClick = function (index) {
            $('.productsAutocomplete').val('');
            $(".textDropdown").hide();
            $("#orderAccountProducts_" + index).show('normal');
            return false;
        },
        addFillAccountButtonClick = function (index) {
            $('.fillAccountNamesAutocomplete').val('');
            $(".textDropdown").hide();
            $("#fillAccountFcmAccounts_" + index).show('normal');
            return false;
        },
        addFillAccountRow = function (fillAccountsTable, orderRoutingUser, fcmAccountId, fillAccountName) {
            var username, orderRoutingProvider, externalUsername,
                fillAccountNameCell, fillAccountRow, deleteButtonCell;
            username = orderRoutingUser.username;
            orderRoutingProvider = orderRoutingUser.orderRoutingProvider;
            externalUsername = orderRoutingUser.externalUsername;
            fillAccountRow = $('<tr/>');
            fillAccountNameCell = $('<td/>');
            fillAccountNameCell.text(fillAccountName);
            fillAccountNameCell.addClass('fillAccountName');
            deleteButtonCell = $('<td/>');
            deleteButtonCell.addClass('deleteButtonCell');
            fillAccountRow.append(fillAccountNameCell, deleteButtonCell);
            common.setRowHover(fillAccountRow, "Delete fill account", function (e) {
                var deleteCallback, control, message, top, left, proceed, title;
                deleteCallback = createDeleteFillAccountCallback(orderRoutingUser, fcmAccountId, deleteButtonCell, fillAccountRow);
                control = $('#confirmDialog');
                message = "This action will delete the fill account  '" + fillAccountName + "' for the user '" + username + "'.<br/>Are you sure that you want to proceed?";
                title = "Delete Fill Account '" + fillAccountName + "' ?";
                top = e.pageY;
                left = e.pageX;
                proceed = function () {
                    dataAccess.deleteFillAccount(username, orderRoutingProvider, externalUsername, fillAccountName, fcmAccountId, deleteCallback);
                };
                common.confirmDialog(control, message, title, top, left, proceed);
            });
            fillAccountsTable.append(fillAccountRow);
        },
        fillProductAutocomplete = function (orderRoutingUser) {
            var callback, sourceArray, button;
            callback = function (response) {
                if (response.Success) {
                    sourceArray = response.Payload;
                    common.removeExistingItemsFromArray(sourceArray, factory.getProducts(orderRoutingUser.orderAccounts));
                    $(".productsAutocomplete").each(function () {
                        var target, index;
                        target = $(this);
                        index = target.closest('tr.fcmAccountRow').attr('id');
                        target.blur(function () {
                            if (common.verifyItemExists(target)) {
                                scrollToPopup();
                            }
                        });
                        target.keyup(function () {
                            return common.verifyItemExists(target);
                        });
                        common.setAutocomplete(target, 0, response.Payload, null, true, true);
                        button = target.closest('td.autocompletesCell').parent().find('.addOrderAccountButtonCell > img');
                        if (target.autocomplete("option", "source").length === 0) {
                            button.unbind('click');
                            common.disableControl(button);
                        } else {
                            button.unbind('click');
                            button.click(function () {
                                addOrderAccountButtonClick(index);
                            });
                            common.enableControl(button);
                        }
                    });
                }
            };
            dataAccess.getProductsForTrader(orderRoutingUser.username, orderRoutingUser.orderRoutingProvider, callback);
        },
        createDeleteOrderAccountCallback = function (orderRoutingUser, product, parent, orderAccountRow) {
            return function (response) {
                var text;
                text = response.Message;
                if (!response.Success) {
                    common.showToaster(parent, text, 0, 25, true, null, -1);
                    return;
                }
                common.showToaster(parent, text, 0, 25, false);
                orderAccountRow.remove();
                factory.deleteOrderAccountFromOrderAccountsArray(orderRoutingUser, product);
                refreshReports(orderRoutingUser);
                fillProductAutocomplete(orderRoutingUser);
            };
        },
        addOrderAccountRow = function (orderAccountsTable, orderRoutingUser, product, fcmAccountId) {
            var productCell, orderAccountRow, deleteButtonCell;
            orderAccountRow = $('<tr/>');
            productCell = $('<td/>');
            productCell.text(product);
            productCell.addClass('orderAccountProduct');
            deleteButtonCell = $('<td/>');
            deleteButtonCell.addClass('deleteButtonCell');
            orderAccountRow.append(productCell, deleteButtonCell);
            common.setRowHover(orderAccountRow, "Delete order account", function (e) {
                var deleteCallback, username, control, message, top, left, proceed, title;
                deleteCallback = createDeleteOrderAccountCallback(orderRoutingUser, product, deleteButtonCell, orderAccountRow);
                username = orderRoutingUser.username;
                control = $('#confirmDialog');
                message = "This action will delete the order account for the product '" + product + "' for the user '" + username + "'.<br/>Are you sure that you want to proceed?";
                title = "Delete Order Account '" + product + "' ?";
                top = e.pageY;
                left = e.pageX;
                proceed = function () {
                    dataAccess.deleteOrderAccount(username, product, fcmAccountId, deleteCallback);
                };
                common.confirmDialog(control, message, title, top, left, proceed);
            });
            orderAccountsTable.append(orderAccountRow);
        },
        createOrderAccountsTable = function (orderRoutingUser, fcmAccountId) {
            var orderAccountsTable;
            orderAccountsTable = $("<table/>").attr('id', 'orderAccountsTable_' + fcmAccountId).addClass("innerTable");
            orderRoutingUser.orderAccounts.forEach(function (orderAccount) {
                if (Number(orderAccount.clearingFirmAccount.fcmAccountId.trim()) === fcmAccountId) {
                    addOrderAccountRow(orderAccountsTable, orderRoutingUser, orderAccount.product, fcmAccountId);
                }
            });
            return orderAccountsTable;
        },
        disableFillAccountButton = function (orderRoutingUser, fcmAccountId) {
            var addFillAccountButton, exists;
            exists = factory.fillAccountExists(orderRoutingUser.fillAccounts, fcmAccountId);
            if (exists) {
                addFillAccountButton = $('.fcmAccountRow[id="' + fcmAccountId + '"]').find('td.addFillAccountButtonCell > img');
                addFillAccountButton.attr("title", "There is already a WhenTech account asssociated with this clearing firm account for fills");
                addFillAccountButton.css('opacity', "0.2");
                addFillAccountButton.unbind('click');
            }
        },
        createFillAccountsTable = function (orderRoutingUser, fcmAccountId) {
            var fillAccountsTable;
            fillAccountsTable = $("<table/>").attr('id', 'fillAccountsTable_' + fcmAccountId).addClass("innerTable");
            orderRoutingUser.fillAccounts.forEach(function (fillAccount) {
                if (Number(fillAccount.clearingFirmAccount.fcmAccountId.trim()) === fcmAccountId) {
                    addFillAccountRow(fillAccountsTable, orderRoutingUser, fillAccount.clearingFirmAccount.fcmAccountId, fillAccount.fillAccountName);
                }
            });
            return fillAccountsTable;
        },
        createAddOrderAccountButton = function (index) {
            var addOrderAccountButton;
            addOrderAccountButton = $('#redAddImage').clone();
            addOrderAccountButton.attr("title", "Associate a product with a clearing firm account for order routing").addClass('addAccountButton');
            common.setHover(addOrderAccountButton);
            addOrderAccountButton.click(function () {
                addOrderAccountButtonClick(index);
            });
            return addOrderAccountButton;
        },
        createAddFillAccountButton = function (index, fillAccountExists) {
            var addFillAccountButton;
            addFillAccountButton = $('#purpleAddImage').clone();
            addFillAccountButton.addClass('addAccountButton');
            common.setHover(addFillAccountButton);
            if (fillAccountExists) {
                addFillAccountButton.attr("title", "There is already a WhenTech account asssociated with this clearing firm account for fills");
                addFillAccountButton.css('opacity', '0.2');
                return addFillAccountButton;
            }
            addFillAccountButton.css('opacity', '1.0');
            addFillAccountButton.attr("title", "Associate a WhenTech account with a clearing firm account for fills");
            addFillAccountButton.click(function () {
                addFillAccountButtonClick(index);
            });
            return addFillAccountButton;
        },
        createAddAccountButton = function (type) {
            var addAccountButton;
            addAccountButton = $('#addAccountImage').clone();
            addAccountButton.css('opacity', '0.2');
            addAccountButton.attr("title", "Save").addClass('add' + type + 'AccountButton');
            return addAccountButton;
        },
        createCancelAddAccountButton = function (type) {
            var cancelAddAccountButton;
            cancelAddAccountButton = $('#cancelAddAccountImage').clone();
            cancelAddAccountButton.attr("title", "Cancel").addClass('cancelAdd' + type + 'AccountButton');
            cancelAddAccountButton.click(function () {
                $(this).closest('tr').find('td > input').val('');
                $(this).closest('table').hide();
                return false;
            });
            return cancelAddAccountButton;
        },
        createAddFillAccountCallback = function (parent, orderRoutingUser, fillAccountsTable, fcmAccountId, fillAccountName, fcmAccount) {
            return function (response) {
                var text;
                text = response.Message;
                if (!response.Success) {
                    common.showToaster(parent, text, 0, 25, true, null, -1);
                    parent.closest('tr.fcmAccountRow').find('td > input').val('');
                    parent.closest('table').hide('normal');
                    return;
                }
                common.showToaster(parent, text, 0, 25, false);
                addFillAccountRow(fillAccountsTable, orderRoutingUser, fcmAccountId, fillAccountName);
                factory.addFillAccountToFillAccountsArray(orderRoutingUser, fcmAccountId, fillAccountName, fcmAccount);
                disableFillAccountButton(orderRoutingUser, fcmAccountId);
                parent.closest('tr.fcmAccountRow').find('td > input').val('');
                parent.closest('table').hide('normal');
                refreshReports(orderRoutingUser);
                dataAccess.getOrderRoutingUsers("GetOrderRoutingUsers", createFillAccountsReportCallback);
            };
        },
        allowDisallowAddFillAccount = function (caller, orderRoutingUser) {
            var fillAccountName, fcmAccount, addFillAccountButton, row, canAdd, fillAccountsTable, fcmAccountId, callback, source;
            row = caller.closest('tr.fcmAccountRow');
            fcmAccountId = row.attr('id');
            fillAccountsTable = $('#fillAccountsTable_' + fcmAccountId);
            fillAccountName = caller.val();
            fcmAccount = row.children("td.fcmAccountCell").text();
            addFillAccountButton = row.find('img.addFillAccountButton');
            addFillAccountButton.unbind('click');
            source = caller.autocomplete("option", "source");
            canAdd = (fillAccountName && fillAccountName.trim().length > 0) && (fcmAccount && fcmAccount.trim().length > 0) &&
                common.elementExistsInArray(source, fillAccountName);
            if (canAdd) {
                addFillAccountButton.css('opacity', '1.0');
                callback = createAddFillAccountCallback(addFillAccountButton, orderRoutingUser, fillAccountsTable, fcmAccountId, fillAccountName, fcmAccount);
                addFillAccountButton.bind('click', function () {
                    dataAccess.addFillAccount(orderRoutingUser, fillAccountName, fcmAccountId, callback);
                });
                return;
            }
            addFillAccountButton.css('opacity', '0.2');
        },
        createAddOrderAccountCallback = function (parent, orderRoutingUser, orderAccountsTable, product, fcmAccount, fcmAccountId) {
            return function (response) {
                var text = response.Message;
                if (!response.Success) {
                    common.showToaster(parent, text, 0, 25, true, null, -1);
                    parent.closest('tr.fcmAccountRow').find('td > input').val('');
                    parent.closest('table').hide('normal');
                    return;
                }
                common.showToaster(parent, text, 0, 25, false);
                addOrderAccountRow(orderAccountsTable, orderRoutingUser, product, fcmAccountId);
                factory.addOrderAccountToOrderAccountsArray(orderRoutingUser, fcmAccount, fcmAccountId, product);
                refreshReports(orderRoutingUser);
                fillProductAutocomplete(orderRoutingUser);
                parent.closest('tr.fcmAccountRow').find('td > input').val('');
                parent.closest('table').hide('normal');
            };
        },
        allowDisallowAddOrderAccount = function (caller, orderRoutingUser) {
            var product, row, fcmAccount, fcmAccountId, orderAddImage, canAdd, callback, source, orderAccountsTable;
            product = caller.val();
            row = caller.closest('tr.fcmAccountRow');
            fcmAccountId = row.attr('id');
            fcmAccount = row.children('td.fcmAccountCell').text();
            orderAddImage = row.find('img.addOrderAccountButton');
            orderAccountsTable = $('#orderAccountsTable_' + fcmAccountId);
            source = caller.autocomplete("option", "source");
            canAdd = (product && product.trim().length > 0) && common.elementExistsInArray(source, product);
            orderAddImage.unbind('click');
            if (canAdd) {
                orderAddImage.css('opacity', '1.0');
                callback = createAddOrderAccountCallback(orderAddImage, orderRoutingUser, orderAccountsTable, product, fcmAccount, fcmAccountId);
                orderAddImage.bind('click', function () {
                    dataAccess.addOrderAccount(orderRoutingUser, product, fcmAccountId, orderRoutingUser.orderRoutingProvider, callback);
                });
                return;
            }
            orderAddImage.css('opacity', '0.2');
        },
        clearEntryControls = function () {
            $('.oruEntry').each(function () {
                $(this).val("");
            });
        },
        tradeAccountsForClearingFirm = [],
        fillTradeAccountsForClearingFirmCallback = function (response) {
            var parent, toaster;
            if (!response.Success) {
                parent = $("#oruClearingFirm");
                toaster = $("#oruToaster");
                common.showToaster(parent, response.Message, 0, 25, true, toaster, 1000);
            }
            if (response.Success && response.Payload) {
                tradeAccountsForClearingFirm = response.Payload.map(function (element) {
                    return element.Account.toLowerCase();
                });
                common.setAutocomplete(clearingFirmAccountsAutoCompleteControl, 0, tradeAccountsForClearingFirm, null, true, true);
                var accounts = factory.createNativeClearingFirmAccounts(response.Payload);
                factory.setClearingFirmAccountsForClearingFirm(accounts);
            } else {
                tradeAccountsForClearingFirm = [];
            }
        },
        enableDisableSaveButton = function () {
            var cancelButton, addButton, accountIsNotEmpty, accountExists;
            cancelButton = $('#oruCancelAddClearingFirmAccountButton');
            addButton = $('#oruAddClearingFirmAccountButton');
            addButton.unbind('click');
            accountIsNotEmpty = $("#oruClearingFirmAccount").val().trim().length > 0;
            accountExists = $("#oruAccountExists").val();
            if (accountIsNotEmpty) {
                common.enableControl(cancelButton);
            } else {
                common.disableControl(cancelButton);
            }
            if (accountExists === 'false' && accountIsNotEmpty === true) {
                addButton.click(addClearingFirmAccountToClearingFirmButtonClick);
                common.enableControl(addButton);
            } else {
                common.disableControl(addButton);
            }
        },
        addClearingFirmAccountToClearingFirmButtonClick = function () {
            var account, executingFirm, accountComment, callback, clearingFirm, addButton;
            account = $("#oruClearingFirmAccount").val();
            addButton = $('#oruAddClearingFirmAccountButton');
            executingFirm = $("#oruExecutingFirmsAutoComplete").val();
            accountComment = $("#oruAccountComment").val();
            callback = function (response) {
                var text = response.Message;
                if (!response.Success) {
                    common.showToaster(addButton, text, 0, 25, true, null, -1);
                    return;
                }
                common.showToaster(addButton, text, 0, 25, false);
                clearEntryControls();
                enableDisableSaveButton();
                clearingFirm = $("#oruClearingFirm").text().trim();
                dataAccess.getTradeAccountsByClearingFirm(clearingFirm, fillTradeAccountsForClearingFirmCallback);
            };
            clearingFirm = $("#oruClearingFirm").text();
            clearingFirmDataAccess.addClearingFirmAccountToClearingFirm(clearingFirm, account, executingFirm, accountComment, callback);
            return false;
        },
        assignCancelAddClearingFirmAccountButton = function () {
            var clickFunction = function () {
                clearEntryControls();
                enableDisableSaveButton();
                return false;
            };
            $('#oruCancelAddClearingFirmAccountButton').click(clickFunction);
        },
        setAccountExists = function (exists) {
            $("#oruAccountExists").val(exists);
        },
        verifyClearingFirmAccountDoesNotExist = function () {
            var account, message, clearingFirmAccountControl;
            clearingFirmAccountControl = $("#oruClearingFirmAccount");
            account = clearingFirmAccountControl.val().trim().toLowerCase();
            if (tradeAccountsForClearingFirm.indexOf(account) >= 0) {
                message = "The account '" + account + "' already exists";
                common.showToaster(clearingFirmAccountControl, message, 0, 120, true, null, -1);
                common.setErrorBorderAndFocus(clearingFirmAccountControl);
                setAccountExists('true');
            } else {
                $('#toaster').text('');
                $('#toaster').hide();
                setAccountExists('false');
                common.setNormalBorderAndCallback(clearingFirmAccountControl);
            }
            enableDisableSaveButton();
        },
        fillExecutingFirmsAutocomplete = function (sourceArray) {
            var autocomplete = $("#oruExecutingFirmsAutoComplete");
            autocomplete.addClass('executingFirms').attr('title', "Choose an executing firm");
            sourceArray.unshift(common.nonePlaceholder);
            autocomplete.blur(function () {
                if (common.verifyItemExists(autocomplete)) {
                    scrollToPopup();
                }
            });
            autocomplete.keyup(function () {
                return common.verifyItemExists(autocomplete);
            });
            common.setAutocomplete(autocomplete, 0, sourceArray, null, true, true);
        },
        initializeAddAccountToClearingFirmContainer = function (callback) {
            var getExecutingFirmsCallback, clearingFirmAccountControl, clearingFirm;
            assignCancelAddClearingFirmAccountButton();
            enableDisableSaveButton();
            clearingFirmAccountControl = $("#oruClearingFirmAccount");
            clearingFirmAccountControl.blur(function () {
                verifyClearingFirmAccountDoesNotExist();
                return scrollToPopup();
            });
            clearEntryControls();
            getExecutingFirmsCallback = function (response) {
                if (!response.Success) {
                    common.showToaster(null, response.Message, 0, 25, true, null, -1);
                    return;
                }
                fillExecutingFirmsAutocomplete(response.Payload);
                clearingFirm = $("#oruClearingFirm").text().trim();
                dataAccess.getTradeAccountsByClearingFirm(clearingFirm, fillTradeAccountsForClearingFirmCallback);
                callback();
            };
            dataAccess.getExecutingFirms(getExecutingFirmsCallback);
        },
        createLineOne = function (clearingFirm) {
            var lineOne, clearingFirmsContainer, clearingFirmAccountContainer, executingFirmsContainer;
            lineOne = $('<div/>').addClass('oruLine');
            clearingFirmsContainer = $('<div/>').attr('id', 'oruClearingFirmContainer');
            clearingFirmsContainer.append($('<label/>').text("Clearing Firm:"));
            clearingFirmsContainer.append($('<label/>').attr('id', 'oruClearingFirm').addClass('bolddarkgreen').text(clearingFirm));
            lineOne.append(clearingFirmsContainer);
            clearingFirmAccountContainer = $('<div/>').attr('id', 'oruClearingFirmAccountContainer');
            clearingFirmAccountContainer.append($('<label/>').text("FCM Account:"));
            clearingFirmAccountContainer.append($('<input/>').attr({ 'type': 'text', 'id': 'oruClearingFirmAccount' }).addClass('oruEntry'));
            lineOne.append(clearingFirmAccountContainer);
            executingFirmsContainer = $('<div/>').attr('id', 'oruExecutingFirmsContainer');
            executingFirmsContainer.append($('<label/>').text("Customer:"));
            executingFirmsContainer.append($('<input/>').attr({ 'type': 'text', 'id': 'oruExecutingFirmsAutoComplete' }).addClass('oruEntry'));
            lineOne.append(executingFirmsContainer);
            return lineOne;
        },
        createLineTwo = function () {
            var lineTwo, accountCommentContainer, cancelAddAccountButton, addAccountButton;
            lineTwo = $('<div/>').addClass('oruLine');
            accountCommentContainer = $('<div/>').attr('id', 'oruAccountCommentContainer');
            accountCommentContainer.append($('<label/>').text("Comment:"));
            accountCommentContainer.append($('<input/>').attr({ 'type': 'text', 'id': 'oruAccountComment' }).addClass('oruEntry'));

            addAccountButton = $('#addAccountImage').clone();
            addAccountButton.attr({ 'id': 'oruAddClearingFirmAccountButton', "title": "Add account to clearing firm" });
            common.disableControl(addAccountButton);
            accountCommentContainer.append(addAccountButton);

            cancelAddAccountButton = $('#cancelAddAccountImage').clone();
            cancelAddAccountButton.attr({ 'id': 'oruCancelAddClearingFirmAccountButton', "title": "Cancel" });
            common.disableControl(cancelAddAccountButton);
            accountCommentContainer.append(cancelAddAccountButton);

            lineTwo.append(accountCommentContainer);
            return lineTwo;
        },
        createAddAccountToClearingFirmContainer = function (clearingFirm) {
            var container;
            container = $('<div/>').attr('id', 'oruAddClearingFirmAccountToClearingFirmContainer');
            container.append(createLineOne(clearingFirm));
            container.append(createLineTwo());
            container.append($('<input/>').attr({ 'type': 'hidden', 'id': 'oruAccountExists' }).val('true'));
            container.append($('<div/>').attr({ 'id': 'oruToaster' }));
            container.hide();
            return container;
        },
        addAccountToClearingFirmButtonClick = function (clearingFirm) {
            var addAccountToClearingFirmContainer;
            addAccountToClearingFirmContainer = $('#oruAddClearingFirmAccountToClearingFirmContainer');
            if (addAccountToClearingFirmContainer.length > 0 && addAccountToClearingFirmContainer.is(":visible")) {
                addAccountToClearingFirmContainer.slideUp('slow', function () {
                    addAccountToClearingFirmContainer.remove();
                });
                return false;
            }
            addAccountToClearingFirmContainer = createAddAccountToClearingFirmContainer(clearingFirm);
            $('#userClearingFirmAccountsTable').before(addAccountToClearingFirmContainer);
            initializeAddAccountToClearingFirmContainer(function () {
                addAccountToClearingFirmContainer.slideDown('slow');
                $('#oruClearingFirmAccount').focus();
            });
            return false;
        },
        createAddAccountToClearingFirmButton = function (clearingFirm) {
            var title, id, attr, button;
            title = 'Add a new FCM account to the clearing firm "' + clearingFirm + '"';
            id = "addAccountToClearingFirmButton";
            attr = { "id": id, 'title': title };
            button = $('#addClearingFirmAccountImage').clone();
            button.unbind('click');
            button.attr(attr).click(function () {
                addAccountToClearingFirmButtonClick.apply(button, [clearingFirm]);
            });
            return button;
        },
        createProductAutocomplete = function (orderRoutingUser, index) {
            var orderAccountProducts, table, row, cell, addAccountButton, cancelAddAccountButton;
            table = $('<table/>').addClass('innerTable');
            row = $('<tr/>');
            cell = $('<td/>');
            orderAccountProducts = $('<input/>').addClass('productsAutocomplete').attr('title', "Click to choose product to associate with order account");
            cell.append(orderAccountProducts);
            row.append(cell);

            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            addAccountButton = createAddAccountButton("Order");
            cell.append(addAccountButton);
            row.append(cell);

            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            cancelAddAccountButton = createCancelAddAccountButton("Order");
            cell.append(cancelAddAccountButton);
            row.append(cell);
            table.append(row);
            table.attr("id", "orderAccountProducts_" + index).addClass("textDropdown");
            orderAccountProducts.blur(function () {
                allowDisallowAddOrderAccount(orderAccountProducts, orderRoutingUser);
                return scrollToPopup();
            });
            fillProductAutocomplete(orderRoutingUser);
            table.hide();
            return table;
        },
        scrollToPopup = function () {
            $("#hiddenTextBox").focus();
        },
        createFillAccountNameAutocomplete = function (orderRoutingUser, index) {
            var fcmAccountsAutocomplete, callback, table, row, cell, addAccountButton, cancelAddAccountButton;
            table = $('<table/>').addClass('innerTable');
            row = $('<tr/>');
            cell = $('<td/>');
            fcmAccountsAutocomplete = $('<input/>').addClass('fillAccountNamesAutocomplete').attr('title', "Type two characters to choose WhenTech account");
            cell.append(fcmAccountsAutocomplete);
            row.append(cell);
            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            addAccountButton = createAddAccountButton("Fill");
            cell.append(addAccountButton);
            row.append(cell);
            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            cancelAddAccountButton = createCancelAddAccountButton("Fill");
            cell.append(cancelAddAccountButton);
            row.append(cell);
            table.append(row);
            table.attr("id", "fillAccountFcmAccounts_" + index).addClass("textDropdown");
            callback = function (response) {
                if (response.Success) {

                    fcmAccountsAutocomplete.blur(function () {
                        if (common.verifyItemExists(fcmAccountsAutocomplete)) {
                            scrollToPopup();
                        }
                        allowDisallowAddFillAccount(fcmAccountsAutocomplete, orderRoutingUser);
                    });
                    fcmAccountsAutocomplete.keyup(function () {
                        return common.verifyItemExists(fcmAccountsAutocomplete);
                    });
                    common.setAutocomplete(fcmAccountsAutocomplete, 2, response.Payload, null, true, true);
                }
            };
            dataAccess.getFillAccountNames(callback);
            table.hide();
            return table;
        },
        createAddClearingAccountButton = function (username, clearingFirm) {
            var addClearingFirmAccountButton;
            addClearingFirmAccountButton = $('#bluePlusImage').clone();
            addClearingFirmAccountButton.attr('title', 'Add an association between the user "' + username +
                '" and an account belonging to the clearing firm "' + clearingFirm + '"');
            addClearingFirmAccountButton.click(function () {
                $("#clearingFirmAccountsTable").show('normal');
                return false;
            });
            return addClearingFirmAccountButton;
        },
        appendUserClearingFirmAccountRow = function (clearingFirmAccount, orderRoutingUser, table) {
            var index, isVisible, row, cell, button;
            index = clearingFirmAccount && clearingFirmAccount.fcmAccountId ? clearingFirmAccount.fcmAccountId : clearingFirmAccount.Id;
            row = $('<tr/>');
            row.attr('id', index);
            row.addClass('fcmAccountRow');
            cell = $('<td/>');
            cell.text(clearingFirmAccount.fcmAccount);
            cell.addClass('fcmAccountCell');
            row.append(cell);
            cell = $('<td/>');
            cell.addClass('addOrderAccountButtonCell');
            button = createAddOrderAccountButton(index);
            cell.append(button);
            row.append(cell);
            cell = $('<td/>');
            cell.addClass('addFillAccountButtonCell');
            isVisible = factory.fillAccountExists(orderRoutingUser.fillAccounts, clearingFirmAccount.fcmAccountId);
            button = createAddFillAccountButton(index, isVisible);
            cell.append(button);
            row.append(cell);
            cell = $('<td/>');
            cell.addClass('autocompletesCell');
            cell.append(createProductAutocomplete(orderRoutingUser, index));
            cell.append(createFillAccountNameAutocomplete(orderRoutingUser, index));
            row.append(cell);
            cell = $('<td/>');
            cell.append(createOrderAccountsTable(orderRoutingUser, clearingFirmAccount.fcmAccountId));
            row.append(cell);
            cell = $('<td/>');
            cell.append(createFillAccountsTable(orderRoutingUser, clearingFirmAccount.fcmAccountId));
            row.append(cell);
            table.append(row);
        },
        allowDisallowAddClearingFirmAccount = function (caller, orderRoutingUser) {
            var canAdd, source, fcmAccountAddImage, callback, fcmAccount, clearingFirmAccount, table, clearingFirmAccountsAutocomplete;
            fcmAccount = caller.val();
            source = caller.autocomplete("option", "source");
            fcmAccountAddImage = caller.parent('td').next('td.saveCancelButtonCell').children('img');
            fcmAccountAddImage.unbind('click');
            canAdd = common.elementExistsInArray(source, fcmAccount);
            if (canAdd) {
                callback = function (response) {
                    var text = response.Message;
                    if (!response.Success) {
                        common.showToaster(caller, text, 0, 25, true, null, -1);
                        caller.closest('tr').find('td > input').val('');
                        caller.closest('table').hide();
                        return;
                    }
                    common.showToaster(caller, text, 0, 25, false);
                    caller.closest('tr').find('td > input').val('');
                    caller.closest('table').hide();
                    clearingFirmAccount = factory.getClearingFirmAccount(fcmAccount);
                    table = $('#userClearingFirmAccountsTable');
                    appendUserClearingFirmAccountRow(clearingFirmAccount, orderRoutingUser, table);
                    clearingFirmAccountsAutocomplete = fcmAccountAddImage.closest('tr').find('input.clearingFirmAccounts');
                    common.removeItemFromAutocompleteSource(fcmAccount, clearingFirmAccountsAutocomplete);
                };
                fcmAccountAddImage.css('opacity', '1.0');
                fcmAccountAddImage.bind('click', function () {
                    dataAccess.addClearingFirmAccountUserAssociation(orderRoutingUser.username, fcmAccount, orderRoutingUser.clearingFirm, callback);
                    return false;
                });
                return;
            }
            fcmAccountAddImage.css('opacity', '0.2');
        },
        clearingFirmAccountsAutoCompleteControl = {},
        retreiveAndFillClearingFirmAccountsAutoComplete = function (orderRoutingUser) {
            var callback, sourceArray;
            callback = function (response) {
                if (response.Success && response.Payload) {
                    var accounts = factory.createNativeClearingFirmAccounts(response.Payload);
                    factory.setClearingFirmAccountsForClearingFirm(accounts);
                    sourceArray = accounts.map(function (clearingFirmAccount) {
                        return clearingFirmAccount.fcmAccount;
                    });
                    common.removeExistingItemsFromArray(sourceArray, orderRoutingUser.fcmAccounts);
                    clearingFirmAccountsAutoCompleteControl.blur(function () {
                        if (common.verifyItemExists(clearingFirmAccountsAutoCompleteControl, null, -3, 130)) {
                            scrollToPopup();
                        }
                    });
                    clearingFirmAccountsAutoCompleteControl.keyup(function () {
                        return common.verifyItemExists(clearingFirmAccountsAutoCompleteControl, null, -3, 130);
                    });
                    common.setAutocomplete(clearingFirmAccountsAutoCompleteControl, 0, sourceArray, null, true, true);
                }
            };
            dataAccess.getTradeAccountsByClearingFirm(orderRoutingUser.clearingFirm, callback);
        },
        createClearingFirmAccountsAutocomplete = function (orderRoutingUser) {
            var table, row, cell, addClearingFirmButton, cancelAddClearingFirmButton, addAccountToClearingFirmButton;
            table = $('<table/>').addClass('innerTable');
            row = $('<tr/>');
            cell = $('<td/>');
            clearingFirmAccountsAutoCompleteControl = $('<input/>');
            clearingFirmAccountsAutoCompleteControl.addClass('clearingFirmAccounts');
            clearingFirmAccountsAutoCompleteControl.attr('title', "Choose a clearing firm account");
            cell.append(clearingFirmAccountsAutoCompleteControl);
            row.append(cell);

            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            addClearingFirmButton = createAddAccountButton("ClearingFirm");
            cell.append(addClearingFirmButton);
            row.append(cell);

            cell = $('<td/>');
            cell.addClass('saveCancelButtonCell');
            cancelAddClearingFirmButton = createCancelAddAccountButton("ClearingFirm");
            cell.append(cancelAddClearingFirmButton);
            row.append(cell);

            cell = $('<td/>');
            cell.addClass('addAccountToClearingFirmCell');
            addAccountToClearingFirmButton = createAddAccountToClearingFirmButton(orderRoutingUser.clearingFirm);
            cell.append(addAccountToClearingFirmButton);
            row.append(cell);

            table.append(row);
            table.attr("id", "clearingFirmAccountsTable");
            clearingFirmAccountsAutoCompleteControl.blur(function () {
                allowDisallowAddClearingFirmAccount(clearingFirmAccountsAutoCompleteControl, orderRoutingUser);
                return scrollToPopup();
            });
            retreiveAndFillClearingFirmAccountsAutoComplete(orderRoutingUser);
            table.hide();
            return table;
        },
        createAddClearingFirmAccountToUserControl = function (orderRoutingUser) {
            var addClearingFirmAccountButton, userDetailClearingFirmAccountsAutocomplete, addClearingFirmAccountToUserControl, table, row, cell;
            addClearingFirmAccountToUserControl = $('<div/>');
            addClearingFirmAccountToUserControl.addClass('addClearingFirmAccountToUserControl');
            table = $('<table/>').attr('id', 'addClearingFirmAccountToUserTable');
            row = $('<tr/>');
            cell = $('<td/>');
            addClearingFirmAccountButton = createAddClearingAccountButton(orderRoutingUser.username, orderRoutingUser.clearingFirm);
            cell.append(addClearingFirmAccountButton);
            row.append(cell);
            cell = $('<td/>');
            userDetailClearingFirmAccountsAutocomplete = createClearingFirmAccountsAutocomplete(orderRoutingUser);
            cell.append(userDetailClearingFirmAccountsAutocomplete);
            row.append(cell);
            table.append(row);
            addClearingFirmAccountToUserControl.append(table);
            return addClearingFirmAccountToUserControl;
        },
        createUserClearingFirmAccountsTable = function (orderRoutingUser, userClearingFirmAccounts) {
            var table, row, cell, control;
            table = $('<table/>').attr('id', 'userClearingFirmAccountsTable');
            row = $('<tr/>').addClass('fcmAccountRowHeader');
            cell = $('<th/>').addClass('fcmAccountHeaderCell').text("FCM Acct#");
            row.append(cell);
            cell = $('<th/>').attr('colspan', '3').addClass('addRemoveAccountsHeaderRow');
            control = createAddClearingFirmAccountToUserControl(orderRoutingUser);
            cell.append(control);
            row.append(cell);
            cell = $('<th/>').addClass('orderAccountsHeaderCell').text("Order Accounts");
            row.append(cell);
            cell = $('<th/>').addClass('fillAccountsHeaderCell').text("Fill Accounts");
            row.append(cell);
            table.append(row);
            userClearingFirmAccounts.forEach(function (clearingFirmAccount) {
                appendUserClearingFirmAccountRow(clearingFirmAccount, orderRoutingUser, table);
            });
            return table;
        },
        createUserDetailContainer = function (orderRoutingUser) {
            var userDetailUserInfo, userDetailUsername, usernameSpan, userDetailOrderRoutingProvider, orderRoutingProviderSpan,
                userDetailExternalUsername, externalUsernameSpan, userDetailClearingFirm, clearingFirmSpan, clearingFirm, userDetailAddClearingFirmAccount,
                addAccountToClearingFirmButton, hiddenTextBox;
            userDetailUserInfo = $('<div/>');
            hiddenTextBox = $('<input/>').attr({ 'id': 'hiddenTextBox', 'tabindex': '1' }).css({ 'width': '1px', 'height': '1px', 'border': 'none' });
            userDetailUserInfo.append(hiddenTextBox);
            userDetailUserInfo.attr('id', 'userDetailUserInfo');
            userDetailAddClearingFirmAccount = $('<div/>');
            userDetailUserInfo.append(userDetailAddClearingFirmAccount);
            userDetailUsername = $('<div/>');
            userDetailUsername.addClass('userDetailUsername');
            userDetailUsername.append('<label/>').text("Username:");
            usernameSpan = $('<span/>').attr('id', 'userDetailUsername').text(orderRoutingUser.username);
            userDetailUsername.append(usernameSpan);
            userDetailUserInfo.append(userDetailUsername);
            userDetailOrderRoutingProvider = $('<div/>');
            userDetailOrderRoutingProvider.addClass('userDetailOrderRoutingProvider');
            userDetailOrderRoutingProvider.append('<label/>').text("Provider:");
            orderRoutingProviderSpan = $('<span/>').attr('id', 'userDetailOrderRoutingProvider').text(orderRoutingUser.orderRoutingProvider);
            userDetailOrderRoutingProvider.append(orderRoutingProviderSpan);
            userDetailUserInfo.append(userDetailOrderRoutingProvider);
            userDetailExternalUsername = $('<div/>');
            userDetailExternalUsername.addClass('userDetailExternalUsername');
            userDetailExternalUsername.text("External Username:");
            externalUsernameSpan = $('<span/>').attr('id', 'userDetailExternalUsername').text(orderRoutingUser.externalUsername);
            userDetailExternalUsername.append(externalUsernameSpan);
            userDetailUserInfo.append(userDetailExternalUsername);
            userDetailClearingFirm = $('<div/>');
            userDetailClearingFirm.addClass('userDetailClearingFirm');
            userDetailClearingFirm.append('<label/>').text("Clearing Firm:");
            clearingFirm = orderRoutingUser.clearingFirm;
            clearingFirmSpan = $('<span/>').attr('id', 'userDetailClearingFirm').text(clearingFirm);
            userDetailClearingFirm.append(clearingFirmSpan);
            addAccountToClearingFirmButton = createAddAccountToClearingFirmButton(clearingFirm);
            userDetailClearingFirm.append(addAccountToClearingFirmButton);
            userDetailUserInfo.append(userDetailClearingFirm);
            return userDetailUserInfo;
        };
    return {
        createAndDisplayFcmAccountsControl: function (row, top, left) {
            var userClearingFirmAccounts, table, userDetailContainer, callback, orderRoutingUser, clearingFirm;
            orderRoutingUser = createOrderRoutingUserFromElement(row);
            clearingFirm = orderRoutingUser.clearingFirm;
            userClearingFirmAccounts = [];
            callback = function (response) {
                response.Payload.forEach(function (clearingFirmAccount) {
                    var account = factory.createClearingFirmAccount(clearingFirmAccount.Firm.trim(), clearingFirmAccount.Account, clearingFirmAccount.Id);
                    userClearingFirmAccounts.push(account);
                });
                userDetailContainer = createUserDetailContainer(orderRoutingUser);
                orderRoutingUser.fcmAccounts = userClearingFirmAccounts.map(function (clearingFirmAccount) {
                    return clearingFirmAccount.fcmAccount;
                });
                table = createUserClearingFirmAccountsTable(orderRoutingUser, userClearingFirmAccounts);
                showFcmAccountsControl(userDetailContainer, table, top, left);
            };
            dataAccess.getClearingFirmAccountsForUser(orderRoutingUser.username, clearingFirm, callback);
        }
    };
});