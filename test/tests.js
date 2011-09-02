/*global FB, TDFriendSelector, test, asyncTest, expect, module, QUnit, ok, equal, notEqual, deepEqual, notDeepEqual, strictEqual, notStrictEqual, raises, start, stop */
// Documentation on writing tests here: http://docs.jquery.com/QUnit
// Example tests: https://github.com/jquery/qunit/blob/master/test/same.js

var $action = $('#action'), selector1, friends;

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
		$action.empty().unbind();
		FB.login(function(response) {
			ok(!response.authResponse, 'should not get a authResponse');
			start();
		});
	});
	$action.html('Click the "Dont Allow" Button on the Login Popup');
});*/

test('Login to Facebook', function() {
	expect(2);
	stop();
	FB.getLoginStatus(function(response) {
		if (response.authResponse) {
			ok(response.authResponse, 'should get a authResponse');
			equal(response.status, 'connected', 'should be connected');
			start();
		} else {
			$action.click(function() {
				$action.empty().unbind();
				FB.login(function(response) {
					ok(response.authResponse, 'should get a authResponse');
					equal(response.status, 'connected', 'should be connected');
					start();
				});
			});
			$action.html('Login with the "Connect" button');
		}
	});
});

test('Load friends from Facebook', function() {
	expect(1);
	stop();
	FB.api('/me/friends/', function(response) {
		var loaded = (response && response.data && response.data.length > 0);
		if (loaded) {
			friends = response.data;
		}
		ok(loaded, 'should load friends');
		start();
	});
});

module('Friend Selector module');

test('TDFriendSelector should not create new instances if it is not initialised', function() {
	selector1 = TDFriendSelector.newInstance();
	equal(selector1, false, 'should return false');
});

test('Can TDFriendSelector create a new instance', function() {
	TDFriendSelector.init({debug: true});
	selector1 = TDFriendSelector.newInstance();
	ok(selector1, 'should return an object');
});

test('show friend selector', function() {
	expect(3);
	stop();
	selector1.showFriendSelector(function() {
		ok(true, 'selector should be built and shown');
		ok($('.TDFriendSelector_friend').length > 0, 'expected some elements to be added to the page with the classname TDFriendSelector_friend');
		equal(selector1.getselectedFriendIds(), 0, 'selected friends should be empty');
		start();
	});
});

test('test filtering', function() {
	expect(1);
	stop();
	selector1.filterFriends(friends[0].name);
	setTimeout(function() {
		ok($('.TDFriendSelector_friend').length > 0, 'expected at least one element to still be shown with the classname TDFriendSelector_friend');
		start();
	}, 500);
});

test('test selection and deselection', function() {
	var phase = 1, friendId, selector2, callbackFriendSelected, callbackFriendUnselected, callbackSubmit;
	expect(7);
	stop();
	callbackFriendSelected = function(id) {
		friendId = id;
		ok((id && typeof id === 'string'), 'expected friend id to be a string');
	};
	callbackFriendUnselected = function(id) {
		ok((id && typeof id === 'string'), 'expected friend id to be a string');
		strictEqual(friendId, id, 'expected id to be the same as the id returned by callbackFriendSelected');
	};
	callbackSubmit = function(ids) {
		if (phase === 1) {
			ok((typeof ids === 'object' && ids.length && ids.length === 1), 'expected friend ids to be an array of length 1');
			ok((typeof ids[0] === 'string'), 'expected ids[0] to be a string');
			strictEqual(friendId, ids[0], 'expected ids[0] to be the same as the id returned by callbackFriendSelected');
			phase = 2;
			selector2.showFriendSelector(function() {
				$('.TDFriendSelector_friend').eq(0).click();
				$('#TDFriendSelector_buttonOK').click();
			});
		} else {
			ok((typeof ids === 'object' && ids.length === 0), 'expected friend ids to be an array of length 0');
			start();
		}
	};
	selector2 = TDFriendSelector.newInstance({
		callbackFriendSelected:   callbackFriendSelected,
		callbackFriendUnselected: callbackFriendUnselected,
		callbackSubmit:           callbackSubmit
	});
	selector2.showFriendSelector(function() {
		$('.TDFriendSelector_friend').eq(0).click();
		$('#TDFriendSelector_buttonOK').click();
	});
});

