/*globals*/
"use strict";
define(["latestMessagesReportDataAccess", "latestMessagesReportFactory", "htmlHelper", "common"], function (dataAccess, factory, htmlHelper, common) {
    var tradeEntrySourceProviderSelect = $("#tradeEntrySourceProviderSelect"),
        latestMessagesReportContainer = $('#latestMessagesReportContainer'),
        getProcessorId = function () {
            return tradeEntrySourceProviderSelect.val();
        },
        displayLatestMessages = function (response) {
            if (!response.Success) {
                window.location.reload();
            }
            latestMessagesReportContainer.empty();
            latestMessagesReportContainer.append(factory.createLatestMessagesReportTable(response.Payload));
            common.disablePopup();
        },
        getLatestMessages = function () {
            showLoadingPopup();
            dataAccess.getLatestMessages(getProcessorId(), displayLatestMessages);
            
        },
        initializeTradeEntrySourceProviderSelect = function (response) {
            htmlHelper.initializeSelect(tradeEntrySourceProviderSelect, '');
            if (response.Success && response.Payload) {
                response.Payload.forEach(function (element) {
                    tradeEntrySourceProviderSelect.append(htmlHelper.createOption(element.Name, element.ProcessorID, element.Description));
                });
            }
        },
        showLoadingPopup = function () {
            var container;
            common.clearPopup();
            container = $('#loadingContainer').clone();
            container.show();
            common.getPopup().append(container);
            common.assignPopupEvents();
            common.showPopup(200, 400);
        },
        assignEventHandlers = function () {
            tradeEntrySourceProviderSelect.change(getLatestMessages);
        };
    return {
        initialize: function () {
            assignEventHandlers();
            dataAccess.getFrontEndClearingProcessors(initializeTradeEntrySourceProviderSelect);
        }
    };
});