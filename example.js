/*globals $, jQuery, FB, TDFriendSelector */
/*jslint white: false, devel: true, onevar: true, browser: true, undef: true, nomen: false, regexp: false, plusplus: true, bitwise: true, newcap: true */

window.fbAsyncInit = function () {

	FB.init({appId: '172102396182433', status: true, cookie: false, xfbml: false});

	$(document).ready(function () {
		var selector1, selector2, callbackFriendSelected, callbackFriendUnselected, callbackMaxSelection, callbackSubmit;

		TDFriendSelector.init({debug: true});

		selector1 = TDFriendSelector.newInstance();
		selector2 = TDFriendSelector.newInstance({maxSelection: 2, friendsPerPage: 5});

		callbackFriendSelected = function(friendId) {
			var result, friend, name, currentDate = new Date();
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			result = $('<div>' + currentDate + ' - Selected ' + name + ' (ID: ' + friendId + ')</div>');
			$("#results").append(result);
		};
		selector1.setCallbackFriendSelected(callbackFriendSelected);
		selector2.setCallbackFriendSelected(callbackFriendSelected);

		callbackFriendUnselected = function(friendId) {
			var result, friend, name, currentDate = new Date();
			friend = TDFriendSelector.getFriendById(friendId);
			name = friend.name;
			result = $('<div>' + currentDate + ' - Unselected ' + name + ' (ID: ' + friendId + ')</div>');
			$("#results").append(result);
		};
		selector1.setCallbackFriendUnselected(callbackFriendUnselected);
		selector2.setCallbackFriendUnselected(callbackFriendUnselected);

		callbackMaxSelection = function() {
			var result, currentDate = new Date();
			result = $('<div>' + currentDate + ' - Selected the maximum number of friends</div>');
			$("#results").append(result);
		};
		selector1.setCallbackMaxSelection(callbackMaxSelection);
		selector2.setCallbackMaxSelection(callbackMaxSelection);

		callbackSubmit = function(selectedFriendIds) {
			var result, currentDate = new Date();
			result = $('<div>' + currentDate + ' - Clicked OK with the following friends selected: ' + selectedFriendIds.join(", ") + '</div>');
			$("#results").append(result);
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

