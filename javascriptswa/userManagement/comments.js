/*globals $, define */
define([], function () {
    "use strict";
    var hideCommentsContainer = function () {
        $(".commentsContainer").hide();
    },
        createLicenseCommentHtml = function (licenseComment) {
            var commentsHtml = $('<div>');
            licenseComment.split('\n').forEach(function (c) {
                if (c.length > 0) {
                    commentsHtml.append($('<span>').text(c));
                    commentsHtml.append($('<br/>'));
                }
            });
            return commentsHtml;
        },
        createAndDisplayCommentsContainer = function (top, left, commentsInfo) {
            var commentsContainer, licenseComment, cancellationReason, licenseCommentSection, cancellationReasonSection, closeButtonSection, commentContent, licenseCommentHtml;
            commentsContainer = $('<div>').addClass('commentsContainer');
            $('body').append(commentsContainer);
            commentsContainer.css({ top: top, left: left });
            commentsContainer.unbind('click');
            commentsContainer.bind('click', hideCommentsContainer);
            closeButtonSection = $('<div>').addClass('closeButtonSection').text('x');
            commentsContainer.append(closeButtonSection);
            licenseComment = commentsInfo ? commentsInfo.LicenseComment : '';
            cancellationReason = commentsInfo ? commentsInfo.CancellationReason : '';
            if (!(licenseComment || cancellationReason)) {
                commentsContainer.append($('<div>').text('No comments.'));
                commentsContainer.show();
                return;
            }
            if (licenseComment) {
                licenseCommentSection = $('<div>').addClass('commentSection').text('License Comment');
                commentContent = $("<div>").addClass('commentContent');
                licenseCommentHtml = createLicenseCommentHtml(licenseComment);
                commentContent.append(licenseCommentHtml);
                licenseCommentSection.append(commentContent);
                commentsContainer.append(licenseCommentSection);
            }
            if (cancellationReason) {
                cancellationReasonSection = $('<div>').addClass('commentSection').text('Cancellation Reason');
                cancellationReasonSection.append($("<div>").addClass('commentContent').text(cancellationReason));
                commentsContainer.append(cancellationReasonSection);
            }
            commentsContainer.show();
        };
    return {
        createAndDisplayCommentsContainer: createAndDisplayCommentsContainer
    };
});