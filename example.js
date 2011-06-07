/*globals $, jQuery, FB, TDFriendSelector */
/*jslint white: false, devel: true, onevar: true, browser: true, undef: true, nomen: false, regexp: false, plusplus: true, bitwise: true, newcap: true */

window.fbAsyncInit = function () {

	FB.init({appId: '172102396182433', status: true, cookie: false, xfbml: false});

	$(document).ready(function () {
		var selector1, selector2, logActivity, callbackFriendSelected, callbackFriendUnselected, callbackMaxSelection, callbackSubmit;

		TDFriendSelector.init({debug: true});

		selector1 = TDFriendSelector.newInstance();
		selector2 = TDFriendSelector.newInstance({maxSelection: 2, friendsPerPage: 5});

		logActivity = function (message) {
			$("#results").append('<div>' + new Date() + ' - ' + message + '</div>');
		};

		callbackFriendSelected = function(friendId) {
			var friend, name;
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			logActivity('Selected ' + name + ' (ID: ' + friendId + ')');
		};
		selector1.setCallbackFriendSelected(callbackFriendSelected);
		selector2.setCallbackFriendSelected(callbackFriendSelected);

		callbackFriendUnselected = function(friendId) {
			var friend, name;
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			logActivity('Unselected ' + name + ' (ID: ' + friendId + ')');
		};
		selector1.setCallbackFriendUnselected(callbackFriendUnselected);
		selector2.setCallbackFriendUnselected(callbackFriendUnselected);

		callbackMaxSelection = function() {
			logActivity('Selected the maximum number of friends');
		};
		selector1.setCallbackMaxSelection(callbackMaxSelection);
		selector2.setCallbackMaxSelection(callbackMaxSelection);

		callbackSubmit = function(selectedFriendIds) {
			logActivity('Clicked OK with the following friends selected: ' + selectedFriendIds.join(", "));
		};
		selector1.setCallbackSubmit(callbackSubmit);
		selector2.setCallbackSubmit(callbackSubmit);

		$("#btnLogin").click(function (e) {
			e.preventDefault();
			FB.login(function (response) {
				if (response.session) {
					console.log("Logged in");
				} else {
					console.log("Not logged in");
				}
			}, {});
		});

		$("#btnLogout").click(function (e) {
			e.preventDefault();
			FB.logout();
		});

		$("#btnSelect1").click(function (e) {
			e.preventDefault();
			selector1.showFriendSelector();
		});

		$("#btnSelect2").click(function (e) {
			e.preventDefault();
			selector2.showFriendSelector();
		});

	});
};
(function () {
	var e = document.createElement('script');
	e.async = true;
	e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
	document.getElementById('fb-root').appendChild(e);
}());

