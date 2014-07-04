/*globals $, console, define */
define(['htmlHelper', 'userManagement/localDataStore', 'common'], function (htmlHelper, localDataStore, common) {
    "use strict";
    var eventListener,
        salesForceLink,
        salesForceAccountLink,
        companyInformationContainer,
        companyContactsTablesContainer,
        companyContactsHeaderTableContainer,
        toggleCompanyContactsButton,
        companyContactsTableContainer,
        companyName = $("#companyName"),
        companyInformation = $("#companyInformation"),
        userContactInfo = $("#userContactInfo"),
        salesForceBaseUrl = 'https://na5.salesforce.com/',
        setControls = function (salesForceLinkControl, salesForceAccountLinkControl, companyInformationContainerControl, companyContactsTablesContainerControl, companyContactsHeaderTableContainerControl,
            toggleCompanyContactsButtonControl, companyContactsTableContainerControl, companyNameControl, companyInformationControl) {
            salesForceLink = salesForceLinkControl;
            salesForceAccountLink = salesForceAccountLinkControl;
            companyInformationContainer = companyInformationContainerControl;
            companyInformationContainer = companyInformationContainerControl;
            companyContactsTablesContainer = companyContactsTablesContainerControl;
            companyContactsHeaderTableContainer = companyContactsHeaderTableContainerControl;
            toggleCompanyContactsButton = toggleCompanyContactsButtonControl;
            companyContactsTableContainer = companyContactsTableContainerControl;
            companyName = companyNameControl;
            companyInformation = companyInformationControl;
        },

        createSalesForceLink = function (salesForceContactID) {
            var url, anchor, src, image;
            url = salesForceBaseUrl + salesForceContactID;
            anchor = htmlHelper.createAnchor(url, '', true, "View User In SalesForce");
            src = $('.salesForceImage').first().attr('src');
            image = $('<img>').attr('src', src).addClass('salesForceImage');
            anchor.append(image);
            return anchor;
        },

        createCompanyContactsTableRow = function (contact) {
            var row, cell;
            row = $('<tr>').addClass('companyContactsTableRow');
            cell = htmlHelper.appendCell(row, '', '', false, 'SalesForceContactID');
            cell.append(createSalesForceLink(contact.SalesForceContactID));
            htmlHelper.appendCell(row, contact.Trader, '', false, 'Trader');
            htmlHelper.appendCell(row, contact.License, '', false, 'License');
            htmlHelper.appendCell(row, contact.FirstName, '', false, 'FirstName');
            htmlHelper.appendCell(row, contact.LastName, '', false, 'LastName');
            htmlHelper.appendCell(row, contact.Email, '', false, 'Email');
            htmlHelper.appendCell(row, contact.WorkPhone, '', false, 'WorkPhone');
            htmlHelper.appendCell(row, contact.MobilePhone, '', false, 'MobilePhone');
            htmlHelper.appendCell(row, contact.ContactTypeName, '', false, 'ContactTypeName');
            htmlHelper.appendCell(row, contact.JobTitle, '', false, 'JobTitle');
            return row;
        },
        createCompanyContactsTableEmptyContactsRow = function () {
            var row;
            row = $('<tr>').addClass('companyContactsTableEmptyContactsRow');
            htmlHelper.appendCell(row, "No Contacts Found");
            return row;
        },
        companyContactsAreVisible = function () {
            return companyContactsTablesContainer.is(":visible");
        },
        hideCompanyContacts = function () {
            companyContactsHeaderTableContainer.empty();
            companyContactsTableContainer.empty();
            companyContactsTablesContainer.hide();
        },
        createCompanyContactsTableHeaderRow = function () {
            var headerRow;
            headerRow = htmlHelper.createRow('companyContactsTableHeaderRow');
            htmlHelper.appendCell(headerRow, '', '', true, "SalesForceContactID");
            htmlHelper.appendCell(headerRow, "Trader", '', true, "Trader");
            htmlHelper.appendCell(headerRow, "License", '', true, "License");
            htmlHelper.appendCell(headerRow, "First", '', true, "FirstName");
            htmlHelper.appendCell(headerRow, "Last", '', true, "LastName");
            htmlHelper.appendCell(headerRow, "Email", '', true, "Email");
            htmlHelper.appendCell(headerRow, "Work", '', true, "WorkPhone");
            htmlHelper.appendCell(headerRow, "Mobile", '', true, "MobilePhone");
            htmlHelper.appendCell(headerRow, "Type", '', true, "ContactTypeName");
            htmlHelper.appendCell(headerRow, "Job Title", '', true, "JobTitle");
            htmlHelper.appendCell(headerRow);
            return headerRow;
        },
        setCompanyContactsHeaderTableColumnWidths = function () {
            var table, headerTable,  traderWidth, firstNameWidth, lastNameWidth, contactTypeWidth, jobTitleWidth, workPhoneWidth, mobilePhoneWidth, emailWidth, salesForceContactIDWidth, licenseWidth, tableWidth;
            table = $('.companyContactsTable');
            headerTable = $('.companyContactsHeaderTable');
            salesForceContactIDWidth = Number(table.find('td.SalesForceContactID').first().width()) + 25;
            traderWidth = Number(table.find('td.Trader').first().width()) + 10;
            licenseWidth = Number(table.find('td.License').first().width()) + 10;
            firstNameWidth = Number(table.find('td.FirstName').first().width()) + 7;
            lastNameWidth = Number(table.find('td.LastName').first().width()) + 12;
            emailWidth = Number(table.find('td.Email').first().width()) + 10;
            workPhoneWidth = Number(table.find('td.WorkPhone').first().width()) + 5;
            mobilePhoneWidth = Number(table.find('td.MobilePhone').first().width()) + 5;
            contactTypeWidth = Number(table.find('td.ContactTypeName').first().width()) + 10;
            jobTitleWidth = Number(table.find('td.JobTitle').first().width()) + 0;
            headerTable.find('th.SalesForceContactID').first().css('width', salesForceContactIDWidth);
            headerTable.find('th.Trader').first().css('width', traderWidth + 'px');
            headerTable.find('th.License').first().css('width', licenseWidth + 'px');
            headerTable.find('th.FirstName').first().css('width', firstNameWidth + 'px');
            headerTable.find('th.LastName').first().css('width', lastNameWidth + 'px');
            headerTable.find('th.Email').first().css('width', emailWidth + 'px');
            headerTable.find('th.WorkPhone').first().css('width', workPhoneWidth + 'px');
            headerTable.find('th.MobilePhone').first().css('width', mobilePhoneWidth + 'px');
            headerTable.find('th.ContactTypeName').first().css('width', contactTypeWidth + 'px');
            headerTable.find('th.JobTitle').first().css('width', jobTitleWidth + 'px');
            tableWidth = traderWidth + firstNameWidth + lastNameWidth + contactTypeWidth + jobTitleWidth + workPhoneWidth + mobilePhoneWidth + emailWidth + licenseWidth;
            return tableWidth + 80;
        },
        createAndDisplayCompanyContactsContainer = function (response) {
            var companyContacts, companyContactsTable, companyContactsHeaderTable, row, emptyRow, headerRow, tableWidth;
            companyContacts = response.Payload;
            hideCompanyContacts();
            companyContactsTable = htmlHelper.createTable('companyContactsTable');
            if (companyContacts.length === 0) {
                emptyRow = createCompanyContactsTableEmptyContactsRow();
                companyContactsTable.append(emptyRow);
                companyContactsTableContainer.append(companyContactsTable);
                companyContactsTablesContainer.slideDown('slow');
                return;
            }
            companyContactsHeaderTable = htmlHelper.createTable('companyContactsHeaderTable');
            headerRow = createCompanyContactsTableHeaderRow();
            companyContactsHeaderTable.append(headerRow);
            companyContactsHeaderTableContainer.append(companyContactsHeaderTable);
            companyContacts.forEach(function (contact) {
                row = createCompanyContactsTableRow(contact);
                companyContactsTable.append(row);
            });
            companyContactsTableContainer.append(companyContactsTable);
            companyContactsTablesContainer.show();
            tableWidth = setCompanyContactsHeaderTableColumnWidths();
            $('#companyContactsHeaderTableContainer').css('width', tableWidth);
            $('.companyContactsTableContainer').css('width', tableWidth);
            $('.companyContactsHeaderTable').css('width', tableWidth);
        },
        initializeUserContactInfo = function () {
            var firstName, lastName, email, workPhone, mobilePhone, salesForceAssetID;
            firstName = localDataStore.getUserFirstName();
            lastName = localDataStore.getUserLastName();
            email = localDataStore.getUserEmail();
            workPhone = localDataStore.getUserWorkPhone();
            mobilePhone = localDataStore.getUserMobilePhone();
            salesForceAssetID = localDataStore.getSalesForceAssetID();
            if (!localDataStore.currentUserIsDefined() || (!firstName && !lastName && !email && !workPhone && !mobilePhone && !salesForceAssetID)) {
                userContactInfo.hide();
                return;
            }
            userContactInfo.show();
        },
        initializeCompanySalesforceLink = function () {
            var salesForceAccountID = localDataStore.getSalesForceAccountID();
            if (!localDataStore.currentUserIsDefined() || !salesForceAccountID) {
                salesForceLink.hide();
                salesForceLink.attr('href', '#');
                return;
            }
            salesForceAccountLink.show();
            salesForceAccountLink.attr('href', salesForceBaseUrl + salesForceAccountID);
        },
        initializeCompanyName = function () {
            var userCompanyName = localDataStore.getUserCompanyName();
            if (!localDataStore.currentUserIsDefined() || !userCompanyName) {
                companyName.text('');
                companyInformation.hide();
                companyInformationContainer.hide();
                return;
            }
            companyName.text(userCompanyName);
            companyInformation.show();
            companyInformationContainer.show();
        },
        initializeCompanyContactsTable = function () {
            var tableCells;
            companyContactsHeaderTableContainer.empty();
            companyContactsTableContainer.empty();
            tableCells = $('.companyContactsTable').find('td.Trader');
            localDataStore.getAssociatedTraders().forEach(function (associatedTrader) {
                tableCells.each(function () {
                    if ($(this).text() === associatedTrader) {
                        $(this).addClass('associatedTrader');
                    }
                });
            });
            toggleCompanyContactsButton.text('Show Company Contacts');
            hideCompanyContacts();
        },
        initializeControls = function (callback) {
            initializeUserContactInfo();
            initializeCompanyName();
            initializeCompanyContactsTable();
            initializeCompanySalesforceLink();
            common.safeCallback(callback);
        },
        setCompanyContactControls = function () {
            var salesForceLinkControl = $('#salesForceLink'),
                salesForceAccountLinkControl = $('#salesForceAccountLink'),
                companyInformationContainerControl = $('#companyInformationContainer'),
                companyContactsTablesContainerControl = $('#companyContactsTablesContainer'),
                companyContactsHeaderTableContainerControl = $('#companyContactsHeaderTableContainer'),
                toggleCompanyContactsButtonControl = $('#toggleCompanyContactsButton'),
                companyContactsTableContainerControl = $('#companyContactsTableContainer'),
                companyNameControl = $("#companyName"),
                companyInformationControl = $("#companyInformation");
            setControls(salesForceLinkControl, salesForceAccountLinkControl, companyInformationContainerControl, companyContactsTablesContainerControl, companyContactsHeaderTableContainerControl,
                toggleCompanyContactsButtonControl, companyContactsTableContainerControl, companyNameControl, companyInformationControl);
        },
        setReadOnlyCompanyContactControls = function () {
            var salesForceLinkControl = $('#viewSalesForceLink'),
            salesForceAccountLinkControl = $('#viewSalesForceAccountLink'),
            companyInformationContainerControl = $('#viewCompanyInformationContainer'),
            companyContactsTablesContainerControl = $('#viewCompanyContactsTablesContainer'),
            companyContactsHeaderTableContainerControl = $('#viewCompanyContactsHeaderTableContainer'),
            toggleCompanyContactsButtonControl = $('#viewToggleCompanyContactsButton'),
            companyContactsTableContainerControl = $('#viewCompanyContactsTableContainer'),
            companyNameControl = $("#viewCompanyName"),
            companyInformationControl = $("#viewCompanyInformation");
                setControls(salesForceLinkControl, salesForceAccountLinkControl, companyInformationContainerControl, companyContactsTablesContainerControl, companyContactsHeaderTableContainerControl,
            toggleCompanyContactsButtonControl, companyContactsTableContainerControl, companyNameControl, companyInformationControl);
        },
        toggleCompanyContacts = function () {
            if (!companyContactsAreVisible()) {
                $(this).text('Hide Company Contacts');
                eventListener.fire("ShowCompanyContacts", [createAndDisplayCompanyContactsContainer]);
                return;
            }
            hideCompanyContacts();
            $(this).text('Show Company Contacts');
        },
        assignEventHandlers = function (wantReadOnly) {
            if (wantReadOnly) {
                setReadOnlyCompanyContactControls();
            } else {
                 setCompanyContactControls();    
            }
            toggleCompanyContactsButton.off('click');
            toggleCompanyContactsButton.on('click', toggleCompanyContacts);
        },
        initializeEventListener = function (listener) {
            eventListener = listener;
            eventListener.removeListener("InitializeCompanyContacts", initializeControls);
            eventListener.addListener("InitializeCompanyContacts", initializeControls);
        };
    return {
        initializeEventListener: initializeEventListener,
        assignEventHandlers: assignEventHandlers,
        initializeControls: initializeControls,
    };
});