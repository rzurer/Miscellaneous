/*globals $ */
"use strict";
var permissions = function (common, dataAccess) {
    var that,
    librarian,
    sessionTimeout,
    keepAliveFactor = 10,
    initialSignInTime,
    mandatorySessionTimeout,
    loginButton = $('#loginButton'),
    loginCloseButton = $('#loginCloseButton'),
    changePasswordButton = $("#changePasswordLabel"),
    loginControl = $("#loginControl"),
    loginError = $('#loginError'),
    usernameInput = $('#usernameInput'),
    passwordInput = $('#passwordInput'),
    workspaces = $('.workspace'),
    tiles = $("#tiles"),
    header = $("#header"),
    signOutControl = $("#signOutLabel"),
    keepAliveIntervalId = 0,
    welcomeLabel = $("#welcomeLabel"),
    setKeepSessionAliveValue = function (keepSessionAlive) {
        dataAccess.setKeepSessionAliveValue(keepSessionAlive);
        if (keepSessionAlive === "Yes") {
            $("#isPrivateComputerCheckbox").attr("checked", "checked");
            return;
        }
        $("#isPrivateComputerCheckbox").removeAttr("checked");
    },
    shouldStaySignedIn = function () {
        return $("#isPrivateComputerCheckbox").is(":checked");
    },
    validateCredentialsAreSupplied = function (username, password) {
        var errorMessage = '';
        if (!username || username.trim().length === 0) {
            errorMessage += "The user name is required.";
        }
        if (!password || password.trim().length === 0) {
            errorMessage += "\r\nThe password is required.";
        }
        return errorMessage;
    },
    showWelcomeControl = function (loggedInUsername) {
        welcomeLabel.text("welcome " + loggedInUsername);
        welcomeLabel.slideDown("slow");
        welcomeLabel.css('cursor', 'default');
    },
    performSignOut = function (loggedOutMessage) {
        signOutControl.text('sign out');
        signOutControl.bind('click', function () {
            that.signOut(loggedOutMessage);
        });
    },
    hideLoginControl = function (callback) {
        loginControl.slideUp('normal', callback);
        usernameInput.val('');
        passwordInput.val('');
        loginError.text('');
    },
    keepAlive = function () {
        var elapsed = new Date().getTime() - initialSignInTime;
        if (elapsed > mandatorySessionTimeout) {
            that.signOut(common.sessionTimedOutMessage);
            return;
        }
        dataAccess.getCurrentUsername(function () {
            var src = librarian.KeepAliveImage + '?' + new Date().getTime();
            $('#keepAliveImage').attr("src", src);
        });
    },
    startStopKeepAlive = function () {
        if (shouldStaySignedIn()) {
            keepAliveIntervalId = setInterval(keepAlive, sessionTimeout / keepAliveFactor);
            return;
        }
        clearInterval(keepAliveIntervalId);
    },
    startSessionExpiryTimer = function () {
        var autoSignOut = function () {
            if (!shouldStaySignedIn()) {
                that.signOut(common.sessionTimedOutMessage);
            }
        };
        setTimeout(autoSignOut, sessionTimeout);
    },
    enterLoggedInState = function (loggedInUsername, keepSessionAlive, bypassTopLevelTiles) {
        initialSignInTime = new Date().getTime();
        changePasswordButton.hide();
        changePasswordButton.unbind('click');
        setKeepSessionAliveValue(keepSessionAlive);
        startSessionExpiryTimer();
        startStopKeepAlive();
        if (bypassTopLevelTiles !== 'True') {
            tiles.fadeIn('slow');
        }
        var callback = function () {
            performSignOut("");
            showWelcomeControl(loggedInUsername);
        };
        hideLoginControl(callback);
    },
    hideSignOutControl = function () {
        signOutControl.text('');
        signOutControl.unbind('click');
    },
    hideWelcomeLabel = function () {
        welcomeLabel.text('');
        welcomeLabel.fadeOut('slow');
    },
    showLoginControl = function (loggedOutMessage) {
        usernameInput.val('');
        passwordInput.val('');
        loginControl.slideDown('normal');
        loginError.text(loggedOutMessage);
        hideWelcomeLabel();
        usernameInput.focus();
    },
    enterLoggedOutState = function (loggedOutMessage) {
        setKeepSessionAliveValue("No");
        changePasswordButton.bind('click', goToChangePasswordPage);
        changePasswordButton.show();
        initialSignInTime = mandatorySessionTimeout + 1000;
        workspaces.css('display', 'none');
        tiles.fadeOut('slow');
        hideSignOutControl();
        showLoginControl(loggedOutMessage);
    },
    signIn = function (username, response) {
        if (!response.Success) {
            loginError.text(response.Message);
            usernameInput.focus();
            return;
        }
        var callback = function (keepAliveResponse) {
            var keepSessionAlive = keepAliveResponse.Payload;
            enterLoggedInState(username, keepSessionAlive);
        };
        dataAccess.getKeepSessionAliveValue(callback);
    },
    trySignin = function () {
        var username, password, errorMessage;
        loginError.text('');
        username = usernameInput.val();
        password = passwordInput.val();
        errorMessage = validateCredentialsAreSupplied(username, password);
        if (errorMessage.length > 0) {
            loginError.text(errorMessage);
            return;
        }
        dataAccess.login(username, password, signIn);
    },
    initializeEventHandlers = function () {
        loginCloseButton.unbind('click');
        $("#isPrivateComputerCheckbox").bind('click', function () {
            var isChecked = $(this).is(':checked');
            dataAccess.setKeepSessionAliveValue(isChecked ? "Yes" : "No");
        });
        changePasswordButton.bind('click', goToChangePasswordPage);
        header.unbind('click');
        loginCloseButton.bind('click', hideLoginControl);
        header.bind('click', common.refreshPage);
        loginButton.bind('click', trySignin);
        common.trapEnterKey(loginButton);
        common.fireOnEnterKeyDown(loginControl, trySignin);
    },
    goToChangePasswordPage = function () {
        loginError.text('');
        window.open(librarian.ChangePassswordUrl, 'Change Password');
    };
    that = {
        signOut: function () {
            var callback = function() {
                clearInterval(keepAliveIntervalId);
                common.refreshPage();
            };
            dataAccess.signOut(callback);
        },
        signOutOrDisplayError: function (response, displayError) {
            if (!response.Success) {
                if (response.Payload) {
                    that.signOut();
                    return false;
                }
                if (displayError) {
                    displayError(response.Message);
                }
                return true;
            }
            return true;
        },
        initialize: function (urlLibrarian, session, hideTiles) {
            librarian = urlLibrarian;
            $("#header").attr("title", session.version);
            sessionTimeout = session.timeoutInMilliseconds;
            mandatorySessionTimeout = session.mandatoryTimeoutInMilliseconds;
            initializeEventHandlers();
            dataAccess.initialize(librarian);
            if (session.loggedInUsername) {
                var callback = function (response) {
                    var keepSessionAlive = response.Payload;
                    enterLoggedInState(session.loggedInUsername, keepSessionAlive, hideTiles);
                };
                dataAccess.getKeepSessionAliveValue(callback);
            } else {
                enterLoggedOutState(session.authorizationExceptionMessage || session.sessionHasTimedOutMessage || '');
            }
        }
    };
    return that;
};