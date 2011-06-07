/*globals jQuery, FB */
/*jslint white: false, devel: true, onevar: true, browser: true, undef: true, nomen: false, regexp: false, plusplus: true, bitwise: true, newcap: true */

/*
var settings = {
	containerSelector : '#fb_friends',
	buttonSelector    : '.social_box_chooseFriends',
	speed             : 500,
	amount            : 4,
	debug             : false,
	page              : 10,
	disabled          : 'disabled'
};

var bans = [];
*/




/*
	FB friends chooser
	@author: Bram Verdyck
*/

var FBFSelector = (function(module, $) {

	// Public members (will be added to module as properties and returned)
	var init, getselectedFriendIds,

	// Private members
	getFriends, search, disableFriends, selectFriend,
	connect, bindEvents, log, showSelector, hideSelector, sortFriends, buildFriend,
	settings, friends, selectedFriendIds = [], disabledFriendIds = [],
	$container, $button, $friendsContainer, $countContainer, $countTotalContainer, $pageContainer, $pageCountContainer, $pageCountTotalContainer, $pagePrev, $pageNext, $searchContainer, $searchField, $searchList;

	// Initialise the plugin
	init = function(options) {

		// Default settings
		settings = {
			containerSelector : '#tdfriendselector',
			buttonSelector    : '.social_box_chooseFriends',
			speed             : 500,
			maxSelection      : 4,
			debug             : false,
			friendsPerPage    : 10,
			friendHeight      : 62,
			disabledClass     : 'tdfriendselector_disabled'
		};

		// Override defaults with arguments
		$.extend(settings, options);

		// Select DOM elements
		$container = $(settings.containerSelector);
		$button = $(settings.buttonSelector);
		$friendsContainer = $container.find('.tdfriendselector_list ul');
		$countContainer = $container.find('.tdfriendselector_count');
		$countTotalContainer = $container.find('.tdfriendselector_total');

		$pageContainer = $container.find('.tdfriendselector_paging');
		$pageCountContainer = $container.find('.tdfriendselector_pagingCount');
		$pageCountTotalContainer = $container.find('.tdfriendselector_pagingTotal');

		$pagePrev = $container.find('.tdfriendselector_prevPage');
		$pageNext = $container.find('.tdfriendselector_nextPage');

		$searchContainer = $container.find('.tdfriendselector_search_form');
		$searchField = $searchContainer.find('.tdfriendselector_text');
		$searchList = $container.find('.fb_search_list ul');

		if (FB) {
			bindEvents();
			return true;
		} else {
			log('FBFSelector - Init - FB not initialised');
			return false;
		}
	};

	// Add event listeners
	bindEvents = function() {

		$button.bind('click', function(e) {
			e.preventDefault();

			if ($(this).hasClass(settings.disabledClass)) { return false; }

			if (friends) {
				showSelector();
			} else {
				// Load the friends if we are logged in
				connect(function() {
					getFriends(showSelector);
				}, function() {
					log('FBFSelector - bindEvents - not logged in');
				});
			}
		});

		$container.find('.tdfriendselector_close, .tdfriendselector_ok').bind('click', function(e) {
			e.preventDefault();
			hideSelector();
		});

		$friendsContainer.find('a').live('click', function(e) {
			e.preventDefault();
			selectFriend($(this));
		});

		$pagePrev.bind('click', function(e) {
			e.preventDefault();

			var page = 1;
			page = parseInt($pageCountContainer.text(), 10);

			if ($friendsContainer.find('.tdfriendselector_friendPage:visible').prev().length > 0) {
				$friendsContainer.find('.tdfriendselector_friendPage:visible').hide().prev().show();
				$pageCountContainer.html(page - 1);
			}
			if (page === 2) { $(this).addClass(settings.disabledClass); }
			$pageNext.removeClass(settings.disabledClass);

		});
		$pageNext.bind('click', function(e) {
			e.preventDefault();

			var page = 1;
			if($friendsContainer.find('.tdfriendselector_friendPage:visible').next().length > 0) {
				$friendsContainer.find('.tdfriendselector_friendPage:visible').hide().next().show();
				page = parseInt($pageCountContainer.text(), 10);
				$pageCountContainer.html(page + 1);
			}
			if (page === $friendsContainer.find('.tdfriendselector_friendPage').length - 1) { $(this).addClass(settings.disabledClass); }
			$pagePrev.removeClass(settings.disabledClass);
		});

	};

	disableFriends = function(input) {
		disabledFriendIds = input;
	};

	/**
	 * Get the selected friends
	 */
	getselectedFriendIds = function() {
		return selectedFriendIds;
	};

	selectFriend = function($friend) {
		var friendId, i, len, name;

		friendId = $friend.attr('data-id');
		name = $friend.find('.tdfriendselector_friendName span:first').text();

		if (!$friend.hasClass('tdfriendselector_friendSelected')) {
			if (selectedFriendIds.length < settings.maxSelection) {
				// Add friend to selectedFriendIds
				if ($.inArray(friendId, selectedFriendIds) === -1) {
					selectedFriendIds.push(friendId);
					$friend.addClass('tdfriendselector_friendSelected');
					$countContainer.html(selectedFriendIds.length);
					log('FBFSelector - selectFriend - selected IDs: ', selectedFriendIds);
					$friend.trigger('FBFSfriendSelected', [friendId, name]);
				} else {
					log('FBFSelector - selectFriend - ID already stored');
				}
			}

		} else {
			// Remove friend from selectedFriendIds
			for (i = 0, len = selectedFriendIds.length; i < len; i += 1) {
				if (selectedFriendIds[i] === friendId) {
					selectedFriendIds.splice(i, 1);
					$friend.removeClass('tdfriendselector_friendSelected');
					$countContainer.html(selectedFriendIds.length);
					$friend.trigger('FBFSfriendUnSelected', [friendId, name]);
					return false;
				}
			}
		}

		if (selectedFriendIds.length === settings.maxSelection) { $friend.trigger('FBFSAmountReached', []); }
	};

	getFriends = function(callback) {
		if (!friends) {
			FB.api('/me/friends?fields=id,name', function(response) {
				if (response.data) {
					friends = response.data.slice();
					friends = friends.sort(sortFriends);
					if (typeof callback === 'function') { callback(); }
				}
			});
		} else {
			if (typeof callback === 'function') { callback(); }
		}
	};

	sortFriends = function(friend1, friend2) {
		if (friend1.name === friend2.name) { return 0; }
		if (friend1.name > friend2.name) { return 1; }
		if (friend1.name < friend2.name) { return -1; }
	};

	buildFriend = function(friend) {
		var html, sclass = 'tdfriendselector_friend tdfriendselector_clearfix';

		// Add selected/disabled classnames if they apply to this friend
		if ($.inArray(friend.id, selectedFriendIds) !== -1) {
			sclass += ' tdfriendselector_friendSelected';
		}
		if ($.inArray(friend.id, disabledFriendIds) !== -1) {
			sclass += ' tdfriendselector_friendDisabled';
		}

		html = '<a href="#" class="' + sclass + '" data-id="' + friend.id + '">' +
				'<img src="http://graph.facebook.com/' + friend.id + '/picture?type=square" width="50" height="50" alt="' + friend.name + '" class="tdfriendselector_friendAvatar" />' +
				'<div class="tdfriendselector_friendName">' + 
					'<span>' + friend.name + '</span>' +
					'<span class="tdfriendselector_friendSelect">select</span>' +
				'</div>' +
			'</a>';

		return html;
	};

	showSelector = function() {
		var friendsLength, i, wrapper, pageLength, j, friendID;

		friendsLength = friends.length;
		pageLength = Math.ceil(friendsLength / settings.friendsPerPage);
		wrapper = document.createDocumentFragment();
		wrapper.innerHTML = '';

		log('FBFSelector - showSelector - friends: ', friends);

		for (j = 0; j < pageLength; j += 1) {
			wrapper.innerHTML += '<li class="tdfriendselector_friendPage" rel="' + j + '"' + (j > 0 ? ' style="display: none;"' : '') + '>';
			for (i = 0; i < settings.friendsPerPage; i += 1) {
				friendID = (j * settings.friendsPerPage) + i;
				if (friendID < friendsLength) {
					//log('FBFSelector - showSelector - friendID: ', friendID);
					//log('FBFSelector - showSelector - Page: ', j);
					//log('FBFSelector - showSelector - FriendOnPage: ', i);
					wrapper.innerHTML += buildFriend(friends[friendID]);
				}
			}
			wrapper.innerHTML += '</li>';
		}

		$friendsContainer.html(wrapper.innerHTML);
		$countContainer.html(selectedFriendIds.length);
		$countTotalContainer.html(settings.maxSelection);
		$pageCountContainer.html("1");
		$pageCountTotalContainer.html(pageLength);

		if (pageLength > 1) {
			$pageContainer.show();
		} else {
			$pageContainer.hide();
		}
		$container.fadeIn(500);
	};

	hideSelector = function() {
		$container.fadeOut(500);
	};

	connect = function(callbackLoggedIn, callbackLoggedOut) {
		FB.getLoginStatus(function(response) {
			if (response.session) {
				log('FBFSelector - logged in');
				if (typeof callbackLoggedIn === 'function') { callbackLoggedIn(); }
			} else {
				log('FBFSelector - not logged in');
				if (typeof callbackLoggedOut === 'function') { callbackLoggedOut(); }
			}
		});
	};

	log = function() {
		if (settings.debug && window.console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	};

	module = {
		init: init,
		getselectedFriendIds : getselectedFriendIds
	};
	return module;

}(FBFSelector || {}, jQuery));

