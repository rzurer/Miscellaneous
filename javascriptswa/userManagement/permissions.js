/*globals $, console, define*/
define(['htmlHelper', 'userManagement/localDataStore'], function (htmlHelper, localDataStore) {
    "use strict";
    var permissionsContainer = $("#permissionsContainer"),
        createUserPermissionsHeader = function (username) {
            var header, container, addtraderToGroupContainer, addGroupToTradersGroupContainer, addRemoveArray;
            addRemoveArray = [{ text: 'Add', value: 'Add' }, { text: 'Remove', value: 'Remove'}];
            header = $('<div>').addClass("userPermissionsHeaderContainer");
            header.append(htmlHelper.createRadioInputGroup("traderToGroupRadioGroup", addRemoveArray, 'Add', 'addRemoveGroup', function () {
                $('.userPermissionsHeaderContainer select').val('');
                if ($(this).val() === 'Add') {
                    $('.addRemoveLabel').text('Add ');
                    $('.toFromLabel').text(' to ');
                    return;
                }
                $('.addRemoveLabel').text('Remove ');
                $('.toFromLabel').text(' from ');
            }));
            addtraderToGroupContainer = $('<div>').addClass("addToGroupContainer");
            container = $('<div>').addClass("addRemoveDescription");
            container.append($('<span>').text('Add ').addClass('addRemoveLabel'));
            container.append($('<span>').addClass('usernameLabel').text(username));
            container.append($('<span>').text(' to ').addClass('toFromLabel'));
            container.append(htmlHelper.createSelectFromList('groupsToAddOrRemoveTraderToSelect', ['HHHH', 'JJJKKKJJ', 'JDLK'], 'styledSmall', '<select>'));
            container.append($('<span>').text("\'s group"));
            addtraderToGroupContainer.append(container);
            header.append(addtraderToGroupContainer);
            addGroupToTradersGroupContainer = $('<div>').addClass("addToGroupContainer");
            container = $('<div>').addClass("addRemoveDescription");
            container.append($('<span>').text('Add ').addClass('addRemoveLabel'));
            container.append(htmlHelper.createSelectFromList('groupsToAddOrRemoveToTradersGroupSelect', ['PPPP', 'IIIIII', 'UUUU'], 'styledSmall', '<select>'));
            container.append($('<span>').text(' to ').addClass('toFromLabel'));
            container.append($('<span>').addClass('usernameLabel').text(username));
            container.append($('<span>').text("\'s group"));
            addGroupToTradersGroupContainer.append(container);
            header.append(addGroupToTradersGroupContainer);
            return header;
        },
        createPermissionsHeaderRow = function (permissionNames) {
            var row;
            row = htmlHelper.createRow("permissionsHeaderRow");
            permissionNames.forEach(function (permissionName) {
                htmlHelper.appendCell(row, permissionName, '', true);
            });
            return row;
        },
        createPermissionsTable = function (permissionRoster, membersOfTradersGroup, groupsInWhichTraderIsMember) {
            var table, row, maxLength, subjectTraders, objectTraders, i, cell, arrowUpImage, arrowDownImage,
                directPermissionLeft = [],
                noPermissionlLeft = [],
                directPermissionRight = [],
                noPermissionlRight = [],
                indirectPermissionLeft = [],
                indirectPermissionRight = [], left, right;
            subjectTraders = permissionRoster.SubjectTraders;
            objectTraders = permissionRoster.ObjectTraders;
            membersOfTradersGroup.forEach(function (item) {
                if (subjectTraders.indexOf(item) !== -1) {
                    directPermissionLeft.push($('<span>').text(item).addClass('permission selectedPermission'));
                } else {
                    noPermissionlLeft.push($('<span>').text(item).addClass('permission noPermission'));
                }
            });
            subjectTraders.forEach(function (item) {
                if (directPermissionLeft.indexOf(item) === -1 && noPermissionlLeft.indexOf(item) === -1) {
                    indirectPermissionLeft.push($('<span>').text(item).addClass('permission indirectPermission'));
                }
            });
            groupsInWhichTraderIsMember.forEach(function (item) {
                if (objectTraders.indexOf(item) !== -1) {
                    directPermissionRight.push($('<span>').text(item).addClass('permission selectedPermission'));
                } else {
                    noPermissionlRight.push($('<span>').text(item).addClass('permission noPermission'));
                }
            });
            objectTraders.forEach(function (item) {
                if (directPermissionRight.indexOf(item) === -1 && noPermissionlRight.indexOf(item) === -1) {
                    indirectPermissionRight.push($('<span>').text(item).addClass('permission indirectPermission'));
                }
            });
            left = directPermissionLeft.concat(noPermissionlLeft).concat(indirectPermissionLeft);
            right = directPermissionRight.concat(noPermissionlRight).concat(indirectPermissionRight);
            maxLength = Math.max(left.length, right.length);
            table = htmlHelper.createTable('permissionRosterTable');
            row = htmlHelper.createRow('permissionRosterImagesRow');
            cell = htmlHelper.appendCell(row);
            cell.css('text-align', 'center');
            arrowUpImage = $('#arrowUpImage').clone().addClass('upDownImage');
            cell.append(arrowUpImage);
            cell = htmlHelper.appendCell(row);
            cell.css('text-align', 'center');
            arrowDownImage = $('#arrowDownImage').clone().addClass('upDownImage');
            cell.append(arrowDownImage);
            table.append(row);
            for (i = 0; i < maxLength; i += 1) {
                row = htmlHelper.createRow('permissionRosterRow');
                cell = htmlHelper.appendCell(row);
                cell.append(left[i]);
                cell = htmlHelper.appendCell(row);
                cell.append(right[i]);
                table.append(row);
            }
            return table;
        },
        createPermissionsRow = function (permissionRosters, membersOfTradersGroup, groupsInWhichTraderIsMember) {
            var cell, row = htmlHelper.createRow("permissionsRow");
            permissionRosters.forEach(function (permissionRoster) {
                cell = htmlHelper.appendCell(row);
                cell.append(createPermissionsTable(permissionRoster, membersOfTradersGroup, groupsInWhichTraderIsMember));
            });
            return row;
        },
        createPermissionsSeparatorRow = function () {
            var row, cell;
            row = htmlHelper.createRow('permissionsSeparatorRow');
            cell = htmlHelper.appendCell(row);
            cell.attr('colspan', 4);
            return row;
        },
        initializePermissionsDisplay = function () {
            var currentUserPermissions, permissionsRosters, membersOfTradersGroup, groupsInWhichTraderIsMember, currentUsername;
            permissionsContainer.empty();
            if (!localDataStore.currentUserIsDefined()) {
                return;
            }
            permissionsRosters = localDataStore.getPermissionsRosters();
            membersOfTradersGroup = localDataStore.getMembersOfTradersGroup();
            groupsInWhichTraderIsMember = localDataStore.getGroupsInWhichTraderIsMember();
            currentUsername = localDataStore.getCurrentUsername();
            currentUserPermissions = create(permissionsRosters, membersOfTradersGroup, groupsInWhichTraderIsMember, currentUsername);
            permissionsContainer.append(currentUserPermissions.container);
        },
        create = function (permissionRosters, membersOfTradersGroup, groupsInWhichTraderIsMember, username) {
            var container, table, permissionsRow, permissionRostersOne, permissionRostersTwo, permissionsSeparatorRow;
            permissionRostersOne = permissionRosters.slice(0, 4);
            permissionRostersTwo = permissionRosters.slice(4);
            container = $('<div>').addClass('permissionsTableContainer');
            container.append(createUserPermissionsHeader(username));
            table = htmlHelper.createTable('permissionsTable');

            table.append(createPermissionsHeaderRow(permissionRostersOne.map(function (permissionRoster) {
                return permissionRoster.Permission;
            })));
            permissionsRow = createPermissionsRow(permissionRostersOne, membersOfTradersGroup, groupsInWhichTraderIsMember);
            table.append(permissionsRow);
            permissionsSeparatorRow = createPermissionsSeparatorRow();
            table.append(permissionsSeparatorRow);
            table.append(createPermissionsHeaderRow(permissionRostersTwo.length, username));
            table.append(createPermissionsHeaderRow(permissionRostersTwo.map(function (permissionRoster) {
                return permissionRoster.Permission;
            })));
            permissionsRow = createPermissionsRow(permissionRostersTwo, membersOfTradersGroup, groupsInWhichTraderIsMember);
            table.append(permissionsRow);
            container.append(table);
            return {
                container: container
            };
        };
    return {
        create: create
    };
});

