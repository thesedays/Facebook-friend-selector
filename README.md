Welcome to the These Days Facebook Friend Selector
=========================================

This is an interface component for websites and Facebook applications which allows your users to make a selection of one or more of their friends. The friends are returned as an array of Facebook IDs. It is similar to the `fb:multi-friend-selector` component by Facebook, except it can be used to select friends for anything, not just application requests.

![This is what it looks like.](http://playground.thesedays.com/tdfriendselector/screenshot-20110608.png)

## Viewing the example

You can view the example at [These Days Labs](http://playground.thesedays.com/tdfriendselector/), or you can check out this repository and run it yourself. You'll need to put the files on a web server - Facebook apps won't run off the local file system.

Just edit `example.js` and set your Facebook `appId`.

## Using the plugin

### Include required HTML

- Copy the `div` element with the ID `TDFriendSelector` (and all of its children) from `index.html`.
- There is some text in the HTML. This is where you can localise the plugin to the desired language.

### Include required CSS

- Include the `tdfriendselector.css` stylesheet in your document.
- Ensure `tdfriendselector.png` is located in the same directory as `tdfriendselector.css`
- We wrote the stylesheet with Sass and have included the SCSS source.

### Include required JavaScript

- Include jQuery in your document. We are considering making this plugin library independent, but currently jQuery is required.
- Include the Facebook [JavaScript SDK](http://developers.facebook.com/docs/reference/javascript/). (Technically, this step is optional. We have provided a `setFriends` function if you have loaded the friends on the serverside and want to avoid the JavaScript SDK.)
- Include `tdfriendselector.js`.
- Optional: We are using an HTML5 placeholder attribute on the search field. If you want the placeholder to work in older browsers, include a [placeholder polyfill](https://github.com/mathiasbynens/Placeholder-jQuery-Plugin).
- Note: we haven't minified the script for you but you might like to [minify it](http://refresh-sf.com/yui/) and concatenate it into a single file with your other plugins.

### The fun stuff (using the plugin)

1 - Make sure your user has authenticated your Facebook app.

2 - Initialise the plugin. Here you can set options like toggling debug messages, your preferred classnames, etc.

	TDFriendSelector.init({debug: true});

3 - Create an instance of the plugin. We allow multiple instances per page because sometimes you will need users to select friends for more than one thing. You can pass in options here which will only effect this instance, for example a callback to deal with the friends that are selected.

	selector1 = TDFriendSelector.newInstance({
		callbackSubmit: function(selectedFriendIds) {
			console.log("The following friends were selected: " + selectedFriendIds.join(", "));
		}
	});

4 - Display the plugin instance when you need it. The plugin will automatically load the Facebook friends of the logged in user (and they will be cached and reused across all instances on the page).

	$("#btnSelect1").click(function (e) {
		e.preventDefault();
		selector1.showFriendSelector();
	});

