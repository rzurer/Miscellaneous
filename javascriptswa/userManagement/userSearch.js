/*globals $, console, document, define */
define(['common', 'htmlHelper'],
    function (common, htmlHelper) {
        "use strict";
        var eventListener,
            userSearchEntry = $("#userSearchEntry"),
            searchResultsSelectContainer = $("#searchResultsSelectContainer"),
            searchResultsSelect = $('#searchResultsSelect'),
            initializeSearchControls = function () {
                userSearchEntry.val('');
                searchResultsSelect.hide();
                htmlHelper.initializeSelect(searchResultsSelect);
            },
            displaySearchResults = function (value, wantReadOnly) {
                eventListener.fire("ShowExistingUserInformation", [value, true, wantReadOnly]);
                initializeSearchControls();
            },
            addSearchResultHover = function () {
                var id, toaster;
                toaster = $('#nameSearchToaster');
                searchResultsSelect.find('option').hover(
                    function (e) {
                        id = $(this).attr('id');
                        common.showToaster(null, 'License : ' + id, e.pageY - 5, e.pageX + 20, false, toaster, -1, '', 'dimGrayColor');
                    },
                    function () {
                        toaster.hide();
                    }
                );
            },
            showSearchResults = function (response) {
                var userInfos, code, option, wantReadOnly;
                if (!response.Success) {
                    eventListener.fire("FailedResponse", [response.Message]);
                    return;
                }
                wantReadOnly = response.wantReadOnly;
                userInfos = response.Payload;
                if (!userInfos || !userInfos.length || userInfos.length === 0) {
                    return;
                }
                if (userInfos && userInfos.length && userInfos.length > 0) {
                    searchResultsSelect.off("dblclick");
                    searchResultsSelect.on("dblclick", function () {
                        displaySearchResults($(this).val(), wantReadOnly);
                    });
                    searchResultsSelect.off("change");
                    searchResultsSelect.on("change", function () {
                        eventListener.fire("ShowExistingUserInformation", [$(this).val(), false, wantReadOnly]);
                    });
                    searchResultsSelect.off("keyup");
                    searchResultsSelect.on("keyup", function (e) {
                        code = e.charCode || e.keyCode;
                        if (code === 13) {
                            displaySearchResults($(this).val(), wantReadOnly);
                        }
                    });
                    searchResultsSelect.attr('size', Math.min(userInfos.length + 1, 10));
                    userInfos.forEach(function (userInfo) {
                        option = htmlHelper.createOption(userInfo.FullName, userInfo.Name, '', '', userInfo.LicenseType);
                        searchResultsSelect.append(option);
                    });
                    addSearchResultHover();
                    searchResultsSelectContainer.append(searchResultsSelect);
                    searchResultsSelect.show();
                }
            },
            enterSearchResultsSelect = function () {
                searchResultsSelect.focus();
                searchResultsSelect.val('');
            },
            searchByFirstNameLastName = function (e) {
                var code, searchTerm;
                code = e.charCode || e.keyCode;
                if (code === 13 || code === 40) {
                    enterSearchResultsSelect();
                    return;
                }
                searchResultsSelect.hide();
                htmlHelper.initializeSelect(searchResultsSelect);
                searchTerm = $(this).val();
                if (searchTerm) {
                    searchTerm = searchTerm.trim();
                }
                if (searchTerm && searchTerm.length > 2) {
                    eventListener.fire("SearchByFirstNameLastName", [e.data.wantReadOnly, searchTerm, showSearchResults]);
                }
            },
            assignEventHandlers = function (wantReadOnly) {
                userSearchEntry.off("keyup");
                userSearchEntry.on("keyup", '', {wantReadOnly: wantReadOnly}, searchByFirstNameLastName);
                userSearchEntry.off("keypress", common.isLetter);
                userSearchEntry.on("keypress", common.isLetter);
            },
            initializeEventListener = function (listener) {
                eventListener = listener;
                eventListener.removeListener("InitializeSearchControls", initializeSearchControls);
                eventListener.addListener("InitializeSearchControls", initializeSearchControls);
            };
        return {
            initializeEventListener: initializeEventListener,
            assignEventHandlers: assignEventHandlers
        };
    });