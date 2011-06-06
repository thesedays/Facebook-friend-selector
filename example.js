/*globals $, jQuery, FB, FBFSelector */
/*jslint white: false, devel: true, onevar: true, browser: true, undef: true, nomen: false, regexp: false, plusplus: true, bitwise: true, newcap: true */

window.fbAsyncInit = function () {

	FB.init({appId: '172102396182433', status: true, cookie: false, xfbml: false});

	$(document).ready(function () {
		var fbfs;

		fbfs = FBFSelector.init({debug: true});

		$("#login_button").click(function (e) {
			e.preventDefault();
			FB.login(function (response) {
				if (response.session) {
					console.log("Logged in");
				} else {
					console.log("Not logged in");
				}
			}, {});
		});

	});
};
(function () {
	var e = document.createElement('script');
	e.async = true;
	e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
	document.getElementById('fb-root').appendChild(e);
}());

