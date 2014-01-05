/*globals $, define, console*/
"use strict";
define(['managePageAccessDataAccess', "managePageAccessFactory", "htmlHelper", 'common'], function (dataAccess, factory, htmlHelper, common) {
    var pageCategories = [],
        pagesTableContainer = $('#pagesTableContainer'),
        createCategoryInput = $('#createCategoryInput'),
        createCategoryImage = $('#createCategoryImage'),
        saveCategoryImage = $('#saveCategoryImage'),
        cancelSaveCategoryImage = $('#cancelSaveCategoryImage'),
        categoryRoleToaster = $('#categoryRoleToaster'),
        createRoleImage = $('#createRoleImage'),
        manageCreatePageAccessError = $('#manageCreatePageAccessError'),
        managePageAccessError = $('#managePageAccessError'),
        managePageAccessStatus = $('#managePageAccessStatus'),
        pageCategoriesSelect = $('#pageCategoriesSelect'),
        pageCategorySelect = $('#pageCategorySelect'),
        pageUrlInput = $('#pageUrlInput'),
        confirmDialog = $('#confirmDialog'),
        pageDescriptionInput = $('#pageDescriptionInput'),
        showCreatePageAccessImage = $('#showCreatePageAccessImage'),
        hideCreatePageAccessImage = $('#hideCreatePageAccessImage'),
        createPageAccessContainer = $('#createPageAccessContainer'),
        createPageAccessButton = $('#createPageAccessButton'),
        managePageAccessCategoriesLabel = $('#managePageAccessCategoriesLabel'),
        rolesContainer = $('#rolesContainer'),
        updatePage = function (pageInfo) {
            var callback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
            };
            dataAccess.updatePage(pageInfo.pageId, pageInfo.categoryId, pageInfo.url, pageInfo.description, callback);
        },
        updatePageAccess = function () {
            var idArray, pageId, roleId, canView, callback;
            callback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
            };
            idArray = $(this).attr("id").split('_').map(function (item) { return Number(item); });
            idArray.push($(this).is(":checked") ? "True" : "False");
            pageId = idArray[0];
            roleId = idArray[1];
            canView = idArray[2];
            dataAccess.updatePageAccess(pageId, roleId, canView, callback);
        },
        clear = function () {
            pageCategorySelect.val('');
            pageUrlInput.val('');
            pageDescriptionInput.val('');
            managePageAccessError.text('');
            managePageAccessStatus.text('');
            manageCreatePageAccessError.empty();
        },
        deletePageAccess = function () {
            var message, title, proceed, pageId, position, description, deletePageAccessCallback, removePageAccessRow;
            clear();
            pageId = $(this).closest('tr').attr('id');
            description = $(this).closest('tr').find('.pageDescription').text();
            message = "Delete the the page '" + description + "'?";
            title = "Delete page access";
            position = $(this).position();
            removePageAccessRow = function () {
                pagesTableContainer.find('.pageAccessRow[id=' + pageId + ']').remove();
            };
            deletePageAccessCallback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
                removePageAccessRow(pageId);
                managePageAccessStatus.text(response.Message);
            };
            proceed = function () {
                dataAccess.deletePageAccess(pageId, deletePageAccessCallback);
            };
            common.confirmDialog(confirmDialog, message, title, position.top, position.left, proceed);
        },
        displayPagesTable = function (response) {
            var pageAccessTable;
            pagesTableContainer.empty();
            if (response.Success) {
                pageCategories = response.Payload.pageCategories;
                pageAccessTable = factory.createPageAccessTable(response.Payload.pageInfos, pageCategories, updatePageAccess, deletePageAccess, updatePage);
                pagesTableContainer.append(pageAccessTable);
            }
        },
        filterByPageCategory = function () {
            var selectedCategory, i, rows, span, row;
            rows = pagesTableContainer.find('tr.pageAccessRow');
            selectedCategory = $(this).find('option:selected').text();
            if (!$(this).val()) {
                rows.show();
                return;
            }
            for (i = 0; i < rows.length; i += 1) {
                row = $(rows[i]);
                span = row.find("span.pageCategory");
                if (span.text() !== selectedCategory) {
                    row.hide();
                } else {
                    row.show();
                }
            }
            $(".rolesTable").find('tr').each(function () {
                $(this).show();
            });
        },
        toggleCreatPageAccessControls = function () {
            showCreatePageAccessImage.toggle('fast');
            hideCreatePageAccessImage.toggle('fast');
            createPageAccessContainer.slideToggle('fast');
            pagesTableContainer.slideToggle('fast');
            managePageAccessCategoriesLabel.toggle('fast');
            pageCategoriesSelect.toggle('fast');
            createRoleImage.toggle('fast');
        },
        createCheckbox = function (id, caption) {
            var container, label, checkbox;
            label = $('<span>').text(caption);
            checkbox = $('<input>').attr("type", "checkbox").addClass('pageAccessCheckbox').attr({ "id": id });
            container = $("<div>").addClass('checkboxDiv');
            container.append(label);
            container.append(checkbox);
            return container;
        },
        createCheckboxGroup = function (roles) {
            var table, data = [];
            roles.forEach(function (role) {
                if (role.ID !== 5 && role.ID !== 6) {
                    data.push(createCheckbox(role.ID, role.Name, role.CanView));
                }
            });
            table = htmlHelper.createFixedColumnsTable(data, roles.length, 'rolesTable');
            return table;
        },
        getRoles = function () {
            var roles, roleId, roleName, id;
            roles = [];
            $('.rolesTable:first').find('.checkboxDiv').each(function () {
                id = $(this).find("input").attr('id');
                roleId = id.substring(id.indexOf('_') + 1);
                roleName = $(this).find("span").text();
                roles.push({ ID: roleId, Name: roleName });
            });
            return roles;
        },
        showCreatePageAccess = function () {
            clear();
            htmlHelper.fillSelectFromKeyValuePairs(pageCategorySelect, 'choose category', pageCategories, '< none >');
            rolesContainer.empty();
            rolesContainer.append($('#rolesLabel').clone());
//            rolesContainer.append(createRoleImage);
            rolesContainer.append(createCheckboxGroup(getRoles()));
            toggleCreatPageAccessControls();
        },
        hideCreatePageAccess = function () {
            clear();
            toggleCreatPageAccessControls();
        },
        getPageAccessErrors = function (categoryId, url, description) {
            var errors = [];
            if (!categoryId) {
                errors.push("Category is required");
            }
            if (!url || url.trim().length === 0) {
                errors.push("Url is required");
            }
            if (!description || description.trim().length === 0) {
                errors.push("Description is required");
            }
            return errors;
        },
        createPageAccess = function () {
            var categoryId, url, description, roleIds, callback, pageAccessErrors;
            categoryId = pageCategorySelect.val();
            url = pageUrlInput.val();
            description = pageDescriptionInput.val();
            roleIds = [];
            rolesContainer.find('.pageAccessCheckbox:checked').each(function () {
                roleIds.push(Number(Number($(this).attr('id'))));
            });
            callback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
                hideCreatePageAccess();
                dataAccess.getPageAccessInfos(displayPagesTable);
            };
            manageCreatePageAccessError.empty();
            pageAccessErrors = getPageAccessErrors(categoryId, url, description);
            if (pageAccessErrors.length > 0) {
                pageAccessErrors.forEach(function (error) {
                    manageCreatePageAccessError.append($('<div>').text(error).addClass('redLabel'));
                });
                return;
            }
            dataAccess.createPageAccess(categoryId, url, description, roleIds, callback);
        },
        showCreateCategory = function () {
            pageCategorySelect.hide();
            createCategoryImage.hide();
            saveCategoryImage.show();
            cancelSaveCategoryImage.show();
            createCategoryInput.fadeIn('medium');
            createCategoryInput.focus();
        },
        hideCreateCategory = function () {
            createCategoryImage.show();
            saveCategoryImage.hide();
            cancelSaveCategoryImage.hide();
            createCategoryInput.hide();
            createCategoryInput.val('');
            pageCategorySelect.fadeIn('medium');
        },
        createPageCategory = function () {
            var category, callback, categoryNames, option;
            callback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
                pageCategories.push(response.Payload);
                htmlHelper.fillSelectFromKeyValuePairs(pageCategorySelect, 'choose category', pageCategories, '< none >');
                hideCreateCategory();
                common.showToaster(createCategoryImage, "The category was added.", -3, 25, false, categoryRoleToaster);
                $('.pageAccessTable').find('select.write').each(function () {
                    option = $('<option>').val(response.Payload.Key).text(response.Payload.Value);
                    $(this).append(option);
                });
            };
            category = createCategoryInput.val().trim();
            if (!category) {
                common.showToaster($(this), "The category is required.", -3, 25, true, categoryRoleToaster);
                createCategoryInput.focus();
                return;
            }
            categoryNames = pageCategories.map(function (item) { return item.Value.toLowerCase(); });
            if (categoryNames.indexOf(category.toLowerCase()) === -1) {
                dataAccess.createPageCategory(category, callback);
            }
        },
        createRole = function () {
            var role, description, callback;
            callback = function (response) {
                if (!response.Success) {
                    managePageAccessError.text(response.Message);
                    return;
                }
            };
            role = 'foo';
            description = 'bar';
            dataAccess.createRole(role, description, callback);
        },
        assignEventHandlers = function () {
            pageCategoriesSelect.bind('change', filterByPageCategory);
            showCreatePageAccessImage.bind('click', showCreatePageAccess);
            hideCreatePageAccessImage.bind('click', hideCreatePageAccess);
            createPageAccessButton.bind('click', createPageAccess);
            createCategoryImage.bind('click', showCreateCategory);
            saveCategoryImage.bind('click', createPageCategory);
            cancelSaveCategoryImage.bind('click', hideCreateCategory);
            createRoleImage.bind('click', createRole);
        };
    return {
        initialize: function () {
            assignEventHandlers();
            dataAccess.getPageAccessInfos(displayPagesTable);
        }
    };
});