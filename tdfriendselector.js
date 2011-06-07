/*globals jQuery, FB */
/*jslint white: false, devel: true, onevar: true, browser: true, undef: true, nomen: false, regexp: false, plusplus: true, bitwise: true, newcap: true */

/*!
 * These Days Friend Selector
 * @authors: Bram Verdyck, Keegan Street
 */
var TDFriendSelector = (function(module, $) {

	// Public functions
	var init, setFriends, newInstance,

	// Private variables
	settings, friends,
	$container, $friendsMask, $friendsContainer, $friends, $countContainer, $countTotalContainer, $pageContainer, $pageCountContainer, $pageCountTotalContainer, $pagePrev, $pageNext, $searchContainer, $searchField, $searchList, $buttonClose, $buttonOK,

	// Private functions
	buildFriendSelector, sortFriends, log;

	/////////////////////////////////////////
	// PUBLIC FUNCTIONS FOR GLOBAL PLUGIN
	/////////////////////////////////////////

	/**
	 * Initialise the plugin and define global options
	 */
	init = function(options) {

		// Default settings
		settings = {
			containerSelector : '#tdfriendselector',
			speed             : 500,
			debug             : false,
			disabledClass     : 'tdfriendselector_disabled'
		};

		// Override defaults with arguments
		$.extend(settings, options);

		// Select DOM elements
		$container = $(settings.containerSelector);
		$friendsMask = $container.find('.tdfriendselector_friendsMask');
		$friendsContainer = $container.find('.tdfriendselector_list');
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

		$buttonClose = $container.find('.tdfriendselector_close');
		$buttonOK = $container.find('.tdfriendselector_ok');
	};

	/**
	 * If your website has already loaded the user's Facebook friends, pass them in here to avoid another API call.
	 */
	setFriends = function(input) {
		friends = Array.prototype.slice.call(input).sort(sortFriends);
	};

	/**
	 * Create a new instance of the friend selector
	 * @param options An object containing settings that are relevant to this particular instance
	 */
	newInstance = function(options) {
		// Public functions
		var showFriendSelector, hideFriendSelector, getselectedFriendIds, setDisabledFriendIds,

		// Private variables
		instanceSettings, selectedFriendIds = [], disabledFriendIds = [],

		// Private functions
		bindEvents, unbindEvents, updatePaginationButtons, selectFriend;

		if (!settings) {
			log('Cannot create a new instance of TDFriendSelector because the plugin not initialised.');
			return false;
		}

		// Default settings
		instanceSettings = {
			maxSelection      : 4,
			friendsPerPage    : 10,
			friendHeight      : 64
		};

		// Override defaults with arguments
		$.extend(instanceSettings, options);

		/////////////////////////////////////////
		// PUBLIC FUNCTIONS FOR AN INSTANCE
		/////////////////////////////////////////

		/**
		 * Call this function to show the interface
		 */
		showFriendSelector = function() {
			var i, len, numPages;
			log('TDFriendSelector - newInstance - showFriendSelector');
			if (!friends) {
				return buildFriendSelector(showFriendSelector);
			} else {
				bindEvents();
				// Update classnames to represent the selections for this instance
				$friends.removeClass("tdfriendselector_friendSelected tdfriendselector_friendDisabled");
				for (i = 0, len = friends.length; i < len; i += 1) {
					if ($.inArray(friends[i].id, selectedFriendIds) !== -1) {
						$($friends[i]).addClass("tdfriendselector_friendSelected");
					}
					if ($.inArray(friends[i].id, disabledFriendIds) !== -1) {
						$($friends[i]).addClass("tdfriendselector_friendDisabled");
					}
				}
				// Update paging
				$friendsMask.height(instanceSettings.friendsPerPage * instanceSettings.friendHeight);
				$friendsContainer.css({top: 0});
				$countTotalContainer.html(instanceSettings.maxSelection);
				numPages = Math.ceil(friends.length / instanceSettings.friendsPerPage);
				$pageCountTotalContainer.html(numPages);
				updatePaginationButtons(1);
				$container.fadeIn(500);
			}
		};

		hideFriendSelector = function() {
			unbindEvents();
			$container.fadeOut(500);
		};

		getselectedFriendIds = function() {
			return selectedFriendIds;
		};

		/**
		 * Disabled friends are greyed out in the interface and are not selectable.
		 */
		setDisabledFriendIds = function(input) {
			disabledFriendIds = input;
		};

		/////////////////////////////////////////
		// PRIVATE FUNCTIONS FOR AN INSTANCE
		/////////////////////////////////////////

		// Add event listeners
		bindEvents = function() {
			$buttonClose.bind('click', function(e) {
				e.preventDefault();
				hideFriendSelector();
			});

			$buttonOK.bind('click', function(e) {
				e.preventDefault();
				hideFriendSelector();
			});

			$friends.bind('click', function(e) {
				e.preventDefault();
				selectFriend($(this));
			});

			$pagePrev.bind('click', function(e) {
				var pageNumber = parseInt($pageCountContainer.text(), 10) - 1;
				e.preventDefault();
				if (pageNumber < 1) { return; }
				$friendsContainer.css({top: 0 - (pageNumber * instanceSettings.friendsPerPage * instanceSettings.friendHeight)});
				updatePaginationButtons(pageNumber);
			});

			$pageNext.bind('click', function(e) {
				var pageNumber = parseInt($pageCountContainer.text(), 10) + 1, numPages = Math.ceil(friends.length / instanceSettings.friendsPerPage);
				e.preventDefault();
				if (pageNumber > numPages) { return; }
				$friendsContainer.css({top: 0 - (pageNumber * instanceSettings.friendsPerPage * instanceSettings.friendHeight)});
				updatePaginationButtons(pageNumber);
			});
		};

		// Remove event listeners
		unbindEvents = function() {
			$buttonClose.unbind('click');
			$buttonOK.unbind('click');
			$friends.unbind('click');
			$pagePrev.unbind('click');
			$pageNext.unbind('click');
		};

		updatePaginationButtons = function(pageNumber) {
			var numPages = Math.ceil(friends.length / instanceSettings.friendsPerPage);
			$pageCountContainer.html(pageNumber);
			if (pageNumber === 1 || numPages === 1) {
				$pagePrev.addClass(settings.disabledClass);
			} else {
				$pagePrev.removeClass(settings.disabledClass);
			}
			if (pageNumber === numPages || numPages === 1) {
				$pageNext.addClass(settings.disabledClass);
			} else {
				$pageNext.removeClass(settings.disabledClass);
			}
		};

		selectFriend = function($friend) {
			var friendId, i, len, name;

			friendId = $friend.attr('data-id');
			name = $friend.find('.tdfriendselector_friendName span:first').text();

			if (!$friend.hasClass('tdfriendselector_friendSelected')) {
				if (selectedFriendIds.length < instanceSettings.maxSelection) {
					// Add friend to selectedFriendIds
					if ($.inArray(friendId, selectedFriendIds) === -1) {
						selectedFriendIds.push(friendId);
						$friend.addClass('tdfriendselector_friendSelected');
						$countContainer.html(selectedFriendIds.length);
						log('TDFriendSelector - newInstance - selectFriend - selected IDs: ', selectedFriendIds);
						$friend.trigger('TDFriendSelector_friendSelected', [friendId, name]);
					} else {
						log('TDFriendSelector - newInstance - selectFriend - ID already stored');
					}
				}

			} else {
				// Remove friend from selectedFriendIds
				for (i = 0, len = selectedFriendIds.length; i < len; i += 1) {
					if (selectedFriendIds[i] === friendId) {
						selectedFriendIds.splice(i, 1);
						$friend.removeClass('tdfriendselector_friendSelected');
						$countContainer.html(selectedFriendIds.length);
						$friend.trigger('TDFriendSelector_friendUnselected', [friendId, name]);
						return false;
					}
				}
			}

			if (selectedFriendIds.length === settings.maxSelection) { $friend.trigger('TDFriendSelector_AmountReached', []); }
		};

		// Return an object with access to the public members
		return {
			showFriendSelector: showFriendSelector,
			hideFriendSelector: hideFriendSelector,
			getselectedFriendIds: getselectedFriendIds
		};
	};

	/////////////////////////////////////////
	// PRIVATE FUNCTIONS FOR GLOBAL PLUGIN
	/////////////////////////////////////////

	/**
	 * Load the Facebook friends and build the markup
	 */
	buildFriendSelector = function(callback) {
		var buildMarkup, buildFriendMarkup;

		if (!FB) {
			log('The Facebook SDK must be initialised before showing the friend selector');
			return false;
		}

		// Check that the user is logged in to Facebook
		FB.getLoginStatus(function(response) {
			if (response.session) {
				// Load Facebook friends
				FB.api('/me/friends?fields=id,name', function(response) {
					if (response.data) {
						setFriends(response.data);
						// Build the markup
						buildMarkup();
						// Call the callback
						if (typeof callback === 'function') { callback(); }
					} else {
						log('TDFriendSelector - buildFriendSelector - No friends returned');
						return false;
					}
				});
			} else {
				log('TDFriendSelector - buildFriendSelector - User is not logged in to Facebook');
				return false;
			}
		});

		// Build the markup of the friend selector
		buildMarkup = function() {
			var i, len, html, j, friendID;
			html = document.createDocumentFragment();
			html.innerHTML = '';
			for (i = 0, len = friends.length; i < len; i += 1) {
				html.innerHTML += buildFriendMarkup(friends[i]);
			}
			$friendsContainer.html(html.innerHTML);
			$friends = $friendsContainer.find('a');
		};

		// Return the markup for a single friend
		buildFriendMarkup = function(friend) {
			return '<a href="#" class="tdfriendselector_friend tdfriendselector_clearfix" data-id="' + friend.id + '">' +
					'<img src="http://graph.facebook.com/' + friend.id + '/picture?type=square" width="50" height="50" alt="' + friend.name + '" class="tdfriendselector_friendAvatar" />' +
					'<div class="tdfriendselector_friendName">' + 
						'<span>' + friend.name + '</span>' +
						'<span class="tdfriendselector_friendSelect">select</span>' +
					'</div>' +
				'</a>';
		};
	};

	sortFriends = function(friend1, friend2) {
		if (friend1.name === friend2.name) { return 0; }
		if (friend1.name > friend2.name) { return 1; }
		if (friend1.name < friend2.name) { return -1; }
	};

	log = function() {
		if (settings.debug && window.console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	};

	module = {
		init: init,
		setFriends: setFriends,
		newInstance: newInstance
	};
	return module;

}(TDFriendSelector || {}, jQuery));

