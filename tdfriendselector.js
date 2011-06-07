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

// var fbd = new FBFSelector();
// fbd.init(settings);
// fbd.removeFriend(rel, fbid, name, callback);
// fbd.getSelectedFriends();
// fbd.ban(bans);


/*
	FB friends chooser
	@author: Bram Verdyck
*/

var FBFSelector = (function(module, $) {

	// Public members (will be added to module as properties and returned)
	var init, getSelectedFriends,

	// Private members
	getFriends, search, ban, removeFriend, selectFriend,
	connect, bindEvents, log, showSelector, hideSelector, sortFriends, buildFriend,
	settings, friends, rel = '', rels = {},
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
			rel = $(this).attr('rel');

			if ($(this).hasClass(settings.disabledClass)) { return false; }

			if (!rels[rel]) { rels[rel] = []; }

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
			rel = '';
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

		//$searchField.bind('keyup', function() { search($(this).val()); });
	};

	ban = function(banList) {
		if (typeof banList === 'object') { rels.bans = banList.slice(); }
	};

	/*search = function(value) {
		var text;

		$searchList.html('');
		$searchList.show();

		if (value) {
			$friendsContainer.hide();
			$friendsContainer.find('li').each(function() {
				text = $(this).find('.fb_friend_name span:first').text();
				if (text.indexOf(value) >= 0) {}
			});
		} else {
			$friendsContainer.show();
			$searchList.hide();
		}
	};*/

	/**
	 * Get the selected friends
	 * @param rel Limit the results to one specific instance
	 */
	getSelectedFriends = function(rel) {
		if (rel) {
			return rels[rel];
		} else {
			return rels;
		}
	};

	removeFriend = function(rel, id, name, callback) {
		var len, i;
		if (rels[rel]) {
			for (i = 0, len = rels[rel].length; i < len; i += 1) {
				if (rels[rel][i] === id) {
					rels[rel].splice(i, 1);
					if (typeof callback === 'function') { callback(); }
					return false;
				}
			}
		}
	};

	selectFriend = function(a) {
		var $container, rel, id, i, name, len, store, count;

		$container = a;
		rel = $container.attr('data-rel');
		id = $container.attr('data-id');
		name = $container.find('.tdfriendselector_friendName span:first').text();
		len = rels[rel].length;

		if (!rels[rel]) { rels[rel] = []; }

		if (!$container.hasClass('tdfriendselector_friendSelected')) {
			store = true;

			if (len < settings.maxSelection) {
				for (i = 0; i < len; i += 1) {
					if (rels[rel][i] === id) { store = false; }
				}

				if (store) {
					rels[rel].push(id);
					$container.addClass('tdfriendselector_friendSelected');
					$countContainer.html(rels[rel].length);
					log('FBFSelector - selectFriend - selected IDs: ', rels[rel]);
					$container.trigger('FBFSfriendSelected', [rel, id, name]);
					if (len + 1 === settings.maxSelection) { $container.trigger('FBFSAmountReached', [rel]); }
				} else {
					log('FBFSelector - selectFriend - ID already stored');
				}
			}

		} else {

			for (i = 0; i < len; i += 1) {
				if(rels[rel][i] === id) {
					rels[rel].splice(i, 1);
					$container.removeClass('tdfriendselector_friendSelected');
					$countContainer.html(rels[rel].length);
					$container.trigger('FBFSfriendUnSelected', [rel, id, name]);
					return false;
				}
			}
		}

		if (len === settings.maxSelection) { $container.trigger('FBFSAmountReached', [rel]); }
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
		var f_avatar, f_html, sclass, ids, idsLength, i, stored, r;

		f_avatar = 'http://graph.facebook.com/' + friend.id + '/picture?type=square';
		stored = false;
		sclass = '';

		for (r in rels) {
			if (rels.hasOwnProperty(r)) {
				ids = rels[r];
				idsLength = ids.length;
				for (i = 0; i < idsLength; i += 1) {
					if ('' + friend.id === '' + ids[i]) {
						stored = true;
						sclass += ' tdfriendselector_friendSelected';
						if (rel !== r) { sclass += ' tdfriendselector_friendDisabled'; }
						if (r === 'bans') { sclass += ' tdfriendselector_invited'; }
					}
				}
			}
		}

		f_html = '<a href="#" class="tdfriendselector_friend tdfriendselector_clearfix' + sclass + '" data-rel="' + rel + '" data-id="' + friend.id + '">' +
				'<img src="' + f_avatar + '" width="50" height="50" alt="' + friend.name + '" class="tdfriendselector_friendAvatar" />' +
				'<div class="tdfriendselector_friendName">' + 
					'<span>' + friend.name + '</span>' +
					'<span class="tdfriendselector_friendSelect">select</span>' +
				'</div>' +
			'</a>';

		//log('FBFSelector - buildFriend - f_html: ', f_html);
		return f_html;
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
		$countContainer.html(rels[rel].length);
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
		getSelectedFriends : getSelectedFriends
	};
	return module;

}(FBFSelector || {}, jQuery));

