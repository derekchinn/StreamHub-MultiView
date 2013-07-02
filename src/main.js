define(function(require){
	/**
	 * Dependencies
	 */
	var Backbone = require("backbone");
	
	var MultiView = Backbone.View.extend(
    /**
     * @lends MultiView.prototype
     */
	{
		className: "StreamHub-MultiView",
		/**
		 * @classdesc A view that allows you to display other views where visibility is
		 * controlled by an external navigation/control group
		 * @constructs
		 * @augments Backbone.View
		 * @requires BackboneJS
		 * @requires JQuery
		 * 
		 * @param {Object} opts The options to pass when initializing the MultiView in
		 * addition to the standard Backbone options.
		 * @param {Object} opts.cssClasses CSS classes to apply
		 * @param {String} opts.cssClasses.hide The class that will be applied in order
		 * to hide/unhide views. By default it is "fyre-media-wall-hide".
		 * @param {DomElement} opts.el Target DOM element that the view will be displayed in
		 * @param {Boolean} opts.loggingOn Whether or not to show logging statements in
		 * the console
		 * @param {DomElement[]} opts.nav An array of navigation/control DOM elements that click
		 * event handlers should be bound to.
		 * @param {ViewConfigs[]} opts.viewConfigs An array of view and bind option pairings
		 * @param {Object} opts.viewConfigs.bindOpts Binding options that will be used to bind
		 * a collection to a view
		 * @param {Object} opts.viewConfigs.view The associated view for how the collection
		 * will be displayed.
		 * @param {Boolean} opts.viewConfigs.load A flag to denote which view to load up on
		 * initial render. Only one item should be set to true. If multiple items are set to
		 * true, it will only render the first item it encounters with "load" set as true.
		 * 
		 * @example
		 * new MultiView({
		 *   el: document.getElementById("target-element"),
		 *   loggingOn: true,
		 *   nav: document.getElementsByClassName("navigation-tabs"),
		 *   viewConfigs: viewConfigs
		 * });
		 */
		initialize: function (opts) {
			// reference to the active view
			this._activeView = null;
			// the CSS class to apply for hiding/showing targeting purposes
			this._cssClasses = opts.cssClasses || {"activeTab": "fyre-media-wall-active",
												   "hide": "fyre-media-wall-hide"};
			// array of DOM elements that we can add event listeners to
			this._nav = opts.nav || [];
			// bool that allows you to turn on/off logging
			this._loggingOn = opts.loggingOn || false;
			// DOM element to render the view to
			this.el = opts.el;
			/* 
			 * array of view/binding opts pairings
			 * e.g. [{ bindOpts: opts, view: view, load: true/false} ]
			 */
			this.viewConfigs = opts.viewConfigs || [];
			
			if (this._nav) {
				this._addNavigationEventHandlers();
			}
			
			this.render();
		},
		render: function () {
			var haveAlreadyLoaded = false;
			var len = this.viewConfigs.length;
			for (var i = 0; i < len; i++) {
				/*
				 * blindly add the class, and later, we'll remove it if it's
				 * supposed to be the active view.
				 */
				this.viewConfigs[i].view.el.setAttribute("class", this._cssClasses.hide);
				this.el.appendChild(this.viewConfigs[i].view.el);
				
				if (this.viewConfigs[i].load && !haveAlreadyLoaded) {
					haveAlreadyLoaded = true;
					this.viewConfigs[i].view.el.removeAttribute("class");
					this._bindCollectionToView(this.viewConfigs[i]);
					this._toggleActiveTab(this.viewConfigs[i].bindOpts.articleId, true);
				}
			}
			return this;
		},
		tagName: "div"
	});
	
	/**
	 * Binding a conversation to a view (by calling collection.setRemote)
	 * and then stores it in the in the _activeView.
	 * 
	 * @memberof MultiView.prototype
	 * @private
	 * 
	 * @param {Object} viewConfig This is a configuration object you would
	 * normally pass in when binding a view to a collection
	 * @example
	 * {
	 *   sdk: sdk,
	 *   siteId: siteId,
	 *   articleId: articleId,
	 * }
	 */
	MultiView.prototype._bindCollectionToView = function(viewConfig) {
		viewConfig.view.collection.setRemote(viewConfig.bindOpts);
		this._activeView = viewConfig;
	};
	
	/**
	 * Adds the "click" event handler to all the navigation/control
	 * items that will trigger the swapping between views.
	 * 
	 * It expects that the control elements are provided in an
	 * array.
	 * 
	 * @memberof MultiView.prototype
	 * @private
	 */
	MultiView.prototype._addNavigationEventHandlers = function() {
		var len = this._nav.length;
		for (var i = 0; i < len; i++) {
			$(this._nav[i]).on("click", this, this._swapView);
		}
	};
	
	/**
	 * 
	 * @memberof MultiView.prototype
	 * @private
	 * 
	 * @param {Object} e This is an event object that get passed when
	 * the method is called. to get the MultiView context, you have to
	 * get it from the data attribute from the event "e".
	 * @returns {Object | null} Returns the ModelView that was swapped to
	 * otherwise, null if it can't switch for the two "fail" cases.
	 */
	MultiView.prototype._swapView = function(e) {
		var self = e.data;
		/*
		 * "this" refers to the element that was clicked. As part of the
		 * pre-req, there has to be an article id on the element so that we
		 * can search for it and know what we're trying to switch to when
		 * it's clicked on.
		 */
		var articleId = this.getAttribute("data-articleId");
		
		if (articleId == self._activeView.bindOpts.articleId) {
			self._log("Trying to swap to the same view, ignoring.");
			return;
		}
		
		var viewToSwap = self._getViewByArticleId.call(self, articleId);
		
		if (!viewToSwap) {
			self._log("Couldn't find the view you're looking for. Check the articleId on the nav items.", "error");
			return;
		}
		
		self._log("Shutting down streaming for " + self._activeView.bindOpts.articleId);
		self._activeView.view.collection.stop();
		$(self._activeView.view.el).toggleClass(self._cssClasses.hide);
		self._log("Starting streaming for " + articleId);
		/*
		 *  If _sdkCollection is present, means the view's already been bound,
		 *  so we can just start it back up. Otherwise, we have to bind it.
		 */
		if (viewToSwap.view.collection._sdkCollection) {
			viewToSwap.view.collection.start();
			self._activeView = viewToSwap;
		}
		else {
			self._bindCollectionToView(viewToSwap);
		}
		$(self._activeView.view.el).toggleClass(self._cssClasses.hide);
		self._toggleActiveTab.call(self, articleId);
		
		return self;
	};
	
	/**
	 * Attempts to find the view given an article Id.
	 * 
	 * @memberof MultiView.prototype
	 * @private
	 * 
	 * @param {String} articleId The article id associated with 
	 * the view you're looking for
	 * @returns {View | null} Returns the view if found, otherwise
	 * it'll return null.
	 */
	MultiView.prototype._getViewByArticleId = function (articleId) {
		var len = this.viewConfigs.length;
		for (var i = 0; i < len; i++) {
			if (articleId == this.viewConfigs[i].bindOpts.articleId) {
				return this.viewConfigs[i];
			}
		}
		return null;
	};
	
	/**
	 * Generic logging function.
	 *
	 * @memberof MultiView.prototype
	 * @private
	 * 
	 * @param {String} msg The message you want to be logged to
	 * the console
	 * @param {String} lvl The level at which you want the message
	 * to be logged at. Options are "warn" for warning, "error", for
	 * errors, or "" (empty) for debugging.
	 * 
	 * @todo Handle the case where no console is defined so JS doesn't
	 * error out if logging is turned on.
	 * @todo Make constants so you don't have to pass strings around
	 * all the time for the warning level.
	 */
	MultiView.prototype._log = function (msg, lvl) {
		if (!this._loggingOn) {
			return;
		}
		
		if (lvl == "warn") {
			console.warn(msg);
		}
		else if (lvl == "error") {
			console.error(msg);
		}
		else {
			console.debug(msg);
		}
	};
	
	/**
	 * Toggles the "active" CSS class on the navigational
	 * elements so that they can be targeted come time to
	 * style.
	 * 
	 * If you pass true as activateOnly, this function will
	 * loop through all the navigation elements looking to only
	 * mark an the nav element as "active" and then return once it's
	 * done. Otherwise, it'll continue to loop through all elements,
	 * looking to remove the previously "active" nav element.
	 * 
	 * If you don't like the CSS class applied, you can pass in the
	 * prefered class name in the opts.cssClass option.
	 * 
	 * @param {String} activeTab This is the article id for the tab that will
	 * be activated.
	 * @param {Boolean} activateOnly A boolean flag to trigger activation only
	 */
	MultiView.prototype._toggleActiveTab = function (activeTab, activateOnly) {
		var len = this._nav.length;
		for (var i = 0; i < len;  i++) {
			if (activeTab == this._nav[i].getAttribute("data-articleId")) {
				$(this._nav[i]).toggleClass(this._cssClasses.activeTab);
				if (activateOnly) {
					return;
				}
			}
			else if (!activateOnly && activeTab == this._activeView.bindOpts.articleId) {
				$(this._nav[i]).toggleClass(this._cssClasses.activeTab);
			}
		}
	};
	
	return MultiView;
});