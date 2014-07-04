/*globals define, $*/
define([], function () {
    "use strict";
    var eventListener,
        ignoredValidations = [],
        validations = [],
        createSuccessContainer = function () {
            var container, image, span;
            container = $("<div>");
            container.addClass('successContainer');
            image = $('#successImage').clone();
            image.addClass('validationImage');
            span = $("<span>").text("No errors or warnings.");
            container.append(image);
            container.append(span);
            return container;
        },
        createErrorContainer = function (validation) {
            var container, image, span;
            container = $("<div>");
            container.addClass('validationErrorContainer');
            container.attr('id', 'validation|' + validation.ID);
            image = $('#errorImage').clone();
            image.addClass('validationImage');
            span = $("<span>").text(validation.Message);
            container.append(image);
            container.append(span);
            return container;
        },

        ignoreValidations = function () {
            var validation, i;
            for (i = 0; i < validations.length; i += 1) {
                validation = validations[i];
                ignoredValidations.push(validation);
            }
            validations = [];
            eventListener.fire('IgnoredValidationsChanged');
        },
        unignoreValidations = function () {
            var validation, i;
            if (ignoredValidations.length === 0) {
                return;
            }
            for (i = 0; i < ignoredValidations.length; i += 1) {
                validation = ignoredValidations[i];
                validations.push(validation);
            }
            ignoredValidations = [];
            eventListener.fire('IgnoredValidationsChanged');
        },
        getWarningControls = function (target) {
            return target.find('span.warningMessage');
        },
        unignoreWarnings = function (target) {
            var messageSpans = getWarningControls(target);
            messageSpans.removeClass('ignoredWarning');
            unignoreValidations();
        },
        ignoreWarnings = function (target) {
            var messageSpans = getWarningControls(target);
            messageSpans.addClass('ignoredWarning');
            ignoreValidations();
        },
        toggleIgnoreValidations = function () {
            var target;
            target = $('#allValidationsContainer');
            if ($(this).is(":checked")) {
                ignoreWarnings(target);
                return;
            }
            unignoreWarnings(target);
        },
        createIgnoreWarningsCheckbox = function () {
            var checkboxContainer, ignoreCheckbox;
            checkboxContainer = $("<div>").addClass('ignoreWarningCheckboxContainer');
            checkboxContainer.append($("<span>").addClass('ignoreLabel').text("Ignore warnings"));
            ignoreCheckbox = $("<input>").attr('type', 'checkbox');
            checkboxContainer.append(ignoreCheckbox);
            ignoreCheckbox.on('click', toggleIgnoreValidations);
            return checkboxContainer;
        },
        createWarningContainer = function (validation) {
            var container, image, warningLabel;
            container = $("<div>");
            container.addClass('warningContainer');
            container.attr('id', validation.ID);
            image = $('#warningImage').clone();
            image.addClass('validationImage');
            warningLabel = $("<span>").addClass('warningMessage').text(validation.Message);
            container.append(image);
            container.append(warningLabel);
            return container;
        },
        setValidations = function (validatationsIn) {
            ignoredValidations = [];
            validations = [];
            validations = validatationsIn;
        },
        getValidations = function () {
            return validations;
        },
        createValidationContainer = function (validation) {
            switch (validation.Severity) {
                case 1:
                    return createWarningContainer(validation);
                case 2:
                    return createErrorContainer(validation);
                default:
                    return null;
            }
        },
        validationsContainWarnings = function (validationsIn) {
            var containWarnings = false;
            validationsIn.forEach(function (validation) {
                if (validation.Severity === 1) {
                    containWarnings = true;
                }
            });
            return containWarnings;
        },
        create = function (validationsIn, successCallback, listener) {
            var parentContainer;
            if (listener) {
                eventListener = listener;
            }
            setValidations(validationsIn);
            parentContainer = $('<div>').attr('id', 'allValidationsContainer');
            if (validations.length === 0) {
                if (successCallback) {
                    successCallback();
                    return null;
                }
                parentContainer.append(createSuccessContainer());
                return parentContainer;
            }
            if (validationsContainWarnings(validations)) {
                parentContainer.append(createIgnoreWarningsCheckbox());
            }
            validations.forEach(function (validation) {
                parentContainer.append(createValidationContainer(validation));
            });

            return parentContainer;
        };
    return {
        create: create,
        getValidations: getValidations
    };
});
