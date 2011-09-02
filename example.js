/*jslint devel: true, bitwise: false, undef: false, browser: true, continue: false, debug: false, eqeq: false, es5: false, type: false, evil: false, vars: false, forin: false, white: true, newcap: false, nomen: true, plusplus: false, regexp: true, sloppy: true */
/*globals $, jQuery, FB, TDFriendSelector */

window.fbAsyncInit = function () {

	FB.init({appId: '172102396182433', status: true, cookie: false, xfbml: false, oauth: true});

	$(document).ready(function () {
		var selector1, selector2, logActivity, callbackFriendSelected, callbackFriendUnselected, callbackMaxSelection, callbackSubmit;

		// When a friend is selected, log their name and ID
		callbackFriendSelected = function(friendId) {
			var friend, name;
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			logActivity('Selected ' + name + ' (ID: ' + friendId + ')');
		};

		// When a friend is deselected, log their name and ID
		callbackFriendUnselected = function(friendId) {
			var friend, name;
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			logActivity('Unselected ' + name + ' (ID: ' + friendId + ')');
		};

		// When the maximum selection is reached, log a message
		callbackMaxSelection = function() {
			logActivity('Selected the maximum number of friends');
		};

		// When the user clicks OK, log a message
		callbackSubmit = function(selectedFriendIds) {
			logActivity('Clicked OK with the following friends selected: ' + selectedFriendIds.join(", "));
		};

		// Initialise the Friend Selector with options that will apply to all instances
		TDFriendSelector.init({debug: true});

		// Create some Friend Selector instances
		selector1 = TDFriendSelector.newInstance({
			callbackFriendSelected   : callbackFriendSelected,
			callbackFriendUnselected : callbackFriendUnselected,
			callbackMaxSelection     : callbackMaxSelection,
			callbackSubmit           : callbackSubmit
		});
		selector2 = TDFriendSelector.newInstance({
			callbackFriendSelected   : callbackFriendSelected,
			callbackFriendUnselected : callbackFriendUnselected,
			callbackMaxSelection     : callbackMaxSelection,
			callbackSubmit           : callbackSubmit,
			maxSelection             : 1,
			friendsPerPage           : 5,
			autoDeselection          : true
		});

		FB.getLoginStatus(function(response) {
			if (response.authResponse) {
				$("#login-status").html("Logged in");
			} else {
				$("#login-status").html("Not logged in");
			}
		});

		$("#btnLogin").click(function (e) {
			e.preventDefault();
			FB.login(function (response) {
				if (response.authResponse) {
					console.log("Logged in");
					$("#login-status").html("Logged in");
				} else {
					console.log("Not logged in");
					$("#login-status").html("Not logged in");
				}
			}, {});
		});

		$("#btnLogout").click(function (e) {
			e.preventDefault();
			FB.logout();
			$("#login-status").html("Not logged in");
		});

		$("#btnSelect1").click(function (e) {
			e.preventDefault();
			selector1.showFriendSelector();
		});

		$("#btnSelect2").click(function (e) {
			e.preventDefault();
			selector2.showFriendSelector();
		});

		logActivity = function (message) {
			$("#results").append('<div>' + new Date() + ' - ' + message + '</div>');
		};
	});
};

(function () {
	var e = document.createElement('script');
	e.async = true;
	e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
	document.getElementById('fb-root').appendChild(e);
}());

