/*globals define, $, console */
"use strict";
define(["traderChangeLogDataAccess", "htmlHelper", "common"], function (dataAccess, htmlHelper, common) {
    var createTraderChangeLogRow = function (entry) {
            var value = entry.Value,
                row = htmlHelper.createRow();
            htmlHelper.appendCell(row,entry.Key, '', false, "logDate");
            htmlHelper.appendCell(row, value.Trader, '', false, "updateLogTrader");
            htmlHelper.appendCell(row, value.PropertyName, '', false, "updateLogPropertyName");
            htmlHelper.appendCell(row, value.OldValue);
            htmlHelper.appendCell(row, value.NewValue);
            htmlHelper.appendCell(row, value.UpdateUser, '', false, "updateLogUpdateUser");
            return row;
        },
        createTraderChangeLogHeader = function () {
            var row = htmlHelper.createRow();
            htmlHelper.appendCell(row, "Updated", 160, true);
            htmlHelper.appendCell(row, "Trader", 100, true);
            htmlHelper.appendCell(row, "What", 150, true);
            htmlHelper.appendCell(row, "From", 250, true);
            htmlHelper.appendCell(row, "To", 250, true);
            htmlHelper.appendCell(row, "By Whom", 150, true);
            return row;
        },
        getTraderChangeLogCallback = function (response) {
            var entries = response.Payload,
                container = $("#traderLogTableContainer"),
                table = htmlHelper.createTable(),
                row;
            container.empty();
            if (!entries || entries.length === 0) {
                row = htmlHelper.createRow();
                htmlHelper.appendCell(row, "No entries found.");
                table.append(row);
                container.append(table);
                return;
            }
            table.append(createTraderChangeLogHeader());
            entries.forEach(function (entry) {
                table.append(createTraderChangeLogRow(entry));
            });
            container.append(table);
        },
        getDaysBack = function () {
            if ($("#radioOneDay").is(":checked")) {
                return 1;
            }
            if ($("#radioSevenDays").is(":checked")) {
                return 7;
            }
            if ($("#radioThirtyDays").is(":checked")) {
                return 30;
            }
            if ($("#radioNinetyDays").is(":checked")) {
                return 90;
            }
            return 1;
        },
        getTraderChangeLog = function () {
            var daysBack = getDaysBack(),
                trader = $('#tradersSelect').val();
            dataAccess.getTraderChangeLog(daysBack, trader, getTraderChangeLogCallback);
        },
        getUsernamesCallback = function (response) {
            htmlHelper.fillSelectFromList($('#tradersSelect'), "Select Trader", response.Payload, "< ALL >");
            dataAccess.getTraderChangeLog(1, '', getTraderChangeLogCallback);
        };
    return {
        initialize: function () {
            common.trapEnterKey($('form'));
            $('#tMenu').find('a').attr('tabindex', -1);
            $("#radioOneDay").attr("checked", "checked");
            $(".traderLog").click(getTraderChangeLog);
            $("#tradersSelect").change(getTraderChangeLog);
            dataAccess.getAllTraders(getUsernamesCallback);
        }
    };
});