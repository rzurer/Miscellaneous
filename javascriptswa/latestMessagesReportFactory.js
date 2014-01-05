/*globals*/
"use strict";
define(["htmlHelper", "common"], function ( htmlHelper, common) {
    var createMessageRow = function(messageText, id) {
            var row, cell;
            row = htmlHelper.createRow('messageRow');
            cell = htmlHelper.appendCell(row, messageText, 520, false, 'xmlMessage');
            cell.attr({ "id": id, "colspan": 9});
            return row;
        },
        clearMessageButtons = function () {
            $('.selectedButton').removeClass('selectedButton').addClass('unselectedButton').unbind('click').bind('click', showMessage);
            $('.messageRow').remove();
        },
        showMessage = function () {
            var button, messageText, messageRow, id;
            clearMessageButtons();
            button = $(this);
            button.removeClass('unselectedButton').addClass('selectedButton').unbind('click').bind('click', hideMessage).attr('title', 'Hide Message');;
            messageText = button.closest('tr').find('td.hiddenMessage').text();
            id = new Date().getTime();
            messageRow = createMessageRow(messageText, id);
            button.closest('tr').after(messageRow);
            common.selectText(id);
        },
        hideMessage = function () {
            var button = $(this);
            clearMessageButtons();
            button.removeClass('selectedButton').addClass('unselectedButton').unbind('click').bind('click', showMessage).attr('title', 'Show Message');
        },
        createLatestMessagesReportRow = function (message) {
            var row, messageCell, messageButton, isRejected, isAccepted, cell;
            row = htmlHelper.createRow();
            common.setSimpleRowHover(row);           
            cell = htmlHelper.appendCell(row, message.UpdateTime);
            cell.css('color', 'blue');
            htmlHelper.appendCell(row, message.TradeLegID);
            htmlHelper.appendCell(row, message.MessageID);
            htmlHelper.appendCell(row, message.ExchangeCode);
            isRejected = message.Status === 'Rejected';
            isAccepted = message.Status === 'Accepted';
            cell = htmlHelper.appendCell(row, message.Status);
            if (isRejected) {
                cell.css('color', 'red');
            }
            if (isAccepted) {
                cell.css('color', 'green');
            }
            cell = htmlHelper.appendCell(row, message.RejectReasonId);
            if (isRejected) {
                cell.css('color', 'red');
            }          
            cell = htmlHelper.appendCell(row, message.RejectReason);
            if (isRejected) {
                cell.css('color', 'red');
            }    
            htmlHelper.appendCell(row, message.Message, 0, false, 'hiddenMessage');
            messageCell = htmlHelper.appendCell(row);
            messageButton = htmlHelper.createContainer("", 'messageButton unselectedButton');
            messageButton.bind('click', showMessage).attr('title', 'Show Message');
            messageCell.append(messageButton);
            return row;
        },
        createLatestMessagesReportHeaderRow = function () {
            var row;
            row = htmlHelper.createRow();
            htmlHelper.appendCell(row, "Time", 130, true);
            htmlHelper.appendCell(row, "TradeLegID", 250, true);
            htmlHelper.appendCell(row, "ID", 60, true);
            htmlHelper.appendCell(row, "Exch", 60, true);
            htmlHelper.appendCell(row, "Status", 70, true);
            htmlHelper.appendCell(row, "RejectID", 70, true);
            htmlHelper.appendCell(row, "RejectReason", 300, true);
            htmlHelper.appendCell(row, "", 0, true);
            htmlHelper.appendCell(row, "Message", 60, true);
         return row;
        };
    return {
        createLatestMessagesReportTable : function (messages) {
            var table = htmlHelper.createTable("latestMessagesReport");
            table.append(createLatestMessagesReportHeaderRow());
            messages.forEach(function (message) {
                table.append(createLatestMessagesReportRow(message));
            });
            return table;
        }
    };
});