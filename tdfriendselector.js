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
	connect, bindEvents, resize, log, show, hide, sortFriends, buildFriend,
	settings, friends = [], rel = '', rels = {},
	$container, $button, $friendsContainer, $countContainer, $countTotalContainer, $pageContainer, $pageCountContainer, $pageCountTotalContainer, $pagePrev, $pageNext, $searchContainer, $searchField, $searchList;

	// Initialise the plugin
	init = function(options) {

		// Default settings
		settings = {
			containerSelector : '#fb_friends',
			buttonSelector    : '.social_box_chooseFriends',
			speed             : 500,
			amount            : 4,
			debug             : false,
			page              : 10,
			disabledClass     : 'disabled',
			updateOnResize    : true
		};

		// Override defaults with arguments
		$.extend(settings, options);

		// Select DOM elements
		$container = $(settings.containerSelector);
		$button = $(settings.buttonSelector);
		$friendsContainer = $container.find('.fb_friends_list ul');
		$countContainer = $container.find('.fb_friends_count');
		$countTotalContainer = $container.find('.fb_friends_total');

		$pageContainer = $container.find('.fb_friends_paging');
		$pageCountContainer = $pageContainer.find('.fb_friends_paging_count');
		$pageCountTotalContainer = $pageContainer.find('.fb_friends_paging_total');

		$pagePrev = $container.find('.fb_friends_prevPage');
		$pageNext = $container.find('.fb_friends_prevNext');

		$searchContainer = $container.find('.fb_friends_search_form');
		$searchField = $searchContainer.find('.text');
		$searchList = $container.find('.fb_search_list ul');

		$($container).height($(document).height());
		$($container).width($(document).width());

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

		if (settings.updateOnResize) {
			$(window).bind('resize', function() {
				resize();
			}).trigger('resize');
		}

		$button.bind('click', function(e) {
			e.preventDefault();
			rel = $(this).attr('rel');

			if ($(this).hasClass(settings.disabledClass)) { return false; }

			if (!rels[rel]) { rels[rel] = []; }

			// check if logged in
			// callback1 = logged in callback
			// callback2 = logged out callback
			connect(function() {
				if(friends.length <= 0) {

					// get friends with FB.api
					// callback when loading of friends is completed
					getFriends(show);
				} else {

					// if friends already stored, don't load again
					// show dialog
					show();
				}

				log('FBFSelector - bindEvents - logged in');

			}, function() {
				log('FBFSelector - bindEvents - not logged in');
			});
		});

		$container.find('.fb_friends_close, .fb_friends_ok').bind('click', function(e) {
			e.preventDefault();
			rel = '';
			hide();
		});

		$friendsContainer.find('a').live('click', function(e) {
			e.preventDefault();
			selectFriend($(this));
		});

		$pagePrev.bind('click', function(e) {
			e.preventDefault();

			var page = 1;
			page = parseInt($pageCountContainer.text(), 10);

			if ($friendsContainer.find('.fb_friend_page:visible').prev().length > 0) {
				$friendsContainer.find('.fb_friend_page:visible').hide().prev().show();
				$pageCountContainer.html(page - 1);
			}
			if (page === 2) { $(this).addClass(settings.disabledClass); }
			$pageNext.removeClass(settings.disabledClass);

		});
		$pageNext.bind('click', function(e) {
			e.preventDefault();

			var page = 1;
			if($friendsContainer.find('.fb_friend_page:visible').next().length > 0) {
				$friendsContainer.find('.fb_friend_page:visible').hide().next().show();
				page = parseInt($pageCountContainer.text(), 10);
				$pageCountContainer.html(page + 1);
			}
			if (page === $friendsContainer.find('.fb_friend_page').length - 1) { $(this).addClass(settings.disabledClass); }
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

	resize = function() {
		var $window = $(window);
		$container.height($window.height());
		$container.width($window.width());
	};

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
		var link, $container, rel, id, i, name, len, store, count;

		link = a;
		$container = link.parents('.fb_friend');
		rel = $container.attr('data-rel');
		id = $container.attr('data-id');
		name = $container.find('.fb_friend_name span:first').text();
		len = rels[rel].length;

		if (!rels[rel]) { rels[rel] = []; }

		if (!$container.hasClass('stored')) {
			store = true;

			if (len < settings.amount) {
				for (i = 0; i < len; i += 1) {
					if (rels[rel][i] === id) { store = false; }
				}

				if (store) {
					rels[rel].push(id);
					$container.addClass('stored');
					$countContainer.html(rels[rel].length);
					log('FBFSelector - selectFriend - selected IDs: ', rels[rel]);
					$container.trigger('FBFSfriendSelected', [rel, id, name]);
					if (len + 1 === settings.amount) { $container.trigger('FBFSAmountReached', [rel]); }
				} else {
					log('FBFSelector - selectFriend - ID already stored');
				}
			}

		} else {

			for (i = 0; i < len; i += 1) {
				if(rels[rel][i] === id) {
					rels[rel].splice(i, 1);
					$container.removeClass('stored');
					$countContainer.html(rels[rel].length);
					$container.trigger('FBFSfriendUnSelected', [rel, id, name]);
					return false;
				}
			}
		}

		if (len === settings.amount) { $container.trigger('FBFSAmountReached', [rel]); }
	};

	getFriends = function(callback) {
		if (friends.length <= 0) {
			FB.api('/me/friends?fields=id,name', function(response) {
				if (response.data) {
					friends = response.data.slice();
					friends = friends.sort(sortFriends);
					if(typeof callback === 'function') { callback(friends); }
				}
			});
		} else {
			friends = friends.sort(sortFriends);
			if (typeof callback === 'function') { callback(friends); }
		}
	};

	sortFriends = function(friend1, friend2) {
		if (friend1.name === friend2.name) { return 0; }
		if (friend1.name > friend2.name) { return 1; }
		if (friend1.name < friend2.name) { return -1; }
	};

	buildFriend = function(friend) {
		var f_id, f_avatar, f_name, f_link, f_html, f_rel, sclass, ids, idsLength, i, stored, _rel;

		f_rel = rel;
		f_id = friend.id;
		f_name = friend.name;
		f_avatar = 'http://graph.facebook.com/' + f_id + '/picture?type=square';

		stored = false;
		ids = rels[f_rel];
		idsLength = ids.length;

		sclass = '';

		for (_rel in rels) {
			ids = rels[_rel];
			idsLength = ids.length;

			for (i = 0; i < idsLength; i += 1) {
				if ('' + f_id === '' + ids[i]) {
					stored = true;
					sclass += ' stored';
					if(f_rel !== _rel) { sclass += ' prestored'; }
					if(_rel === 'bans') { sclass += ' invited'; }
				}
			}
		}

		f_html = '<li class="fb_friend clearfix' + sclass + '" data-rel="f_rel" data-id="f_id"><a href="#" class="fb_friend_link"><div class="fb_friend_avatar left"><img src="f_avatar" width="50" height="50" alt="f_name" /></div><div class="fb_friend_name left"><span>f_name</span><span class="fb_friend_select">select</span></div></a></li>';

		f_html = f_html.replace(/f_rel/g, f_rel);
		f_html = f_html.replace(/f_id/g, f_id);
		f_html = f_html.replace(/f_avatar/g, f_avatar);
		f_html = f_html.replace(/f_name/g, f_name);

		//fbfs.log('FBFSelector - buildFriend - f_html: ', f_html);

		return f_html;
	};

	show = function(friendList){
		var _friends, friendsLength, i, wrapper, friend, friend_html, pageLength, j, friendID, dataRel;

		_friends = friendList.slice();
		friendsLength = _friends.length;

		pageLength = Math.ceil(friendsLength / settings.page);

		wrapper = document.createDocumentFragment();
		wrapper.innerHTML = '';

		log('FBFSelector - show - friends: ', _friends);

		for (j = 0; j < pageLength; j += 1) {

			wrapper.innerHTML += '<li class="fb_friend_page" rel="' + j + '"><ul>';

			for (i = 0; i < settings.page; i += 1) {
				friendID = (j * settings.page) + i;

				if (friendID < friendsLength) {

					//fbfs.log('FBFSelector - show - friendID: ', friendID);
					//fbfs.log('FBFSelector - show - Page: ', j);
					//fbfs.log('FBFSelector - show - FriendOnPage: ', i);

					friend = friends[friendID];
					friend_html = buildFriend(friend);
					wrapper.innerHTML += friend_html;

					//fbfs.log('FBFSelector - show - friend: ', friend);
					//fbfs.log('FBFSelector - show - friend_html: ', friend_html);
				}
			}

			wrapper.innerHTML += '</ul></li>';
		}

		$friendsContainer.html(wrapper.innerHTML);

		dataRel = $container.find('.fb_friend').attr('data-rel');

		//fbfs.$countContainer.html(fbfs.$container.find('.stored').length);
		if (pageLength > 1) {
			$pageContainer.show();
		} else {
			$pageContainer.hide();
		}

		//fbfs.$pageCountContainer.html(pageLength);
		$countContainer.html(rels[dataRel].length);
		$countTotalContainer.html(settings.amount);

		$pageCountTotalContainer.html(pageLength);
		$friendsContainer.find('.fb_friend_page:gt(0)').hide();

		$container.fadeIn(500);
	};
	hide = function() {
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

