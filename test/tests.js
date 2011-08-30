/*global FB, TDFriendSelector, module, test, expect, equals, ok, start, stop */
// Documentation on writing tests here: http://docs.jquery.com/QUnit
// Example tests: https://github.com/jquery/qunit/blob/master/test/same.js

var $action = $('#action'), selector1;

module('Environment module');

test('Environment is good', function() {
	expect(3);
	ok(!!window.jQuery, 'jQuery global is present');
	ok(!!window.FB, 'Facebook global is present');
	ok(!!window.TDFriendSelector, 'TDFriendSelector global is present');
});

module('Facebook module');

/*test('should start with no session', function() {
	expect(1);
	stop(2000);
	FB.getLoginStatus(function(response) {
		ok(!response.authResponse, 'should not get a session');
		start();
	});
});

test('cancel login using cancel button', function() {
	expect(1);
	stop();
	$action.click(function() {
		FB.login(function(response) {
			ok(!response.authResponse, 'should not get a authResponse');
			$action.empty().unbind();
			start();
		});
	});
	$action.html('Click the "Dont Allow" Button on the Login Popup');
});*/

test('login with the "Connect" button', function() {
	expect(2);
	stop();
	$action.click(function() {
		FB.login(function(response) {
			ok(response.authResponse, 'should get a authResponse');
			equals(response.status, 'connected', 'should be connected');
			$action.empty().unbind();
			start();
		});
	});
	$action.html('Login with the "Connect" button');
});

module('Friend Selector module');

test('TDFriendSelector should not create new instances if it is not initialised', function() {
	selector1 = TDFriendSelector.newInstance();
	equals(selector1, false, 'should return false');
});

test('Can TDFriendSelector create a new instance', function() {
	TDFriendSelector.init();
	selector1 = TDFriendSelector.newInstance();
	ok(selector1, 'should return an object');
});

