/*jslint devel: true, bitwise: false, undef: false, browser: true, continue: false, debug: false, eqeq: false, es5: false, type: false, evil: false, vars: false, forin: false, white: true, newcap: false, nomen: true, plusplus: false, regexp: true, sloppy: true */
/*globals jQuery, FB */

/*!
 * These Days Friend Selector
 * @authors: Bram Verdyck, Keegan Street
 */
var TDFriendSelector = (function(module, $) {

	// Public functions
	var init, setFriends, getFriends, getFriendById, newInstance,

	// Private variables
	settings, friends,
	$friends, $container, $friendsMask, $friendsContainer, $searchField, $selectedCount, $selectedCountMax, $pageNumber, $pageNumberTotal, $pagePrev, $pageNext, $buttonClose, $buttonOK,

	// Private functions
	$getFriendById, buildFriendSelector, sortFriends, log;

	/////////////////////////////////////////
	// PUBLIC FUNCTIONS FOR GLOBAL PLUGIN
	// They are public because they are added to module and returned
	/////////////////////////////////////////

	/**
	 * Initialise the plugin and define global options
	 */
	init = function(options) {

		// Default settings
		settings = {
			speed                    : 500,
			debug                    : false,
			textSelect               : 'select',
			disabledClass            : 'TDFriendSelector_disabled',
			friendSelectedClass      : 'TDFriendSelector_friendSelected',
			friendDisabledClass      : 'TDFriendSelector_friendDisabled',
			friendFilteredClass      : 'TDFriendSelector_friendFiltered',
			containerSelector        : '#TDFriendSelector',
			friendsMaskSelector      : '.TDFriendSelector_friendsMask',
			friendsContainerSelector : '.TDFriendSelector_friendsContainer',
			searchFieldSelector      : '#TDFriendSelector_searchField',
			selectedCountSelector    : '.TDFriendSelector_selectedCount',
			selectedCountMaxSelector : '.TDFriendSelector_selectedCountMax',
			pageNumberSelector       : '#TDFriendSelector_pageNumber',
			pageNumberTotalSelector  : '#TDFriendSelector_pageNumberTotal',
			pagePrevSelector         : '#TDFriendSelector_pagePrev',
			pageNextSelector         : '#TDFriendSelector_pageNext',
			buttonCloseSelector      : '#TDFriendSelector_buttonClose',
			buttonOKSelector         : '#TDFriendSelector_buttonOK'
		};

		// Override defaults with arguments
		$.extend(settings, options);

		// Select DOM elements
		$container        = $(settings.containerSelector);
		$friendsMask      = $container.find(settings.friendsMaskSelector);
		$friendsContainer = $container.find(settings.friendsContainerSelector);
		$searchField      = $container.find(settings.searchFieldSelector);
		$selectedCount    = $container.find(settings.selectedCountSelector);
		$selectedCountMax = $container.find(settings.selectedCountMaxSelector);
		$pageNumber       = $container.find(settings.pageNumberSelector);
		$pageNumberTotal  = $container.find(settings.pageNumberTotalSelector);
		$pagePrev         = $container.find(settings.pagePrevSelector);
		$pageNext         = $container.find(settings.pageNextSelector);
		$buttonClose      = $container.find(settings.buttonCloseSelector);
		$buttonOK         = $container.find(settings.buttonOKSelector);
	};

	/**
	 * If your website has already loaded the user's Facebook friends, pass them in here to avoid another API call.
	 */
	setFriends = function(input) {
		var i, len;
		if (!input || input.length === 0) {
			return;
		}
		input = Array.prototype.slice.call(input);
		for (i = 0, len = input.length; i < len; i += 1) {
			input[i].upperCaseName = input[i].name.toUpperCase();
		}
		input = input.sort(sortFriends);
		friends = input;
	};

	getFriends = function() {
		return friends;
	};

	/**
	 * Use this function if you have a friend ID and need to know their name
	 */
	getFriendById = function(id) {
		var i, len;
		for (i = 0, len = friends.length; i < len; i += 1) {
			if ('' + friends[i].id === '' + id) {
				return friends[i];
			}
		}
		return null;
	};

	/**
	 * Create a new instance of the friend selector
	 * @param options An object containing settings that are relevant to this particular instance
	 */
	newInstance = function(options) {
		// Public functions
		var showFriendSelector, hideFriendSelector, getselectedFriendIds, setDisabledFriendIds, filterFriends, reset,

		// Private variables
		instanceSettings, selectedFriendIds = [], disabledFriendIds = [], numFilteredFriends = 0,

		// Private functions
		bindEvents, unbindEvents, updatePaginationButtons, selectFriend;

		if (!settings) {
			log('Cannot create a new instance of TDFriendSelector because the plugin not initialised.');
			return false;
		}

		// Default settings
		instanceSettings = {
			maxSelection             : 4,
			friendsPerPage           : 10,
			friendHeight             : 64,
			autoDeselection          : false, // Allow the user to keep on selecting once they reach maxSelection, and just deselect the first selected friend
			callbackFriendSelected   : null,
			callbackFriendUnselected : null,
			callbackMaxSelection     : null,
			callbackSubmit           : null
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
			var i, len;
			log('TDFriendSelector - newInstance - showFriendSelector');
			if (!$friends) {
				return buildFriendSelector(showFriendSelector);
			} else {
				bindEvents();
				// Update classnames to represent the selections for this instance
				$friends.removeClass(settings.friendSelectedClass + ' ' + settings.friendDisabledClass + ' ' + settings.friendFilteredClass);
				for (i = 0, len = friends.length; i < len; i += 1) {
					if ($.inArray(friends[i].id, selectedFriendIds) !== -1) {
						$($friends[i]).addClass(settings.friendSelectedClass);
					}
					if ($.inArray(friends[i].id, disabledFriendIds) !== -1) {
						$($friends[i]).addClass(settings.friendDisabledClass);
					}
				}
				// Reset filtering
				numFilteredFriends = 0;
				$searchField.val("");
				// Update paging
				$friendsMask.height(instanceSettings.friendsPerPage * instanceSettings.friendHeight);
				$friendsContainer.css({top: 0});
				$selectedCount.html(selectedFriendIds.length);
				$selectedCountMax.html(instanceSettings.maxSelection);
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

		/**
		 * Hides friends whose names do not match the filter
		 */
		filterFriends = function(filter) {
			var i, len;
			numFilteredFriends = 0;
			$friends.removeClass(settings.friendFilteredClass);
			$friendsContainer.css({top: 0});
			if (filter.length > 2) {
				filter = filter.toUpperCase();
				for (i = 0, len = friends.length; i < len; i += 1) {
					if (friends[i].upperCaseName.indexOf(filter) === -1) {
						$($friends[i]).addClass(settings.friendFilteredClass);
						numFilteredFriends += 1;
					}
				}
			}
			updatePaginationButtons(1);
		};

		/**
		 * Remove selections, clear disabled list, go to page 1, etc
		 */
		reset = function() {
			if (!friends || friends.length === 0) {
				return;
			}
			selectedFriendIds = [];
			$selectedCount.html("");
			disabledFriendIds = [];
			numFilteredFriends = 0;
			$searchField.val("");
			$friendsContainer.css({top: 0});
			updatePaginationButtons(1);
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
				if (typeof instanceSettings.callbackSubmit === "function") { instanceSettings.callbackSubmit(selectedFriendIds); }
			});

			$friends.bind('click', function(e) {
				e.preventDefault();
				selectFriend($(this));
			});

			$searchField.bind('keyup', function(e) {
				filterFriends($(this).val());
			});

			$pagePrev.bind('click', function(e) {
				var pageNumber = parseInt($pageNumber.text(), 10) - 1;
				e.preventDefault();
				if (pageNumber < 1) { return; }
				$friendsContainer.css({top: - ((pageNumber - 1) * instanceSettings.friendsPerPage * instanceSettings.friendHeight)});
				updatePaginationButtons(pageNumber);
			});

			$pageNext.bind('click', function(e) {
				var pageNumber = parseInt($pageNumber.text(), 10) + 1, numPages = Math.ceil(friends.length / instanceSettings.friendsPerPage);
				e.preventDefault();
				if ($(this).hasClass(settings.disabledClass)) { return; }
				$friendsContainer.css({top: - ((pageNumber - 1) * instanceSettings.friendsPerPage * instanceSettings.friendHeight)});
				updatePaginationButtons(pageNumber);
			});
		};

		// Remove event listeners
		unbindEvents = function() {
			$buttonClose.unbind('click');
			$buttonOK.unbind('click');
			$friends.unbind('click');
			$searchField.unbind('keyup');
			$pagePrev.unbind('click');
			$pageNext.unbind('click');
		};

		updatePaginationButtons = function(pageNumber) {
			var numPages = Math.ceil((friends.length - numFilteredFriends) / instanceSettings.friendsPerPage);
			$pageNumber.html(pageNumber);
			$pageNumberTotal.html(numPages);
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
			var friendId, i, len, removedId;
			friendId = $friend.attr('data-id');

			// If the friend is disabled, ignore this
			if ($friend.hasClass(settings.friendDisabledClass)) {
				return;
			}

			if (!$friend.hasClass(settings.friendSelectedClass)) {
				// If autoDeselection is enabled and they have already selected the max number of friends, deselect the first friend
				if (instanceSettings.autoDeselection && selectedFriendIds.length === instanceSettings.maxSelection) {
					removedId = selectedFriendIds.splice(0, 1);
					$getFriendById(removedId).removeClass(settings.friendSelectedClass);
					$selectedCount.html(selectedFriendIds.length);
				}
				if (selectedFriendIds.length < instanceSettings.maxSelection) {
					// Add friend to selectedFriendIds
					if ($.inArray(friendId, selectedFriendIds) === -1) {
						selectedFriendIds.push(friendId);
						$friend.addClass(settings.friendSelectedClass);
						$selectedCount.html(selectedFriendIds.length);
						log('TDFriendSelector - newInstance - selectFriend - selected IDs: ', selectedFriendIds);
						if (typeof instanceSettings.callbackFriendSelected === "function") { instanceSettings.callbackFriendSelected(friendId); }
					} else {
						log('TDFriendSelector - newInstance - selectFriend - ID already stored');
					}
				}

			} else {
				// Remove friend from selectedFriendIds
				for (i = 0, len = selectedFriendIds.length; i < len; i += 1) {
					if (selectedFriendIds[i] === friendId) {
						selectedFriendIds.splice(i, 1);
						$friend.removeClass(settings.friendSelectedClass);
						$selectedCount.html(selectedFriendIds.length);
						if (typeof instanceSettings.callbackFriendUnselected === "function") { instanceSettings.callbackFriendUnselected(friendId); }
						return false;
					}
				}
			}

			if (selectedFriendIds.length === instanceSettings.maxSelection) {
				if (typeof instanceSettings.callbackMaxSelection === "function") { instanceSettings.callbackMaxSelection(); }
			}
		};

		// Return an object with access to the public members
		return {
			showFriendSelector          : showFriendSelector,
			hideFriendSelector          : hideFriendSelector,
			getselectedFriendIds        : getselectedFriendIds,
			setDisabledFriendIds        : setDisabledFriendIds,
			filterFriends               : filterFriends,
			reset                       : reset
		};
	};

	/////////////////////////////////////////
	// PRIVATE FUNCTIONS FOR GLOBAL PLUGIN
	/////////////////////////////////////////

	$getFriendById = function(id) {
		var i, len;
		for (i = 0, len = friends.length; i < len; i += 1) {
			if ('' + friends[i].id === '' + id) {
				return $($friends[i]);
			}
		}
		return $("");
	};

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
			return '<a href="#" class="TDFriendSelector_friend TDFriendSelector_clearfix" data-id="' + friend.id + '">' +
					'<img src="http://graph.facebook.com/' + friend.id + '/picture?type=square" width="50" height="50" alt="' + friend.name + '" class="TDFriendSelector_friendAvatar" />' +
					'<div class="TDFriendSelector_friendName">' + 
						'<span>' + friend.name + '</span>' +
						'<span class="TDFriendSelector_friendSelect">' + settings.textSelect + '</span>' +
					'</div>' +
				'</a>';
		};
	};

	sortFriends = function(friend1, friend2) {
		if (friend1.upperCaseName === friend2.upperCaseName) { return 0; }
		if (friend1.upperCaseName > friend2.upperCaseName) { return 1; }
		if (friend1.upperCaseName < friend2.upperCaseName) { return -1; }
	};

	log = function() {
		if (settings.debug && window.console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	};

	module = {
		init          : init,
		setFriends    : setFriends,
		getFriends    : getFriends,
		getFriendById : getFriendById,
		newInstance   : newInstance
	};
	return module;

}(TDFriendSelector || {}, jQuery));

