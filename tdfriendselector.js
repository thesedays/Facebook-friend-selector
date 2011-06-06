/*globals $, jQuery, FB */
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

var FBFSelector = function(settings) { this.init(settings); };

FBFSelector.prototype.init = function(settings) {

	var defaults, fbfs;

	defaults = {
		containerSelector : '#fb_friends',
		buttonSelector    : '.social_box_chooseFriends',
		speed             : 500,
		amount            : 4,
		debug             : false,
		page              : 10,
		disabled          : 'disabled'
	};

	fbfs = this;
	$.extend(defaults, settings);
	$.extend(fbfs, defaults);

	fbfs.$container = $(defaults.containerSelector);
	fbfs.$button = $(defaults.buttonSelector);
	fbfs.$friendsContainer = fbfs.$container.find('.fb_friends_list ul');
	fbfs.$countContainer = fbfs.$container.find('.fb_friends_count');
	fbfs.$countTotalContainer = fbfs.$container.find('.fb_friends_total');

	fbfs.$pageContainer = fbfs.$container.find('.fb_friends_paging');
	fbfs.$pageCountContainer = fbfs.$pageContainer.find('.fb_friends_paging_count');
	fbfs.$pageCountTotalContainer = fbfs.$pageContainer.find('.fb_friends_paging_total');

	fbfs.$pagePrev = fbfs.$container.find('.fb_friends_prevPage');
	fbfs.$pageNext = fbfs.$container.find('.fb_friends_prevNext');

	fbfs.$searchContainer = fbfs.$container.find('.fb_friends_search_form');
	fbfs.$searchField = fbfs.$searchContainer.find('.text');
	fbfs.$searchList = fbfs.$container.find('.fb_search_list ul');

	fbfs.friends = [];
	fbfs.rel = '';
	fbfs.rels = {};

	$(fbfs.$container).height($(document).height());
	$(fbfs.$container).width($(document).width());

	if(FB) {
		fbfs.bindEvents();
	} else {
		fbfs.log('FBFSelector - Init - FB not initialised');
		return false;
	}
};

FBFSelector.prototype.bindEvents = function() {
	var fbfs = this;

	$(window).bind('resize', function() { fbfs.resize(); }).trigger('resize');

	fbfs.$button.bind('click', function(e) {
		e.preventDefault();
		fbfs.rel = $(this).attr('rel');

		if($(this).hasClass(fbfs.disabled)) { return false; }

		if(!fbfs.rels[fbfs.rel]) { fbfs.rels[fbfs.rel] = []; }

		// check if logged in
		// callback1 = logged in callback
		// callback2 = logged out callback
		fbfs.connect(function() {
			if(fbfs.friends.length <= 0) {

				// get friends with FB.api
				// callback when loading of friends is completed
				fbfs.getFriends(fbfs.show);
			} else {

				// if friends already stored, don't load again
				// show dialog
				fbfs.show(fbfs.friends);
			}

			fbfs.log('FBFSelector - bindEvents - logged in');

		}, function() {
			fbfs.log('FBFSelector - bindEvents - not logged in');
		});
	});

	fbfs.$container.find('.fb_friends_close, .fb_friends_ok').bind('click', function(e) {
		e.preventDefault();
		fbfs.rel = '';
		fbfs.hide(fbfs);
	});

	fbfs.$friendsContainer.find('a').live('click', function(e) {
		e.preventDefault();
		fbfs.selectFriend($(this));
	});

	fbfs.$pagePrev.bind('click', function(e) {
		e.preventDefault();

		var page = 1;
		page = parseInt(fbfs.$pageCountContainer.text(), 10);

		if(fbfs.$friendsContainer.find('.fb_friend_page:visible').prev().length > 0) {
			fbfs.$friendsContainer.find('.fb_friend_page:visible').hide().prev().show();
			fbfs.$pageCountContainer.html(page - 1);
		}
		if(page === 2) { $(this).addClass(fbfs.disabled); }
		fbfs.$pageNext.removeClass(fbfs.disabled);

	});
	fbfs.$pageNext.bind('click', function(e) {
		e.preventDefault();

		var page = 1;
		if(fbfs.$friendsContainer.find('.fb_friend_page:visible').next().length > 0) {
			fbfs.$friendsContainer.find('.fb_friend_page:visible').hide().next().show();
			page = parseInt(fbfs.$pageCountContainer.text(), 10);
			fbfs.$pageCountContainer.html(page + 1);
		}
		if(page === fbfs.$friendsContainer.find('.fb_friend_page').length - 1) { $(this).addClass(fbfs.disabled); }
		fbfs.$pagePrev.removeClass(fbfs.disabled);
	});

	//fbfs.$searchField.bind('keyup', function() { fbfs.search($(this).val()); });
};

FBFSelector.prototype.ban = function(banList) {
	var fbfs = this;
	if(typeof banList === 'object') { fbfs.rels['bans'] = banList.slice(); }
};

/*FBFSelector.prototype.search = function(value) {
	var text, fbfs;
	fbfs = this;

	fbfs.$searchList.html('');
	fbfs.$searchList.show();

	if(value) {
		fbfs.$friendsContainer.hide();
		fbfs.$friendsContainer.find('li').each(function() {
			text = $(this).find('.fb_friend_name span:first').text();
			if(text.indexOf(value) >= 0) {}
		});
	} else {
		fbfs.$friendsContainer.show();
		fbfs.$searchList.hide();
	}
};*/

FBFSelector.prototype.resize = function() {
	var fbfs = this;

	$(fbfs.$container).height($(window).height());
	$(fbfs.$container).width($(window).width());
};

FBFSelector.prototype.getSelectedFriends = function(rel) {
	var fbfs = this;

	if(rel) { return fbfs.rels[rel]; } else { return fbfs.rels; }
};

FBFSelector.prototype.removeFriend = function(rel, id, name, callback) {
	var fbfs, rels, relsLength, i;
	fbfs = this;

	rels = fbfs.rels[rel];
	if(rels) {
		relsLength = rels.length;

		for(i = 0; i < relsLength; i += 1) {
			if(rels[i] === id) {
				rels.splice(i, 1);
				if(typeof callback === 'function') { callback(); }
				return false;
			}
		}
	}
};

FBFSelector.prototype.selectFriend = function(a) {
	var fbfs, link, $container, rel, id, i, name, rels, relsLength, store, count;

	fbfs = this;
	link = a;
	$container = link.parents('.fb_friend');
	rel = $container.attr('data-rel');
	id = $container.attr('data-id');
	name = $container.find('.fb_friend_name span:first').text();

	if(!fbfs.rels[rel]) { fbfs.rels[rel] = []; }

	rels = fbfs.rels[rel];
	relsLength = rels.length;

	if(!$container.hasClass('stored')) {
		store = true;

		if(relsLength < fbfs.amount) {
			for(i = 0; i < relsLength; i += 1) {
				if(rels[i] === id) { store = false; }
			}

			if(store) {
				rels.push(id);
				$container.addClass('stored');
				fbfs.$countContainer.html(rels.length);
				fbfs.log('FBFSelector - selectFriend - selected IDs: ', rels);
				fbfs.$container.trigger('FBFSfriendSelected', [rel, id, name]);
				if(relsLength + 1 === fbfs.amount) { fbfs.$container.trigger('FBFSAmountReached', [rel]); }
			} else {
				fbfs.log('FBFSelector - selectFriend - ID allready stored');
			}

		}

	} else {

		for(i = 0; i < relsLength; i += 1) {
			if(rels[i] === id) {
				rels.splice(i, 1);
				$container.removeClass('stored');
				fbfs.$countContainer.html(rels.length);
				fbfs.$container.trigger('FBFSfriendUnSelected', [rel, id, name]);
				return false;
			}
		}
	}

	if(relsLength === fbfs.amount) { fbfs.$container.trigger('FBFSAmountReached', [rel]); }
};

FBFSelector.prototype.getFriends = function(callback) {
	var friends, fbfs;

	fbfs = this;
	friends = [];

	if(fbfs.friends.length <= 0) {
		FB.api('/me/friends?fields=id,name', function(response) {
			if(response.data) {
				friends = response.data.slice();

				friends = friends.sort(fbfs.sortFriends);

				if(typeof callback === 'function') { callback(friends, fbfs); }
			}
		});
	} else {
		friends = fbfs.friends;
		friends = friends.sort(fbfs.sortFriends);
		if(typeof callback === 'function') { callback(friends, fbfs); }
	}
};

FBFSelector.prototype.sortFriends = function(friend1, friend2) {
	if(friend1.name === friend2.name) { return 0; }
	if(friend1.name > friend2.name) { return 1; }
	if(friend1.name < friend2.name) { return -1; }
};

FBFSelector.prototype.buildFriend = function(friend) {
	var f_id, f_avatar, f_name, f_link, f_html, f_rel, fbfs, sclass, ids, idsLength, i, stored, rel;

	fbfs = this;
	f_rel = fbfs.rel;
	f_id = friend.id;
	f_name = friend.name;
	f_avatar = 'http://graph.facebook.com/' + f_id + '/picture?type=square';

	stored = false;
	ids = fbfs.rels[f_rel];
	idsLength = ids.length;

	sclass = '';

	for(rel in fbfs.rels) {
		ids = fbfs.rels[rel];
		idsLength = ids.length;

		for(i = 0; i < idsLength; i += 1) {
			if('' + f_id === '' + ids[i]) {
				stored = true;
				sclass += ' stored';

				if(f_rel !== rel) { sclass += ' prestored'; }
				if(rel === 'bans') { sclass += ' invited'; }
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

FBFSelector.prototype.show = function(friendList, o){
	var friends, friendsLength, i, wrapper, friend, friend_html, fbfs, pageLength, j, friendID, rel;

	fbfs = o || this;

	friends = friendList.slice();
	friendsLength = friends.length;

	pageLength = Math.ceil(friendsLength / fbfs.page);

	wrapper = document.createDocumentFragment();
	wrapper.innerHTML = '';

	fbfs.log('FBFSelector - show - fbf: ', fbfs);
	fbfs.log('FBFSelector - show - friends: ', friends);

	for(j = 0; j < pageLength; j += 1) {

		wrapper.innerHTML += '<li class="fb_friend_page" rel="' + j + '"><ul>';

		for(i = 0; i < fbfs.page; i += 1) {
			friendID = (j * fbfs.page) + i;

			if(friendID < friendsLength) {

				//fbfs.log('FBFSelector - show - friendID: ', friendID);
				//fbfs.log('FBFSelector - show - Page: ', j);
				//fbfs.log('FBFSelector - show - FriendOnPage: ', i);

				friend = friends[friendID];
				friend_html = fbfs.buildFriend(friend);
				wrapper.innerHTML += friend_html;

				//fbfs.log('FBFSelector - show - friend: ', friend);
				//fbfs.log('FBFSelector - show - friend_html: ', friend_html);
			}
		}

		wrapper.innerHTML += '</ul></li>';
	}

	fbfs.$friendsContainer.html(wrapper.innerHTML);

	rel = fbfs.$container.find('.fb_friend').attr('data-rel');

	//fbfs.$countContainer.html(fbfs.$container.find('.stored').length);
	if(pageLength > 1) {
		fbfs.$pageContainer.show();
	} else {
		fbfs.$pageContainer.hide();
	}

	//fbfs.$pageCountContainer.html(pageLength);
	fbfs.$countContainer.html(fbfs.rels[rel].length);
	fbfs.$countTotalContainer.html(fbfs.amount);

	fbfs.$pageCountTotalContainer.html(pageLength);
	fbfs.$friendsContainer.find('.fb_friend_page:gt(0)').hide();

	fbfs.$container.fadeIn(500);
};
FBFSelector.prototype.hide = function(fbfs){ fbfs.$container.fadeOut(500); };

FBFSelector.prototype.connect = function(callbackLoggedIn, callbackLoggedOut) {
	var fbfs = this;

	FB.getLoginStatus(function(response) {
		if(response.session) {
			fbfs.log('FBFSelector - logged in');
			if(typeof callbackLoggedIn === 'function') { callbackLoggedIn(); }
		} else {
			fbfs.log('FBFSelector - not logged in');
			if(typeof callbackLoggedOut === 'function') { callbackLoggedOut(); }
		}
	});
};

FBFSelector.prototype.log = function() {
	var fbfs = this;
	if (fbfs.debug && window.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

