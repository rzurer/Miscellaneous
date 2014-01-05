/*global $, define */
"use strict";
define(['htmlHelper'], function (htmlHelper) {
    var updateToNewVersion = function () {
            var oldVersion, newVersion, oldVersionDescription, newVersionDescription, versionSelect, updateToVersionSelect, updateButton;
            updateButton = $('#updateUsersToVersionImage');
            versionSelect = $('#versionSelect');
            updateToVersionSelect = $('#updateToVersionSelect');
            oldVersion = versionSelect.val();
            oldVersionDescription = versionSelect.find('option:selected').text();
            newVersion = updateToVersionSelect.val();
            newVersionDescription = updateToVersionSelect.find('option:selected').text();
            $.ajax({
                type: "POST",
                url: "ApplicationVersionOverride.aspx/UpdateVersion",
                data: JSON.stringify({ oldVersion: oldVersion, newVersion: newVersion }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (!response.d.Success) {
                        $('#lblErrorMessage').text(response.d.Message);
                        return;
                    }
                    versionSelect.val(newVersion);
                    $('.versionLabel').each(function () {
                        if ($(this).text() === oldVersionDescription) {
                            $(this).text(newVersionDescription);
                        }
                    });
                    $('.versionSelect').val(function () {
                        if ($(this).val() === oldVersion) {
                            $(this).val(newVersion);
                        }
                    });
                    updateButton.css('opacity', '0.2');
                    updateToVersionSelect.val('-1');
                    versionSelect.trigger('change');
                }
            });
        },
        selectUpdateVersion = function () {
            var updateButton = $('#updateUsersToVersionImage');
            updateButton.unbind("click");
            updateButton.removeAttr('title');
            updateButton.css('opacity', '0.2');
            if ($(this).val() > 0) {
                updateButton.css('opacity', '1.0');
                updateButton.attr('title', 'Update users to selected version');
                updateButton.bind("click", updateToNewVersion);
            }
        };
    return {
        initialize: function () {
            var versionSelect, selectedVersion, selectedVersionDescription, versionDescription, updateToVersionSelect, versionHasUsers, bulkVersionUpdate;
            versionSelect = $('#versionSelect');
            bulkVersionUpdate = $('#bulkVersionUpdate');
            selectedVersion = versionSelect.val();
            selectedVersionDescription = versionSelect.find('option:selected').text();
            versionDescription = $('#versionDescription');
            updateToVersionSelect = $('#updateToVersionSelect');
            versionHasUsers = $('.GridViewReport').text().indexOf('No data') === -1;
            versionDescription.text('');
            updateToVersionSelect.unbind('change');
            if (selectedVersion && selectedVersion > 0 && versionHasUsers) {
                htmlHelper.copySelectToSelect(versionSelect, updateToVersionSelect);
                updateToVersionSelect.find('option').each(function () {
                    if ($(this).val() === selectedVersion) {
                        $(this).remove();
                    }
                });
                updateToVersionSelect.bind('change', selectUpdateVersion);
                versionDescription.text(selectedVersionDescription);
                bulkVersionUpdate.fadeIn();
                return;
            }
            bulkVersionUpdate.fadeOut();
        }
    };
});
