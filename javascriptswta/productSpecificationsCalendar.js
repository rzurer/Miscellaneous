/*global  $, document*/
"use strict";
var productSpecificationsCalendar = function (urlLibrarian, common) {
    var yearsArray,
        currentYearIndex,
        daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        getDaysInMonth = function (month, year) {
            if ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) {
                return 29;
            }
            return daysInMonth[month];
        },
        getInfoContainer = function () {
            return $("#infoContainer");
        },
        getHolidayInfoContainer = function () {
            return $("#holidayInfoContainer");
        },
        getContractInfoContainer = function () {
            return $("#contractInfoContainer");
        },
        createMonthTableHeaderRow = function (monthName, businessDaysInMonth) {
            var row, cell;
            row = $('<tr>');
            cell = $('<th>');
            cell.addClass('monthTableHeader');
            cell.text(monthName);
            cell.attr('colspan', 6);
            row.append(cell);
            cell = $('<th>');
            cell.text(businessDaysInMonth);
            cell.addClass('businessDaysInMonth');
            cell.attr("title", "Business days in " + monthName);
            row.append(cell);
            return row;
        },
        createDaysOfWeekHeaderRow = function () {
            var row;
            row = $('<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>');
            row.addClass('daysOfWeekHeader');
            return row;
        },
        createCalendarDayCell = function (id, text, isWeekendDay, isInThePast, isToday) {
            var cell;
            cell = $('<td>');
            cell.attr('id', id);
            cell.text(text);
            cell.addClass("calendarCell");
            if (isWeekendDay) {
                cell.addClass("weekendCell");
            }
            if (isInThePast) {
                cell.css("background-image", "url(" + urlLibrarian.InThePastImage + ")");
            }
            if (isToday) {
                cell.addClass("isToday");
            }
            return cell;
        },
        createProductCell = function (product, derivativeType) {
            var cell, span;
            cell = $('<th>');
            cell.text('Product: ');
            span = $('<span>');
            span.text(product + " " + derivativeType);
            cell.append(span);
            cell.addClass("productCell");
            return cell;
        },
        showYearTable = function () {
            $('#' + yearsArray[currentYearIndex]).show();
        },
        createPreviousYearImage = function () {
            var image;
            image = $('<img>');
            image.attr('src', urlLibrarian.PreviousImage);
            image.click(function () {
                if (currentYearIndex > 0) {
                    currentYearIndex -= 1;
                }
                $('.yearTable').hide();
                showYearTable();
            });
            return image;
        },
        createNextYearImage = function () {
            var image;
            image = $('<img>');
            image.attr('src', urlLibrarian.NextImage);
            image.click(function () {
                if (currentYearIndex < yearsArray.length - 1) {
                    currentYearIndex += 1;
                }
                $('.yearTable').hide();
                showYearTable();
            });
            return image;
        },
        createYearCell = function (year, initialYear, finalYear) {
            var cell, span;
            cell = $('<th>');
            if (year !== initialYear) {
                cell.append(createPreviousYearImage());
            }
            span = $('<span>');
            span.text(year);
            cell.append(span);
            if (year !== finalYear) {
                cell.append(createNextYearImage());
            }
            cell.addClass("yearCell");
            cell.attr('colspan', 2);
            return cell;
        },
        createHolidayScheduleNameCell = function (holidayScheduleName) {
            var cell, span;
            cell = $('<th>');
            span = $('<span>');
            span.text(holidayScheduleName);
            cell.append(span);
            cell.attr('colspan', 4);
            return cell;
        },
        createYearInfoCell = function (businessDaysInYear) {
            var cell;
            cell = $('<th>');
            cell.text('Business Days: ' + businessDaysInYear);
            cell.addClass("yearInfoCell");
            return cell;
        },
        createHolidayScheduleNameRow = function (holidayScheduleName) {
            var row;
            row = $('<tr>');
            row.addClass('holidayScheduleNameRow');
            row.append(createHolidayScheduleNameCell(holidayScheduleName));
            return row;
        },
        createYearHeaderRow = function (product, year, businessDaysInYear, derivativeType, initialYear, finalyear) {
            var row;
            row = $('<tr>');
            row.addClass('yearHeaderRow');
            row.append(createProductCell(product, derivativeType));
            row.append(createYearCell(year, initialYear, finalyear));
            row.append(createYearInfoCell(businessDaysInYear));
            return row;
        },
        createMonthContainerRow = function () {
            var row;
            row = $('<tr>');
            row.addClass('monthContainerRow');
            return row;
        },
        createMonthContainerCell = function (monthTable) {
            var cell;
            cell = $('<td>');
            cell.addClass('monthContainerCell');
            cell.html(monthTable);
            return cell;
        },
        getBusinessDaysInMonth = function (year, month, holidaysForYear) {
            var businessDaysInMonth, numberOfDaysInMonth, dayOfWeek, isWeekendDay, holidaysInMonth, i;
            businessDaysInMonth = 0;
            holidaysInMonth = 0;
            numberOfDaysInMonth = getDaysInMonth(month, year);
            for (i = 0; i < numberOfDaysInMonth; i += 1) {
                dayOfWeek = new Date(year, month, i).getDay();
                isWeekendDay = dayOfWeek === 0 || dayOfWeek === 5;
                if (!isWeekendDay) {
                    businessDaysInMonth += 1;
                }
            }
            holidaysForYear.forEach(function (holiday) {
                var dateFromDayOfYear, monthOfDate;
                dateFromDayOfYear = common.getDateFromDayOfYear(year, holiday.Key);
                monthOfDate = dateFromDayOfYear.getMonth();
                if (month === monthOfDate) {
                    holidaysInMonth += 1;
                }
            });
            return businessDaysInMonth - holidaysInMonth;
        },
        createCalendarFor = function (year, holidaysForYear) {
            var i, j, row, monthTables, month, firstDay, monthTable, dayInYear, businessDaysInYear, dayOfWeek, isWeekendDay, isInThePast, dateFromDayOfYear, today, isToday, monthName, businessDaysInMonth;
            monthTables = [];
            businessDaysInYear = 0;
            dayInYear = 0;
            month = 0;
            for (i = 0; i < 12; i += 1) {
                firstDay = new Date(year, month, 1).getDay();
                monthTable = $('<table>');
                monthName = monthNames[month];
                businessDaysInMonth = getBusinessDaysInMonth(year, month, holidaysForYear);
                monthTable.append(createMonthTableHeaderRow(monthName, businessDaysInMonth));
                monthTable.append(createDaysOfWeekHeaderRow());
                for (j = 0; j < 42; j += 1) {
                    if (j % 7 === 0) {
                        row = $('<tr>');
                        monthTable.append(row);
                    }
                    if (j < firstDay || j >= firstDay + getDaysInMonth(month, year)) {
                        if (row) {
                            row.append($('<td>'));
                        }
                    } else {
                        dayInYear += 1;
                        dayOfWeek = new Date(year, month, j - firstDay).getDay();
                        isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6;
                        if (!isWeekendDay) {
                            businessDaysInYear += 1;
                        }
                        if (row) {
                            today = new Date();
                            dateFromDayOfYear = common.getDateFromDayOfYear(year, dayInYear);
                            isInThePast = dateFromDayOfYear.getFullYear() < today.getFullYear() ||
                                (dateFromDayOfYear.getFullYear() === today.getFullYear() && dateFromDayOfYear.getMonth() < today.getMonth()) ||
                                (dateFromDayOfYear.getFullYear() === today.getFullYear() && dateFromDayOfYear.getMonth() === today.getMonth() && dateFromDayOfYear.getDate() < today.getDate());
                            isToday = dateFromDayOfYear.getFullYear() === today.getFullYear() && dateFromDayOfYear.getMonth() === today.getMonth() && dateFromDayOfYear.getDate() === today.getDate();
                            row.append(createCalendarDayCell(year + '|' + dayInYear, j - firstDay + 1, isWeekendDay, isInThePast, isToday));
                        }
                    }
                }
                month += 1;
                monthTables.push(monthTable);
            }
            return { businessDaysInYear: businessDaysInYear, monthTables: monthTables };
        },
        createYearTableForProductYear = function (productCode, year, derivativeType, holidayScheduleName, initialYear, finalyear, holidaysForYear) {
            var k, m, calendar, index, yearTable, row, holidayScheduleNameRow, yearHeaderRow;
            calendar = createCalendarFor(year, holidaysForYear);
            index = 0;
            yearTable = $('<table>');
            yearTable.attr('id', year);
            yearTable.addClass('yearTable');
            holidayScheduleNameRow = createHolidayScheduleNameRow(holidayScheduleName);
            yearTable.append(holidayScheduleNameRow);
            yearHeaderRow = createYearHeaderRow(productCode, year, calendar.businessDaysInYear - holidaysForYear.length, derivativeType, initialYear, finalyear);
            yearTable.append(yearHeaderRow);
            for (k = 0; k < 3; k += 1) {
                row = createMonthContainerRow();
                for (m = 0; m < 4; m += 1) {
                    row.append(createMonthContainerCell(calendar.monthTables[index]));
                    index += 1;
                }
                yearTable.append(row);
            }
            return yearTable;
        },
        getHolidaysForYear = function (holidays, year) {
            var result = [];
            holidays.forEach(function (holidaysForYear) {
                if (holidaysForYear.Key === year) {
                    result = holidaysForYear;
                    return;
                }
            });
            return result;
        },
        getContractSpecificationsForYear = function (contractSpecificationYears, year) {
            var result = [];
            contractSpecificationYears.forEach(function (contractSpecificationYear) {
                if (contractSpecificationYear.Key === year) {
                    result = contractSpecificationYear.Value;
                }
            });
            return result;
        },
        getFormattedDate = function (year, dayOfYear) {
            var date, dayOfMonth, month;
            date = common.getDateFromDayOfYear(year, dayOfYear);
            dayOfMonth = date.getDate();
            month = date.getMonth() + 1;
            return month + "-" + dayOfMonth + "-" + year;
        },
        formatUnderlier = function (underlier) {
            var prefix = underlier.Quantity < 0 ? '-' : '+';
            return prefix + " " + Math.abs(underlier.Quantity) + " " + underlier.Product + '/' + underlier.UnderlyingContract;
        },
        appendContractInformationHtml = function (contractSpecification) {
            var contractInformationTable, underliersTable;
            contractInformationTable = $("<table>").addClass('contractInformationTable');
            contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Product Code: "), $("<td>").addClass('bold blue').text(contractSpecification.ProductCode)));
            contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Contract Code: "), $("<td>").addClass('bold blue').text(contractSpecification.ContractCode)));
            contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Expiration: "), $("<td>").addClass('bold blue').text(getFormattedDate(contractSpecification.Year, contractSpecification.DayOfYear))));
            if (contractSpecification.ExchangeContractCode) {
                contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Exchange Contract Code: "), $("<td>").addClass('bold blue').text(contractSpecification.ExchangeContractCode)));
            }
            contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Tick Value: "), $("<td>").addClass('bold blue').text(contractSpecification.TickValue)));
            if (contractSpecification.Underliers && contractSpecification.Underliers.length > 0) {
                underliersTable = $("<table>").addClass('underliersTable');
                contractSpecification.Underliers.forEach(function (underlier) {
                    underliersTable.append($("<tr>").append($("<td>").addClass('bold blue').text(formatUnderlier(underlier))));
                });
                contractInformationTable.append($("<tr>").append($("<td>").addClass('info-label').text("Underliers: "), $("<td>").append(underliersTable)));
            }
            return contractInformationTable;
        },
        showInfoContainer = function (event) {
            var top, left, infoContainer;
            infoContainer = getInfoContainer();
            top = (event.pageY + -$("#popup").offset().top - 20) + 'px';
            left = (event.pageX - 170) + "px";
            infoContainer.css({ top: top, left: left }).show();
        },
        hideInfoContainer = function () {
            getInfoContainer().hide();
        },
        clearHolidayInfoContainer = function () {
            var holidayInfoContainer = getHolidayInfoContainer();
            holidayInfoContainer.html('');
        },
        fillHolidayInfoContainer = function (year, holiday) {
            var holidayInfoContainer = getHolidayInfoContainer();
            holidayInfoContainer.html('');
            holidayInfoContainer.append($("<div>").append($("<span>").text(getFormattedDate(year, holiday.Key))));
            holidayInfoContainer.append($("<div>").append($("<span>").addClass('red bold').text(holiday.Value)));
        },
        clearContractInfoContainer = function () {
            var contractInfoContainer = getContractInfoContainer();
            contractInfoContainer.html('');
        },
        fillContractInfoContainer = function (specification) {
            var contractInfoContainer = getContractInfoContainer();
            contractInfoContainer.html('');
            contractInfoContainer.append(appendContractInformationHtml(specification));
        },
        insertHolidayAndContractInfo = function (year, holidaysForYear, contractSpecificationsForYear) {
            var daysOfYear = [],
                holidayDaysOfYear = [],
                contractDaysOfYear = [];
            holidaysForYear.forEach(function (holiday) {
                daysOfYear.push(holiday.Key);
                holidayDaysOfYear.push(holiday.Key);
            });
            contractSpecificationsForYear.forEach(function (specification) {
                daysOfYear.push(specification.DayOfYear);
                contractDaysOfYear.push(specification.DayOfYear);
            });
            daysOfYear.forEach(function (dayOfYear) {
                var holiday, specification, includeHoliday, includeContract, cell;
                holidaysForYear.forEach(function (item) {
                    if (item.Key === dayOfYear) {
                        holiday = item;
                        return;
                    }
                });
                contractSpecificationsForYear.forEach(function (item) {
                    if (item.DayOfYear === dayOfYear) {
                        specification = item;
                        return;
                    }
                });
                includeHoliday = holidayDaysOfYear.indexOf(dayOfYear) !== -1;
                includeContract = contractDaysOfYear.indexOf(dayOfYear) !== -1;
                cell = $(document.getElementById(year + "|" + dayOfYear));
                if (includeHoliday && includeContract) {
                    cell.addClass("holidayExpirationDate");
                    cell.mouseenter(function (event) {
                        fillHolidayInfoContainer(year, holiday);
                        fillContractInfoContainer(specification);
                        showInfoContainer(event);
                    });
                    cell.mouseleave(hideInfoContainer);
                    return;
                }
                if (includeHoliday) {
                    cell.addClass("holiday");
                    cell.mouseenter(function (event) {
                        clearContractInfoContainer();
                        fillHolidayInfoContainer(year, holiday);
                        showInfoContainer(event);
                    });
                    cell.mouseleave(hideInfoContainer);
                    return;
                }
                if (includeContract) {
                    cell.addClass("expirationDate");
                    cell.mouseenter(function (event) {
                        clearHolidayInfoContainer();
                        fillContractInfoContainer(specification);
                        showInfoContainer(event);
                    });
                    cell.mouseleave(hideInfoContainer);
                    return;
                }
            });
        };
    return {
        renderCalendars: function (parent, productCode, holidays, contractSpecificationYears, derivativeType, holidayScheduleName) {
            var yearTable, currentYear, infoContainer, holidayInfoContainer, contractInfoContainer, year, contractSpecificationsForYear, initialYear, finalyear, holidaysForYear;
            infoContainer = $('<div>').attr('id', "infoContainer").addClass('calendarInfoContainer');
            holidayInfoContainer = $('<div>').attr('id', "holidayInfoContainer");
            infoContainer.append(holidayInfoContainer);
            contractInfoContainer = $('<div>').attr('id', "contractInfoContainer");
            infoContainer.append(contractInfoContainer);
            parent.append(infoContainer);
            yearsArray = contractSpecificationYears.map(function (contractSpecificationYear) {
                return contractSpecificationYear.Key;
            });
            currentYear = new Date().getFullYear();
            currentYearIndex = yearsArray.indexOf(currentYear);
            initialYear = yearsArray[0];
            finalyear = yearsArray[yearsArray.length - 1];
            contractSpecificationYears.forEach(function (contractSpecificationYear) {
                year = contractSpecificationYear.Key;
                holidaysForYear = getHolidaysForYear(holidays, year).Value;
                contractSpecificationsForYear = getContractSpecificationsForYear(contractSpecificationYears, year);
                yearTable = createYearTableForProductYear(productCode, year, derivativeType, holidayScheduleName, initialYear, finalyear, holidaysForYear);
                parent.append(yearTable);
                insertHolidayAndContractInfo(year, holidaysForYear, contractSpecificationsForYear);
            });
            if (currentYearIndex < 0) {
                currentYearIndex = 0;
            }
            showYearTable();
        }
    };
};