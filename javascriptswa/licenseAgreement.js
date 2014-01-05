/*globals $, define */
"use strict";
define(['common', "licenseAgreementDataAccess"], function (common, dataAccess) {
    var result,
        createAgreementEntry = function (agreement) {
            var container, hidden, label;
            container = $('<div/>');
            label = $('<label/>');
            hidden = $('<input/>');
            hidden.attr("type", "hidden");
            hidden.val(agreement.CompanyId);
            label.text(agreement.CompanyName);
            container.append(hidden);
            container.append(label);
            return container;
        },
        displayAgreement = function (signedAgreements, unsignedAgreements, agreement) {
            var checkbox,
                callback = function () {
                    dataAccess.getCompanyLicenseAgreements(result.displayAgreements);
                },
                reject = function () {
                    dataAccess.rejectCompanyLicenseAgreement(agreement.CompanyId, callback);
                },
                accept = function () {
                    dataAccess.acceptCompanyLicenseAgreement(agreement.CompanyId, callback);
                },
                entry = createAgreementEntry(agreement);
            if (agreement.AgreementHasBeenSigned === true) {
                entry.addClass("signedCompanyLicenseAgreement");
                checkbox = $('<input/>');
                checkbox.attr("type", "checkbox");
                checkbox.attr("checked", "checked");
                checkbox.change(reject);
                entry.prepend(checkbox);
                signedAgreements.append(entry);
            } else {
                entry.addClass("unsignedCompanyLicenseAgreement");
                checkbox = $('<input/>');
                checkbox.attr("type", "checkbox");
                checkbox.removeAttr("checked");
                checkbox.change(accept);
                entry.prepend(checkbox);
                unsignedAgreements.append(entry);
            }
        };
    result = {
        displayAgreements: function (response) {
            var signedAgreements, unsignedAgreements;
            common.trapEnterKey($('form'));
            signedAgreements = $('#signedAgreements');
            unsignedAgreements = $('#unsignedAgreements');
            signedAgreements.empty();
            unsignedAgreements.empty();
            if (response.Success) {
                response.Payload.forEach(function (element) {
                    displayAgreement(signedAgreements, unsignedAgreements, element);
                });
            }
        }
    };
    return result;
});