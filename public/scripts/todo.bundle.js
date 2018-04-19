webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var angular = __webpack_require__(1);
	var uiRouter = __webpack_require__(3);

	angular.module('spreadyApp', [uiRouter])
	  .config(function($stateProvider, $locationProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
	    $urlRouterProvider.when('/', '/me');    

	    $stateProvider.state('me', {
	      name: 'me',
	      url: '/me',
	      templateUrl: './../templates/me.html'
	    }).state('profile', {
	      name: 'profile',      
	      url: '/profile/{id}',
	      controller: 'profileCtrl',
	      templateUrl: './../templates/profile.html',
	      resolve: {
	       profile: function($stateParams, uiRouterService) {
	        console.log('Running resolve function');
	        console.log('Profile is ' + $stateParams.id);
	        return uiRouterService.getProfile($stateParams.id).then(function(res) {
	          console.log('Result should follow', res);
	          return res.data;
	        });
	       }
	      }
	    });

		// use the HTML5 History API
	    $locationProvider.html5Mode(true);

	  });

	__webpack_require__(4);
	__webpack_require__(7);
	__webpack_require__(11);



	console.log('App.js has been properly loaded')


/***/ }),
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports) {

	/**
	 * State-based routing for AngularJS
	 * @version v0.4.3
	 * @link http://angular-ui.github.com/
	 * @license MIT License, http://www.opensource.org/licenses/MIT
	 */

	/* commonjs package manager support (eg componentjs) */
	if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
	  module.exports = 'ui.router';
	}

	(function (window, angular, undefined) {
	/*jshint globalstrict:true*/
	/*global angular:false*/
	'use strict';

	var isDefined = angular.isDefined,
	    isFunction = angular.isFunction,
	    isString = angular.isString,
	    isObject = angular.isObject,
	    isArray = angular.isArray,
	    forEach = angular.forEach,
	    extend = angular.extend,
	    copy = angular.copy,
	    toJson = angular.toJson;

	function inherit(parent, extra) {
	  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
	}

	function merge(dst) {
	  forEach(arguments, function(obj) {
	    if (obj !== dst) {
	      forEach(obj, function(value, key) {
	        if (!dst.hasOwnProperty(key)) dst[key] = value;
	      });
	    }
	  });
	  return dst;
	}

	/**
	 * Finds the common ancestor path between two states.
	 *
	 * @param {Object} first The first state.
	 * @param {Object} second The second state.
	 * @return {Array} Returns an array of state names in descending order, not including the root.
	 */
	function ancestors(first, second) {
	  var path = [];

	  for (var n in first.path) {
	    if (first.path[n] !== second.path[n]) break;
	    path.push(first.path[n]);
	  }
	  return path;
	}

	/**
	 * IE8-safe wrapper for `Object.keys()`.
	 *
	 * @param {Object} object A JavaScript object.
	 * @return {Array} Returns the keys of the object as an array.
	 */
	function objectKeys(object) {
	  if (Object.keys) {
	    return Object.keys(object);
	  }
	  var result = [];

	  forEach(object, function(val, key) {
	    result.push(key);
	  });
	  return result;
	}

	/**
	 * IE8-safe wrapper for `Array.prototype.indexOf()`.
	 *
	 * @param {Array} array A JavaScript array.
	 * @param {*} value A value to search the array for.
	 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
	 */
	function indexOf(array, value) {
	  if (Array.prototype.indexOf) {
	    return array.indexOf(value, Number(arguments[2]) || 0);
	  }
	  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
	  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

	  if (from < 0) from += len;

	  for (; from < len; from++) {
	    if (from in array && array[from] === value) return from;
	  }
	  return -1;
	}

	/**
	 * Merges a set of parameters with all parameters inherited between the common parents of the
	 * current state and a given destination state.
	 *
	 * @param {Object} currentParams The value of the current state parameters ($stateParams).
	 * @param {Object} newParams The set of parameters which will be composited with inherited params.
	 * @param {Object} $current Internal definition of object representing the current state.
	 * @param {Object} $to Internal definition of object representing state to transition to.
	 */
	function inheritParams(currentParams, newParams, $current, $to) {
	  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

	  for (var i in parents) {
	    if (!parents[i] || !parents[i].params) continue;
	    parentParams = objectKeys(parents[i].params);
	    if (!parentParams.length) continue;

	    for (var j in parentParams) {
	      if (indexOf(inheritList, parentParams[j]) >= 0) continue;
	      inheritList.push(parentParams[j]);
	      inherited[parentParams[j]] = currentParams[parentParams[j]];
	    }
	  }
	  return extend({}, inherited, newParams);
	}

	/**
	 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
	 *
	 * @param {Object} a The first object.
	 * @param {Object} b The second object.
	 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
	 *                     it defaults to the list of keys in `a`.
	 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
	 */
	function equalForKeys(a, b, keys) {
	  if (!keys) {
	    keys = [];
	    for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
	  }

	  for (var i=0; i<keys.length; i++) {
	    var k = keys[i];
	    if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
	  }
	  return true;
	}

	/**
	 * Returns the subset of an object, based on a list of keys.
	 *
	 * @param {Array} keys
	 * @param {Object} values
	 * @return {Boolean} Returns a subset of `values`.
	 */
	function filterByKeys(keys, values) {
	  var filtered = {};

	  forEach(keys, function (name) {
	    filtered[name] = values[name];
	  });
	  return filtered;
	}

	// like _.indexBy
	// when you know that your index values will be unique, or you want last-one-in to win
	function indexBy(array, propName) {
	  var result = {};
	  forEach(array, function(item) {
	    result[item[propName]] = item;
	  });
	  return result;
	}

	// extracted from underscore.js
	// Return a copy of the object only containing the whitelisted properties.
	function pick(obj) {
	  var copy = {};
	  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	  forEach(keys, function(key) {
	    if (key in obj) copy[key] = obj[key];
	  });
	  return copy;
	}

	// extracted from underscore.js
	// Return a copy of the object omitting the blacklisted properties.
	function omit(obj) {
	  var copy = {};
	  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	  for (var key in obj) {
	    if (indexOf(keys, key) == -1) copy[key] = obj[key];
	  }
	  return copy;
	}

	function pluck(collection, key) {
	  var result = isArray(collection) ? [] : {};

	  forEach(collection, function(val, i) {
	    result[i] = isFunction(key) ? key(val) : val[key];
	  });
	  return result;
	}

	function filter(collection, callback) {
	  var array = isArray(collection);
	  var result = array ? [] : {};
	  forEach(collection, function(val, i) {
	    if (callback(val, i)) {
	      result[array ? result.length : i] = val;
	    }
	  });
	  return result;
	}

	function map(collection, callback) {
	  var result = isArray(collection) ? [] : {};

	  forEach(collection, function(val, i) {
	    result[i] = callback(val, i);
	  });
	  return result;
	}

	// issue #2676 #2889
	function silenceUncaughtInPromise (promise) {
	  return promise.then(undefined, function() {}) && promise;
	}

	/**
	 * @ngdoc overview
	 * @name ui.router.util
	 *
	 * @description
	 * # ui.router.util sub-module
	 *
	 * This module is a dependency of other sub-modules. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 *
	 */
	angular.module('ui.router.util', ['ng']);

	/**
	 * @ngdoc overview
	 * @name ui.router.router
	 * 
	 * @requires ui.router.util
	 *
	 * @description
	 * # ui.router.router sub-module
	 *
	 * This module is a dependency of other sub-modules. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 */
	angular.module('ui.router.router', ['ui.router.util']);

	/**
	 * @ngdoc overview
	 * @name ui.router.state
	 * 
	 * @requires ui.router.router
	 * @requires ui.router.util
	 *
	 * @description
	 * # ui.router.state sub-module
	 *
	 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
	 * in your angular app (use {@link ui.router} module instead).
	 * 
	 */
	angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);

	/**
	 * @ngdoc overview
	 * @name ui.router
	 *
	 * @requires ui.router.state
	 *
	 * @description
	 * # ui.router
	 * 
	 * ## The main module for ui.router 
	 * There are several sub-modules included with the ui.router module, however only this module is needed
	 * as a dependency within your angular app. The other modules are for organization purposes. 
	 *
	 * The modules are:
	 * * ui.router - the main "umbrella" module
	 * * ui.router.router - 
	 * 
	 * *You'll need to include **only** this module as the dependency within your angular app.*
	 * 
	 * <pre>
	 * <!doctype html>
	 * <html ng-app="myApp">
	 * <head>
	 *   <script src="js/angular.js"></script>
	 *   <!-- Include the ui-router script -->
	 *   <script src="js/angular-ui-router.min.js"></script>
	 *   <script>
	 *     // ...and add 'ui.router' as a dependency
	 *     var myApp = angular.module('myApp', ['ui.router']);
	 *   </script>
	 * </head>
	 * <body>
	 * </body>
	 * </html>
	 * </pre>
	 */
	angular.module('ui.router', ['ui.router.state']);

	angular.module('ui.router.compat', ['ui.router']);

	/**
	 * @ngdoc object
	 * @name ui.router.util.$resolve
	 *
	 * @requires $q
	 * @requires $injector
	 *
	 * @description
	 * Manages resolution of (acyclic) graphs of promises.
	 */
	$Resolve.$inject = ['$q', '$injector'];
	function $Resolve(  $q,    $injector) {
	  
	  var VISIT_IN_PROGRESS = 1,
	      VISIT_DONE = 2,
	      NOTHING = {},
	      NO_DEPENDENCIES = [],
	      NO_LOCALS = NOTHING,
	      NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });
	  

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$resolve#study
	   * @methodOf ui.router.util.$resolve
	   *
	   * @description
	   * Studies a set of invocables that are likely to be used multiple times.
	   * <pre>
	   * $resolve.study(invocables)(locals, parent, self)
	   * </pre>
	   * is equivalent to
	   * <pre>
	   * $resolve.resolve(invocables, locals, parent, self)
	   * </pre>
	   * but the former is more efficient (in fact `resolve` just calls `study` 
	   * internally).
	   *
	   * @param {object} invocables Invocable objects
	   * @return {function} a function to pass in locals, parent and self
	   */
	  this.study = function (invocables) {
	    if (!isObject(invocables)) throw new Error("'invocables' must be an object");
	    var invocableKeys = objectKeys(invocables || {});
	    
	    // Perform a topological sort of invocables to build an ordered plan
	    var plan = [], cycle = [], visited = {};
	    function visit(value, key) {
	      if (visited[key] === VISIT_DONE) return;
	      
	      cycle.push(key);
	      if (visited[key] === VISIT_IN_PROGRESS) {
	        cycle.splice(0, indexOf(cycle, key));
	        throw new Error("Cyclic dependency: " + cycle.join(" -> "));
	      }
	      visited[key] = VISIT_IN_PROGRESS;
	      
	      if (isString(value)) {
	        plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
	      } else {
	        var params = $injector.annotate(value);
	        forEach(params, function (param) {
	          if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
	        });
	        plan.push(key, value, params);
	      }
	      
	      cycle.pop();
	      visited[key] = VISIT_DONE;
	    }
	    forEach(invocables, visit);
	    invocables = cycle = visited = null; // plan is all that's required
	    
	    function isResolve(value) {
	      return isObject(value) && value.then && value.$$promises;
	    }
	    
	    return function (locals, parent, self) {
	      if (isResolve(locals) && self === undefined) {
	        self = parent; parent = locals; locals = null;
	      }
	      if (!locals) locals = NO_LOCALS;
	      else if (!isObject(locals)) {
	        throw new Error("'locals' must be an object");
	      }       
	      if (!parent) parent = NO_PARENT;
	      else if (!isResolve(parent)) {
	        throw new Error("'parent' must be a promise returned by $resolve.resolve()");
	      }
	      
	      // To complete the overall resolution, we have to wait for the parent
	      // promise and for the promise for each invokable in our plan.
	      var resolution = $q.defer(),
	          result = silenceUncaughtInPromise(resolution.promise),
	          promises = result.$$promises = {},
	          values = extend({}, locals),
	          wait = 1 + plan.length/3,
	          merged = false;

	      silenceUncaughtInPromise(result);
	          
	      function done() {
	        // Merge parent values we haven't got yet and publish our own $$values
	        if (!--wait) {
	          if (!merged) merge(values, parent.$$values); 
	          result.$$values = values;
	          result.$$promises = result.$$promises || true; // keep for isResolve()
	          delete result.$$inheritedValues;
	          resolution.resolve(values);
	        }
	      }
	      
	      function fail(reason) {
	        result.$$failure = reason;
	        resolution.reject(reason);
	      }

	      // Short-circuit if parent has already failed
	      if (isDefined(parent.$$failure)) {
	        fail(parent.$$failure);
	        return result;
	      }
	      
	      if (parent.$$inheritedValues) {
	        merge(values, omit(parent.$$inheritedValues, invocableKeys));
	      }

	      // Merge parent values if the parent has already resolved, or merge
	      // parent promises and wait if the parent resolve is still in progress.
	      extend(promises, parent.$$promises);
	      if (parent.$$values) {
	        merged = merge(values, omit(parent.$$values, invocableKeys));
	        result.$$inheritedValues = omit(parent.$$values, invocableKeys);
	        done();
	      } else {
	        if (parent.$$inheritedValues) {
	          result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
	        }        
	        parent.then(done, fail);
	      }
	      
	      // Process each invocable in the plan, but ignore any where a local of the same name exists.
	      for (var i=0, ii=plan.length; i<ii; i+=3) {
	        if (locals.hasOwnProperty(plan[i])) done();
	        else invoke(plan[i], plan[i+1], plan[i+2]);
	      }
	      
	      function invoke(key, invocable, params) {
	        // Create a deferred for this invocation. Failures will propagate to the resolution as well.
	        var invocation = $q.defer(), waitParams = 0;
	        function onfailure(reason) {
	          invocation.reject(reason);
	          fail(reason);
	        }
	        // Wait for any parameter that we have a promise for (either from parent or from this
	        // resolve; in that case study() will have made sure it's ordered before us in the plan).
	        forEach(params, function (dep) {
	          if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
	            waitParams++;
	            promises[dep].then(function (result) {
	              values[dep] = result;
	              if (!(--waitParams)) proceed();
	            }, onfailure);
	          }
	        });
	        if (!waitParams) proceed();
	        function proceed() {
	          if (isDefined(result.$$failure)) return;
	          try {
	            invocation.resolve($injector.invoke(invocable, self, values));
	            invocation.promise.then(function (result) {
	              values[key] = result;
	              done();
	            }, onfailure);
	          } catch (e) {
	            onfailure(e);
	          }
	        }
	        // Publish promise synchronously; invocations further down in the plan may depend on it.
	        promises[key] = silenceUncaughtInPromise(invocation.promise);
	      }
	      
	      return result;
	    };
	  };
	  
	  /**
	   * @ngdoc function
	   * @name ui.router.util.$resolve#resolve
	   * @methodOf ui.router.util.$resolve
	   *
	   * @description
	   * Resolves a set of invocables. An invocable is a function to be invoked via 
	   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
	   * An invocable can either return a value directly,
	   * or a `$q` promise. If a promise is returned it will be resolved and the 
	   * resulting value will be used instead. Dependencies of invocables are resolved 
	   * (in this order of precedence)
	   *
	   * - from the specified `locals`
	   * - from another invocable that is part of this `$resolve` call
	   * - from an invocable that is inherited from a `parent` call to `$resolve` 
	   *   (or recursively
	   * - from any ancestor `$resolve` of that parent).
	   *
	   * The return value of `$resolve` is a promise for an object that contains 
	   * (in this order of precedence)
	   *
	   * - any `locals` (if specified)
	   * - the resolved return values of all injectables
	   * - any values inherited from a `parent` call to `$resolve` (if specified)
	   *
	   * The promise will resolve after the `parent` promise (if any) and all promises 
	   * returned by injectables have been resolved. If any invocable 
	   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
	   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
	   * same error. A rejection of a `parent` promise (if specified) will likewise be 
	   * propagated immediately. Once the `$resolve` promise has been rejected, no 
	   * further invocables will be called.
	   * 
	   * Cyclic dependencies between invocables are not permitted and will cause `$resolve`
	   * to throw an error. As a special case, an injectable can depend on a parameter 
	   * with the same name as the injectable, which will be fulfilled from the `parent` 
	   * injectable of the same name. This allows inherited values to be decorated. 
	   * Note that in this case any other injectable in the same `$resolve` with the same
	   * dependency would see the decorated value, not the inherited value.
	   *
	   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
	   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
	   * exception.
	   *
	   * Invocables are invoked eagerly as soon as all dependencies are available. 
	   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
	   *
	   * As a special case, an invocable can be a string, in which case it is taken to 
	   * be a service name to be passed to `$injector.get()`. This is supported primarily 
	   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
	   * routes.
	   *
	   * @param {object} invocables functions to invoke or 
	   * `$injector` services to fetch.
	   * @param {object} locals  values to make available to the injectables
	   * @param {object} parent  a promise returned by another call to `$resolve`.
	   * @param {object} self  the `this` for the invoked methods
	   * @return {object} Promise for an object that contains the resolved return value
	   * of all invocables, as well as any inherited and local values.
	   */
	  this.resolve = function (invocables, locals, parent, self) {
	    return this.study(invocables)(locals, parent, self);
	  };
	}

	angular.module('ui.router.util').service('$resolve', $Resolve);



	/**
	 * @ngdoc object
	 * @name ui.router.util.$templateFactoryProvider
	 *
	 * @description
	 * Provider for $templateFactory. Manages which template-loading mechanism to
	 * use, and will default to the most recent one ($templateRequest on Angular
	 * versions starting from 1.3, $http otherwise).
	 */
	function TemplateFactoryProvider() {
	  var shouldUnsafelyUseHttp = angular.version.minor < 3;

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactoryProvider#shouldUnsafelyUseHttp
	   * @methodOf ui.router.util.$templateFactoryProvider
	   *
	   * @description
	   * Forces $templateFactory to use $http instead of $templateRequest. This
	   * might cause XSS, as $http doesn't enforce the regular security checks for
	   * templates that have been introduced in Angular 1.3. Note that setting this
	   * to false on Angular older than 1.3.x will crash, as the $templateRequest
	   * service (and the security checks) are not implemented on these versions.
	   *
	   * See the $sce documentation, section
	   * <a href="https://docs.angularjs.org/api/ng/service/$sce#impact-on-loading-templates">
	   * Impact on loading templates</a> for more details about this mechanism.
	   *
	   * @param {boolean} value
	   */
	  this.shouldUnsafelyUseHttp = function(value) {
	    shouldUnsafelyUseHttp = !!value;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.util.$templateFactory
	   *
	   * @requires $http
	   * @requires $templateCache
	   * @requires $injector
	   *
	   * @description
	   * Service. Manages loading of templates.
	   */
	  this.$get = ['$http', '$templateCache', '$injector', function($http, $templateCache, $injector){
	    return new TemplateFactory($http, $templateCache, $injector, shouldUnsafelyUseHttp);}];
	}


	/**
	 * @ngdoc object
	 * @name ui.router.util.$templateFactory
	 *
	 * @requires $http
	 * @requires $templateCache
	 * @requires $injector
	 *
	 * @description
	 * Service. Manages loading of templates.
	 */
	function TemplateFactory($http, $templateCache, $injector, shouldUnsafelyUseHttp) {

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromConfig
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template from a configuration object. 
	   *
	   * @param {object} config Configuration object for which to load a template. 
	   * The following properties are search in the specified order, and the first one 
	   * that is defined is used to create the template:
	   *
	   * @param {string|object} config.template html string template or function to 
	   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
	   * @param {string|object} config.templateUrl url to load or a function returning 
	   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
	   * @param {Function} config.templateProvider function to invoke via 
	   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
	   * @param {object} params  Parameters to pass to the template function.
	   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
	   * via a `templateProvider`. Defaults to `{ params: params }`.
	   *
	   * @return {string|object}  The template html as a string, or a promise for 
	   * that string,or `null` if no template is configured.
	   */
	  this.fromConfig = function (config, params, locals) {
	    return (
	      isDefined(config.template) ? this.fromString(config.template, params) :
	      isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
	      isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
	      null
	    );
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromString
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template from a string or a function returning a string.
	   *
	   * @param {string|object} template html template as a string or function that 
	   * returns an html template as a string.
	   * @param {object} params Parameters to pass to the template function.
	   *
	   * @return {string|object} The template html as a string, or a promise for that 
	   * string.
	   */
	  this.fromString = function (template, params) {
	    return isFunction(template) ? template(params) : template;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromUrl
	   * @methodOf ui.router.util.$templateFactory
	   * 
	   * @description
	   * Loads a template from the a URL via `$http` and `$templateCache`.
	   *
	   * @param {string|Function} url url of the template to load, or a function 
	   * that returns a url.
	   * @param {Object} params Parameters to pass to the url function.
	   * @return {string|Promise.<string>} The template html as a string, or a promise 
	   * for that string.
	   */
	  this.fromUrl = function (url, params) {
	    if (isFunction(url)) url = url(params);
	    if (url == null) return null;
	    else {
	      if(!shouldUnsafelyUseHttp) {
	        return $injector.get('$templateRequest')(url);
	      } else {
	        return $http
	          .get(url, { cache: $templateCache, headers: { Accept: 'text/html' }})
	          .then(function(response) { return response.data; });
	      }
	    }
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$templateFactory#fromProvider
	   * @methodOf ui.router.util.$templateFactory
	   *
	   * @description
	   * Creates a template by invoking an injectable provider function.
	   *
	   * @param {Function} provider Function to invoke via `$injector.invoke`
	   * @param {Object} params Parameters for the template.
	   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
	   * `{ params: params }`.
	   * @return {string|Promise.<string>} The template html as a string, or a promise 
	   * for that string.
	   */
	  this.fromProvider = function (provider, params, locals) {
	    return $injector.invoke(provider, null, locals || { params: params });
	  };
	}

	angular.module('ui.router.util').provider('$templateFactory', TemplateFactoryProvider);

	var $$UMFP; // reference to $UrlMatcherFactoryProvider

	/**
	 * @ngdoc object
	 * @name ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Matches URLs against patterns and extracts named parameters from the path or the search
	 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
	 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
	 * do not influence whether or not a URL is matched, but their values are passed through into
	 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
	 *
	 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
	 * syntax, which optionally allows a regular expression for the parameter to be specified:
	 *
	 * * `':'` name - colon placeholder
	 * * `'*'` name - catch-all placeholder
	 * * `'{' name '}'` - curly placeholder
	 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
	 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
	 *
	 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
	 * must be unique within the pattern (across both path and search parameters). For colon
	 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
	 * number of characters other than '/'. For catch-all placeholders the path parameter matches
	 * any number of characters.
	 *
	 * Examples:
	 *
	 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
	 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
	 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
	 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
	 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
	 * * `'/user/{id:[^/]*}'` - Same as the previous example.
	 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
	 *   parameter consists of 1 to 8 hex digits.
	 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
	 *   path into the parameter 'path'.
	 * * `'/files/*path'` - ditto.
	 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
	 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
	 *
	 * @param {string} pattern  The pattern to compile into a matcher.
	 * @param {Object} config  A configuration object hash:
	 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
	 *   an existing UrlMatcher
	 *
	 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
	 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
	 *
	 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
	 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
	 *   non-null) will start with this prefix.
	 *
	 * @property {string} source  The pattern that was passed into the constructor
	 *
	 * @property {string} sourcePath  The path portion of the source property
	 *
	 * @property {string} sourceSearch  The search portion of the source property
	 *
	 * @property {string} regex  The constructed regex that will be used to match against the url when
	 *   it is time to determine which url will match.
	 *
	 * @returns {Object}  New `UrlMatcher` object
	 */
	function UrlMatcher(pattern, config, parentMatcher) {
	  config = extend({ params: {} }, isObject(config) ? config : {});

	  // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
	  //   '*' name
	  //   ':' name
	  //   '{' name '}'
	  //   '{' name ':' regexp '}'
	  // The regular expression is somewhat complicated due to the need to allow curly braces
	  // inside the regular expression. The placeholder regexp breaks down as follows:
	  //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
	  //    \{([\w\[\]]+)(?:\:\s*( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
	  //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
	  //    [^{}\\]+                       - anything other than curly braces or backslash
	  //    \\.                            - a backslash escape
	  //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
	  var placeholder       = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
	      searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
	      compiled = '^', last = 0, m,
	      segments = this.segments = [],
	      parentParams = parentMatcher ? parentMatcher.params : {},
	      params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(),
	      paramNames = [];

	  function addParameter(id, type, config, location) {
	    paramNames.push(id);
	    if (parentParams[id]) return parentParams[id];
	    if (!/^\w+([-.]+\w+)*(?:\[\])?$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
	    if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
	    params[id] = new $$UMFP.Param(id, type, config, location);
	    return params[id];
	  }

	  function quoteRegExp(string, pattern, squash, optional) {
	    var surroundPattern = ['',''], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	    if (!pattern) return result;
	    switch(squash) {
	      case false: surroundPattern = ['(', ')' + (optional ? "?" : "")]; break;
	      case true:
	        result = result.replace(/\/$/, '');
	        surroundPattern = ['(?:\/(', ')|\/)?'];
	      break;
	      default:    surroundPattern = ['(' + squash + "|", ')?']; break;
	    }
	    return result + surroundPattern[0] + pattern + surroundPattern[1];
	  }

	  this.source = pattern;

	  // Split into static segments separated by path parameter placeholders.
	  // The number of segments is always 1 more than the number of parameters.
	  function matchDetails(m, isSearch) {
	    var id, regexp, segment, type, cfg, arrayMode;
	    id          = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	    cfg         = config.params[id];
	    segment     = pattern.substring(last, m.index);
	    regexp      = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);

	    if (regexp) {
	      type      = $$UMFP.type(regexp) || inherit($$UMFP.type("string"), { pattern: new RegExp(regexp, config.caseInsensitive ? 'i' : undefined) });
	    }

	    return {
	      id: id, regexp: regexp, segment: segment, type: type, cfg: cfg
	    };
	  }

	  var p, param, segment;
	  while ((m = placeholder.exec(pattern))) {
	    p = matchDetails(m, false);
	    if (p.segment.indexOf('?') >= 0) break; // we're into the search part

	    param = addParameter(p.id, p.type, p.cfg, "path");
	    compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash, param.isOptional);
	    segments.push(p.segment);
	    last = placeholder.lastIndex;
	  }
	  segment = pattern.substring(last);

	  // Find any search parameter names and remove them from the last segment
	  var i = segment.indexOf('?');

	  if (i >= 0) {
	    var search = this.sourceSearch = segment.substring(i);
	    segment = segment.substring(0, i);
	    this.sourcePath = pattern.substring(0, last + i);

	    if (search.length > 0) {
	      last = 0;
	      while ((m = searchPlaceholder.exec(search))) {
	        p = matchDetails(m, true);
	        param = addParameter(p.id, p.type, p.cfg, "search");
	        last = placeholder.lastIndex;
	        // check if ?&
	      }
	    }
	  } else {
	    this.sourcePath = pattern;
	    this.sourceSearch = '';
	  }

	  compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
	  segments.push(segment);

	  this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
	  this.prefix = segments[0];
	  this.$$paramNames = paramNames;
	}

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#concat
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Returns a new matcher for a pattern constructed by appending the path part and adding the
	 * search parameters of the specified pattern to this pattern. The current pattern is not
	 * modified. This can be understood as creating a pattern for URLs that are relative to (or
	 * suffixes of) the current pattern.
	 *
	 * @example
	 * The following two matchers are equivalent:
	 * <pre>
	 * new UrlMatcher('/user/{id}?q').concat('/details?date');
	 * new UrlMatcher('/user/{id}/details?q&date');
	 * </pre>
	 *
	 * @param {string} pattern  The pattern to append.
	 * @param {Object} config  An object hash of the configuration for the matcher.
	 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
	 */
	UrlMatcher.prototype.concat = function (pattern, config) {
	  // Because order of search parameters is irrelevant, we can add our own search
	  // parameters to the end of the new pattern. Parse the new pattern by itself
	  // and then join the bits together, but it's much easier to do this on a string level.
	  var defaultConfig = {
	    caseInsensitive: $$UMFP.caseInsensitive(),
	    strict: $$UMFP.strictMode(),
	    squash: $$UMFP.defaultSquashPolicy()
	  };
	  return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
	};

	UrlMatcher.prototype.toString = function () {
	  return this.source;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#exec
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Tests the specified path against this matcher, and returns an object containing the captured
	 * parameter values, or null if the path does not match. The returned object contains the values
	 * of any search parameters that are mentioned in the pattern, but their value may be null if
	 * they are not present in `searchParams`. This means that search parameters are always treated
	 * as optional.
	 *
	 * @example
	 * <pre>
	 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
	 *   x: '1', q: 'hello'
	 * });
	 * // returns { id: 'bob', q: 'hello', r: null }
	 * </pre>
	 *
	 * @param {string} path  The URL path to match, e.g. `$location.path()`.
	 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
	 * @returns {Object}  The captured parameter values.
	 */
	UrlMatcher.prototype.exec = function (path, searchParams) {
	  var m = this.regexp.exec(path);
	  if (!m) return null;
	  searchParams = searchParams || {};

	  var paramNames = this.parameters(), nTotal = paramNames.length,
	    nPath = this.segments.length - 1,
	    values = {}, i, j, cfg, paramName;

	  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

	  function decodePathArray(string) {
	    function reverseString(str) { return str.split("").reverse().join(""); }
	    function unquoteDashes(str) { return str.replace(/\\-/g, "-"); }

	    var split = reverseString(string).split(/-(?!\\)/);
	    var allReversed = map(split, reverseString);
	    return map(allReversed, unquoteDashes).reverse();
	  }

	  var param, paramVal;
	  for (i = 0; i < nPath; i++) {
	    paramName = paramNames[i];
	    param = this.params[paramName];
	    paramVal = m[i+1];
	    // if the param value matches a pre-replace pair, replace the value before decoding.
	    for (j = 0; j < param.replace.length; j++) {
	      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
	    }
	    if (paramVal && param.array === true) paramVal = decodePathArray(paramVal);
	    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
	    values[paramName] = param.value(paramVal);
	  }
	  for (/**/; i < nTotal; i++) {
	    paramName = paramNames[i];
	    values[paramName] = this.params[paramName].value(searchParams[paramName]);
	    param = this.params[paramName];
	    paramVal = searchParams[paramName];
	    for (j = 0; j < param.replace.length; j++) {
	      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
	    }
	    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
	    values[paramName] = param.value(paramVal);
	  }

	  return values;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#parameters
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Returns the names of all path and search parameters of this pattern in an unspecified order.
	 *
	 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
	 *    pattern has no parameters, an empty array is returned.
	 */
	UrlMatcher.prototype.parameters = function (param) {
	  if (!isDefined(param)) return this.$$paramNames;
	  return this.params[param] || null;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#validates
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Checks an object hash of parameters to validate their correctness according to the parameter
	 * types of this `UrlMatcher`.
	 *
	 * @param {Object} params The object hash of parameters to validate.
	 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
	 */
	UrlMatcher.prototype.validates = function (params) {
	  return this.params.$$validates(params);
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:UrlMatcher#format
	 * @methodOf ui.router.util.type:UrlMatcher
	 *
	 * @description
	 * Creates a URL that matches this pattern by substituting the specified values
	 * for the path and search parameters. Null values for path parameters are
	 * treated as empty strings.
	 *
	 * @example
	 * <pre>
	 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
	 * // returns '/user/bob?q=yes'
	 * </pre>
	 *
	 * @param {Object} values  the values to substitute for the parameters in this pattern.
	 * @returns {string}  the formatted URL (path and optionally search part).
	 */
	UrlMatcher.prototype.format = function (values) {
	  values = values || {};
	  var segments = this.segments, params = this.parameters(), paramset = this.params;
	  if (!this.validates(values)) return null;

	  var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];

	  function encodeDashes(str) { // Replace dashes with encoded "\-"
	    return encodeURIComponent(str).replace(/-/g, function(c) { return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase(); });
	  }

	  for (i = 0; i < nTotal; i++) {
	    var isPathParam = i < nPath;
	    var name = params[i], param = paramset[name], value = param.value(values[name]);
	    var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
	    var squash = isDefaultValue ? param.squash : false;
	    var encoded = param.type.encode(value);

	    if (isPathParam) {
	      var nextSegment = segments[i + 1];
	      var isFinalPathParam = i + 1 === nPath;

	      if (squash === false) {
	        if (encoded != null) {
	          if (isArray(encoded)) {
	            result += map(encoded, encodeDashes).join("-");
	          } else {
	            result += encodeURIComponent(encoded);
	          }
	        }
	        result += nextSegment;
	      } else if (squash === true) {
	        var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
	        result += nextSegment.match(capture)[1];
	      } else if (isString(squash)) {
	        result += squash + nextSegment;
	      }

	      if (isFinalPathParam && param.squash === true && result.slice(-1) === '/') result = result.slice(0, -1);
	    } else {
	      if (encoded == null || (isDefaultValue && squash !== false)) continue;
	      if (!isArray(encoded)) encoded = [ encoded ];
	      if (encoded.length === 0) continue;
	      encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
	      result += (search ? '&' : '?') + (name + '=' + encoded);
	      search = true;
	    }
	  }

	  return result;
	};

	/**
	 * @ngdoc object
	 * @name ui.router.util.type:Type
	 *
	 * @description
	 * Implements an interface to define custom parameter types that can be decoded from and encoded to
	 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
	 * objects when matching or formatting URLs, or comparing or validating parameter values.
	 *
	 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
	 * information on registering custom types.
	 *
	 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
	 *        properties will override the default methods and/or pattern in `Type`'s public interface.
	 * @example
	 * <pre>
	 * {
	 *   decode: function(val) { return parseInt(val, 10); },
	 *   encode: function(val) { return val && val.toString(); },
	 *   equals: function(a, b) { return this.is(a) && a === b; },
	 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
	 *   pattern: /\d+/
	 * }
	 * </pre>
	 *
	 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
	 *           coming from a substring of a URL.
	 *
	 * @returns {Object}  Returns a new `Type` object.
	 */
	function Type(config) {
	  extend(this, config);
	}

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#is
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Detects whether a value is of a particular type. Accepts a native (decoded) value
	 * and determines whether it matches the current `Type` object.
	 *
	 * @param {*} val  The value to check.
	 * @param {string} key  Optional. If the type check is happening in the context of a specific
	 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
	 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
	 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
	 */
	Type.prototype.is = function(val, key) {
	  return true;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#encode
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
	 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
	 * only needs to be a representation of `val` that has been coerced to a string.
	 *
	 * @param {*} val  The value to encode.
	 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
	 *        meta-programming of `Type` objects.
	 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
	 */
	Type.prototype.encode = function(val, key) {
	  return val;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#decode
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Converts a parameter value (from URL string or transition param) to a custom/native value.
	 *
	 * @param {string} val  The URL parameter value to decode.
	 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
	 *        meta-programming of `Type` objects.
	 * @returns {*}  Returns a custom representation of the URL parameter value.
	 */
	Type.prototype.decode = function(val, key) {
	  return val;
	};

	/**
	 * @ngdoc function
	 * @name ui.router.util.type:Type#equals
	 * @methodOf ui.router.util.type:Type
	 *
	 * @description
	 * Determines whether two decoded values are equivalent.
	 *
	 * @param {*} a  A value to compare against.
	 * @param {*} b  A value to compare against.
	 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
	 */
	Type.prototype.equals = function(a, b) {
	  return a == b;
	};

	Type.prototype.$subPattern = function() {
	  var sub = this.pattern.toString();
	  return sub.substr(1, sub.length - 2);
	};

	Type.prototype.pattern = /.*/;

	Type.prototype.toString = function() { return "{Type:" + this.name + "}"; };

	/** Given an encoded string, or a decoded object, returns a decoded object */
	Type.prototype.$normalize = function(val) {
	  return this.is(val) ? val : this.decode(val);
	};

	/*
	 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
	 * e.g.:
	 * - urlmatcher pattern "/path?{queryParam[]:int}"
	 * - url: "/path?queryParam=1&queryParam=2
	 * - $stateParams.queryParam will be [1, 2]
	 * if `mode` is "auto", then
	 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
	 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
	 */
	Type.prototype.$asArray = function(mode, isSearch) {
	  if (!mode) return this;
	  if (mode === "auto" && !isSearch) throw new Error("'auto' array mode is for query parameters only");

	  function ArrayType(type, mode) {
	    function bindTo(type, callbackName) {
	      return function() {
	        return type[callbackName].apply(type, arguments);
	      };
	    }

	    // Wrap non-array value as array
	    function arrayWrap(val) { return isArray(val) ? val : (isDefined(val) ? [ val ] : []); }
	    // Unwrap array value for "auto" mode. Return undefined for empty array.
	    function arrayUnwrap(val) {
	      switch(val.length) {
	        case 0: return undefined;
	        case 1: return mode === "auto" ? val[0] : val;
	        default: return val;
	      }
	    }
	    function falsey(val) { return !val; }

	    // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
	    function arrayHandler(callback, allTruthyMode) {
	      return function handleArray(val) {
	        if (isArray(val) && val.length === 0) return val;
	        val = arrayWrap(val);
	        var result = map(val, callback);
	        if (allTruthyMode === true)
	          return filter(result, falsey).length === 0;
	        return arrayUnwrap(result);
	      };
	    }

	    // Wraps type (.equals) functions to operate on each value of an array
	    function arrayEqualsHandler(callback) {
	      return function handleArray(val1, val2) {
	        var left = arrayWrap(val1), right = arrayWrap(val2);
	        if (left.length !== right.length) return false;
	        for (var i = 0; i < left.length; i++) {
	          if (!callback(left[i], right[i])) return false;
	        }
	        return true;
	      };
	    }

	    this.encode = arrayHandler(bindTo(type, 'encode'));
	    this.decode = arrayHandler(bindTo(type, 'decode'));
	    this.is     = arrayHandler(bindTo(type, 'is'), true);
	    this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
	    this.pattern = type.pattern;
	    this.$normalize = arrayHandler(bindTo(type, '$normalize'));
	    this.name = type.name;
	    this.$arrayMode = mode;
	  }

	  return new ArrayType(this, mode);
	};



	/**
	 * @ngdoc object
	 * @name ui.router.util.$urlMatcherFactory
	 *
	 * @description
	 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
	 * is also available to providers under the name `$urlMatcherFactoryProvider`.
	 */
	function $UrlMatcherFactory() {
	  $$UMFP = this;

	  var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;

	  // Use tildes to pre-encode slashes.
	  // If the slashes are simply URLEncoded, the browser can choose to pre-decode them,
	  // and bidirectional encoding/decoding fails.
	  // Tilde was chosen because it's not a RFC 3986 section 2.2 Reserved Character
	  function valToString(val) { return val != null ? val.toString().replace(/(~|\/)/g, function (m) { return {'~':'~~', '/':'~2F'}[m]; }) : val; }
	  function valFromString(val) { return val != null ? val.toString().replace(/(~~|~2F)/g, function (m) { return {'~~':'~', '~2F':'/'}[m]; }) : val; }

	  var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
	    "string": {
	      encode: valToString,
	      decode: valFromString,
	      // TODO: in 1.0, make string .is() return false if value is undefined/null by default.
	      // In 0.2.x, string params are optional by default for backwards compat
	      is: function(val) { return val == null || !isDefined(val) || typeof val === "string"; },
	      pattern: /[^/]*/
	    },
	    "int": {
	      encode: valToString,
	      decode: function(val) { return parseInt(val, 10); },
	      is: function(val) { return val !== undefined && val !== null && this.decode(val.toString()) === val; },
	      pattern: /-?\d+/
	    },
	    "bool": {
	      encode: function(val) { return val ? 1 : 0; },
	      decode: function(val) { return parseInt(val, 10) !== 0; },
	      is: function(val) { return val === true || val === false; },
	      pattern: /0|1/
	    },
	    "date": {
	      encode: function (val) {
	        if (!this.is(val))
	          return undefined;
	        return [ val.getFullYear(),
	          ('0' + (val.getMonth() + 1)).slice(-2),
	          ('0' + val.getDate()).slice(-2)
	        ].join("-");
	      },
	      decode: function (val) {
	        if (this.is(val)) return val;
	        var match = this.capture.exec(val);
	        return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
	      },
	      is: function(val) { return val instanceof Date && !isNaN(val.valueOf()); },
	      equals: function (a, b) { return this.is(a) && this.is(b) && a.toISOString() === b.toISOString(); },
	      pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
	      capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
	    },
	    "json": {
	      encode: angular.toJson,
	      decode: angular.fromJson,
	      is: angular.isObject,
	      equals: angular.equals,
	      pattern: /[^/]*/
	    },
	    "any": { // does not encode/decode
	      encode: angular.identity,
	      decode: angular.identity,
	      equals: angular.equals,
	      pattern: /.*/
	    }
	  };

	  function getDefaultConfig() {
	    return {
	      strict: isStrictMode,
	      caseInsensitive: isCaseInsensitive
	    };
	  }

	  function isInjectable(value) {
	    return (isFunction(value) || (isArray(value) && isFunction(value[value.length - 1])));
	  }

	  /**
	   * [Internal] Get the default value of a parameter, which may be an injectable function.
	   */
	  $UrlMatcherFactory.$$getDefaultValue = function(config) {
	    if (!isInjectable(config.value)) return config.value;
	    if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
	    return injector.invoke(config.value);
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#caseInsensitive
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Defines whether URL matching should be case sensitive (the default behavior), or not.
	   *
	   * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
	   * @returns {boolean} the current value of caseInsensitive
	   */
	  this.caseInsensitive = function(value) {
	    if (isDefined(value))
	      isCaseInsensitive = value;
	    return isCaseInsensitive;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#strictMode
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Defines whether URLs should match trailing slashes, or not (the default behavior).
	   *
	   * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
	   * @returns {boolean} the current value of strictMode
	   */
	  this.strictMode = function(value) {
	    if (isDefined(value))
	      isStrictMode = value;
	    return isStrictMode;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Sets the default behavior when generating or matching URLs with default parameter values.
	   *
	   * @param {string} value A string that defines the default parameter URL squashing behavior.
	   *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
	   *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
	   *             parameter is surrounded by slashes, squash (remove) one slash from the URL
	   *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
	   *             the parameter value from the URL and replace it with this string.
	   */
	  this.defaultSquashPolicy = function(value) {
	    if (!isDefined(value)) return defaultSquashPolicy;
	    if (value !== true && value !== false && !isString(value))
	      throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
	    defaultSquashPolicy = value;
	    return value;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#compile
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
	   *
	   * @param {string} pattern  The URL pattern.
	   * @param {Object} config  The config object hash.
	   * @returns {UrlMatcher}  The UrlMatcher.
	   */
	  this.compile = function (pattern, config) {
	    return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#isMatcher
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
	   *
	   * @param {Object} object  The object to perform the type check against.
	   * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
	   *          implementing all the same methods.
	   */
	  this.isMatcher = function (o) {
	    if (!isObject(o)) return false;
	    var result = true;

	    forEach(UrlMatcher.prototype, function(val, name) {
	      if (isFunction(val)) {
	        result = result && (isDefined(o[name]) && isFunction(o[name]));
	      }
	    });
	    return result;
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.util.$urlMatcherFactory#type
	   * @methodOf ui.router.util.$urlMatcherFactory
	   *
	   * @description
	   * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
	   * generate URLs with typed parameters.
	   *
	   * @param {string} name  The type name.
	   * @param {Object|Function} definition   The type definition. See
	   *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
	   * @param {Object|Function} definitionFn (optional) A function that is injected before the app
	   *        runtime starts.  The result of this function is merged into the existing `definition`.
	   *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
	   *
	   * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
	   *
	   * @example
	   * This is a simple example of a custom type that encodes and decodes items from an
	   * array, using the array index as the URL-encoded value:
	   *
	   * <pre>
	   * var list = ['John', 'Paul', 'George', 'Ringo'];
	   *
	   * $urlMatcherFactoryProvider.type('listItem', {
	   *   encode: function(item) {
	   *     // Represent the list item in the URL using its corresponding index
	   *     return list.indexOf(item);
	   *   },
	   *   decode: function(item) {
	   *     // Look up the list item by index
	   *     return list[parseInt(item, 10)];
	   *   },
	   *   is: function(item) {
	   *     // Ensure the item is valid by checking to see that it appears
	   *     // in the list
	   *     return list.indexOf(item) > -1;
	   *   }
	   * });
	   *
	   * $stateProvider.state('list', {
	   *   url: "/list/{item:listItem}",
	   *   controller: function($scope, $stateParams) {
	   *     console.log($stateParams.item);
	   *   }
	   * });
	   *
	   * // ...
	   *
	   * // Changes URL to '/list/3', logs "Ringo" to the console
	   * $state.go('list', { item: "Ringo" });
	   * </pre>
	   *
	   * This is a more complex example of a type that relies on dependency injection to
	   * interact with services, and uses the parameter name from the URL to infer how to
	   * handle encoding and decoding parameter values:
	   *
	   * <pre>
	   * // Defines a custom type that gets a value from a service,
	   * // where each service gets different types of values from
	   * // a backend API:
	   * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
	   *
	   *   // Matches up services to URL parameter names
	   *   var services = {
	   *     user: Users,
	   *     post: Posts
	   *   };
	   *
	   *   return {
	   *     encode: function(object) {
	   *       // Represent the object in the URL using its unique ID
	   *       return object.id;
	   *     },
	   *     decode: function(value, key) {
	   *       // Look up the object by ID, using the parameter
	   *       // name (key) to call the correct service
	   *       return services[key].findById(value);
	   *     },
	   *     is: function(object, key) {
	   *       // Check that object is a valid dbObject
	   *       return angular.isObject(object) && object.id && services[key];
	   *     }
	   *     equals: function(a, b) {
	   *       // Check the equality of decoded objects by comparing
	   *       // their unique IDs
	   *       return a.id === b.id;
	   *     }
	   *   };
	   * });
	   *
	   * // In a config() block, you can then attach URLs with
	   * // type-annotated parameters:
	   * $stateProvider.state('users', {
	   *   url: "/users",
	   *   // ...
	   * }).state('users.item', {
	   *   url: "/{user:dbObject}",
	   *   controller: function($scope, $stateParams) {
	   *     // $stateParams.user will now be an object returned from
	   *     // the Users service
	   *   },
	   *   // ...
	   * });
	   * </pre>
	   */
	  this.type = function (name, definition, definitionFn) {
	    if (!isDefined(definition)) return $types[name];
	    if ($types.hasOwnProperty(name)) throw new Error("A type named '" + name + "' has already been defined.");

	    $types[name] = new Type(extend({ name: name }, definition));
	    if (definitionFn) {
	      typeQueue.push({ name: name, def: definitionFn });
	      if (!enqueue) flushTypeQueue();
	    }
	    return this;
	  };

	  // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
	  function flushTypeQueue() {
	    while(typeQueue.length) {
	      var type = typeQueue.shift();
	      if (type.pattern) throw new Error("You cannot override a type's .pattern at runtime.");
	      angular.extend($types[type.name], injector.invoke(type.def));
	    }
	  }

	  // Register default types. Store them in the prototype of $types.
	  forEach(defaultTypes, function(type, name) { $types[name] = new Type(extend({name: name}, type)); });
	  $types = inherit($types, {});

	  /* No need to document $get, since it returns this */
	  this.$get = ['$injector', function ($injector) {
	    injector = $injector;
	    enqueue = false;
	    flushTypeQueue();

	    forEach(defaultTypes, function(type, name) {
	      if (!$types[name]) $types[name] = new Type(type);
	    });
	    return this;
	  }];

	  this.Param = function Param(id, type, config, location) {
	    var self = this;
	    config = unwrapShorthand(config);
	    type = getType(config, type, location);
	    var arrayMode = getArrayMode();
	    type = arrayMode ? type.$asArray(arrayMode, location === "search") : type;
	    if (type.name === "string" && !arrayMode && location === "path" && config.value === undefined)
	      config.value = ""; // for 0.2.x; in 0.3.0+ do not automatically default to ""
	    var isOptional = config.value !== undefined;
	    var squash = getSquashPolicy(config, isOptional);
	    var replace = getReplace(config, arrayMode, isOptional, squash);

	    function unwrapShorthand(config) {
	      var keys = isObject(config) ? objectKeys(config) : [];
	      var isShorthand = indexOf(keys, "value") === -1 && indexOf(keys, "type") === -1 &&
	                        indexOf(keys, "squash") === -1 && indexOf(keys, "array") === -1;
	      if (isShorthand) config = { value: config };
	      config.$$fn = isInjectable(config.value) ? config.value : function () { return config.value; };
	      return config;
	    }

	    function getType(config, urlType, location) {
	      if (config.type && urlType) throw new Error("Param '"+id+"' has two type configurations.");
	      if (urlType) return urlType;
	      if (!config.type) return (location === "config" ? $types.any : $types.string);

	      if (angular.isString(config.type))
	        return $types[config.type];
	      if (config.type instanceof Type)
	        return config.type;
	      return new Type(config.type);
	    }

	    // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
	    function getArrayMode() {
	      var arrayDefaults = { array: (location === "search" ? "auto" : false) };
	      var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
	      return extend(arrayDefaults, arrayParamNomenclature, config).array;
	    }

	    /**
	     * returns false, true, or the squash value to indicate the "default parameter url squash policy".
	     */
	    function getSquashPolicy(config, isOptional) {
	      var squash = config.squash;
	      if (!isOptional || squash === false) return false;
	      if (!isDefined(squash) || squash == null) return defaultSquashPolicy;
	      if (squash === true || isString(squash)) return squash;
	      throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
	    }

	    function getReplace(config, arrayMode, isOptional, squash) {
	      var replace, configuredKeys, defaultPolicy = [
	        { from: "",   to: (isOptional || arrayMode ? undefined : "") },
	        { from: null, to: (isOptional || arrayMode ? undefined : "") }
	      ];
	      replace = isArray(config.replace) ? config.replace : [];
	      if (isString(squash))
	        replace.push({ from: squash, to: undefined });
	      configuredKeys = map(replace, function(item) { return item.from; } );
	      return filter(defaultPolicy, function(item) { return indexOf(configuredKeys, item.from) === -1; }).concat(replace);
	    }

	    /**
	     * [Internal] Get the default value of a parameter, which may be an injectable function.
	     */
	    function $$getDefaultValue() {
	      if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
	      var defaultValue = injector.invoke(config.$$fn);
	      if (defaultValue !== null && defaultValue !== undefined && !self.type.is(defaultValue))
	        throw new Error("Default value (" + defaultValue + ") for parameter '" + self.id + "' is not an instance of Type (" + self.type.name + ")");
	      return defaultValue;
	    }

	    /**
	     * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
	     * default value, which may be the result of an injectable function.
	     */
	    function $value(value) {
	      function hasReplaceVal(val) { return function(obj) { return obj.from === val; }; }
	      function $replace(value) {
	        var replacement = map(filter(self.replace, hasReplaceVal(value)), function(obj) { return obj.to; });
	        return replacement.length ? replacement[0] : value;
	      }
	      value = $replace(value);
	      return !isDefined(value) ? $$getDefaultValue() : self.type.$normalize(value);
	    }

	    function toString() { return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}"; }

	    extend(this, {
	      id: id,
	      type: type,
	      location: location,
	      array: arrayMode,
	      squash: squash,
	      replace: replace,
	      isOptional: isOptional,
	      value: $value,
	      dynamic: undefined,
	      config: config,
	      toString: toString
	    });
	  };

	  function ParamSet(params) {
	    extend(this, params || {});
	  }

	  ParamSet.prototype = {
	    $$new: function() {
	      return inherit(this, extend(new ParamSet(), { $$parent: this}));
	    },
	    $$keys: function () {
	      var keys = [], chain = [], parent = this,
	        ignore = objectKeys(ParamSet.prototype);
	      while (parent) { chain.push(parent); parent = parent.$$parent; }
	      chain.reverse();
	      forEach(chain, function(paramset) {
	        forEach(objectKeys(paramset), function(key) {
	            if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1) keys.push(key);
	        });
	      });
	      return keys;
	    },
	    $$values: function(paramValues) {
	      var values = {}, self = this;
	      forEach(self.$$keys(), function(key) {
	        values[key] = self[key].value(paramValues && paramValues[key]);
	      });
	      return values;
	    },
	    $$equals: function(paramValues1, paramValues2) {
	      var equal = true, self = this;
	      forEach(self.$$keys(), function(key) {
	        var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
	        if (!self[key].type.equals(left, right)) equal = false;
	      });
	      return equal;
	    },
	    $$validates: function $$validate(paramValues) {
	      var keys = this.$$keys(), i, param, rawVal, normalized, encoded;
	      for (i = 0; i < keys.length; i++) {
	        param = this[keys[i]];
	        rawVal = paramValues[keys[i]];
	        if ((rawVal === undefined || rawVal === null) && param.isOptional)
	          break; // There was no parameter value, but the param is optional
	        normalized = param.type.$normalize(rawVal);
	        if (!param.type.is(normalized))
	          return false; // The value was not of the correct Type, and could not be decoded to the correct Type
	        encoded = param.type.encode(normalized);
	        if (angular.isString(encoded) && !param.type.pattern.exec(encoded))
	          return false; // The value was of the correct type, but when encoded, did not match the Type's regexp
	      }
	      return true;
	    },
	    $$parent: undefined
	  };

	  this.ParamSet = ParamSet;
	}

	// Register as a provider so it's available to other providers
	angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
	angular.module('ui.router.util').run(['$urlMatcherFactory', function($urlMatcherFactory) { }]);

	/**
	 * @ngdoc object
	 * @name ui.router.router.$urlRouterProvider
	 *
	 * @requires ui.router.util.$urlMatcherFactoryProvider
	 * @requires $locationProvider
	 *
	 * @description
	 * `$urlRouterProvider` has the responsibility of watching `$location`. 
	 * When `$location` changes it runs through a list of rules one by one until a 
	 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
	 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
	 *
	 * There are several methods on `$urlRouterProvider` that make it useful to use directly
	 * in your module config.
	 */
	$UrlRouterProvider.$inject = ['$locationProvider', '$urlMatcherFactoryProvider'];
	function $UrlRouterProvider(   $locationProvider,   $urlMatcherFactory) {
	  var rules = [], otherwise = null, interceptDeferred = false, listener;

	  // Returns a string that is a prefix of all strings matching the RegExp
	  function regExpPrefix(re) {
	    var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
	    return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
	  }

	  // Interpolates matched values into a String.replace()-style pattern
	  function interpolate(pattern, match) {
	    return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
	      return match[what === '$' ? 0 : Number(what)];
	    });
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#rule
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Defines rules that are used by `$urlRouterProvider` to find matches for
	   * specific URLs.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   // Here's an example of how you might allow case insensitive urls
	   *   $urlRouterProvider.rule(function ($injector, $location) {
	   *     var path = $location.path(),
	   *         normalized = path.toLowerCase();
	   *
	   *     if (path !== normalized) {
	   *       return normalized;
	   *     }
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {function} rule Handler function that takes `$injector` and `$location`
	   * services as arguments. You can use them to return a valid path as a string.
	   *
	   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
	   */
	  this.rule = function (rule) {
	    if (!isFunction(rule)) throw new Error("'rule' must be a function");
	    rules.push(rule);
	    return this;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.router.$urlRouterProvider#otherwise
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Defines a path that is used when an invalid route is requested.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   // if the path doesn't match any of the urls you configured
	   *   // otherwise will take care of routing the user to the
	   *   // specified url
	   *   $urlRouterProvider.otherwise('/index');
	   *
	   *   // Example of using function rule as param
	   *   $urlRouterProvider.otherwise(function ($injector, $location) {
	   *     return '/a/valid/url';
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {string|function} rule The url path you want to redirect to or a function 
	   * rule that returns the url path. The function version is passed two params: 
	   * `$injector` and `$location` services, and must return a url string.
	   *
	   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
	   */
	  this.otherwise = function (rule) {
	    if (isString(rule)) {
	      var redirect = rule;
	      rule = function () { return redirect; };
	    }
	    else if (!isFunction(rule)) throw new Error("'rule' must be a function");
	    otherwise = rule;
	    return this;
	  };


	  function handleIfMatch($injector, handler, match) {
	    if (!match) return false;
	    var result = $injector.invoke(handler, handler, { $match: match });
	    return isDefined(result) ? result : true;
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#when
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Registers a handler for a given url matching. 
	   * 
	   * If the handler is a string, it is
	   * treated as a redirect, and is interpolated according to the syntax of match
	   * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
	   *
	   * If the handler is a function, it is injectable. It gets invoked if `$location`
	   * matches. You have the option of inject the match object as `$match`.
	   *
	   * The handler can return
	   *
	   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
	   *   will continue trying to find another one that matches.
	   * - **string** which is treated as a redirect and passed to `$location.url()`
	   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
	   *     if ($state.$current.navigable !== state ||
	   *         !equalForKeys($match, $stateParams) {
	   *      $state.transitionTo(state, $match, false);
	   *     }
	   *   });
	   * });
	   * </pre>
	   *
	   * @param {string|object} what The incoming path that you want to redirect.
	   * @param {string|function} handler The path you want to redirect your user to.
	   */
	  this.when = function (what, handler) {
	    var redirect, handlerIsString = isString(handler);
	    if (isString(what)) what = $urlMatcherFactory.compile(what);

	    if (!handlerIsString && !isFunction(handler) && !isArray(handler))
	      throw new Error("invalid 'handler' in when()");

	    var strategies = {
	      matcher: function (what, handler) {
	        if (handlerIsString) {
	          redirect = $urlMatcherFactory.compile(handler);
	          handler = ['$match', function ($match) { return redirect.format($match); }];
	        }
	        return extend(function ($injector, $location) {
	          return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
	        }, {
	          prefix: isString(what.prefix) ? what.prefix : ''
	        });
	      },
	      regex: function (what, handler) {
	        if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

	        if (handlerIsString) {
	          redirect = handler;
	          handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
	        }
	        return extend(function ($injector, $location) {
	          return handleIfMatch($injector, handler, what.exec($location.path()));
	        }, {
	          prefix: regExpPrefix(what)
	        });
	      }
	    };

	    var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

	    for (var n in check) {
	      if (check[n]) return this.rule(strategies[n](what, handler));
	    }

	    throw new Error("invalid 'what' in when()");
	  };

	  /**
	   * @ngdoc function
	   * @name ui.router.router.$urlRouterProvider#deferIntercept
	   * @methodOf ui.router.router.$urlRouterProvider
	   *
	   * @description
	   * Disables (or enables) deferring location change interception.
	   *
	   * If you wish to customize the behavior of syncing the URL (for example, if you wish to
	   * defer a transition but maintain the current URL), call this method at configuration time.
	   * Then, at run time, call `$urlRouter.listen()` after you have configured your own
	   * `$locationChangeSuccess` event handler.
	   *
	   * @example
	   * <pre>
	   * var app = angular.module('app', ['ui.router.router']);
	   *
	   * app.config(function ($urlRouterProvider) {
	   *
	   *   // Prevent $urlRouter from automatically intercepting URL changes;
	   *   // this allows you to configure custom behavior in between
	   *   // location changes and route synchronization:
	   *   $urlRouterProvider.deferIntercept();
	   *
	   * }).run(function ($rootScope, $urlRouter, UserService) {
	   *
	   *   $rootScope.$on('$locationChangeSuccess', function(e) {
	   *     // UserService is an example service for managing user state
	   *     if (UserService.isLoggedIn()) return;
	   *
	   *     // Prevent $urlRouter's default handler from firing
	   *     e.preventDefault();
	   *
	   *     UserService.handleLogin().then(function() {
	   *       // Once the user has logged in, sync the current URL
	   *       // to the router:
	   *       $urlRouter.sync();
	   *     });
	   *   });
	   *
	   *   // Configures $urlRouter's listener *after* your custom listener
	   *   $urlRouter.listen();
	   * });
	   * </pre>
	   *
	   * @param {boolean} defer Indicates whether to defer location change interception. Passing
	            no parameter is equivalent to `true`.
	   */
	  this.deferIntercept = function (defer) {
	    if (defer === undefined) defer = true;
	    interceptDeferred = defer;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.router.$urlRouter
	   *
	   * @requires $location
	   * @requires $rootScope
	   * @requires $injector
	   * @requires $browser
	   *
	   * @description
	   *
	   */
	  this.$get = $get;
	  $get.$inject = ['$location', '$rootScope', '$injector', '$browser', '$sniffer'];
	  function $get(   $location,   $rootScope,   $injector,   $browser,   $sniffer) {

	    var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;

	    function appendBasePath(url, isHtml5, absolute) {
	      if (baseHref === '/') return url;
	      if (isHtml5) return baseHref.slice(0, -1) + url;
	      if (absolute) return baseHref.slice(1) + url;
	      return url;
	    }

	    // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
	    function update(evt) {
	      if (evt && evt.defaultPrevented) return;
	      var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
	      lastPushedUrl = undefined;
	      // TODO: Re-implement this in 1.0 for https://github.com/angular-ui/ui-router/issues/1573
	      //if (ignoreUpdate) return true;

	      function check(rule) {
	        var handled = rule($injector, $location);

	        if (!handled) return false;
	        if (isString(handled)) $location.replace().url(handled);
	        return true;
	      }
	      var n = rules.length, i;

	      for (i = 0; i < n; i++) {
	        if (check(rules[i])) return;
	      }
	      // always check otherwise last to allow dynamic updates to the set of rules
	      if (otherwise) check(otherwise);
	    }

	    function listen() {
	      listener = listener || $rootScope.$on('$locationChangeSuccess', update);
	      return listener;
	    }

	    if (!interceptDeferred) listen();

	    return {
	      /**
	       * @ngdoc function
	       * @name ui.router.router.$urlRouter#sync
	       * @methodOf ui.router.router.$urlRouter
	       *
	       * @description
	       * Triggers an update; the same update that happens when the address bar url changes, aka `$locationChangeSuccess`.
	       * This method is useful when you need to use `preventDefault()` on the `$locationChangeSuccess` event,
	       * perform some custom logic (route protection, auth, config, redirection, etc) and then finally proceed
	       * with the transition by calling `$urlRouter.sync()`.
	       *
	       * @example
	       * <pre>
	       * angular.module('app', ['ui.router'])
	       *   .run(function($rootScope, $urlRouter) {
	       *     $rootScope.$on('$locationChangeSuccess', function(evt) {
	       *       // Halt state change from even starting
	       *       evt.preventDefault();
	       *       // Perform custom logic
	       *       var meetsRequirement = ...
	       *       // Continue with the update and state transition if logic allows
	       *       if (meetsRequirement) $urlRouter.sync();
	       *     });
	       * });
	       * </pre>
	       */
	      sync: function() {
	        update();
	      },

	      listen: function() {
	        return listen();
	      },

	      update: function(read) {
	        if (read) {
	          location = $location.url();
	          return;
	        }
	        if ($location.url() === location) return;

	        $location.url(location);
	        $location.replace();
	      },

	      push: function(urlMatcher, params, options) {
	         var url = urlMatcher.format(params || {});

	        // Handle the special hash param, if needed
	        if (url !== null && params && params['#']) {
	            url += '#' + params['#'];
	        }

	        $location.url(url);
	        lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
	        if (options && options.replace) $location.replace();
	      },

	      /**
	       * @ngdoc function
	       * @name ui.router.router.$urlRouter#href
	       * @methodOf ui.router.router.$urlRouter
	       *
	       * @description
	       * A URL generation method that returns the compiled URL for a given
	       * {@link ui.router.util.type:UrlMatcher `UrlMatcher`}, populated with the provided parameters.
	       *
	       * @example
	       * <pre>
	       * $bob = $urlRouter.href(new UrlMatcher("/about/:person"), {
	       *   person: "bob"
	       * });
	       * // $bob == "/about/bob";
	       * </pre>
	       *
	       * @param {UrlMatcher} urlMatcher The `UrlMatcher` object which is used as the template of the URL to generate.
	       * @param {object=} params An object of parameter values to fill the matcher's required parameters.
	       * @param {object=} options Options object. The options are:
	       *
	       * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
	       *
	       * @returns {string} Returns the fully compiled URL, or `null` if `params` fail validation against `urlMatcher`
	       */
	      href: function(urlMatcher, params, options) {
	        if (!urlMatcher.validates(params)) return null;

	        var isHtml5 = $locationProvider.html5Mode();
	        if (angular.isObject(isHtml5)) {
	          isHtml5 = isHtml5.enabled;
	        }

	        isHtml5 = isHtml5 && $sniffer.history;
	        
	        var url = urlMatcher.format(params);
	        options = options || {};

	        if (!isHtml5 && url !== null) {
	          url = "#" + $locationProvider.hashPrefix() + url;
	        }

	        // Handle special hash param, if needed
	        if (url !== null && params && params['#']) {
	          url += '#' + params['#'];
	        }

	        url = appendBasePath(url, isHtml5, options.absolute);

	        if (!options.absolute || !url) {
	          return url;
	        }

	        var slash = (!isHtml5 && url ? '/' : ''), port = $location.port();
	        port = (port === 80 || port === 443 ? '' : ':' + port);

	        return [$location.protocol(), '://', $location.host(), port, slash, url].join('');
	      }
	    };
	  }
	}

	angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);

	/**
	 * @ngdoc object
	 * @name ui.router.state.$stateProvider
	 *
	 * @requires ui.router.router.$urlRouterProvider
	 * @requires ui.router.util.$urlMatcherFactoryProvider
	 *
	 * @description
	 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
	 * on state.
	 *
	 * A state corresponds to a "place" in the application in terms of the overall UI and
	 * navigation. A state describes (via the controller / template / view properties) what
	 * the UI looks like and does at that place.
	 *
	 * States often have things in common, and the primary way of factoring out these
	 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
	 * nested states.
	 *
	 * The `$stateProvider` provides interfaces to declare these states for your app.
	 */
	$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider'];
	function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory) {

	  var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

	  // Builds state properties from definition passed to registerState()
	  var stateBuilder = {

	    // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
	    // state.children = [];
	    // if (parent) parent.children.push(state);
	    parent: function(state) {
	      if (isDefined(state.parent) && state.parent) return findState(state.parent);
	      // regex matches any valid composite state name
	      // would match "contact.list" but not "contacts"
	      var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
	      return compositeName ? findState(compositeName[1]) : root;
	    },

	    // inherit 'data' from parent and override by own values (if any)
	    data: function(state) {
	      if (state.parent && state.parent.data) {
	        state.data = state.self.data = inherit(state.parent.data, state.data);
	      }
	      return state.data;
	    },

	    // Build a URLMatcher if necessary, either via a relative or absolute URL
	    url: function(state) {
	      var url = state.url, config = { params: state.params || {} };

	      if (isString(url)) {
	        if (url.charAt(0) == '^') return $urlMatcherFactory.compile(url.substring(1), config);
	        return (state.parent.navigable || root).url.concat(url, config);
	      }

	      if (!url || $urlMatcherFactory.isMatcher(url)) return url;
	      throw new Error("Invalid url '" + url + "' in state '" + state + "'");
	    },

	    // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
	    navigable: function(state) {
	      return state.url ? state : (state.parent ? state.parent.navigable : null);
	    },

	    // Own parameters for this state. state.url.params is already built at this point. Create and add non-url params
	    ownParams: function(state) {
	      var params = state.url && state.url.params || new $$UMFP.ParamSet();
	      forEach(state.params || {}, function(config, id) {
	        if (!params[id]) params[id] = new $$UMFP.Param(id, null, config, "config");
	      });
	      return params;
	    },

	    // Derive parameters for this state and ensure they're a super-set of parent's parameters
	    params: function(state) {
	      var ownParams = pick(state.ownParams, state.ownParams.$$keys());
	      return state.parent && state.parent.params ? extend(state.parent.params.$$new(), ownParams) : new $$UMFP.ParamSet();
	    },

	    // If there is no explicit multi-view configuration, make one up so we don't have
	    // to handle both cases in the view directive later. Note that having an explicit
	    // 'views' property will mean the default unnamed view properties are ignored. This
	    // is also a good time to resolve view names to absolute names, so everything is a
	    // straight lookup at link time.
	    views: function(state) {
	      var views = {};

	      forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
	        if (name.indexOf('@') < 0) name += '@' + state.parent.name;
	        view.resolveAs = view.resolveAs || state.resolveAs || '$resolve';
	        views[name] = view;
	      });
	      return views;
	    },

	    // Keep a full path from the root down to this state as this is needed for state activation.
	    path: function(state) {
	      return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
	    },

	    // Speed up $state.contains() as it's used a lot
	    includes: function(state) {
	      var includes = state.parent ? extend({}, state.parent.includes) : {};
	      includes[state.name] = true;
	      return includes;
	    },

	    $delegates: {}
	  };

	  function isRelative(stateName) {
	    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
	  }

	  function findState(stateOrName, base) {
	    if (!stateOrName) return undefined;

	    var isStr = isString(stateOrName),
	        name  = isStr ? stateOrName : stateOrName.name,
	        path  = isRelative(name);

	    if (path) {
	      if (!base) throw new Error("No reference point given for path '"  + name + "'");
	      base = findState(base);
	      
	      var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

	      for (; i < pathLength; i++) {
	        if (rel[i] === "" && i === 0) {
	          current = base;
	          continue;
	        }
	        if (rel[i] === "^") {
	          if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
	          current = current.parent;
	          continue;
	        }
	        break;
	      }
	      rel = rel.slice(i).join(".");
	      name = current.name + (current.name && rel ? "." : "") + rel;
	    }
	    var state = states[name];

	    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
	      return state;
	    }
	    return undefined;
	  }

	  function queueState(parentName, state) {
	    if (!queue[parentName]) {
	      queue[parentName] = [];
	    }
	    queue[parentName].push(state);
	  }

	  function flushQueuedChildren(parentName) {
	    var queued = queue[parentName] || [];
	    while(queued.length) {
	      registerState(queued.shift());
	    }
	  }

	  function registerState(state) {
	    // Wrap a new object around the state so we can store our private details easily.
	    state = inherit(state, {
	      self: state,
	      resolve: state.resolve || {},
	      toString: function() { return this.name; }
	    });

	    var name = state.name;
	    if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
	    if (states.hasOwnProperty(name)) throw new Error("State '" + name + "' is already defined");

	    // Get parent name
	    var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
	        : (isString(state.parent)) ? state.parent
	        : (isObject(state.parent) && isString(state.parent.name)) ? state.parent.name
	        : '';

	    // If parent is not registered yet, add state to queue and register later
	    if (parentName && !states[parentName]) {
	      return queueState(parentName, state.self);
	    }

	    for (var key in stateBuilder) {
	      if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
	    }
	    states[name] = state;

	    // Register the state in the global state list and with $urlRouter if necessary.
	    if (!state[abstractKey] && state.url) {
	      $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
	        if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
	          $state.transitionTo(state, $match, { inherit: true, location: false });
	        }
	      }]);
	    }

	    // Register any queued children
	    flushQueuedChildren(name);

	    return state;
	  }

	  // Checks text to see if it looks like a glob.
	  function isGlob (text) {
	    return text.indexOf('*') > -1;
	  }

	  // Returns true if glob matches current $state name.
	  function doesStateMatchGlob (glob) {
	    var globSegments = glob.split('.'),
	        segments = $state.$current.name.split('.');

	    //match single stars
	    for (var i = 0, l = globSegments.length; i < l; i++) {
	      if (globSegments[i] === '*') {
	        segments[i] = '*';
	      }
	    }

	    //match greedy starts
	    if (globSegments[0] === '**') {
	       segments = segments.slice(indexOf(segments, globSegments[1]));
	       segments.unshift('**');
	    }
	    //match greedy ends
	    if (globSegments[globSegments.length - 1] === '**') {
	       segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
	       segments.push('**');
	    }

	    if (globSegments.length != segments.length) {
	      return false;
	    }

	    return segments.join('') === globSegments.join('');
	  }


	  // Implicit root state that is always active
	  root = registerState({
	    name: '',
	    url: '^',
	    views: null,
	    'abstract': true
	  });
	  root.navigable = null;


	  /**
	   * @ngdoc function
	   * @name ui.router.state.$stateProvider#decorator
	   * @methodOf ui.router.state.$stateProvider
	   *
	   * @description
	   * Allows you to extend (carefully) or override (at your own peril) the 
	   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
	   * to add custom functionality to ui-router, for example inferring templateUrl 
	   * based on the state name.
	   *
	   * When passing only a name, it returns the current (original or decorated) builder
	   * function that matches `name`.
	   *
	   * The builder functions that can be decorated are listed below. Though not all
	   * necessarily have a good use case for decoration, that is up to you to decide.
	   *
	   * In addition, users can attach custom decorators, which will generate new 
	   * properties within the state's internal definition. There is currently no clear 
	   * use-case for this beyond accessing internal states (i.e. $state.$current), 
	   * however, expect this to become increasingly relevant as we introduce additional 
	   * meta-programming features.
	   *
	   * **Warning**: Decorators should not be interdependent because the order of 
	   * execution of the builder functions in non-deterministic. Builder functions 
	   * should only be dependent on the state definition object and super function.
	   *
	   *
	   * Existing builder functions and current return values:
	   *
	   * - **parent** `{object}` - returns the parent state object.
	   * - **data** `{object}` - returns state data, including any inherited data that is not
	   *   overridden by own values (if any).
	   * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
	   *   or `null`.
	   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
	   *   navigable).
	   * - **params** `{object}` - returns an array of state params that are ensured to 
	   *   be a super-set of parent's params.
	   * - **views** `{object}` - returns a views object where each key is an absolute view 
	   *   name (i.e. "viewName@stateName") and each value is the config object 
	   *   (template, controller) for the view. Even when you don't use the views object 
	   *   explicitly on a state config, one is still created for you internally.
	   *   So by decorating this builder function you have access to decorating template 
	   *   and controller properties.
	   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
	   *   not including any params defined by ancestor states.
	   * - **path** `{string}` - returns the full path from the root down to this state. 
	   *   Needed for state activation.
	   * - **includes** `{object}` - returns an object that includes every state that 
	   *   would pass a `$state.includes()` test.
	   *
	   * @example
	   * <pre>
	   * // Override the internal 'views' builder with a function that takes the state
	   * // definition, and a reference to the internal function being overridden:
	   * $stateProvider.decorator('views', function (state, parent) {
	   *   var result = {},
	   *       views = parent(state);
	   *
	   *   angular.forEach(views, function (config, name) {
	   *     var autoName = (state.name + '.' + name).replace('.', '/');
	   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
	   *     result[name] = config;
	   *   });
	   *   return result;
	   * });
	   *
	   * $stateProvider.state('home', {
	   *   views: {
	   *     'contact.list': { controller: 'ListController' },
	   *     'contact.item': { controller: 'ItemController' }
	   *   }
	   * });
	   *
	   * // ...
	   *
	   * $state.go('home');
	   * // Auto-populates list and item views with /partials/home/contact/list.html,
	   * // and /partials/home/contact/item.html, respectively.
	   * </pre>
	   *
	   * @param {string} name The name of the builder function to decorate. 
	   * @param {object} func A function that is responsible for decorating the original 
	   * builder function. The function receives two parameters:
	   *
	   *   - `{object}` - state - The state config object.
	   *   - `{object}` - super - The original builder function.
	   *
	   * @return {object} $stateProvider - $stateProvider instance
	   */
	  this.decorator = decorator;
	  function decorator(name, func) {
	    /*jshint validthis: true */
	    if (isString(name) && !isDefined(func)) {
	      return stateBuilder[name];
	    }
	    if (!isFunction(func) || !isString(name)) {
	      return this;
	    }
	    if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
	      stateBuilder.$delegates[name] = stateBuilder[name];
	    }
	    stateBuilder[name] = func;
	    return this;
	  }

	  /**
	   * @ngdoc function
	   * @name ui.router.state.$stateProvider#state
	   * @methodOf ui.router.state.$stateProvider
	   *
	   * @description
	   * Registers a state configuration under a given state name. The stateConfig object
	   * has the following acceptable properties.
	   *
	   * @param {string} name A unique state name, e.g. "home", "about", "contacts".
	   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
	   * @param {object} stateConfig State configuration object.
	   * @param {string|function=} stateConfig.template
	   * <a id='template'></a>
	   *   html template as a string or a function that returns
	   *   an html template as a string which should be used by the uiView directives. This property 
	   *   takes precedence over templateUrl.
	   *   
	   *   If `template` is a function, it will be called with the following parameters:
	   *
	   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
	   *     applying the current state
	   *
	   * <pre>template:
	   *   "<h1>inline template definition</h1>" +
	   *   "<div ui-view></div>"</pre>
	   * <pre>template: function(params) {
	   *       return "<h1>generated template</h1>"; }</pre>
	   * </div>
	   *
	   * @param {string|function=} stateConfig.templateUrl
	   * <a id='templateUrl'></a>
	   *
	   *   path or function that returns a path to an html
	   *   template that should be used by uiView.
	   *   
	   *   If `templateUrl` is a function, it will be called with the following parameters:
	   *
	   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
	   *     applying the current state
	   *
	   * <pre>templateUrl: "home.html"</pre>
	   * <pre>templateUrl: function(params) {
	   *     return myTemplates[params.pageId]; }</pre>
	   *
	   * @param {function=} stateConfig.templateProvider
	   * <a id='templateProvider'></a>
	   *    Provider function that returns HTML content string.
	   * <pre> templateProvider:
	   *       function(MyTemplateService, params) {
	   *         return MyTemplateService.getTemplate(params.pageId);
	   *       }</pre>
	   *
	   * @param {string|function=} stateConfig.controller
	   * <a id='controller'></a>
	   *
	   *  Controller fn that should be associated with newly
	   *   related scope or the name of a registered controller if passed as a string.
	   *   Optionally, the ControllerAs may be declared here.
	   * <pre>controller: "MyRegisteredController"</pre>
	   * <pre>controller:
	   *     "MyRegisteredController as fooCtrl"}</pre>
	   * <pre>controller: function($scope, MyService) {
	   *     $scope.data = MyService.getData(); }</pre>
	   *
	   * @param {function=} stateConfig.controllerProvider
	   * <a id='controllerProvider'></a>
	   *
	   * Injectable provider function that returns the actual controller or string.
	   * <pre>controllerProvider:
	   *   function(MyResolveData) {
	   *     if (MyResolveData.foo)
	   *       return "FooCtrl"
	   *     else if (MyResolveData.bar)
	   *       return "BarCtrl";
	   *     else return function($scope) {
	   *       $scope.baz = "Qux";
	   *     }
	   *   }</pre>
	   *
	   * @param {string=} stateConfig.controllerAs
	   * <a id='controllerAs'></a>
	   * 
	   * A controller alias name. If present the controller will be
	   *   published to scope under the controllerAs name.
	   * <pre>controllerAs: "myCtrl"</pre>
	   *
	   * @param {string|object=} stateConfig.parent
	   * <a id='parent'></a>
	   * Optionally specifies the parent state of this state.
	   *
	   * <pre>parent: 'parentState'</pre>
	   * <pre>parent: parentState // JS variable</pre>
	   *
	   * @param {object=} stateConfig.resolve
	   * <a id='resolve'></a>
	   *
	   * An optional map&lt;string, function&gt; of dependencies which
	   *   should be injected into the controller. If any of these dependencies are promises, 
	   *   the router will wait for them all to be resolved before the controller is instantiated.
	   *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
	   *   and the values of the resolved promises are injected into any controllers that reference them.
	   *   If any  of the promises are rejected the $stateChangeError event is fired.
	   *
	   *   The map object is:
	   *   
	   *   - key - {string}: name of dependency to be injected into controller
	   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
	   *     it is injected and return value it treated as dependency. If result is a promise, it is 
	   *     resolved before its value is injected into controller.
	   *
	   * <pre>resolve: {
	   *     myResolve1:
	   *       function($http, $stateParams) {
	   *         return $http.get("/api/foos/"+stateParams.fooID);
	   *       }
	   *     }</pre>
	   *
	   * @param {string=} stateConfig.url
	   * <a id='url'></a>
	   *
	   *   A url fragment with optional parameters. When a state is navigated or
	   *   transitioned to, the `$stateParams` service will be populated with any 
	   *   parameters that were passed.
	   *
	   *   (See {@link ui.router.util.type:UrlMatcher UrlMatcher} `UrlMatcher`} for
	   *   more details on acceptable patterns )
	   *
	   * examples:
	   * <pre>url: "/home"
	   * url: "/users/:userid"
	   * url: "/books/{bookid:[a-zA-Z_-]}"
	   * url: "/books/{categoryid:int}"
	   * url: "/books/{publishername:string}/{categoryid:int}"
	   * url: "/messages?before&after"
	   * url: "/messages?{before:date}&{after:date}"
	   * url: "/messages/:mailboxid?{before:date}&{after:date}"
	   * </pre>
	   *
	   * @param {object=} stateConfig.views
	   * <a id='views'></a>
	   * an optional map&lt;string, object&gt; which defined multiple views, or targets views
	   * manually/explicitly.
	   *
	   * Examples:
	   *
	   * Targets three named `ui-view`s in the parent state's template
	   * <pre>views: {
	   *     header: {
	   *       controller: "headerCtrl",
	   *       templateUrl: "header.html"
	   *     }, body: {
	   *       controller: "bodyCtrl",
	   *       templateUrl: "body.html"
	   *     }, footer: {
	   *       controller: "footCtrl",
	   *       templateUrl: "footer.html"
	   *     }
	   *   }</pre>
	   *
	   * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
	   * <pre>views: {
	   *     'header@top': {
	   *       controller: "msgHeaderCtrl",
	   *       templateUrl: "msgHeader.html"
	   *     }, 'body': {
	   *       controller: "messagesCtrl",
	   *       templateUrl: "messages.html"
	   *     }
	   *   }</pre>
	   *
	   * @param {boolean=} [stateConfig.abstract=false]
	   * <a id='abstract'></a>
	   * An abstract state will never be directly activated,
	   *   but can provide inherited properties to its common children states.
	   * <pre>abstract: true</pre>
	   *
	   * @param {function=} stateConfig.onEnter
	   * <a id='onEnter'></a>
	   *
	   * Callback function for when a state is entered. Good way
	   *   to trigger an action or dispatch an event, such as opening a dialog.
	   * If minifying your scripts, make sure to explicitly annotate this function,
	   * because it won't be automatically annotated by your build tools.
	   *
	   * <pre>onEnter: function(MyService, $stateParams) {
	   *     MyService.foo($stateParams.myParam);
	   * }</pre>
	   *
	   * @param {function=} stateConfig.onExit
	   * <a id='onExit'></a>
	   *
	   * Callback function for when a state is exited. Good way to
	   *   trigger an action or dispatch an event, such as opening a dialog.
	   * If minifying your scripts, make sure to explicitly annotate this function,
	   * because it won't be automatically annotated by your build tools.
	   *
	   * <pre>onExit: function(MyService, $stateParams) {
	   *     MyService.cleanup($stateParams.myParam);
	   * }</pre>
	   *
	   * @param {boolean=} [stateConfig.reloadOnSearch=true]
	   * <a id='reloadOnSearch'></a>
	   *
	   * If `false`, will not retrigger the same state
	   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
	   *   Useful for when you'd like to modify $location.search() without triggering a reload.
	   * <pre>reloadOnSearch: false</pre>
	   *
	   * @param {object=} stateConfig.data
	   * <a id='data'></a>
	   *
	   * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
	   *   prototypally inherited.  In other words, adding a data property to a state adds it to
	   *   the entire subtree via prototypal inheritance.
	   *
	   * <pre>data: {
	   *     requiredRole: 'foo'
	   * } </pre>
	   *
	   * @param {object=} stateConfig.params
	   * <a id='params'></a>
	   *
	   * A map which optionally configures parameters declared in the `url`, or
	   *   defines additional non-url parameters.  For each parameter being
	   *   configured, add a configuration object keyed to the name of the parameter.
	   *
	   *   Each parameter configuration object may contain the following properties:
	   *
	   *   - ** value ** - {object|function=}: specifies the default value for this
	   *     parameter.  This implicitly sets this parameter as optional.
	   *
	   *     When UI-Router routes to a state and no value is
	   *     specified for this parameter in the URL or transition, the
	   *     default value will be used instead.  If `value` is a function,
	   *     it will be injected and invoked, and the return value used.
	   *
	   *     *Note*: `undefined` is treated as "no default value" while `null`
	   *     is treated as "the default value is `null`".
	   *
	   *     *Shorthand*: If you only need to configure the default value of the
	   *     parameter, you may use a shorthand syntax.   In the **`params`**
	   *     map, instead mapping the param name to a full parameter configuration
	   *     object, simply set map it to the default parameter value, e.g.:
	   *
	   * <pre>// define a parameter's default value
	   * params: {
	   *     param1: { value: "defaultValue" }
	   * }
	   * // shorthand default values
	   * params: {
	   *     param1: "defaultValue",
	   *     param2: "param2Default"
	   * }</pre>
	   *
	   *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
	   *     treated as an array of values.  If you specified a Type, the value will be
	   *     treated as an array of the specified Type.  Note: query parameter values
	   *     default to a special `"auto"` mode.
	   *
	   *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
	   *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
	   *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
	   *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
	   *     value (e.g.: `{ foo: '1' }`).
	   *
	   * <pre>params: {
	   *     param1: { array: true }
	   * }</pre>
	   *
	   *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
	   *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
	   *     configured default squash policy.
	   *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
	   *
	   *   There are three squash settings:
	   *
	   *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
	   *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
	   *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
	   *       This can allow for cleaner looking URLs.
	   *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
	   *
	   * <pre>params: {
	   *     param1: {
	   *       value: "defaultId",
	   *       squash: true
	   * } }
	   * // squash "defaultValue" to "~"
	   * params: {
	   *     param1: {
	   *       value: "defaultValue",
	   *       squash: "~"
	   * } }
	   * </pre>
	   *
	   *
	   * @example
	   * <pre>
	   * // Some state name examples
	   *
	   * // stateName can be a single top-level name (must be unique).
	   * $stateProvider.state("home", {});
	   *
	   * // Or it can be a nested state name. This state is a child of the
	   * // above "home" state.
	   * $stateProvider.state("home.newest", {});
	   *
	   * // Nest states as deeply as needed.
	   * $stateProvider.state("home.newest.abc.xyz.inception", {});
	   *
	   * // state() returns $stateProvider, so you can chain state declarations.
	   * $stateProvider
	   *   .state("home", {})
	   *   .state("about", {})
	   *   .state("contacts", {});
	   * </pre>
	   *
	   */
	  this.state = state;
	  function state(name, definition) {
	    /*jshint validthis: true */
	    if (isObject(name)) definition = name;
	    else definition.name = name;
	    registerState(definition);
	    return this;
	  }

	  /**
	   * @ngdoc object
	   * @name ui.router.state.$state
	   *
	   * @requires $rootScope
	   * @requires $q
	   * @requires ui.router.state.$view
	   * @requires $injector
	   * @requires ui.router.util.$resolve
	   * @requires ui.router.state.$stateParams
	   * @requires ui.router.router.$urlRouter
	   *
	   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
	   * you'd like to test against the current active state.
	   * @property {object} current A reference to the state's config object. However 
	   * you passed it in. Useful for accessing custom data.
	   * @property {object} transition Currently pending transition. A promise that'll 
	   * resolve or reject.
	   *
	   * @description
	   * `$state` service is responsible for representing states as well as transitioning
	   * between them. It also provides interfaces to ask for current state or even states
	   * you're coming from.
	   */
	  this.$get = $get;
	  $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$urlRouter', '$location', '$urlMatcherFactory'];
	  function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $urlRouter,   $location,   $urlMatcherFactory) {

	    var TransitionSupersededError = new Error('transition superseded');

	    var TransitionSuperseded = silenceUncaughtInPromise($q.reject(TransitionSupersededError));
	    var TransitionPrevented = silenceUncaughtInPromise($q.reject(new Error('transition prevented')));
	    var TransitionAborted = silenceUncaughtInPromise($q.reject(new Error('transition aborted')));
	    var TransitionFailed = silenceUncaughtInPromise($q.reject(new Error('transition failed')));

	    // Handles the case where a state which is the target of a transition is not found, and the user
	    // can optionally retry or defer the transition
	    function handleRedirect(redirect, state, params, options) {
	      /**
	       * @ngdoc event
	       * @name ui.router.state.$state#$stateNotFound
	       * @eventOf ui.router.state.$state
	       * @eventType broadcast on root scope
	       * @description
	       * Fired when a requested state **cannot be found** using the provided state name during transition.
	       * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
	       * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
	       * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
	       * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
	       *
	       * @param {Object} event Event object.
	       * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
	       * @param {State} fromState Current state object.
	       * @param {Object} fromParams Current state params.
	       *
	       * @example
	       *
	       * <pre>
	       * // somewhere, assume lazy.state has not been defined
	       * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
	       *
	       * // somewhere else
	       * $scope.$on('$stateNotFound',
	       * function(event, unfoundState, fromState, fromParams){
	       *     console.log(unfoundState.to); // "lazy.state"
	       *     console.log(unfoundState.toParams); // {a:1, b:2}
	       *     console.log(unfoundState.options); // {inherit:false} + default options
	       * })
	       * </pre>
	       */
	      var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);

	      if (evt.defaultPrevented) {
	        $urlRouter.update();
	        return TransitionAborted;
	      }

	      if (!evt.retry) {
	        return null;
	      }

	      // Allow the handler to return a promise to defer state lookup retry
	      if (options.$retry) {
	        $urlRouter.update();
	        return TransitionFailed;
	      }
	      var retryTransition = $state.transition = $q.when(evt.retry);

	      retryTransition.then(function() {
	        if (retryTransition !== $state.transition) {
	          $rootScope.$broadcast('$stateChangeCancel', redirect.to, redirect.toParams, state, params);
	          return TransitionSuperseded;
	        }
	        redirect.options.$retry = true;
	        return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
	      }, function() {
	        return TransitionAborted;
	      });
	      $urlRouter.update();

	      return retryTransition;
	    }

	    root.locals = { resolve: null, globals: { $stateParams: {} } };

	    $state = {
	      params: {},
	      current: root.self,
	      $current: root,
	      transition: null
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#reload
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A method that force reloads the current state. All resolves are re-resolved,
	     * controllers reinstantiated, and events re-fired.
	     *
	     * @example
	     * <pre>
	     * var app angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.reload = function(){
	     *     $state.reload();
	     *   }
	     * });
	     * </pre>
	     *
	     * `reload()` is just an alias for:
	     * <pre>
	     * $state.transitionTo($state.current, $stateParams, { 
	     *   reload: true, inherit: false, notify: true
	     * });
	     * </pre>
	     *
	     * @param {string=|object=} state - A state name or a state object, which is the root of the resolves to be re-resolved.
	     * @example
	     * <pre>
	     * //assuming app application consists of 3 states: 'contacts', 'contacts.detail', 'contacts.detail.item' 
	     * //and current state is 'contacts.detail.item'
	     * var app angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.reload = function(){
	     *     //will reload 'contact.detail' and 'contact.detail.item' states
	     *     $state.reload('contact.detail');
	     *   }
	     * });
	     * </pre>
	     *
	     * `reload()` is just an alias for:
	     * <pre>
	     * $state.transitionTo($state.current, $stateParams, { 
	     *   reload: true, inherit: false, notify: true
	     * });
	     * </pre>

	     * @returns {promise} A promise representing the state of the new transition. See
	     * {@link ui.router.state.$state#methods_go $state.go}.
	     */
	    $state.reload = function reload(state) {
	      return $state.transitionTo($state.current, $stateParams, { reload: state || true, inherit: false, notify: true});
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#go
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Convenience method for transitioning to a new state. `$state.go` calls 
	     * `$state.transitionTo` internally but automatically sets options to 
	     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
	     * This allows you to easily use an absolute or relative to path and specify 
	     * only the parameters you'd like to update (while letting unspecified parameters 
	     * inherit from the currently active ancestor states).
	     *
	     * @example
	     * <pre>
	     * var app = angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.changeState = function () {
	     *     $state.go('contact.detail');
	     *   };
	     * });
	     * </pre>
	     * <img src='../ngdoc_assets/StateGoExamples.png'/>
	     *
	     * @param {string} to Absolute state name or relative state path. Some examples:
	     *
	     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
	     * - `$state.go('^')` - will go to a parent state
	     * - `$state.go('^.sibling')` - will go to a sibling state
	     * - `$state.go('.child.grandchild')` - will go to grandchild state
	     *
	     * @param {object=} params A map of the parameters that will be sent to the state, 
	     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
	     * defined parameters. Only parameters specified in the state definition can be overridden, new 
	     * parameters will be ignored. This allows, for example, going to a sibling state that shares parameters
	     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
	     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
	     * will get you all current parameters, etc.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
	     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
	     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
	     * - **`reload`** (v0.2.5) - {boolean=false|string|object}, If `true` will force transition even if no state or params
	     *    have changed.  It will reload the resolves and views of the current state and parent states.
	     *    If `reload` is a string (or state object), the state object is fetched (by name, or object reference); and \
	     *    the transition reloads the resolves and views for that matched state, and all its children states.
	     *
	     * @returns {promise} A promise representing the state of the new transition.
	     *
	     * Possible success values:
	     *
	     * - $state.current
	     *
	     * <br/>Possible rejection values:
	     *
	     * - 'transition superseded' - when a newer transition has been started after this one
	     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
	     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
	     *   when a `$stateNotFound` `event.retry` promise errors.
	     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
	     * - *resolve error* - when an error has occurred with a `resolve`
	     *
	     */
	    $state.go = function go(to, params, options) {
	      return $state.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#transitionTo
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
	     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
	     *
	     * @example
	     * <pre>
	     * var app = angular.module('app', ['ui.router']);
	     *
	     * app.controller('ctrl', function ($scope, $state) {
	     *   $scope.changeState = function () {
	     *     $state.transitionTo('contact.detail');
	     *   };
	     * });
	     * </pre>
	     *
	     * @param {string} to State name.
	     * @param {object=} toParams A map of the parameters that will be sent to the state,
	     * will populate $stateParams.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
	     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
	     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
	     * - **`reload`** (v0.2.5) - {boolean=false|string=|object=}, If `true` will force transition even if the state or params 
	     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
	     *    use this when you want to force a reload when *everything* is the same, including search params.
	     *    if String, then will reload the state with the name given in reload, and any children.
	     *    if Object, then a stateObj is expected, will reload the state found in stateObj, and any children.
	     *
	     * @returns {promise} A promise representing the state of the new transition. See
	     * {@link ui.router.state.$state#methods_go $state.go}.
	     */
	    $state.transitionTo = function transitionTo(to, toParams, options) {
	      toParams = toParams || {};
	      options = extend({
	        location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
	      }, options || {});

	      var from = $state.$current, fromParams = $state.params, fromPath = from.path;
	      var evt, toState = findState(to, options.relative);

	      // Store the hash param for later (since it will be stripped out by various methods)
	      var hash = toParams['#'];

	      if (!isDefined(toState)) {
	        var redirect = { to: to, toParams: toParams, options: options };
	        var redirectResult = handleRedirect(redirect, from.self, fromParams, options);

	        if (redirectResult) {
	          return redirectResult;
	        }

	        // Always retry once if the $stateNotFound was not prevented
	        // (handles either redirect changed or state lazy-definition)
	        to = redirect.to;
	        toParams = redirect.toParams;
	        options = redirect.options;
	        toState = findState(to, options.relative);

	        if (!isDefined(toState)) {
	          if (!options.relative) throw new Error("No such state '" + to + "'");
	          throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
	        }
	      }
	      if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
	      if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
	      if (!toState.params.$$validates(toParams)) return TransitionFailed;

	      toParams = toState.params.$$values(toParams);
	      to = toState;

	      var toPath = to.path;

	      // Starting from the root of the path, keep all levels that haven't changed
	      var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];

	      if (!options.reload) {
	        while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
	          locals = toLocals[keep] = state.locals;
	          keep++;
	          state = toPath[keep];
	        }
	      } else if (isString(options.reload) || isObject(options.reload)) {
	        if (isObject(options.reload) && !options.reload.name) {
	          throw new Error('Invalid reload state object');
	        }
	        
	        var reloadState = options.reload === true ? fromPath[0] : findState(options.reload);
	        if (options.reload && !reloadState) {
	          throw new Error("No such reload state '" + (isString(options.reload) ? options.reload : options.reload.name) + "'");
	        }

	        while (state && state === fromPath[keep] && state !== reloadState) {
	          locals = toLocals[keep] = state.locals;
	          keep++;
	          state = toPath[keep];
	        }
	      }

	      // If we're going to the same state and all locals are kept, we've got nothing to do.
	      // But clear 'transition', as we still want to cancel any other pending transitions.
	      // TODO: We may not want to bump 'transition' if we're called from a location change
	      // that we've initiated ourselves, because we might accidentally abort a legitimate
	      // transition initiated from code?
	      if (shouldSkipReload(to, toParams, from, fromParams, locals, options)) {
	        if (hash) toParams['#'] = hash;
	        $state.params = toParams;
	        copy($state.params, $stateParams);
	        copy(filterByKeys(to.params.$$keys(), $stateParams), to.locals.globals.$stateParams);
	        if (options.location && to.navigable && to.navigable.url) {
	          $urlRouter.push(to.navigable.url, toParams, {
	            $$avoidResync: true, replace: options.location === 'replace'
	          });
	          $urlRouter.update(true);
	        }
	        $state.transition = null;
	        return $q.when($state.current);
	      }

	      // Filter parameters before we pass them to event handlers etc.
	      toParams = filterByKeys(to.params.$$keys(), toParams || {});
	      
	      // Re-add the saved hash before we start returning things or broadcasting $stateChangeStart
	      if (hash) toParams['#'] = hash;
	      
	      // Broadcast start event and cancel the transition if requested
	      if (options.notify) {
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeStart
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired when the state transition **begins**. You can use `event.preventDefault()`
	         * to prevent the transition from happening and then the transition promise will be
	         * rejected with a `'transition prevented'` value.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         *
	         * @example
	         *
	         * <pre>
	         * $rootScope.$on('$stateChangeStart',
	         * function(event, toState, toParams, fromState, fromParams){
	         *     event.preventDefault();
	         *     // transitionTo() promise will be rejected with
	         *     // a 'transition prevented' error
	         * })
	         * </pre>
	         */
	        if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams, options).defaultPrevented) {
	          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
	          //Don't update and resync url if there's been a new transition started. see issue #2238, #600
	          if ($state.transition == null) $urlRouter.update();
	          return TransitionPrevented;
	        }
	      }

	      // Resolve locals for the remaining states, but don't update any global state just
	      // yet -- if anything fails to resolve the current state needs to remain untouched.
	      // We also set up an inheritance chain for the locals here. This allows the view directive
	      // to quickly look up the correct definition for each view in the current state. Even
	      // though we create the locals object itself outside resolveState(), it is initially
	      // empty and gets filled asynchronously. We need to keep track of the promise for the
	      // (fully resolved) current locals, and pass this down the chain.
	      var resolved = $q.when(locals);

	      for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
	        locals = toLocals[l] = inherit(locals);
	        resolved = resolveState(state, toParams, state === to, resolved, locals, options);
	      }

	      // Once everything is resolved, we are ready to perform the actual transition
	      // and return a promise for the new state. We also keep track of what the
	      // current promise is, so that we can detect overlapping transitions and
	      // keep only the outcome of the last transition.
	      var transition = $state.transition = resolved.then(function () {
	        var l, entering, exiting;

	        if ($state.transition !== transition) {
	          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
	          return TransitionSuperseded;
	        }

	        // Exit 'from' states not kept
	        for (l = fromPath.length - 1; l >= keep; l--) {
	          exiting = fromPath[l];
	          if (exiting.self.onExit) {
	            $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
	          }
	          exiting.locals = null;
	        }

	        // Enter 'to' states not kept
	        for (l = keep; l < toPath.length; l++) {
	          entering = toPath[l];
	          entering.locals = toLocals[l];
	          if (entering.self.onEnter) {
	            $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
	          }
	        }

	        // Run it again, to catch any transitions in callbacks
	        if ($state.transition !== transition) {
	          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
	          return TransitionSuperseded;
	        }

	        // Update globals in $state
	        $state.$current = to;
	        $state.current = to.self;
	        $state.params = toParams;
	        copy($state.params, $stateParams);
	        $state.transition = null;

	        if (options.location && to.navigable) {
	          $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
	            $$avoidResync: true, replace: options.location === 'replace'
	          });
	        }

	        if (options.notify) {
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeSuccess
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired once the state transition is **complete**.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         */
	          $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
	        }
	        $urlRouter.update(true);

	        return $state.current;
	      }).then(null, function (error) {
	        // propagate TransitionSuperseded error without emitting $stateChangeCancel
	        // as it was already emitted in the success handler above
	        if (error === TransitionSupersededError) return TransitionSuperseded;

	        if ($state.transition !== transition) {
	          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
	          return TransitionSuperseded;
	        }

	        $state.transition = null;
	        /**
	         * @ngdoc event
	         * @name ui.router.state.$state#$stateChangeError
	         * @eventOf ui.router.state.$state
	         * @eventType broadcast on root scope
	         * @description
	         * Fired when an **error occurs** during transition. It's important to note that if you
	         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
	         * they will not throw traditionally. You must listen for this $stateChangeError event to
	         * catch **ALL** errors.
	         *
	         * @param {Object} event Event object.
	         * @param {State} toState The state being transitioned to.
	         * @param {Object} toParams The params supplied to the `toState`.
	         * @param {State} fromState The current state, pre-transition.
	         * @param {Object} fromParams The params supplied to the `fromState`.
	         * @param {Error} error The resolve error object.
	         */
	        evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

	        if (!evt.defaultPrevented) {
	          $urlRouter.update();
	        }

	        return $q.reject(error);
	      });

	      silenceUncaughtInPromise(transition);
	      return transition;
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#is
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
	     * but only checks for the full state name. If params is supplied then it will be
	     * tested for strict equality against the current active params object, so all params
	     * must match with none missing and no extras.
	     *
	     * @example
	     * <pre>
	     * $state.$current.name = 'contacts.details.item';
	     *
	     * // absolute name
	     * $state.is('contact.details.item'); // returns true
	     * $state.is(contactDetailItemStateObject); // returns true
	     *
	     * // relative name (. and ^), typically from a template
	     * // E.g. from the 'contacts.details' template
	     * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
	     * </pre>
	     *
	     * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
	     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
	     * to test against the current active state.
	     * @param {object=} options An options object.  The options are:
	     *
	     * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
	     * test relative to `options.relative` state (or name).
	     *
	     * @returns {boolean} Returns true if it is the state.
	     */
	    $state.is = function is(stateOrName, params, options) {
	      options = extend({ relative: $state.$current }, options || {});
	      var state = findState(stateOrName, options.relative);

	      if (!isDefined(state)) { return undefined; }
	      if ($state.$current !== state) { return false; }

	      return !params || objectKeys(params).reduce(function(acc, key) {
	        var paramDef = state.params[key];
	        return acc && (!paramDef || paramDef.type.equals($stateParams[key], params[key]));
	      }, true);
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#includes
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A method to determine if the current active state is equal to or is the child of the
	     * state stateName. If any params are passed then they will be tested for a match as well.
	     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
	     *
	     * @example
	     * Partial and relative names
	     * <pre>
	     * $state.$current.name = 'contacts.details.item';
	     *
	     * // Using partial names
	     * $state.includes("contacts"); // returns true
	     * $state.includes("contacts.details"); // returns true
	     * $state.includes("contacts.details.item"); // returns true
	     * $state.includes("contacts.list"); // returns false
	     * $state.includes("about"); // returns false
	     *
	     * // Using relative names (. and ^), typically from a template
	     * // E.g. from the 'contacts.details' template
	     * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
	     * </pre>
	     *
	     * Basic globbing patterns
	     * <pre>
	     * $state.$current.name = 'contacts.details.item.url';
	     *
	     * $state.includes("*.details.*.*"); // returns true
	     * $state.includes("*.details.**"); // returns true
	     * $state.includes("**.item.**"); // returns true
	     * $state.includes("*.details.item.url"); // returns true
	     * $state.includes("*.details.*.url"); // returns true
	     * $state.includes("*.details.*"); // returns false
	     * $state.includes("item.**"); // returns false
	     * </pre>
	     *
	     * @param {string} stateOrName A partial name, relative name, or glob pattern
	     * to be searched for within the current state name.
	     * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
	     * that you'd like to test against the current active state.
	     * @param {object=} options An options object.  The options are:
	     *
	     * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
	     * .includes will test relative to `options.relative` state (or name).
	     *
	     * @returns {boolean} Returns true if it does include the state
	     */
	    $state.includes = function includes(stateOrName, params, options) {
	      options = extend({ relative: $state.$current }, options || {});
	      if (isString(stateOrName) && isGlob(stateOrName)) {
	        if (!doesStateMatchGlob(stateOrName)) {
	          return false;
	        }
	        stateOrName = $state.$current.name;
	      }

	      var state = findState(stateOrName, options.relative);
	      if (!isDefined(state)) { return undefined; }
	      if (!isDefined($state.$current.includes[state.name])) { return false; }
	      if (!params) { return true; }

	      var keys = objectKeys(params);
	      for (var i = 0; i < keys.length; i++) {
	        var key = keys[i], paramDef = state.params[key];
	        if (paramDef && !paramDef.type.equals($stateParams[key], params[key])) {
	          return false;
	        }
	      }

	      return objectKeys(params).reduce(function(acc, key) {
	        var paramDef = state.params[key];
	        return acc && !paramDef || paramDef.type.equals($stateParams[key], params[key]);
	      }, true);
	    };


	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#href
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * A url generation method that returns the compiled url for the given state populated with the given params.
	     *
	     * @example
	     * <pre>
	     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
	     * </pre>
	     *
	     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
	     * @param {object=} params An object of parameter values to fill the state's required parameters.
	     * @param {object=} options Options object. The options are:
	     *
	     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
	     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
	     *    ancestor with a valid url).
	     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
	     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
	     *    defines which state to be relative from.
	     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
	     * 
	     * @returns {string} compiled state url
	     */
	    $state.href = function href(stateOrName, params, options) {
	      options = extend({
	        lossy:    true,
	        inherit:  true,
	        absolute: false,
	        relative: $state.$current
	      }, options || {});

	      var state = findState(stateOrName, options.relative);

	      if (!isDefined(state)) return null;
	      if (options.inherit) params = inheritParams($stateParams, params || {}, $state.$current, state);
	      
	      var nav = (state && options.lossy) ? state.navigable : state;

	      if (!nav || nav.url === undefined || nav.url === null) {
	        return null;
	      }
	      return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys().concat('#'), params || {}), {
	        absolute: options.absolute
	      });
	    };

	    /**
	     * @ngdoc function
	     * @name ui.router.state.$state#get
	     * @methodOf ui.router.state.$state
	     *
	     * @description
	     * Returns the state configuration object for any specific state or all states.
	     *
	     * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
	     * the requested state. If not provided, returns an array of ALL state configs.
	     * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
	     * @returns {Object|Array} State configuration object or array of all objects.
	     */
	    $state.get = function (stateOrName, context) {
	      if (arguments.length === 0) return map(objectKeys(states), function(name) { return states[name].self; });
	      var state = findState(stateOrName, context || $state.$current);
	      return (state && state.self) ? state.self : null;
	    };

	    function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
	      // Make a restricted $stateParams with only the parameters that apply to this state if
	      // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
	      // we also need $stateParams to be available for any $injector calls we make during the
	      // dependency resolution process.
	      var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params.$$keys(), params);
	      var locals = { $stateParams: $stateParams };

	      // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
	      // We're also including $stateParams in this; that way the parameters are restricted
	      // to the set that should be visible to the state, and are independent of when we update
	      // the global $state and $stateParams values.
	      dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
	      var promises = [dst.resolve.then(function (globals) {
	        dst.globals = globals;
	      })];
	      if (inherited) promises.push(inherited);

	      function resolveViews() {
	        var viewsPromises = [];

	        // Resolve template and dependencies for all views.
	        forEach(state.views, function (view, name) {
	          var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
	          injectables.$template = [ function () {
	            return $view.load(name, { view: view, locals: dst.globals, params: $stateParams, notify: options.notify }) || '';
	          }];

	          viewsPromises.push($resolve.resolve(injectables, dst.globals, dst.resolve, state).then(function (result) {
	            // References to the controller (only instantiated at link time)
	            if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
	              var injectLocals = angular.extend({}, injectables, dst.globals);
	              result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
	            } else {
	              result.$$controller = view.controller;
	            }
	            // Provide access to the state itself for internal use
	            result.$$state = state;
	            result.$$controllerAs = view.controllerAs;
	            result.$$resolveAs = view.resolveAs;
	            dst[name] = result;
	          }));
	        });

	        return $q.all(viewsPromises).then(function(){
	          return dst.globals;
	        });
	      }

	      // Wait for all the promises and then return the activation object
	      return $q.all(promises).then(resolveViews).then(function (values) {
	        return dst;
	      });
	    }

	    return $state;
	  }

	  function shouldSkipReload(to, toParams, from, fromParams, locals, options) {
	    // Return true if there are no differences in non-search (path/object) params, false if there are differences
	    function nonSearchParamsEqual(fromAndToState, fromParams, toParams) {
	      // Identify whether all the parameters that differ between `fromParams` and `toParams` were search params.
	      function notSearchParam(key) {
	        return fromAndToState.params[key].location != "search";
	      }
	      var nonQueryParamKeys = fromAndToState.params.$$keys().filter(notSearchParam);
	      var nonQueryParams = pick.apply({}, [fromAndToState.params].concat(nonQueryParamKeys));
	      var nonQueryParamSet = new $$UMFP.ParamSet(nonQueryParams);
	      return nonQueryParamSet.$$equals(fromParams, toParams);
	    }

	    // If reload was not explicitly requested
	    // and we're transitioning to the same state we're already in
	    // and    the locals didn't change
	    //     or they changed in a way that doesn't merit reloading
	    //        (reloadOnParams:false, or reloadOnSearch.false and only search params changed)
	    // Then return true.
	    if (!options.reload && to === from &&
	      (locals === from.locals || (to.self.reloadOnSearch === false && nonSearchParamsEqual(from, fromParams, toParams)))) {
	      return true;
	    }
	  }
	}

	angular.module('ui.router.state')
	  .factory('$stateParams', function () { return {}; })
	  .constant("$state.runtime", { autoinject: true })
	  .provider('$state', $StateProvider)
	  // Inject $state to initialize when entering runtime. #2574
	  .run(['$injector', function ($injector) {
	    // Allow tests (stateSpec.js) to turn this off by defining this constant
	    if ($injector.get("$state.runtime").autoinject) {
	      $injector.get('$state');
	    }
	  }]);


	$ViewProvider.$inject = [];
	function $ViewProvider() {

	  this.$get = $get;
	  /**
	   * @ngdoc object
	   * @name ui.router.state.$view
	   *
	   * @requires ui.router.util.$templateFactory
	   * @requires $rootScope
	   *
	   * @description
	   *
	   */
	  $get.$inject = ['$rootScope', '$templateFactory'];
	  function $get(   $rootScope,   $templateFactory) {
	    return {
	      // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
	      /**
	       * @ngdoc function
	       * @name ui.router.state.$view#load
	       * @methodOf ui.router.state.$view
	       *
	       * @description
	       *
	       * @param {string} name name
	       * @param {object} options option object.
	       */
	      load: function load(name, options) {
	        var result, defaults = {
	          template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
	        };
	        options = extend(defaults, options);

	        if (options.view) {
	          result = $templateFactory.fromConfig(options.view, options.params, options.locals);
	        }
	        return result;
	      }
	    };
	  }
	}

	angular.module('ui.router.state').provider('$view', $ViewProvider);

	/**
	 * @ngdoc object
	 * @name ui.router.state.$uiViewScrollProvider
	 *
	 * @description
	 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
	 */
	function $ViewScrollProvider() {

	  var useAnchorScroll = false;

	  /**
	   * @ngdoc function
	   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
	   * @methodOf ui.router.state.$uiViewScrollProvider
	   *
	   * @description
	   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
	   * scrolling based on the url anchor.
	   */
	  this.useAnchorScroll = function () {
	    useAnchorScroll = true;
	  };

	  /**
	   * @ngdoc object
	   * @name ui.router.state.$uiViewScroll
	   *
	   * @requires $anchorScroll
	   * @requires $timeout
	   *
	   * @description
	   * When called with a jqLite element, it scrolls the element into view (after a
	   * `$timeout` so the DOM has time to refresh).
	   *
	   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
	   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
	   */
	  this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
	    if (useAnchorScroll) {
	      return $anchorScroll;
	    }

	    return function ($element) {
	      return $timeout(function () {
	        $element[0].scrollIntoView();
	      }, 0, false);
	    };
	  }];
	}

	angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-view
	 *
	 * @requires ui.router.state.$state
	 * @requires $compile
	 * @requires $controller
	 * @requires $injector
	 * @requires ui.router.state.$uiViewScroll
	 * @requires $document
	 *
	 * @restrict ECA
	 *
	 * @description
	 * The ui-view directive tells $state where to place your templates.
	 *
	 * @param {string=} name A view name. The name should be unique amongst the other views in the
	 * same state. You can have views of the same name that live in different states.
	 *
	 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
	 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
	 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
	 * scroll ui-view elements into view when they are populated during a state activation.
	 *
	 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
	 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
	 *
	 * @param {string=} onload Expression to evaluate whenever the view updates.
	 *
	 * @example
	 * A view can be unnamed or named.
	 * <pre>
	 * <!-- Unnamed -->
	 * <div ui-view></div>
	 *
	 * <!-- Named -->
	 * <div ui-view="viewName"></div>
	 * </pre>
	 *
	 * You can only have one unnamed view within any template (or root html). If you are only using a
	 * single view and it is unnamed then you can populate it like so:
	 * <pre>
	 * <div ui-view></div>
	 * $stateProvider.state("home", {
	 *   template: "<h1>HELLO!</h1>"
	 * })
	 * </pre>
	 *
	 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#methods_state `views`}
	 * config property, by name, in this case an empty name:
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "": {
	 *       template: "<h1>HELLO!</h1>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * But typically you'll only use the views property if you name your view or have more than one view
	 * in the same template. There's not really a compelling reason to name a view if its the only one,
	 * but you could if you wanted, like so:
	 * <pre>
	 * <div ui-view="main"></div>
	 * </pre>
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "main": {
	 *       template: "<h1>HELLO!</h1>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * Really though, you'll use views to set up multiple views:
	 * <pre>
	 * <div ui-view></div>
	 * <div ui-view="chart"></div>
	 * <div ui-view="data"></div>
	 * </pre>
	 *
	 * <pre>
	 * $stateProvider.state("home", {
	 *   views: {
	 *     "": {
	 *       template: "<h1>HELLO!</h1>"
	 *     },
	 *     "chart": {
	 *       template: "<chart_thing/>"
	 *     },
	 *     "data": {
	 *       template: "<data_thing/>"
	 *     }
	 *   }    
	 * })
	 * </pre>
	 *
	 * Examples for `autoscroll`:
	 *
	 * <pre>
	 * <!-- If autoscroll present with no expression,
	 *      then scroll ui-view into view -->
	 * <ui-view autoscroll/>
	 *
	 * <!-- If autoscroll present with valid expression,
	 *      then scroll ui-view into view if expression evaluates to true -->
	 * <ui-view autoscroll='true'/>
	 * <ui-view autoscroll='false'/>
	 * <ui-view autoscroll='scopeVariable'/>
	 * </pre>
	 *
	 * Resolve data:
	 *
	 * The resolved data from the state's `resolve` block is placed on the scope as `$resolve` (this
	 * can be customized using [[ViewDeclaration.resolveAs]]).  This can be then accessed from the template.
	 *
	 * Note that when `controllerAs` is being used, `$resolve` is set on the controller instance *after* the
	 * controller is instantiated.  The `$onInit()` hook can be used to perform initialization code which
	 * depends on `$resolve` data.
	 *
	 * Example usage of $resolve in a view template
	 * <pre>
	 * $stateProvider.state('home', {
	 *   template: '<my-component user="$resolve.user"></my-component>',
	 *   resolve: {
	 *     user: function(UserService) { return UserService.fetchUser(); }
	 *   }
	 * });
	 * </pre>
	 */
	$ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll', '$interpolate', '$q'];
	function $ViewDirective(   $state,   $injector,   $uiViewScroll,   $interpolate,   $q) {

	  function getService() {
	    return ($injector.has) ? function(service) {
	      return $injector.has(service) ? $injector.get(service) : null;
	    } : function(service) {
	      try {
	        return $injector.get(service);
	      } catch (e) {
	        return null;
	      }
	    };
	  }

	  var service = getService(),
	      $animator = service('$animator'),
	      $animate = service('$animate');

	  // Returns a set of DOM manipulation functions based on which Angular version
	  // it should use
	  function getRenderer(attrs, scope) {
	    var statics = function() {
	      return {
	        enter: function (element, target, cb) { target.after(element); cb(); },
	        leave: function (element, cb) { element.remove(); cb(); }
	      };
	    };

	    if ($animate) {
	      return {
	        enter: function(element, target, cb) {
	          if (angular.version.minor > 2) {
	            $animate.enter(element, null, target).then(cb);
	          } else {
	            $animate.enter(element, null, target, cb);
	          }
	        },
	        leave: function(element, cb) {
	          if (angular.version.minor > 2) {
	            $animate.leave(element).then(cb);
	          } else {
	            $animate.leave(element, cb);
	          }
	        }
	      };
	    }

	    if ($animator) {
	      var animate = $animator && $animator(scope, attrs);

	      return {
	        enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
	        leave: function(element, cb) { animate.leave(element); cb(); }
	      };
	    }

	    return statics();
	  }

	  var directive = {
	    restrict: 'ECA',
	    terminal: true,
	    priority: 400,
	    transclude: 'element',
	    compile: function (tElement, tAttrs, $transclude) {
	      return function (scope, $element, attrs) {
	        var previousEl, currentEl, currentScope, latestLocals,
	            onloadExp     = attrs.onload || '',
	            autoScrollExp = attrs.autoscroll,
	            renderer      = getRenderer(attrs, scope),
	            inherited     = $element.inheritedData('$uiView');

	        scope.$on('$stateChangeSuccess', function() {
	          updateView(false);
	        });

	        updateView(true);

	        function cleanupLastView() {
	          if (previousEl) {
	            previousEl.remove();
	            previousEl = null;
	          }

	          if (currentScope) {
	            currentScope.$destroy();
	            currentScope = null;
	          }

	          if (currentEl) {
	            var $uiViewData = currentEl.data('$uiViewAnim');
	            renderer.leave(currentEl, function() {
	              $uiViewData.$$animLeave.resolve();
	              previousEl = null;
	            });

	            previousEl = currentEl;
	            currentEl = null;
	          }
	        }

	        function updateView(firstTime) {
	          var newScope,
	              name            = getUiViewName(scope, attrs, $element, $interpolate),
	              previousLocals  = name && $state.$current && $state.$current.locals[name];

	          if (!firstTime && previousLocals === latestLocals) return; // nothing to do
	          newScope = scope.$new();
	          latestLocals = $state.$current.locals[name];

	          /**
	           * @ngdoc event
	           * @name ui.router.state.directive:ui-view#$viewContentLoading
	           * @eventOf ui.router.state.directive:ui-view
	           * @eventType emits on ui-view directive scope
	           * @description
	           *
	           * Fired once the view **begins loading**, *before* the DOM is rendered.
	           *
	           * @param {Object} event Event object.
	           * @param {string} viewName Name of the view.
	           */
	          newScope.$emit('$viewContentLoading', name);

	          var clone = $transclude(newScope, function(clone) {
	            var animEnter = $q.defer(), animLeave = $q.defer();
	            var viewAnimData = {
	              $animEnter: animEnter.promise,
	              $animLeave: animLeave.promise,
	              $$animLeave: animLeave
	            };

	            clone.data('$uiViewAnim', viewAnimData);
	            renderer.enter(clone, $element, function onUiViewEnter() {
	              animEnter.resolve();
	              if(currentScope) {
	                currentScope.$emit('$viewContentAnimationEnded');
	              }

	              if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
	                $uiViewScroll(clone);
	              }
	            });
	            cleanupLastView();
	          });

	          currentEl = clone;
	          currentScope = newScope;
	          /**
	           * @ngdoc event
	           * @name ui.router.state.directive:ui-view#$viewContentLoaded
	           * @eventOf ui.router.state.directive:ui-view
	           * @eventType emits on ui-view directive scope
	           * @description
	           * Fired once the view is **loaded**, *after* the DOM is rendered.
	           *
	           * @param {Object} event Event object.
	           * @param {string} viewName Name of the view.
	           */
	          currentScope.$emit('$viewContentLoaded', name);
	          currentScope.$eval(onloadExp);
	        }
	      };
	    }
	  };

	  return directive;
	}

	$ViewDirectiveFill.$inject = ['$compile', '$controller', '$state', '$interpolate'];
	function $ViewDirectiveFill (  $compile,   $controller,   $state,   $interpolate) {
	  return {
	    restrict: 'ECA',
	    priority: -400,
	    compile: function (tElement) {
	      var initial = tElement.html();
	      if (tElement.empty) {
	        tElement.empty();
	      } else {
	        // ng 1.0.0 doesn't have empty(), which cleans up data and handlers
	        tElement[0].innerHTML = null;
	      }

	      return function (scope, $element, attrs) {
	        var current = $state.$current,
	            name = getUiViewName(scope, attrs, $element, $interpolate),
	            locals  = current && current.locals[name];

	        if (! locals) {
	          $element.html(initial);
	          $compile($element.contents())(scope);
	          return;
	        }

	        $element.data('$uiView', { name: name, state: locals.$$state });
	        $element.html(locals.$template ? locals.$template : initial);

	        var resolveData = angular.extend({}, locals);
	        scope[locals.$$resolveAs] = resolveData;

	        var link = $compile($element.contents());

	        if (locals.$$controller) {
	          locals.$scope = scope;
	          locals.$element = $element;
	          var controller = $controller(locals.$$controller, locals);
	          if (locals.$$controllerAs) {
	            scope[locals.$$controllerAs] = controller;
	            scope[locals.$$controllerAs][locals.$$resolveAs] = resolveData;
	          }
	          if (isFunction(controller.$onInit)) controller.$onInit();
	          $element.data('$ngControllerController', controller);
	          $element.children().data('$ngControllerController', controller);
	        }

	        link(scope);
	      };
	    }
	  };
	}

	/**
	 * Shared ui-view code for both directives:
	 * Given scope, element, and its attributes, return the view's name
	 */
	function getUiViewName(scope, attrs, element, $interpolate) {
	  var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
	  var uiViewCreatedBy = element.inheritedData('$uiView');
	  return name.indexOf('@') >= 0 ?  name :  (name + '@' + (uiViewCreatedBy ? uiViewCreatedBy.state.name : ''));
	}

	angular.module('ui.router.state').directive('uiView', $ViewDirective);
	angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

	function parseStateRef(ref, current) {
	  var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
	  if (preparsed) ref = current + '(' + preparsed[1] + ')';
	  parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
	  if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
	  return { state: parsed[1], paramExpr: parsed[3] || null };
	}

	function stateContext(el) {
	  var stateData = el.parent().inheritedData('$uiView');

	  if (stateData && stateData.state && stateData.state.name) {
	    return stateData.state;
	  }
	}

	function getTypeInfo(el) {
	  // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
	  var isSvg = Object.prototype.toString.call(el.prop('href')) === '[object SVGAnimatedString]';
	  var isForm = el[0].nodeName === "FORM";

	  return {
	    attr: isForm ? "action" : (isSvg ? 'xlink:href' : 'href'),
	    isAnchor: el.prop("tagName").toUpperCase() === "A",
	    clickable: !isForm
	  };
	}

	function clickHook(el, $state, $timeout, type, current) {
	  return function(e) {
	    var button = e.which || e.button, target = current();

	    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
	      // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
	      var transition = $timeout(function() {
	        $state.go(target.state, target.params, target.options);
	      });
	      e.preventDefault();

	      // if the state has no URL, ignore one preventDefault from the <a> directive.
	      var ignorePreventDefaultCount = type.isAnchor && !target.href ? 1: 0;

	      e.preventDefault = function() {
	        if (ignorePreventDefaultCount-- <= 0) $timeout.cancel(transition);
	      };
	    }
	  };
	}

	function defaultOpts(el, $state) {
	  return { relative: stateContext(el) || $state.$current, inherit: true };
	}

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref
	 *
	 * @requires ui.router.state.$state
	 * @requires $timeout
	 *
	 * @restrict A
	 *
	 * @description
	 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated
	 * URL, the directive will automatically generate & update the `href` attribute via
	 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking
	 * the link will trigger a state transition with optional parameters.
	 *
	 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be
	 * handled natively by the browser.
	 *
	 * You can also use relative state paths within ui-sref, just like the relative
	 * paths passed to `$state.go()`. You just need to be aware that the path is relative
	 * to the state that the link lives in, in other words the state that loaded the
	 * template containing the link.
	 *
	 * You can specify options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
	 * and `reload`.
	 *
	 * @example
	 * Here's an example of how you'd use ui-sref and how it would compile. If you have the
	 * following template:
	 * <pre>
	 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
	 *
	 * <ul>
	 *     <li ng-repeat="contact in contacts">
	 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
	 *     </li>
	 * </ul>
	 * </pre>
	 *
	 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
	 * <pre>
	 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
	 *
	 * <ul>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
	 *     </li>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
	 *     </li>
	 *     <li ng-repeat="contact in contacts">
	 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
	 *     </li>
	 * </ul>
	 *
	 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
	 * </pre>
	 *
	 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
	 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 */
	$StateRefDirective.$inject = ['$state', '$timeout'];
	function $StateRefDirective($state, $timeout) {
	  return {
	    restrict: 'A',
	    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
	    link: function(scope, element, attrs, uiSrefActive) {
	      var ref    = parseStateRef(attrs.uiSref, $state.current.name);
	      var def    = { state: ref.state, href: null, params: null };
	      var type   = getTypeInfo(element);
	      var active = uiSrefActive[1] || uiSrefActive[0];
	      var unlinkInfoFn = null;
	      var hookFn;

	      def.options = extend(defaultOpts(element, $state), attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {});

	      var update = function(val) {
	        if (val) def.params = angular.copy(val);
	        def.href = $state.href(ref.state, def.params, def.options);

	        if (unlinkInfoFn) unlinkInfoFn();
	        if (active) unlinkInfoFn = active.$$addStateInfo(ref.state, def.params);
	        if (def.href !== null) attrs.$set(type.attr, def.href);
	      };

	      if (ref.paramExpr) {
	        scope.$watch(ref.paramExpr, function(val) { if (val !== def.params) update(val); }, true);
	        def.params = angular.copy(scope.$eval(ref.paramExpr));
	      }
	      update();

	      if (!type.clickable) return;
	      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
	      element[element.on ? 'on' : 'bind']("click", hookFn);
	      scope.$on('$destroy', function() {
	        element[element.off ? 'off' : 'unbind']("click", hookFn);
	      });
	    }
	  };
	}

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-state
	 *
	 * @requires ui.router.state.uiSref
	 *
	 * @restrict A
	 *
	 * @description
	 * Much like ui-sref, but will accept named $scope properties to evaluate for a state definition,
	 * params and override options.
	 *
	 * @param {string} ui-state 'stateName' can be any valid absolute or relative state
	 * @param {Object} ui-state-params params to pass to {@link ui.router.state.$state#methods_href $state.href()}
	 * @param {Object} ui-state-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
	 */
	$StateRefDynamicDirective.$inject = ['$state', '$timeout'];
	function $StateRefDynamicDirective($state, $timeout) {
	  return {
	    restrict: 'A',
	    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
	    link: function(scope, element, attrs, uiSrefActive) {
	      var type   = getTypeInfo(element);
	      var active = uiSrefActive[1] || uiSrefActive[0];
	      var group  = [attrs.uiState, attrs.uiStateParams || null, attrs.uiStateOpts || null];
	      var watch  = '[' + group.map(function(val) { return val || 'null'; }).join(', ') + ']';
	      var def    = { state: null, params: null, options: null, href: null };
	      var unlinkInfoFn = null;
	      var hookFn;

	      function runStateRefLink (group) {
	        def.state = group[0]; def.params = group[1]; def.options = group[2];
	        def.href = $state.href(def.state, def.params, def.options);

	        if (unlinkInfoFn) unlinkInfoFn();
	        if (active) unlinkInfoFn = active.$$addStateInfo(def.state, def.params);
	        if (def.href) attrs.$set(type.attr, def.href);
	      }

	      scope.$watch(watch, runStateRefLink, true);
	      runStateRefLink(scope.$eval(watch));

	      if (!type.clickable) return;
	      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
	      element[element.on ? 'on' : 'bind']("click", hookFn);
	      scope.$on('$destroy', function() {
	        element[element.off ? 'off' : 'unbind']("click", hookFn);
	      });
	    }
	  };
	}


	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref-active
	 *
	 * @requires ui.router.state.$state
	 * @requires ui.router.state.$stateParams
	 * @requires $interpolate
	 *
	 * @restrict A
	 *
	 * @description
	 * A directive working alongside ui-sref to add classes to an element when the
	 * related ui-sref directive's state is active, and removing them when it is inactive.
	 * The primary use-case is to simplify the special appearance of navigation menus
	 * relying on `ui-sref`, by having the "active" state's menu button appear different,
	 * distinguishing it from the inactive menu items.
	 *
	 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
	 * ui-sref-active found at the same level or above the ui-sref will be used.
	 *
	 * Will activate when the ui-sref's target state or any child state is active. If you
	 * need to activate only when the ui-sref target state is active and *not* any of
	 * it's children, then you will use
	 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
	 *
	 * @example
	 * Given the following template:
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active="active" class="item">
	 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 *
	 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
	 * the resulting HTML will appear as (note the 'active' class):
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active="active" class="item active">
	 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 * The class name is interpolated **once** during the directives link time (any further changes to the
	 * interpolated value are ignored).
	 *
	 * Multiple classes may be specified in a space-separated format:
	 * <pre>
	 * <ul>
	 *   <li ui-sref-active='class1 class2 class3'>
	 *     <a ui-sref="app.user">link</a>
	 *   </li>
	 * </ul>
	 * </pre>
	 *
	 * It is also possible to pass ui-sref-active an expression that evaluates
	 * to an object hash, whose keys represent active class names and whose
	 * values represent the respective state names/globs.
	 * ui-sref-active will match if the current active state **includes** any of
	 * the specified state names/globs, even the abstract ones.
	 *
	 * @Example
	 * Given the following template, with "admin" being an abstract state:
	 * <pre>
	 * <div ui-sref-active="{'active': 'admin.*'}">
	 *   <a ui-sref-active="active" ui-sref="admin.roles">Roles</a>
	 * </div>
	 * </pre>
	 *
	 * When the current state is "admin.roles" the "active" class will be applied
	 * to both the <div> and <a> elements. It is important to note that the state
	 * names/globs passed to ui-sref-active shadow the state provided by ui-sref.
	 */

	/**
	 * @ngdoc directive
	 * @name ui.router.state.directive:ui-sref-active-eq
	 *
	 * @requires ui.router.state.$state
	 * @requires ui.router.state.$stateParams
	 * @requires $interpolate
	 *
	 * @restrict A
	 *
	 * @description
	 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
	 * when the exact target state used in the `ui-sref` is active; no child states.
	 *
	 */
	$StateRefActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
	function $StateRefActiveDirective($state, $stateParams, $interpolate) {
	  return  {
	    restrict: "A",
	    controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
	      var states = [], activeClasses = {}, activeEqClass, uiSrefActive;

	      // There probably isn't much point in $observing this
	      // uiSrefActive and uiSrefActiveEq share the same directive object with some
	      // slight difference in logic routing
	      activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);

	      try {
	        uiSrefActive = $scope.$eval($attrs.uiSrefActive);
	      } catch (e) {
	        // Do nothing. uiSrefActive is not a valid expression.
	        // Fall back to using $interpolate below
	      }
	      uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || '', false)($scope);
	      if (isObject(uiSrefActive)) {
	        forEach(uiSrefActive, function(stateOrName, activeClass) {
	          if (isString(stateOrName)) {
	            var ref = parseStateRef(stateOrName, $state.current.name);
	            addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
	          }
	        });
	      }

	      // Allow uiSref to communicate with uiSrefActive[Equals]
	      this.$$addStateInfo = function (newState, newParams) {
	        // we already got an explicit state provided by ui-sref-active, so we
	        // shadow the one that comes from ui-sref
	        if (isObject(uiSrefActive) && states.length > 0) {
	          return;
	        }
	        var deregister = addState(newState, newParams, uiSrefActive);
	        update();
	        return deregister;
	      };

	      $scope.$on('$stateChangeSuccess', update);

	      function addState(stateName, stateParams, activeClass) {
	        var state = $state.get(stateName, stateContext($element));
	        var stateHash = createStateHash(stateName, stateParams);

	        var stateInfo = {
	          state: state || { name: stateName },
	          params: stateParams,
	          hash: stateHash
	        };

	        states.push(stateInfo);
	        activeClasses[stateHash] = activeClass;

	        return function removeState() {
	          var idx = states.indexOf(stateInfo);
	          if (idx !== -1) states.splice(idx, 1);
	        };
	      }

	      /**
	       * @param {string} state
	       * @param {Object|string} [params]
	       * @return {string}
	       */
	      function createStateHash(state, params) {
	        if (!isString(state)) {
	          throw new Error('state should be a string');
	        }
	        if (isObject(params)) {
	          return state + toJson(params);
	        }
	        params = $scope.$eval(params);
	        if (isObject(params)) {
	          return state + toJson(params);
	        }
	        return state;
	      }

	      // Update route state
	      function update() {
	        for (var i = 0; i < states.length; i++) {
	          if (anyMatch(states[i].state, states[i].params)) {
	            addClass($element, activeClasses[states[i].hash]);
	          } else {
	            removeClass($element, activeClasses[states[i].hash]);
	          }

	          if (exactMatch(states[i].state, states[i].params)) {
	            addClass($element, activeEqClass);
	          } else {
	            removeClass($element, activeEqClass);
	          }
	        }
	      }

	      function addClass(el, className) { $timeout(function () { el.addClass(className); }); }
	      function removeClass(el, className) { el.removeClass(className); }
	      function anyMatch(state, params) { return $state.includes(state.name, params); }
	      function exactMatch(state, params) { return $state.is(state.name, params); }

	      update();
	    }]
	  };
	}

	angular.module('ui.router.state')
	  .directive('uiSref', $StateRefDirective)
	  .directive('uiSrefActive', $StateRefActiveDirective)
	  .directive('uiSrefActiveEq', $StateRefActiveDirective)
	  .directive('uiState', $StateRefDynamicDirective);

	/**
	 * @ngdoc filter
	 * @name ui.router.state.filter:isState
	 *
	 * @requires ui.router.state.$state
	 *
	 * @description
	 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
	 */
	$IsStateFilter.$inject = ['$state'];
	function $IsStateFilter($state) {
	  var isFilter = function (state, params) {
	    return $state.is(state, params);
	  };
	  isFilter.$stateful = true;
	  return isFilter;
	}

	/**
	 * @ngdoc filter
	 * @name ui.router.state.filter:includedByState
	 *
	 * @requires ui.router.state.$state
	 *
	 * @description
	 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
	 */
	$IncludedByStateFilter.$inject = ['$state'];
	function $IncludedByStateFilter($state) {
	  var includesFilter = function (state, params, options) {
	    return $state.includes(state, params, options);
	  };
	  includesFilter.$stateful = true;
	  return  includesFilter;
	}

	angular.module('ui.router.state')
	  .filter('isState', $IsStateFilter)
	  .filter('includedByState', $IncludedByStateFilter);
	})(window, window.angular);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var angular = __webpack_require__(1);

	angular.module('spreadyApp').service('dataService', __webpack_require__(5));
	angular.module('spreadyApp').service('uiRouterService', __webpack_require__(6));

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';

	function DataService ($http, $q) {

	  this.getUser = function(cb, cb2) {
	    $http.get('/user').then(cb).finally(cb2);
	  };

	  this.getUsername = function(id, cb) {
	    $http.get('/username/' + id).then(cb);
	  };

	  this.getPerson = function(id, cb) {
	    $http.get('/person/' + id).then(cb);
	  };

	  this.getBasicUsers = function(ids){
	    return $http.post('/data/basicUsers', ids);
	  };

	  this.getList = function(_id, cb) {
	    $http.get('/list/' + _id).then(cb);
	  };

	  this.addNewListToDb = function(list, cb){
	  	$http.post('/list/', list).then(cb);
	  };

	  this.deleteList = function(id, cb){
	    $http.delete('/list/' + id, id).then(cb);
	  };

	  this.updateUserToDatabase = function(reqBody, cb){
	  	$http.put('/user/' + reqBody.user._id, reqBody).then(cb);
	  };

	  this.updateListToDatabase = function(reqBody, cb){
	    $http.put('/list/' + reqBody.listId, reqBody).then(cb);
	  };

	}

	module.exports = DataService;



/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	function UiRouterService ($http, $q) {

	  this.getProfile = function(_id) {
	    return $http.get('/data/profile/'+ _id);
	  };

	}

	module.exports = UiRouterService;



/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var angular = __webpack_require__(1);

	angular.module('spreadyApp').directive('me', __webpack_require__(8));
	angular.module('spreadyApp').directive('listOfUsers', __webpack_require__(9));
	angular.module('spreadyApp').directive('listOfLists', __webpack_require__(10));
	angular.module('spreadyApp').directive('infiniteScroll', [
	  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
	    return {
	      link: function(scope, elem, attrs) {
	        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
	        $window = angular.element($window);
	        scrollDistance = 0;
	        if (attrs.infiniteScrollDistance != null) {
	          scope.$watch(attrs.infiniteScrollDistance, function(value) {
	            return scrollDistance = parseInt(value, 10);
	          });
	        }
	        scrollEnabled = true;
	        checkWhenEnabled = false;
	        if (attrs.infiniteScrollDisabled != null) {
	          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
	            scrollEnabled = !value;
	            if (scrollEnabled && checkWhenEnabled) {
	              checkWhenEnabled = false;
	              return handler();
	            }
	          });
	        }
	        handler = function() {
	          var elementBottom, remaining, shouldScroll, windowBottom;
	          windowBottom = $window.height() + $window.scrollTop();
	          elementBottom = elem.offset().top + elem.height();
	          remaining = elementBottom - windowBottom;
	          shouldScroll = remaining <= $window.height() * scrollDistance;
	          if (shouldScroll && scrollEnabled) {
	            if ($rootScope.$$phase) {
	              return scope.$eval(attrs.infiniteScroll);
	            } else {
	              return scope.$apply(attrs.infiniteScroll);
	            }
	          } else if (shouldScroll) {
	            return checkWhenEnabled = true;
	          }
	        };
	        $window.on('scroll', handler);
	        scope.$on('$destroy', function() {
	          return $window.off('scroll', handler);
	        });
	        return $timeout((function() {
	          if (attrs.infiniteScrollImmediateCheck) {
	            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
	              return handler();
	            }
	          } else {
	            return handler();
	          }
	        }), 0);
	      }
	    };
	  }
	]);
	angular.module('spreadyApp').directive('showFocus', function($timeout) {
	  return function(scope, element, attrs) {
	    scope.$watch(attrs.showFocus, 
	      function (newValue) { 
	        $timeout(function() {
	            newValue && element.focus();
	        });
	      },true);
	  };    
	});
	angular.module('spreadyApp').directive('backButton', function(){
	    return {
	      restrict: 'A',

	      link: function(scope, element, attrs) {
	        element.bind('click', goBack);
	        function goBack() {
	          history.back();
	          scope.$apply();
	        }
	      }
	    }
	});

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';

	function ProfileDirective () {
			return {
				templateUrl: 'templates/me.html'
			}
	}

	module.exports = ProfileDirective;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';

	function ListOfUsersDirective () {
			return {
				templateUrl: 'templates/list-of-users.html'
			}
	}

	module.exports = ListOfUsersDirective;



/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	function ListOfListsDirective () {
			return {
				templateUrl: 'templates/list-of-lists.html'
			}
	}

	module.exports = ListOfListsDirective;



/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var angular = __webpack_require__(1);

	angular.module('spreadyApp').controller('mainCtrl', __webpack_require__(12));
	angular.module('spreadyApp').controller('adminCtrl', __webpack_require__(13));
	// angular.module('spreadyApp')
	// .controller('mainCtrl', function($scope, dataService, $q, $filter, $interval, $timeout, $location, $anchorScroll){
		
	// 	console.log(io, "io here");
	// 	var socket = io("http://ec2-54-90-163-255.compute-1.amazonaws.com:3000");

	// 	$scope.loaded = false;

	// //Socket handlers
	// 	socket.on('msg-from-server', function(data) {
	// 		var to = data.to;
	// 		var chatId = data.id;
	// 		var dbMessage = data.dbMessage;
	// 		var newChat = true;
	// 		if(to.indexOf($scope.user._id)=== -1){
	// 			console.log('Message to someone else');
	// 		} else {
	// 			console.log('Message to me');
	// 			//Adicionar mensagem ao chat no user.chats
	// 			angular.forEach($scope.user.chats, function(chat, i){
	// 				if(chat._id === chatId){
	// 					$scope.user.chats[i].messages.unshift(dbMessage);
	// 					$scope.$apply();
	// 					$scope.goToBottom();
	// 				}
	// 			});
	// 		};
	// 	});

	// 	socket.on('new-chat-from-server', function(data) {
	// 		var to = data.users;
	// 		if(to.indexOf($scope.user._id)=== -1){
	// 			console.log('Chat with someone else');
	// 		} else {
	// 			console.log('New chat with me');
	// 			var chat = data;
	// 			var userIDs = chat.users;
	// 			var orderedChatUsersIDS = [];
	// 			angular.forEach(userIDs, function(id){
	// 				if(id !== $scope.user._id){
	// 				orderedChatUsersIDS.push(id);
	// 				}
	// 			});
	// 			var scopeChatUsers = $scope.loadUsersBasicArray(orderedChatUsersIDS);
	// 			chat.users = scopeChatUsers;
	// 			$scope.user.chats.unshift(chat);
	// 		}
	// 	});

	// 	socket.on('notification-from-server', function(data) {
	// 		var to = data.to;
	// 		var notification = data.notification;
	// 		var userID = notification.user;
	// 		if(to !== $scope.user._id){
	// 			console.log('Notification to someone else');
	// 		} else {
	// 			console.log('Notification to me');
	// 			dataService.getUsername(userID, function(response){
	// 				notification.user = response.data;
	// 				$scope.user.notifications.unread.unshift(notification);
	// 				$scope.user.followers.unshift(response.data);
	// 			});
	// 		}
	// 	});

	// 	socket.on('fact-change-from-server', function(data) {
	// 		var action = data.action;
	// 		var factId = data.fact;
	// 		var userId = data.user;

	// 		//checar se fato está nos scope.facts
	// 		angular.forEach($scope.facts, function(fact){
	// 			//se sim
	// 			if (fact._id == factId) {
	// 				//se ação é like
	// 				if(action == 'like'){
	// 					//checar se já tem userId entre os likes
	// 					if (fact.likes.indexOf(userId) === -1) {
	// 						//se não, unshift
	// 						fact.likes.unshift(userId);
	// 						$scope.$apply();
	// 						console.log('Updated fact in the scope with like')
	// 					};
	// 					//checar se fato está nos user.facts
	// 					angular.forEach($scope.user.facts, function(fact){
	// 						if (fact._id == factId) {
	// 							//se sim, checar se já tem userId entre os likes
	// 							if (fact.likes.indexOf(userId) === -1) {
	// 								//se não, unshift
	// 								fact.likes.unshift(userId);
	// 								$scope.$apply();
	// 								console.log('Updated fact in the user facts with like')
	// 							};
	// 						};
	// 					});
	// 				};

	// 				//se ação é like
	// 				if(action == 'unlike'){
	// 					//checar se já tem userId entre os likes
	// 					if (fact.likes.indexOf(userId) !== -1) {
	// 						//se não, unshift
	// 						var index = fact.likes.indexOf(userId);
	// 						fact.likes.splice(index, 1);
	// 						$scope.$apply();
	// 						console.log('Updated fact in the scope with unlike')
	// 					};
	// 					//checar se fato está nos user.facts
	// 					angular.forEach($scope.user.facts, function(fact){
	// 						if (fact._id == factId) {
	// 							//se sim, checar se já tem userId entre os likes
	// 							if (fact.likes.indexOf(userId) !== -1) {
	// 								//se não, unshift
	// 								var index = fact.likes.indexOf(userId);
	// 								fact.likes.splice(index, 1);
	// 								$scope.$apply();
	// 								console.log('Updated fact in the user facts with unlike')
	// 							};
	// 						};
	// 					});
	// 				};

	// 				//se ação é comment
	// 				if(action == 'comment'){
	// 					var comment = data.comment;
	// 					var found = false;
	// 					//se comentário não está no fact
	// 					angular.forEach(fact.comments, function(scopeComment){
	// 						if(comment == scopeComment){
	// 							found = true;
	// 						};
	// 					});
	// 					//else
	// 					if(!found){
	// 						//adiciona o comentário
	// 						fact.comments.push(comment);
	// 						$scope.$apply();
	// 						console.log('Updated fact in the scope with comment')
	// 					};
	// 					//checar se fato está nos user.facts
	// 					angular.forEach($scope.user.facts, function(fact){
	// 						if (fact._id == factId) {
	// 							var found2 = true;
	// 							//se comentário não está no fact
	// 							angular.forEach(fact.comments, function(scopeComment){
	// 								if(comment == scopeComment){
	// 									found = true;
	// 								};
	// 							});
	// 							//else
	// 							if(!found){
	// 								//adiciona o comentário
	// 								fact.comments.push(comment);
	// 								$scope.$apply();
	// 								console.log('Updated fact in the scope with comment');
	// 							};
	// 						};
	// 					});

	// 				};
	// 			};
	// 		});
	// 	});

	// //Loading Home
	// 	dataService.getUser(function(response){ 
	//     	console.log(response.data);
	//     	var user = response.data;
	//     	$scope.user = response.data;
	//     	if (user.signup !== false){
	//     		$scope.createDefaultLists(user);
	//     	};
	//     	$scope.facts = [];
	//     	$scope.loadFeed(response.data);
	//     }, function(response){
	//     	$scope.user.lists = $scope.loadListsLight($scope.user.lists);
	// //    	$scope.loadUserFollowing();
	//     	$scope.loadNotifications();
	// //    	$scope.loadUserFollowers();
	//     	$scope.loadUserChats();
	//     	$scope.loadUserFacts($scope.user._id, Date.now());
	//     	$scope.findCountry($scope.user.location.name);
	//     	$scope.loaded = true;
	//     });

	// 	$scope.collapse = false;

	// 	$scope.problematicMovieIds = [];

	// 	//find movie from title, year and cast (title, year, type, cast)
	// 	$scope.getImdbID = function(title, type, year){
	// 		//searchTitle = substring de title com 2 palavras
	// 		var title2 = title.split(/\s+/).slice(0,2).join(" ");
	// 		console.log(title2);
	// 		//search data service with title, year and type
	// 		if(type === 'movie'){
	// 			dataService.searchOmdbMovieTitleYear(title2, year, function(response){
	// 				//search omdbAPI
	// 				if (response.data.Search){
	// 					var results = response.data.Search;
	// 					console.log('These are the results from omdbAPI:');
	// 					console.log(results);
	// 					//if single answer
	// 					if (results.length === 1){
	// 						//return imdbID
	// 						console.log('Found imdbID at omdbAPI');
	// 						console.log(results[0].imdbID);
	// 						return results[0].imdbID;
	// 					} else {
	// 						console.log('Oops, there is more than 1 matching result at OMDB');
	// 						return "FIX";
	// 					}
	// 				} else {
	// 					//search tmdbAPI
	// 					console.log('Searching Tmdb');
	// 					dataService.searchTmdbMovieTitleYear(title2, year, function(response){
	// 						if (response.data.results[0]){
	// 							var results = response.data.results;
	// 							console.log('Found results at Tmdb');
	// 							console.log(response.data);
	// 							//if single answer
	// 							if (results.length === 1){
	// 								console.log('Found single match at tmdbAPI');
	// 								var tmdbID = results[0].id;
	// 								console.log('TmdbID is ' + tmdbID);
	// 								//get imdbID
	// 								dataService.getTmdbMovieFromId(tmdbID, function(response){
	// 									console.log('Got response from movie id at Tmdb');
	// 									console.log(response.data);
	// 									if (response.data.imdb_id){
	// 										console.log('Found imdbID at tmdbID');
	// 										console.log(response.data.imdb_id);
	// 										return response.data.imdb_id;
	// 									} else {
	// 										console.log('Couldn\'t find imdbID although we had the tmdb id');
	// 										return "FIX";
	// 									}
	// 								});
	// 							} else {
	// 								console.log('Oops, there is more than 1 matching result at TMDB')
	// 								return "FIX";
	// 							};
	// 						} else {
	// 							console.log('Oops, didnt find movie at tmdb');
	// 							return "FIX";
	// 						};
	// 					});
	// 				};
	// 			});			
	// 		}
	// 	};


	// 	$scope.addNetflixMovie = function(imdbID, nfid, nfcountry){
	// 		var dbMovie = {
	// 			imdbID: imdbID,
	// 			nfid: nfid,
	// 			nfcountry: nfcountry,
	// 		};
	// 		var reqBody = {
	// 			movie: dbMovie,
	// 			action: 'add'
	// 		};
	// 		//upsert no movie database
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 	};

	// 	$scope.fixAcute = function(title){
	// 		var title = title.toLowerCase();
	// 		title.replace("&aacute;", "á");
	// 		title.replace("&eacute;", "é");
	// 		title.replace("&iacute;", "í");
	// 		title.replace("&oacute;", "ó");
	// 		title.replace("&uacute;", "ú");
	// 		title.replace("&#39;", "'");
	// 		return title;
	// 	};


	// 	$scope.searchTmdbAndUpsertMovie = function(title, year, nfid, nfcountry, nfresult){
	// 		//search tmdbAPI
	// 		var title2 = title.split(/\s+/).slice(0,2).join(" ");
	// 		var imdbID = "";
	// 		console.log('Searching Tmdb');
	// 		dataService.searchTmdbMovieTitleYear(title2, year, function(response){
	// 			if (response.data.results[0]){
	// 				var tmdbresults = response.data.results;
	// 				console.log('Found results at Tmdb');
	// 				console.log(response.data);
	// 				//if single answer
	// 				if (tmdbresults.length === 1){
	// 					console.log('Found single match at tmdbAPI');
	// 					var tmdbID = tmdbresults[0].id;
	// 					console.log('TmdbID is ' + tmdbID);
	// 					//get imdbID
	// 					dataService.getTmdbMovieFromId(tmdbID, function(response){
	// 						console.log('Got response from movie id at Tmdb');
	// 						console.log(response.data);
	// 						if (response.data.imdb_id){
	// 							console.log('Found imdbID at tmdb');
	// 							console.log(response.data.imdb_id);
	// 							imdbID = response.data.imdb_id;
	// 							$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 						} else {
	// 							console.log('Couldn\'t find imdbID although we had the tmdb id');
	// 							dataService.saveNflog(nfresult, function(response){
	// 								$scope.problematicMovieIds.push(nfresult);
	// 								console.log(response.data);
	// 							});
	// 						}
	// 					});
	// 				//tmdbresults.length !== 1
	// 				} else {
	// 					var perfectMatch = [];
	// 					angular.forEach(tmdbresults, function(tmdbresult){
	// 						if (tmdbresult.Title === title){
	// 							var alreadyThere = false;
	// 							angular.forEach(perfectMatch, function(match){
	// 								if (match.imdbID === tmdbresult.imdbID){
	// 									alreadyThere = true;
	// 								}
	// 							});
	// 							if (!alreadyThere){
	// 								perfectMatch.push(tmdbresult);
	// 							}
	// 						}
	// 					});
	// 					if (perfectMatch.length === 1) {
	// 						imdbID = perfectMatch[0].imdbID;
	// 						console.log('Found imdbID at tmdbAPI after matching whole title');
	// 						$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 					} else {
	// 						console.log('Could not find perfect match with tmdb');
	// 						dataService.saveNflog(nfresult, function(response){
	// 							$scope.problematicMovieIds.push(nfresult);
	// 							console.log(response.data);
	// 						});
	// 					};
	// 				}; //tmdbresults.length !== 1
	// 			} else {
	// 				console.log('Tmdb returned no results');
	// 				dataService.saveNflog(nfresult, function(response){
	// 					$scope.problematicMovieIds.push(nfresult);
	// 					console.log(response.data);
	// 				});
	// 			}; //!response.data.results[0]
	// 		});			//searchtmdbTitle
	// 	};

	// 	$scope.upsertNfInfo = function(nfid){
	// 		//checar no db interno se já tem registro com esse nfid
	// 		dataService.getTitleByNfid(nfid, function(response){
	// 			//se sim, pula
	// 			if (response.data.title[0]){
	// 				console.log('Title already in the database');
	// 				console.log(response.data.title[0]);
	// 			//se não
	// 			} else {
	// 				console.log('Didn\'t find title');
	// 				//pedir title information para esse filme no unogs
	// 				dataService.getTitleDetailsByNfid(nfid, function(response){
	// 					//pegar imdbid
	// 					var nfresult = response.data.RESULT;
	// 					var imdbID = "";
	// 					var nfcountry = [];
	// 					if(nfresult.country){
	// 						angular.forEach(nfresult.country, function(country){
	// 							var countryCode = country[1];
	// 							nfcountry.push(countryCode);
	// 						});
	// 					};
	// 					nfresult.country = nfcountry;
	// 					if(nfresult.imdbinfo[9]){
	// 						imdbID = nfresult.imdbinfo[9]
	// 						$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 					//!nfresult.imdbinfo[9]
	// 					} else {
	// 						var title = $scope.fixAcute(nfresult.nfinfo[1]);
	// 						var title2 = title.split(/\s+/).slice(0,2).join(" ");
	// 						var type = nfresult.nfinfo[6];
	// 						var year = nfresult.nfinfo[9];
	// 						console.log('Getting imdbID from omdbAPI');
	// //						imdbID = $scope.getImdbID(title, 'movie', year);
	// 							//searchTitle = substring de title com 2 palavras

	// 						//search data service with title, year and type
	// 						dataService.searchOmdbMovieTitleYear(title2, year, function(response){
	// 							//search omdbAPI
	// 							if (response.data.Search){
	// 								var omdbresults = response.data.Search;
	// 								console.log('These are the results from omdbAPI:');
	// 								console.log(omdbresults);
	// 								//if single answer
	// 								if (omdbresults.length === 1){
	// 									//return imdbID
	// 									imdbID = omdbresults[0].imdbID;
	// 									console.log(omdbresults[0].imdbID);
	// 									console.log('Found imdbID at omdbAPI');
	// 									$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 								//if omdbresults.lenght !== 1
	// 								} else {
	// 								console.log('Oops, there is more than 1 matching result at OMDB');
	// 									var goodresults = [];
	// 									angular.forEach(omdbresults, function(movie){
	// 										if (movie.Poster !== "N/A"){
	// 											goodresults.push(movie);
	// 										};
	// 									});
	// 									if(goodresults.length === 1){
	// 										imdbID = goodresults[0].imdbID;
	// 										console.log('Found imdbID at omdbAPI after filtering for image');
	// 										$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 									//if goodresults.lenght !== 1
	// 									} else {
	// 										var perfectMatch = [];
	// 										angular.forEach(goodresults, function(goodresult){
	// 											if (goodresult.Title === title){
	// 												var alreadyThere = false;
	// 												angular.forEach(perfectMatch, function(match){
	// 													if (match.imdbID === goodresult.imdbID){
	// 														alreadyThere = true;
	// 													}
	// 												});
	// 												if (!alreadyThere){
	// 													perfectMatch.push(goodresult);
	// 												}
	// 											}
	// 										});
	// 										if (perfectMatch.length === 1) {
	// 											imdbID = perfectMatch[0].imdbID;
	// 											console.log('Found imdbID at omdbAPI after matching whole title');
	// 											$scope.addNetflixMovie(imdbID, nfid, nfcountry);
	// 										// if perfectMatch !== 1
	// 										} else {
	// 											console.log('Could not find perfect match at omdb');
	// 											$scope.searchTmdbAndUpsertMovie(title, year, nfid, nfcountry, nfresult);
	// 										}
	// 									}; //goodresults.length === 1
	// 								}; // omdbresults.length === 1
	// 							//if there is no response.data.Search
	// 							} else {
	// 								$scope.searchTmdbAndUpsertMovie(title, year, nfid, nfcountry, nfresult);
	// 							} // response.data.Search
	// 						}); //searchomdb
	// 					};
	// 				});
	// 			};
	// 		});
	// 	};

	// 	$scope.getCountryCatalog = function(countryCode){
	// 		dataService.getCatalogPageFromCountry(countryCode, 1, function(response){
	// 			var pages = Math.ceil(response.data.COUNT/100);
	// 			console.log('There are '+ pages + ' catalog pages.');
	// 			var pageContent = response.data.ITEMS;
	// 		 	//de 1 a pages
	// 		 		//dataService.getCatalogPageFromCountry(countryCode, page=1, function(response){
	// 					//para cada item em response.items
	// 					//a cada 2 segundos
	// 					var i = 0;
	// 					$interval(function(){
	// 						//pega o nfid do item
	// 						var item = pageContent[i];
	// 						console.log('Upserting movie: ' + item[1]);
	// 						var nfid = item[0];
	// 						//dá um upsertNFInfo
	// 						$scope.upsertNfInfo(nfid);
	// 						//aumenta o index
	// 						i += 1;
	// 					}, 2000, 100);
	// 		});
	// 	};

	// //	$scope.getCountryCatalog(29);



	// 	$scope.findCountry = function(location_name){
	// 		//gets country string from location.name
	// 		var $index = location_name.lastIndexOf(',') + 2;
	// 		var countrystr = location_name.slice($index) + " ";
	// 		console.log('The country is '+ countrystr);
	// 		//gets country object from unogs
	// 		dataService.getCountryList(function(response){
	// 			var countryList = response.data;
	// 			angular.forEach(countryList, function(country){
	// 				if (country[2] === countrystr){
	// 					$scope.country = country;
	// 				};
	// 			});
	// 		});
	// 	};

	// 	$scope.userItemCount = function(){
	// 	    if($scope.user && $scope.user.lists){
	// 		    var total = 0;
	// 		    angular.forEach($scope.user.lists, function(list){
	// 		    	total += list.items.length;
	// 		    });
	// 		    return total;
	// 		}
	// 	};
	 
	// 	$scope.personItemCount = function(){
	// 	    if($scope.person && $scope.person.lists){
	// 		    var total = 0;
	// 		    angular.forEach($scope.person.lists, function(list){
	// 		    	total += list.items.length;
	// 		    });
	// 		    return total;
	// 		}
	// 	};

	// 	$scope.createDefaultLists = function(user){
	// 		var dbuser = {
	// 			displayName: user.displayName,
	// 			_id: user._id
	// 		};

	// 		var watchlist = {
	// 			name: 'Watchlist',
	// 			type: 'watchlist',
	// 			user: dbuser,
	// 			privacy: 'public',
	// 			items: [],
	// 			dateOfCreation: Date.now(),
	// 			dateOfChange: Date.now()
	// 		};

	// 		var seen = {
	// 			name: 'Seen',
	// 			type: 'seen',
	// 			user: dbuser,
	// 			privacy: 'public',
	// 			items: [],
	// 			dateOfCreation: Date.now(),
	// 			dateOfChange: Date.now()
	// 		};

	// 		var recommendation = {
	// 			name: 'Recommendations',
	// 			type: 'recommendation',
	// 			user: dbuser,
	// 			privacy: 'public',
	// 			items: [],
	// 			dateOfCreation: Date.now(),
	// 			dateOfChange: Date.now()
	// 		};

	// 		var dislike = {
	// 			name: 'Dislike',
	// 			type: 'dislike',
	// 			user: dbuser,
	// 			privacy: 'public',
	// 			items: [],
	// 			dateOfCreation: Date.now(),
	// 			dateOfChange: Date.now()
	// 		};

	// 		var queue = [];

	// 		var r1 = dataService.addNewListToDb(watchlist, function(response){
	// 			console.log(response.data.message);
	// 			var list = response.data.list;
	// 		//then add the list to the user in the scope
	// 			$scope.user.lists.unshift(list);
	// 		//then updates user with new list to user database
	// 			var userId = $scope.user._id;
	// 		//trocar por salvar só lista
	// 		 	var reqBody = {
	// 				user: {_id: userId},
	// 				action: 'addList',
	// 				listId: list._id
	// 			};
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});

	// 		queue.push(r1);

	// 		var r2 = dataService.addNewListToDb(seen, function(response){
	// 			console.log(response.data.message);
	// 			var list = response.data.list;
	// 		//then add the list to the user in the scope
	// 			$scope.user.lists.unshift(list);
	// 		//then updates user with new list to user database
	// 			var userId = $scope.user._id;
	// 		//trocar por salvar só lista
	// 		 	var reqBody = {
	// 				user: {_id: userId},
	// 				action: 'addList',
	// 				listId: list._id
	// 			};
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});

	// 		queue.push(r2);

	// 		var r3 = dataService.addNewListToDb(recommendation, function(response){
	// 			console.log(response.data.message);
	// 			var list = response.data.list;
	// 		//then add the list to the user in the scope
	// 			$scope.user.lists.unshift(list);
	// 		//then updates user with new list to user database
	// 			var userId = $scope.user._id;
	// 		//trocar por salvar só lista
	// 		 	var reqBody = {
	// 				user: {_id: userId},
	// 				action: 'addList',
	// 				listId: list._id
	// 			};
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});

	// 		queue.push(r3);

	// 		var r4 = dataService.addNewListToDb(dislike, function(response){
	// 			console.log(response.data.message);
	// 			var list = response.data.list;
	// 		//then add the list to the user in the scope
	// 			$scope.user.lists.unshift(list);
	// 		//then updates user with new list to user database
	// 			var userId = $scope.user._id;
	// 		//trocar por salvar só lista
	// 		 	var reqBody = {
	// 				user: {_id: userId},
	// 				action: 'addList',
	// 				listId: list._id
	// 			};
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});

	// 		queue.push(r4);

	// 		var reqBody = {
	// 			user: {_id: user._id},
	// 			action: 'signup'
	// 		};

	// 		$q.all(queue).then(function(response){
	// 			$scope.user.signup = false;
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});
	// 	};


	// 	$scope.loadFeed = function(basicUser){
	// 		$scope.interface.loadingFacts = true;
	// 		console.log('Running loadFeed')
	// 		var friendsIds = [];
	//     	friendsIds.unshift(basicUser._id);
	//     	angular.forEach($scope.user.following, function(friendId){
	//     		friendsIds.unshift(friendId);
	//     	});
	// 		console.log('Inside loadFeed with friends Ids');
	// 		console.log(friendsIds);
	// 		var reqBody = {
	// 			ids: friendsIds,
	// 			time: Date.now()
	// 		};
	// 		dataService.postFeed(reqBody, function(response){
	// 			var basicFacts = response.data.facts;
	// 			if (basicFacts.length === 0){
	// 				$scope.user.new = true;
	// 			} else {
	// 				$scope.user.new = false;
	// 			};
	// 			//para cada fato básico carregado
	// 			angular.forEach(basicFacts, function(basicFact){
	// 				//criar um fato que inicialmente é igual ao fato básico
	// 				var queue = [];
	// 				var fact = basicFact;
	// 				var userId = basicUser._id;
	// 				if (fact.privacy == 'public' || fact.user == userId){
	// 					//definir fact.like como true se usuário tiver curtido
	// 					if (fact.likes.indexOf(userId) > -1) {
	// 						fact.like = true;
	// 					} else {
	// 						fact.like = false;
	// 					};
	// 					//definir o usuário basico do fato
	// 			 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 						fact.user = response.data;
	// 					});
	// 					queue.push(r1);
	// 					//definir a lista básica do fato
	// 					var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 						fact.list = response.data;
	// 					});
	// 					queue.push(r2);
	// 					$q.all(queue).then(function(){
	// 						$scope.getMovieDetails(basicFact.item, function(){
	// 							//adicionar esse fato ao array de fatos no scope
	// 							$scope.facts.push(fact);
	// 						});
	// 					});
	// 				};
	// 			});
	// 			$scope.interface.loadingFacts = false;
	// 		});
	// 	};

	// 	$scope.loadNextFacts = function(){
	// 		console.log('Running loadNextFacts');
	// 		$scope.interface.loadingFacts = true;
	// 		if($scope.interface.feed){
	// 			var basicUser = $scope.user;
	// 			var friendsIds = [];
	// 	    	friendsIds.unshift(basicUser._id);
	// 	    	if(basicUser.following[0]){
	// 		    	if(!basicUser.following[0].displayName){
	// 			    	angular.forEach(basicUser.following, function(friendId){
	// 			    		friendsIds.unshift(friendId);
	// 			    	});
	// 		    	} else {
	// 			    	angular.forEach(basicUser.following, function(friend){
	// 			    		friendsIds.unshift(friend._id);
	// 			    	});    		
	// 		    	};
	// 		    };
	// 			var reqBody = {
	// 				ids: friendsIds,
	// 				time: $scope.facts[$scope.facts.length-1].time
	// 			};
	// 			dataService.postFeed(reqBody, function(response){
	// 				var basicFacts = response.data.facts;	
	// 				if($scope.facts.length !== 0){
	// 					$scope.user.new = false;
	// 				};
	// 				//para cada fato básico carregado
	// 				angular.forEach(basicFacts, function(basicFact){
	// 					//criar um fato que inicialmente é igual ao fato básico
	// 					var queue = [];
	// 					var fact = basicFact;
	// 					var userId = basicUser._id;
	// 					if (fact.privacy == 'public' || fact.user == userId){
	// 						//definir fact.like como true se usuário tiver curtido
	// 						if (fact.likes.indexOf(userId) > -1) {
	// 							fact.like = true;
	// 						} else {
	// 							fact.like = false;
	// 						};
	// 						//definir o usuário basico do fato
	// 				 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 							fact.user = response.data;
	// 						});
	// 						queue.push(r1);
	// 						//definir a lista básica do fato
	// 						var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 							fact.list = response.data;
	// 						});
	// 						queue.push(r2);
	// 						$q.all(queue).then(function(){
	// 							$scope.getMovieDetails(basicFact.item, function(){
	// 								//adicionar esse fato ao array de fatos no scope
	// 								$scope.facts.push(fact);
	// 							});
	// 						});
	// 					};
	// 				});
	// 				$scope.interface.loadingFacts = false;
	// 			});		
	// 		} else {
	// 			$scope.interface.loadingFacts = false;
	// 		};
	// 	};

	// 	$scope.loadUserFacts = function(userId, time){
	// 		console.log('Inside loadUserFacts');
	// 		var reqBody = {
	// 				ids: [userId],
	// 				time: time
	// 			};
	// 		dataService.postFeed(reqBody, function(response){
	// 			var basicFacts = response.data.facts;
	// 			//para cada fato básico carregado
	// 			angular.forEach(basicFacts, function(basicFact){
	// 				//criar um fato que inicialmente é igual ao fato básico
	// 				var queue = [];
	// 				var fact = basicFact;
	// 				//definir fact.like como true se usuário tiver curtido
	// 				if (fact.likes.indexOf(userId) > -1) {
	// 					fact.like = true;
	// 				} else {
	// 					fact.like = false;
	// 				};
	// 				//definir o usuário basico do fato
	// 		 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 					fact.user = response.data;
	// 				});
	// 				queue.push(r1);
	// 				//definir a lista básica do fato
	// 				var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 					fact.list = response.data;
	// 				});
	// 				queue.push(r2);
	// 				$q.all(queue).then(function(){
	// 					$scope.getMovieDetails(basicFact.item, function(){
	// 						//adicionar esse fato ao array de fatos no scope
	// 						$scope.user.facts.push(fact);
	// 					});
	// 				});
	// 			})
	// 		});
	// 	};

	// 	$scope.loadUsersBasicArray = function(IDsArray){
	// 		var usersArray = [];
	// 	 	angular.forEach(IDsArray, function(id){
	// 		 		dataService.getPerson(id, function(response){
	// //		 			var list = loadUsernames(response.data);
	// 					var person = response.data;
	// 		 			usersArray.unshift(person);
	// 		 		});
	// 			});
	// 		return usersArray;
	// 	};

	//     $scope.loadUserFollowing = function() {
	//  	    var followingIds = $scope.user.following;
	// 		var scopeFollowing = $scope.loadUsersBasicArray(followingIds);
	// 		$scope.user.following = scopeFollowing;
	// 	};

	//     $scope.loadUserFollowers = function() {
	//  	    var followersIds = $scope.user.followers;
	// 		var scopeFollowers = $scope.loadUsersBasicArray(followersIds);
	// 		$scope.user.followers = scopeFollowers;
	// 	};

	// 	$scope.loadUserChats = function() {
	// 		var chatIds = $scope.user.chats;
	// 		var scopeChats = [];
	// 		var queue = [];
	// 		angular.forEach(chatIds, function(chatId){
	// 			var request;
	// 			var reqBody = {
	// 				id: chatId,
	// 				action: 'basic'
	// 			};
	// 			request = dataService.getChat(reqBody, function(response){
	// 				var chat = response.data.chat;
	// 				var userIDs = chat.users;
	// 				var orderedChatUsersIDS = [];
	// 				angular.forEach(userIDs, function(id){
	// 					if(id !== $scope.user._id){
	// 						orderedChatUsersIDS.push(id);
	// 					}
	// 				});
	// 				var scopeChatUsers = $scope.loadUsersBasicArray(orderedChatUsersIDS);
	// 				chat.users = scopeChatUsers;
	// 				scopeChats.unshift(chat);
	// 			});
	// 			queue.push(request);
	// 		});
	// 		$q.all(queue).then(function(){
	// 			$scope.user.chats = scopeChats;
	// 		})
	// 	};

	// 	$scope.loadListContentFromListId = function(list){
	// 		$scope.list = list;
	// 		var listId = list._id;
	// 		$scope.overlay = true;
	// 		$scope.interface.listContent = true;
	//  		dataService.getList(listId, function(response){
	// 			var list = response.data;
	// 			angular.forEach(list.items, function(item){
	// 				$scope.getMovieDetails(item, function(){
	// 					$scope.list.items.unshift(item);
	// 					$scope.list.items.pop();
	// 				});
	// 			});
	//  		});
	// 	}

	// 	$scope.loadListsLight = function(listIdArray){
	// 		var listsIds = listIdArray;
	// 		var scopeLists = [];
	// 		angular.forEach(listsIds,function(list){
	// 			dataService.getList(list, function(response){
	// 				var list = response.data;
	// 				if (list.privacy == 'public' | list.user[0]._id == $scope.user._id){
	// 					console.log('Loading ' + list.name);
	// 					if (list.items[0]) {
	// 						console.log(list.name + ' has items');
	// 						var len = list.items.length-1;
	// 						var item = list.items[len];
	// 						$scope.getMovieDetails(item, function(){
	// 							list.items.unshift(item);
	// 							list.items.pop();
	// 							scopeLists.unshift(list);
	// 						});
	// 					} else {
	// 						scopeLists.unshift(list);
	// 					};
	// 				};
	// 			});
	// 		});
	// 		return scopeLists;
	// 	};

	// 	$scope.loadNotifications = function() {
	// 		var notifications = $scope.user.notifications;
	// 		var scopeNotifications = {
	// 			read: [],
	// 			reading: [],
	// 			unread: []
	// 		};
	// 		angular.forEach(notifications, function(notification){
	// 			if (notification.read){
	// 				var userID = notification.user;
	// 				dataService.getUsername(userID, function(response){
	// 					notification.user = response.data;
	// 					scopeNotifications.read.unshift(notification);
	// 				});
	// 			} else {
	// 				var userID = notification.user;
	// 				dataService.getUsername(userID, function(response){
	// 					notification.user = response.data;
	// 					scopeNotifications.unread.unshift(notification);
	// 				});					
	// 			};
	// 		});
	// 		console.log('There are ' + scopeNotifications.read.length + ' read notifications and ' + scopeNotifications.unread.length + ' unread.');
	// 		$scope.user.notifications = scopeNotifications;
	// 	};

	// 	$scope.loadPersonFacts = function(userId, time) {
	// 		console.log('Inside loadUserFacts');
	// 		var reqBody = {
	// 				ids: [userId],
	// 				time: time
	// 			};
	// 		dataService.postFeed(reqBody, function(response){
	// 			var basicFacts = response.data.facts;	
	// 			//para cada fato básico carregado
	// 			angular.forEach(basicFacts, function(basicFact){
	// 				//criar um fato que inicialmente é igual ao fato básico
	// 				var queue = [];
	// 				var fact = basicFact;
	// 				//definir fact.like como true se usuário tiver curtido
	// 				if (fact.likes.indexOf(userId) > -1) {
	// 					fact.like = true;
	// 				} else {
	// 					fact.like = false;
	// 				};
	// 				//definir o usuário basico do fato
	// 		 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 					fact.user = response.data;
	// 				});
	// 				queue.push(r1);
	// 				//definir a lista básica do fato
	// 				var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 					fact.list = response.data;
	// 				});
	// 				queue.push(r2);
	// 				$q.all(queue).then(function(){
	// 					$scope.getMovieDetails(basicFact.item, function(){
	// 						//adicionar esse fato ao array de fatos no scope
	// 						$scope.person.facts.push(fact);
	// 					});
	// 				});
	// 			})
	// 		});
	// 	};


	// //------NAVIGATION BOOLEANS-----//
	// 	$scope.interface = {
	// 		me: false,
	// 		lists: true,
	// 		notifications: false,
	// 		meFacts: false,
	// 		feed: true,
	// 		search: false,
	// 		messages: false,
	// 		friends: false,
	// 		messageContent: false,
	// 		listContent: false,
	// 		movieContent: false,
	// 		profile: false,
	// 		singleFact: false,
	// 		searchTab: {
	// 			movies: true,
	// 			series: false,
	// 			people: false
	// 		},
	// 	};

	// 	$scope.alert = {
	// 		text: "",
	// 		show: false
	// 	};

	// //-----NAVIGATION FUNCTIONS---------//

	// 	$scope.goToBottom = function(){
	// 		// go to bottom
	// 	      $location.hash('bottom');
	// 	      // call $anchorScroll()
	// 	      $anchorScroll();
	// 	};

	// 	$scope.go = {
	// 		hideAll: function(){
	// 			$scope.interface.feed = false;
	// 			$scope.interface.search = false;
	// 			$scope.interface.messages = false;
	// 			$scope.interface.friends = false;
	// 			$scope.interface.me = false;	
	// 			$scope.overlay = false;
	// 			$scope.interface.listContent = false;
	// 			$scope.interface.movieContent = false;
	// 			$scope.interface.profile = false;
	// 			$scope.interface.messageContent = false;
	// 			$scope.interface.singleFact = false;
	// 		},
	// 		loadFeed: function(){
	// 			$scope.go.hideAll();
	// 			$scope.interface.feed = true;
	// 		},
	// 		loadSearch: function(){
	// 			$scope.go.hideAll();
	// 			$scope.interface.search = true;
	// 		},
	// 		loadMessages: function(){
	// 			$scope.go.hideAll();
	// 			$scope.interface.messages = true;
	// 		},
	// 		loadMe: function(){
	// 			$scope.go.hideAll();
	// 			$scope.interface.me = true;
	// 			$scope.interface.lists = true;
	// 			$scope.interface.notifications = false;
	// 			$scope.interface.meFacts = false;
	// 		},
	// 		loadNotifications: function(){
	// 			$scope.updateNotificationsStatus();
	// 			$scope.interface.notifications = true;
	// 			$scope.interface.lists = false;
	// 			$scope.interface.meFacts = false;
	// 		},
	// 		loadLists: function(){
	// 			$scope.interface.lists = true;
	// 			$scope.interface.notifications = false;
	// 			$scope.interface.meFacts = false;
	// 		},
	// 		loadSearchTab:{
	// 			movies: function(){
	// 				$scope.interface.searchTab.movies = true;
	// 				$scope.interface.searchTab.series = false;
	// 				$scope.interface.searchTab.people = false;
	// 			},
	// 			series: function(){
	// 				$scope.interface.searchTab.movies = false;
	// 				$scope.interface.searchTab.series = true;
	// 				$scope.interface.searchTab.people = false;
	// 			},
	// 			people: function(){
	// 				$scope.interface.searchTab.movies = false;
	// 				$scope.interface.searchTab.series = false;
	// 				$scope.interface.searchTab.people = true;
	// 			}
	// 		},
	// 		loadMeFacts: function(){
	// 			$scope.interface.meFacts = true;
	// 			$scope.interface.notifications = false;
	// 			$scope.interface.lists = false;
	// 		},
	// 		closeProfile: function(){
	// 			$scope.overlay = false;
	// 			$scope.interface.profile = false;
	// 		},
	// 		closeMessageContent: function(){
	// 			$scope.overlay = false;
	// 			$scope.interface.messageContent = false;
	// 		},
	// 		closeSingleFact: function(){
	// 			$scope.overlay = false;
	// 			$scope.interface.singleFact = false;
	// 		},
	// 		closeListContent: function(){
	// 			$scope.overlay = false;
	// 			$scope.interface.listContent = false;
	// 		},
	// 		closeMovieContent: function(){
	// 			$scope.overlay = false;
	// 			$scope.interface.movieContent = false;
	// 		}
	// 	};

	// 	$scope.loadListContent = function(list){
	// 		$scope.overlay = true;
	// 		$scope.interface.notifications = false;
	// 		$scope.interface.listContent = true;
	// 		$scope.list = list;
	// 	};

	// 	$scope.loadMsgContentFromChatList = function(chat){
	// 		$scope.chat = chat;
	// 		$scope.updateChatContent(chat._id);
	// 		$scope.overlay = true;
	// 		$scope.interface.messageContent = true;
	// 	};

	// 	$scope.loadMsgContentFromPersonId = function(person){
	// 		var personId = person._id;
	// 		//1. Verifica se existe o chat -> se não houver chat com a pessoa, retorna zero.
	// 		var chatId = $scope.checkForExistingChat(personId);
	// 			//2. Se não existir, cria o chat, pega o chat.id e define scope.chat = novo chat
	// 			if(chatId == "0"){
	// 				$scope.addNewChatToDb(person);
	// 			} else {
	// 			//3. Se já existir, pega o chat.id, define scope.chat = chat, e udpatechat content
	// 				$scope.updateChatContent(chatId);
	// 			}
	// 		$scope.overlay = true;
	// 		$scope.interface.messageContent = true;
	// 	};

	// 	// $scope.loadProfile = function(){
	// 	// 	$scope.overlay = true;
	// 	// 	$scope.interface.profile = true;
	// 	// 	$scope.person = this.user;
	// 	// 	$scope.loadPersonFacts(this.user._id);
	// 	// };

	// 	//carregar dados da person a partir do id
	// 	$scope.loadProfileFromId = function(id){
	// 		if(id === $scope.user._id){
	// 			$scope.go.loadMe();
	// 		} else {
	// 			$scope.overlay = true;
	// 			$scope.interface.profile = true;
	// 			$scope.interface.singleFact = false;
	// 			$scope.go.loadLists();
	// 			var person = {};
	// 			dataService.getPerson(id, function(response){
	// 				person = response.data;
	// 				person.lists = $scope.loadListsLight(person.lists);
	// 				person.isFollowing = $scope.isFollowing(person);
	// 				$scope.person = person;
	// 				$scope.loadPersonFacts(id, Date.now());
	// 			});
	// 		};
	// 	};

	// 	$scope.loadSingleFact = function(factId){
	// 		$scope.overlay = true;
	// 		$scope.interface.singleFact = true;

	// 		dataService.getFact(factId, function(response){
	// 			var basicFact = response.data;
	// 			var fact = response.data;
	// 			var queue = [];
	// 			//definir fact.like como true se usuário tiver curtido
	// 			var userId = $scope.user._id;
	// 			if (fact.likes.indexOf(userId) > -1) {
	// 				fact.like = true;
	// 			} else {
	// 				fact.like = false;
	// 			};
	// 	 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 				fact.user = response.data;
	// 			});
	// 			queue.push(r1);
	// 			//definir a lista básica do fato
	// 			var r2 = dataService.getList(basicFact.list, function(response){
	// 				fact.list = response.data;
	// 			});
	// 			queue.push(r2);
	// 			$q.all(queue).then(function(){
	// 				$scope.getMovieDetails(basicFact.item, function(){
	// 					//adicionar esse fato ao array de fatos no scope
	// 					$scope.singleFact = [];
	// 					$scope.singleFact[0] = fact;
	// 				});
	// 			});
	// 		});
	// 	};

	// 	$scope.selectListOfUsers = function(array, title) {
	// 		if (array[0] && !array[0].displayName) {
	// 			array = $scope.loadUsersBasicArray(array);
	// 		};
	// 		$scope.listOfUsers = {
	// 			users: [],
	// 			Title: title
	// 		};
	// 		$scope.listOfUsers.users = array;
	// 	};

	// 	$scope.loadUserFriends = function(){
	// 		if ($scope.user.following[0] && !$scope.user.following[0].displayName){
	// 			$scope.selectListOfUsers($scope.user.following, $scope.user.displayName + '\'s friends');
	// 			$scope.user.following = $scope.listOfUsers.users;
	// 		}
	// 	};

	// 	$scope.checkListsWithItem = function(item){
	// 	//for each list in user.lists
	// 	var imdbID = item.imdbID;
	// 	angular.forEach($scope.user.lists, function(list){
	// 			//check if item belongs to the list
	// 			list.hasItem = false;
	// 			angular.forEach(list.items, function(item){
	// 				//if it does
	// 				if(item.imdbID == imdbID){
	// 					 //set list.hasItem = true
	// 					 list.hasItem = true;
	// 				};
	// 			});
	// 		});
	// 	};

	// 	$scope.loadMovieContent = function(item){
	// 		$scope.overlay = true;
	// 		$scope.interface.movieContent = true;
	// 		item.recommended = $scope.checkRecommended(item.imdbID);
	// 		item.disliked = $scope.checkDisliked(item.imdbID);
	// 		item.checkmarked = $scope.checkCheckmarked(item.imdbID);
	// 		item.bookmarked = $scope.checkBookmarked(item.imdbID);
	// 		$scope.item = item;
	// 		$scope.checkListsWithItem(item);
	// 	};

	// 	$scope.loadNewList = function(){
	// 		var listUser = {
	// 			_id: this.user._id,
	// 			displayName: this.user.displayName
	// 		};
	// 		$scope.list = {
	// 			name: '',
	// 			type: 'custom',
	// 			user: [listUser],
	// 			privacy: 'public',
	// 			items: []
	// 		};
	// 	};

	// //-----NOTIFICATIONS---------//

	// 	$scope.updateNotificationsStatus = function(){
	// 		if($scope.user.notifications.unread){
	// 			var oldNotifications = $scope.user.notifications;
	// 			angular.forEach(oldNotifications.unread, function(notification){
	// 				notification.read = true;
	// 			});
	// 			var newNotifications = {
	// 				unread: [],
	// 				reading: oldNotifications.unread,
	// 				read: oldNotifications.read
	// 			};
	// 			var justRead = oldNotifications.reading;
	// 			if (justRead.length !== 0){
	// 				angular.forEach(justRead, function(notification){
	// 					newNotifications.read.push(notification);
	// 				});
	// 			};
	// 			$scope.user.notifications = newNotifications;
	// 			$scope.updateNotificationsToDb();
	// 		};
	// 	};

	// 	$scope.updateNotificationsToDb = function(){
	// 		var userID = $scope.user._id;
	// 		var dbNotifications = [];
	// 		var scopeNotifications = $scope.user.notifications;
	// 		angular.forEach(scopeNotifications.unread, function(notification){
	// 			var dbNotification = {
	// 				user: notification.user._id,
	// 				type: notification.type,
	// 				read: notification.read,
	// 				time: notification.time
	// 			};
	// 			if (notification.fact) {
	// 				dbNotification.fact = notification.fact;
	// 			};
	// 			dbNotifications.push(dbNotification)
	// 		});
	// 		angular.forEach(scopeNotifications.reading, function(notification){
	// 			var dbNotification = {
	// 				user: notification.user._id,
	// 				type: notification.type,
	// 				read: notification.read,
	// 				time: notification.time
	// 			};
	// 			if (notification.fact) {
	// 				dbNotification.fact = notification.fact;
	// 			};
	// 			dbNotifications.push(dbNotification)
	// 		});
	// 		angular.forEach(scopeNotifications.read, function(notification){
	// 			var dbNotification = {
	// 				user: notification.user._id,
	// 				type: notification.type,
	// 				read: notification.read,
	// 				time: notification.time
	// 			};
	// 			if (notification.fact) {
	// 				dbNotification.fact = notification.fact;
	// 			};
	// 			dbNotifications.push(dbNotification)
	// 		});
	// 		var reqBody = {
	// 			user: {_id: userID},
	// 			notifications: dbNotifications,
	// 			action: 'updateNotifications'
	// 		};
	// 		dataService.updateUserToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 	};

	// //-----CHAT---------//

	// 	$scope.checkForExistingChat = function(personId){
	// 			var chats = $scope.user.chats;
	// 			var personId = personId;
	// 			var scopeChat = {};
	// 			var response = "0";
	// 		//se existir chat, retorna chatId
	// 		//se não existir chat retorna 0
	// 			angular.forEach(chats, function(chat){
	// 				if(!chat.group && chat.users[0]._id == personId){
	// 					scopeChat = chat;
	// 					$scope.chat = scopeChat;
	// 					response = chat._id;
	// 				}
	// 			});
	// 			return response;
	// 	};

	// 	$scope.addNewChatToDb = function(person){
	// 		var user = $scope.user;
	// 		var dbChat = {
	// 			users: [user._id, person._id],
	// 			group: false,
	// 			messages: []
	// 		};
	// 		var scopeChat;
	// 		dataService.addNewChatToDb(dbChat, function(response){
	// 			console.log(response.data.message);
	// 			var chatId = response.data.chat._id;
	// 			scopeChat = response.data.chat;
	// 			socket.emit('new-chat-to-server', response.data.chat);
	// 			scopeChat.users = $scope.loadUsersBasicArray(response.data.chat.users);
	// 			$scope.chat = scopeChat;
	// 			$scope.user.chats.unshift(scopeChat);

	// 		//then updates user with new chat to user database
	// 			var reqBody = {
	// 				user: {_id: user._id, displayName: user.displayName},
	// 				chat: chatId,
	// 				action: 'newChat'
	// 			};
	// 			var reqBodyPerson = {
	// 				user: {_id: person._id, displayName: person.displayName},
	// 				chat: chatId,
	// 				action: 'newChat'
	// 			};
	// 		//udpate user with chat id
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		//update person with chat id
	// 			dataService.updateUserToDatabase(reqBodyPerson, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 			return scopeChat;
	// 		});
	// 	};

	// 	$scope.appendMessage = function(dbMessage){
	// 		console.log('Inside appendMessage');
	// 		var message = {
	// 			time: dbMessage.time,
	// 			user: dbMessage.user,
	// 			text: dbMessage.text,
	// 			me: true
	// 		};
	// 		if (dbMessage.user !== $scope.user._id){
	// 			message.me = false;
	// 		};
	// 		$scope.chat.messages.unshift(message);
	// 	};

	// 	$scope.submitMessage = function(){
	// 		var time = Date.now();
	// 		var text = $scope.newMessage.text;
	// 		var userID = $scope.user._id;
	// 		var chatID = $scope.chat._id;
	// 		var to = [];
	// 		angular.forEach($scope.chat.users, function(user){
	// 			to.unshift(user._id);
	// 		});

	// 		var dbMessage = {
	// 			time: time,
	// 			text: text,
	// 			user: userID
	// 		};
	// 		var reqBody = {
	// 			id: chatID,
	// 			to: to,
	// 			dbMessage: dbMessage
	// 		};
	// 		dataService.submitMessageToChat(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			if(response.data){
	// 				socket.emit('msg-to-server', reqBody);
	// 			} else {
	// 				console.log('Message could not be sent');
	// 			}
	// 		});
	// 		$scope.newMessage.text = "";
	// 		$scope.appendMessage(dbMessage);
	// 		$scope.goToBottom();
	// 	};

	// 	$scope.sendItem = function(chat, item){
	// 		var time = Date.now();
	// 		var text = "";
	// 		var userID = $scope.user._id;
	// 		var dbMessage = {
	// 			time: time,
	// 			text: text,
	// 			user: userID,
	// 			attachment: {
	// 				type: item.Type,
	// 				imdbID: item.imdbID
	// 			}
	// 		};
	// 		var to = [];
	// 		angular.forEach(chat.users, function(user){
	// 			to.unshift(user._id);
	// 		});
	// 		var reqBody = {
	// 			id: chat._id,
	// 			to: to,
	// 			dbMessage: dbMessage
	// 		};
	// 		dataService.submitMessageToChat(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			socket.emit('msg-to-server', reqBody);
	// 		});

	// 		$scope.chat = chat;
	// 		$scope.overlay = true;
	// 		$scope.interface.messageContent = true;
	// 		$scope.interface.movieContent = false;
	// 		$scope.updateChatContent(chat._id);
	// 	};

	// 	$scope.sendItemFromPersonId = function(person, item){
	// 		var personId = person._id;
	// 		//1. Verifica se existe o chat -> se não houver chat com a pessoa, retorna zero.
	// 		var chatId = $scope.checkForExistingChat(personId);
	// 			//2. Se não existir, cria o chat, pega o chat.id e define scope.chat = novo chat
	// 			if(chatId == "0"){
	// 				//copiando função addNewChatToDb inteira, incluindo apenas o sendItem no final
	// 				var user = $scope.user;
	// 				var dbChat = {
	// 					users: [user._id, person._id],
	// 					group: false,
	// 					messages: []
	// 				};
	// 				var scopeChat;
	// 				dataService.addNewChatToDb(dbChat, function(response){
	// 					console.log(response.data.message);
	// 					var chatId = response.data.chat._id;
	// 					scopeChat = response.data.chat;
	// 					socket.emit('new-chat-to-server', response.data.chat);
	// 					scopeChat.users = $scope.loadUsersBasicArray(response.data.chat.users);
	// 					$scope.chat = scopeChat;
	// 					$scope.user.chats.unshift(scopeChat);

	// 				//then updates user with new chat to user database
	// 					var reqBody = {
	// 						user: {_id: user._id, displayName: user.displayName},
	// 						chat: chatId,
	// 						action: 'newChat'
	// 					};
	// 					var reqBodyPerson = {
	// 						user: {_id: person._id, displayName: person.displayName},
	// 						chat: chatId,
	// 						action: 'newChat'
	// 					};
	// 				//udpate user with chat id
	// 					dataService.updateUserToDatabase(reqBody, function(response){
	// 						console.log(response.data.message);
	// 					});
	// 				//update person with chat id
	// 					dataService.updateUserToDatabase(reqBodyPerson, function(response){
	// 						console.log(response.data.message);
	// 					});
	// 					$scope.sendItem({_id: chatId, users: [person]}, item);
	// 				});
					
	// 			} else {
	// 			//3. Se já existir, pega o chat.id, define scope.chat = chat, e udpatechat content
	// 				$scope.updateChatContent(chatId);
	// 				$scope.sendItem({_id: chatId, users: [person]}, item);
	// 			}
	// 		$scope.overlay = true;
	// 		$scope.interface.messageContent = true;
	// 	};


	// 	$scope.updateChatContent = function(chatId){
	// 		var scopeMessages;
	// 		var userID = $scope.user._id;
	// 		//Pegar 10 mensagens mais recentes do chat
	// //		var request = 
	// 		dataService.updateChat(chatId, function(response){
	// 			scopeMessages = response.data.messages;
	// 			angular.forEach(scopeMessages, function(message){
	// 				if(message.user === userID){
	// 					message.me = true;
	// 				} else {
	// 					message.me =false;
	// 				}
	// 			});
	// 			angular.forEach(scopeMessages, function(message){
	// 				if(message.attachment && message.attachment.type === "movie"){
	// 					message.attachment.item = message.attachment;
	// 					$scope.getMovieDetails(message.attachment.item);
	// 				};
	// 			});
	// 			$scope.chat.messages = scopeMessages;
	// //			console.log(scopeMessages);
	// 		});
	// //		$q.all(request).then(function(){
	// //			$scope.chat.messages = scopeMessages;
	// //		});

	// 	};


	// //-----------LIST CONTENT---------------//
	// 	$scope.selectItem = function(item){
	// 		$scope.item = item;
	// 	};

	// 	$scope.removeItemFromList = function(item){
	// 		//remover item da lista no scope
	// 		var items = this.list.items;
	// 		var imdbID = item.imdbID;
	// 		var $index;
	// 		var i = -1;
	// 		angular.forEach(items, function(item){
	// 			i += 1;
	// 			if (item.imdbID === imdbID) {
	// 				$index = i;
	// 			};
	// 		});
	// 		//Remove list from $scope.user.lists
	// 		if ( $index !== -1) {
	// 			var scopeItem = items[$index];
	// 			$scope.list.items.splice($index, 1);
	// 		};
	// 		//atualizar lista para o database de listas
	// 		var reqBody = {
	// 			listId: $scope.list._id,
	// 			action: 'delete',
	// 			item: {
	// 				imdbID: scopeItem.imdbID,
	// 				Type: scopeItem.Type
	// 			}
	// 		};
	// 		dataService.updateListToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 		//pull a lista do filme no database de filmes
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		var listId = $scope.list._id;
	// 		if ($scope.list.type === 'recommendation'){
	// 			var action = 'deleteRecommendation';
	// 		} else {
	// 			var action = 'delete'
	// 		};
	// 		var reqBody = {
	// 			movie: dbMovie,
	// 			listId: listId,
	// 			action: action
	// 		};
	// 		//update item to database with list in item.lists array
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//remove correspondent fact from facts database
	// 			var fact = {
	// 				user: $scope.user._id,
	// 				item: dbMovie,
	// 			};
	// 			var reqBody = {
	// 				fact: fact,
	// 				query: 'check'
	// 			};
	// 			dataService.saveFact(reqBody, function(response){
	// 				console.log('Response fact: '+ response.data.fact);
	// 				console.log(response.data.fact);
	// 				if(response.data.fact !== undefined){
	// 					$scope.deleteFact(response.data.fact, listId);
	// 				}
	// 			});
	// 		});
	// 	};

	// 	$scope.loadListItems = function(basicList) {
	// 		var list = basicList;
	// 		var scopeItems = [];
	// 		angular.forEach(list.items, function(item){
	// 			$scope.getMovieDetails(item, function(){
	// 				scopeItems.unshift(item);
	// 			});
	// 		});
	// 		list.items = scopeItems;
	// 		return list;
	// 	};

	// 	$scope.loadListContentFromBasicList = function(basicList){
	// 		var list = $scope.loadListItems(basicList);
	// 		$scope.loadListContent(list);
	// 	};

	// //-----------SEARCH---------------//

	// 	$scope.getMovieDetails = function(item, cb){
	// 		item.recommended = $scope.checkRecommended(item.imdbID);
	// 		item.disliked = $scope.checkDisliked(item.imdbID);
	// 		item.checkmarked = $scope.checkCheckmarked(item.imdbID);
	// 		item.bookmarked = $scope.checkBookmarked(item.imdbID);
	// 		var queue = [];
	// 		var r1 = dataService.getMovieDetails(item.imdbID, function(response){
	// 			if (response.data.Response === 'True'){
	// 				item.Title = response.data.Title;
	// 				item.Year = response.data.Year;
	// 				item.Poster = response.data.Poster;
	// 				item.imdbID = response.data.imdbID,
	// 				item.Type = response.data.Type,
	// 				item.Released = response.data.Released;
	// 				item.Runtime = response.data.Runtime;
	// 				item.Genre = response.data.Genre;
	// 				item.Director = response.data.Director;
	// 				item.Writer = response.data.Writer;
	// 				item.Actors = response.data.Actors;
	// 				item.Plot = response.data.Plot;
	// 				item.Language = response.data.Language;
	// 				item.Country = response.data.Country;
	// 				item.Awards = response.data.Awards;
	// 				item.Metascore = response.data.Metascore;
	// 				item.imdbRating = response.data.imdbRating;
	// 				item.imdbVotes = response.data.imdbVotes;
	// 				item.Ratings = response.data.Ratings
	// 			};
	// 		});
	// 		queue.push(r1);
	// 		var r2 = dataService.getMovie(item.imdbID, function(response){
	// 			if (response.data.movie[0]){
	// 				if(response.data.movie[0].lists){
	// 					item.lists = response.data.movie[0].lists;
	// 				} else {
	// 					item.lists = [];
	// 				};
	// 				if(response.data.movie[0].recommendation){
	// 					item.recommendation = response.data.movie[0].recommendation;
	// 				} else {
	// 					item.recommendation = [];
	// 				};
	// 				if(response.data.movie[0].seen){
	// 					item.seen = response.data.movie[0].seen;
	// 				} else {
	// 					item.seen = []
	// 				};
	// 				if(response.data.movie[0].watchlist){
	// 					item.watchlist = response.data.movie[0].watchlist;
	// 				} else {
	// 					item.watchlist = []
	// 				};
	// 				if(response.data.movie[0].dislike){
	// 					item.dislike = response.data.movie[0].dislike;
	// 				} else {
	// 					item.dislike = [];
	// 				};
	// 				if(response.data.movie[0].facts){
	// 					item.facts = response.data.movie[0].facts;
	// 				} else {
	// 					item.facts = [];
	// 				};
	// 				item.netflix = false;
	// 				if(response.data.movie[0].nfcountry){
	// 					angular.forEach(response.data.movie[0].nfcountry, function(nfcountry){
	// 						if(nfcountry === $scope.country[1]){
	// 							item.netflix = true;
	// 							item.nfid = response.data.movie[0].nfid;
	// 						};
	// 					});
	// 				}
	// 			} else {
	// 				item.lists = [];
	// 				item.recommendation = [];
	// 				item.seen = [];
	// 				item.watchlist = [];
	// 				item.dislike = [];
	// 				item.facts = [];
	// 				item.netflix = false;
	// 			};
	// 		});
	// 		queue.push(r2);
	// 		//pegar poster em alta resolução
	// 		$q.all(queue).then(cb);
	// 	};

	// 	$scope.isFollowing = function(person){
	// 		var personId = person._id;
	// 		var user = $scope.user;
	// 		var test = false;
	// 		angular.forEach(user.following, function(followee){
	// 			if(personId == followee._id | personId == followee){
	// 				test = true;
	// 			};
	// 		});
	// 		return test;
	// 	};

	// 	$scope.checkRecommended = function(imdbID){
	// 		var test = false;
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'recommendation'){
	// 				angular.forEach(list.items, function(item){
	// 					if (item.imdbID === imdbID){
	// 						test = true;
	// 					}
	// 				});
	// 			};
	// 		});
	// 		return test;
	// 	};

	// 	$scope.checkDisliked = function(imdbID){
	// 		var test = false;
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'dislike'){
	// 				angular.forEach(list.items, function(item){
	// 					if (item.imdbID === imdbID){
	// 						test = true;
	// 					}
	// 				});
	// 			};
	// 		});
	// 		return test;
	// 	};

	// 	$scope.checkCheckmarked = function(imdbID){
	// 		var test = false;
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'seen'){
	// 				angular.forEach(list.items, function(item){
	// 					if (item.imdbID === imdbID){
	// 						test = true;
	// 					}
	// 				});
	// 			};
	// 		});
	// 		return test;
	// 	};

	// 	$scope.checkBookmarked = function(imdbID){
	// 		var test = false;
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'watchlist'){
	// 				angular.forEach(list.items, function(item){
	// 					if (item.imdbID === imdbID){
	// 						test = true;
	// 					}
	// 				});
	// 			};
	// 		});
	// 		return test;
	// 	};

	// 	$scope.search = {
	// 		input: "",
	// 		movieResults: [],
	// 		peopleResults: [],
	// 		seriesResults: [],
	// 		movieCounter: 0,
	// 		seriesCounter: 0,
	// 		submit: function() {
	// 			console.log('Search ' + this.input);
	// 			dataService.getSearchResults(this.input, 1, function(response){
	// 				var success = response.data.Response;
	// //				$scope.search.movieCounter = response.data.totalResults;
	// 				if (success) {
	// 					$scope.search.movieResults.splice(0,$scope.search.movieResults.length);
	// 					$scope.search.seriesResults.splice(0,$scope.search.movieResults.length);
	// 					var results = response.data.Search;
	// 					angular.forEach(results, function(item) {
	// 						if (item.Poster !== "N/A") {
	// 							$scope.getMovieDetails(item, function(){
	// 								if (item.Type === 'movie'){
	// 									$scope.search.movieResults.push(item);
	// 								} else if(item.Type === 'series'){
	// 									$scope.search.seriesResults.push(item);
	// 								};
	// 							});
	// 						};
	// 					});
	// 				} else {
	// 					console.log('Sorry, your search did not return a response.');
	// 				};
	// 			});
	// 			dataService.getPeopleResults(this.input, function(response){
	// 				var success = response.data.Response;
	// 				if (success) {
	// 					$scope.search.peopleResults.splice(0,$scope.search.peopleResults.length);
	// 					var peopleResults = response.data.Search;
	// 					angular.forEach(peopleResults, function(person) {
	// 						var person = person;
	// //						person.lists = $scope.loadListsLight(person.lists);
	// 						person.isFollowing = $scope.isFollowing(person);
	// 						$scope.search.peopleResults.push(person);
	// 					});
	// 				} else {
	// 					console.log('Sorry, your search did not return a response.');
	// 				};
	// 			});
	// 		}
	// 	};


	// //-----------NEW LIST---------------//

	// //Saving list to database
	// 	$scope.exportList = function(){
	// 		var list = $scope.list;
	// 		var dblist = {
	// 			name: list.name,
	// 			type: list.type,
	// 			user: list.user,
	// 			privacy: list.privacy,
	// 			items: list.items,
	// 			dateOfCreation: Date.now(),
	// 			dateOfChange: Date.now()
	// 		};
	// 		console.log('Created exportable list for ' + dblist.name);
	// 		return dblist;		
	// 	};

	// 	$scope.addNewListToDb = function() {
	// 		//convert the scope list to an exportable list which saves only the user's id to its user
	// 		var dblist = $scope.exportList();
	// 		console.log('Controller is still working and has the object dblist whose name is ' + dblist.name);
	// 		dataService.addNewListToDb(dblist, function(response){
	// 			console.log(response.data.message);
	// 			var listId = response.data.list._id;
	// 			$scope.list._id = listId;
	// 			$scope.list.dateOfCreation = response.data.list.dateOfCreation,
	// 			$scope.list.dateOfChange = response.data.list.dateOfChange,
	// 		//then add the list to the user in the scope
	// 			$scope.user.lists.unshift($scope.list);
	// 		//then updates user with new list to user database
	// 			var userId = $scope.user._id;
	// 		//trocar por salvar só lista
	// 		 	var reqBody = {
	// 				user: {_id: userId},
	// 				action: 'addList',
	// 				listId: listId
	// 			};
	// 			dataService.updateUserToDatabase(reqBody, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 		});
	// 	};

	// 	$scope.newListNext = function(){
	// 		var list = $scope.list;
	// 		//if list name is empty, ask again
	// 		if(list.name === "") {
	// 			$scope.emptyListName = true;
	// 		} else {
	// 		//else load list content UI for new empty list
	// 			$scope.loadListContent(list);
	// 			if($scope.emptyListName) {
	// 				$scope.emptyListName = false;
	// 			};
	// 		//then add the new list to the list's database
	// 			$scope.addNewListToDb();
	// 		};
	// 	};

	// //-------------- DELETE LIST -------------//

	// 	$scope.deleteList = function(){
	// 		//close listContent UI
	// 		$scope.go.closeListContent();
	// 		//identify desired list position in scope.user.lists
	// 		var list = $scope.list;
	// 		var id = $scope.list._id;
	// 		var lists = $scope.user.lists;

	// 		//For each item in the list
	// 		var queue = [];
	// 		angular.forEach(list.items, function(item){
	// 			//delete the list from its lists
	// 			var request;
	// 				//pull a lista do filme no database de filmes
	// 				var dbMovie = {imdbID: item.imdbID};
	// 				var reqBody = {
	// 					movie: dbMovie,
	// 					listId: id,
	// 					action: 'delete'
	// 				};
	// 				//update item to database with list in item.lists array
	// 				request = dataService.updateMovieToDatabase(reqBody, function(response){
	// 					console.log(response.data.message);
	// 				});

	// 			queue.push(request);
	// 		});

	// 		$q.all(queue).then(function(){
	// 		//Find list position in user lists
	// 		var $index;
	// 		var i = -1;
	// 		angular.forEach(lists, function(list){
	// 			i += 1;
	// 			if (list._id === id) {
	// 				$index = i;
	// 			};
	// 		});

	// 		//Remove list from $scope.user.lists
	// 		if ( $index !== -1) {
	// 			$scope.user.lists.splice($index, 1);
	// 		};
	// 		//Remove list from List database
	// 		dataService.deleteList(id, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 		dataService.deleteFactsFromList(id, function(response){
	// 			console.log(response.data.message);
	// 			$scope.user.facts = [];
	// 			$scope.loadUserFacts($scope.user._id, Date.now());
	// 		});
	// 		dataService.getUser(function(response){ 
	// 	    	$scope.loadFeed(response.data);
	// 	    });
	// 		//Update user to database
	// 		var userId = $scope.user._id;
	// 		var listId = list._id;

	// 	 	var reqBody = {
	// 			user: {_id: userId},
	// 			action: 'deleteList',
	// 			listId: listId
	// 		};
	// 		dataService.updateUserToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 		//Show success alert
	// 		});
	// 	};

	// //-------------- MOVIE CONTENT -------------//

	// //Adding new item to list database
	// 	$scope.updateListToDatabase = function(){
	// 		console.log('Running updateListToDatabase');
	// 	 	var list = $scope.list;
	// 	 	var dbitems = [];
	// 	 	var dbDate = [];
	// 	 	// for each item in list.items
	// 	 	angular.forEach(list.items, function(item){
	// 	 		var dbitem = {
	// 	 			imdbID: item.imdbID,
	// 	 			Type: item.Type
	// 	 		};
	// 	 		dbitems.unshift(dbitem);
	// 		});
	// 		console.log(dbitems);
	// 	//Create exportable list with limited item info before sending it to database
	// 	 	var dblist = {
	// 	 		_id: list._id,
	// 	 		name: list.name,
	// 	 		type: list.type,
	// 	 		privacy: list.privacy,
	// 	 		//deal with list users in a better way
	// 	 		user: list.user,
	// 	 		allowed: list.allowed,
	// 	 		items: dbitems,
	// 	 		dateOfCreation: list.dateOfCreation,
	// 	 		dateOfChange: Date.now()
	// 	 	};
	// 		dataService.updateListToDatabase(dblist, function(response){
	// 			console.log(response.data.message);
	// 		});
	// 	};

	// 	$scope.exportMovie = function(item) {
	// 		var dbMovie = {
	// 			Title: item.Title,
	// 			Year: item.Year,
	// 			Released: item.Released,
	// 			Runtime: item.Runtime,
	// 			Genre: item.Genre,
	// 			Director: item.Director,
	// 			Writer: item.Writer,
	// 			Actors: item.Actors,
	// 			Plot: item.Plot,
	// 			Language: item.Language,
	// 			Country: item.Country,
	// 			Awards: item.Awards,
	// 			Poster: item.Poster,
	// 			Metascore: item.Metascore,
	// 			imdbRating: item.imdbRating,
	// 			imdbVotes: item.imdbVotes,
	// 			imdbID: item.imdbID,
	// 			Ratings: item.Ratings,
	// 			Type: item.Type,
	// 		};
	// 		console.log('Created exportable item for ' + dbMovie.Title);
	// 		return dbMovie;				
	// 	};

	// 	$scope.pinToList = function(){
	// 		var user = $scope.user;
	// 		var list = this.list;
	// 		var listId = list._id;
	// 		var date = Date.now();
	// 		//add list to item in the scope
	// 		$scope.item.lists.unshift(list);
	// 		console.log('Added list ' + this.list.name + ' to ' + this.item.Title + ' at the scope.')

	// 		//dado que ou está no movie content, ou teve selectItem para abrir modal de chooseList
	// 		var item = $scope.item;

	// 		//upsert item to database
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		var reqBody = {
	// 			movie: dbMovie,
	// 			action: 'add',
	// 		};

	// 		var reqBody2 = {
	// 			movie: {imdbID: item.imdbID},
	// 			listId: list._id,
	// 			action: 'addList',
	// 		};
	// 		var reqBody3 = {
	// 			listId: list._id,
	// 			item: {
	// 	 			imdbID: item.imdbID,
	// 	 			Type: item.Type
	// 	 		},
	// 	 		date: date,
	// 	 		action: 'add'
	// 		};
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//then add the list to the item in the database
	// 			dataService.updateMovieToDatabase(reqBody2, function(response2){
	// 				console.log(response2.data.message);
	// 			});
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			console.log('Executing cb2');
	// 			console.log(reqBody3);
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				$scope.generateFact(user._id, item, list._id, list.privacy);
	// 				//show alert
	// 				$scope.alert.list = list;
	// 				$scope.alert.text = item.Title + ' was added to ';
	// 				$scope.alert.show = true;

	// 			});
	// 		});

	// 		//identificar list entre user lists no scope
	// 		var $index;
	// 		var i = -1;
	// 		angular.forEach($scope.user.lists, function(userlist){
	// 			i += 1;
	// 			if(userlist._id === listId){
	// 				//unshift o item
	// 				$index = i;
	// 			}
	// 		});
	// 		$scope.user.lists[$index].items.unshift(item);
	// 		$scope.user.lists[$index].dateOfChange = date;
	// 	};

	// 	$scope.recommend = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running recommend');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'recommendation'){
	// 				listId = list._id;
	// 				list.items.unshift(item);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 			//change like on scope and add class
	// 			item.recommended = true;
	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				action: 'add',
	// 			};
	// 			var reqBody2 = {
	// 				movie: {imdbID: item.imdbID},
	// 				listId: listId,
	// 				action: 'addRecommendation',
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				item: {
	// 		 			imdbID: item.imdbID,
	// 		 			Type: item.Type
	// 		 		},
	// 		 		date: date,
	// 		 		action: 'add'
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//then add the list to the item in the database

	// 				dataService.updateMovieToDatabase(reqBody2, function(response2){
	// 					console.log(response2.data.message);
	// 						if(!item.recommendation){
	// 							item.recommendation = [];							
	// 						};
	// 						item.recommendation.push(listId);

	// 				});
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			console.log('Executing cb2');
	// 			console.log(reqBody3);
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//generate fact if list is public
	// 				dataService.getList(listId, function(response){
	// 					var list = response.data;
	// 		 			if (list.privacy == "public"){
	// 						$scope.generateFact($scope.user._id, item, listId, list.privacy);
	// 		 			};
	// 				});
	// 				//show alert
	// 			});
	// 		});
	// 	};

	// 	$scope.checkmark = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running checkmark');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'seen'){
	// 				listId = list._id;
	// 				list.items.unshift(item);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 			//change like on scope and add class
	// 			item.checkmarked = true;
	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				action: 'add',
	// 			};
	// 			var reqBody2 = {
	// 				movie: {imdbID: item.imdbID},
	// 				listId: listId,
	// 				action: 'addSeen',
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				item: {
	// 		 			imdbID: item.imdbID,
	// 		 			Type: item.Type
	// 		 		},
	// 		 		date: date,
	// 		 		action: 'add'
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//then add the list to the item in the database

	// 				dataService.updateMovieToDatabase(reqBody2, function(response2){
	// 					console.log(response2.data.message);
	// 						if(!item.seen){
	// 							item.seen = [];
	// 						};
	// 						item.seen.push(listId);
	// 				});
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			console.log('Executing cb2');
	// 			console.log(reqBody3);
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//generate fact if list is public
	// 				dataService.getList(listId, function(response){
	// 					var list = response.data;
	// 		 			if (list.privacy == "public"){
	// 						$scope.generateFact($scope.user._id, item, listId, list.privacy);
	// 		 			};
	// 				});
	// 				//show alert
	// 			});
	// 		});
	// 	};

	// 	$scope.bookmark = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running add to watchlist');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'watchlist'){
	// 				listId = list._id;
	// 				list.items.unshift(item);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 			//change like on scope and add class
	// 			item.bookmarked = true;
	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				action: 'add',
	// 			};
	// 			var reqBody2 = {
	// 				movie: {imdbID: item.imdbID},
	// 				listId: listId,
	// 				action: 'addWatchlist',
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				item: {
	// 		 			imdbID: item.imdbID,
	// 		 			Type: item.Type
	// 		 		},
	// 		 		date: date,
	// 		 		action: 'add'
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//then add the list to the item in the database

	// 				dataService.updateMovieToDatabase(reqBody2, function(response2){
	// 					console.log(response2.data.message);
	// 						if(!item.watchlist){
	// 							item.watchlist = [];
	// 						};
	// 						item.watchlist.push(listId);
	// 				});
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			console.log('Executing cb2');
	// 			console.log(reqBody3);
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//generate fact if list is public
	// 				dataService.getList(listId, function(response){
	// 					var list = response.data;
	// 		 			if (list.privacy == "public"){
	// 						$scope.generateFact($scope.user._id, item, listId, list.privacy);
	// 		 			};
	// 				});
	// 				//show alert
	// 			});
	// 		});
	// 	};

	// 	$scope.dislike = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running dislike');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'dislike'){
	// 				listId = list._id;
	// 				list.items.unshift(item);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 			//change like on scope and add class
	// 			item.disliked = true;
	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				action: 'add',
	// 			};
	// 			var reqBody2 = {
	// 				movie: {imdbID: item.imdbID},
	// 				listId: listId,
	// 				action: 'addDislike',
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				item: {
	// 		 			imdbID: item.imdbID,
	// 		 			Type: item.Type
	// 		 		},
	// 		 		date: date,
	// 		 		action: 'add'
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			//then add the list to the item in the database

	// 				dataService.updateMovieToDatabase(reqBody2, function(response2){
	// 					console.log(response2.data.message);
	// 						if(!item.dislike){
	// 							item.dislike = [];
	// 						};
	// 						item.dislike.push(listId);
	// 				});
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			console.log('Executing cb2');
	// 			console.log(reqBody3);
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//generate fact if list is public
	// 				dataService.getList(listId, function(response){
	// 					var list = response.data;
	// 		 			if (list.privacy == "public"){
	// 						$scope.generateFact($scope.user._id, item, listId, list.privacy);
	// 		 			};
	// 				});
	// 				//show alert
	// 			});
	// 		});
	// 	};

	// 	$scope.unrecommend = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running unrecommend');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'recommendation'){
	// 				listId = list._id;
	// 				var index = list.items.indexOf(item);
	// 				list.items.splice(index, 1);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 		console.log('Found recommendations list: '+ listId);
	// 			//change like on scope and add class
	// 			item.recommended = false;			

	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				listId: listId,
	// 				action: 'deleteRecommendation'
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				action: 'delete',
	// 				item: {
	// 					imdbID: item.imdbID,
	// 					Type: item.Type
	// 				}
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			var index = item.recommendation.indexOf(listId);
	// 			item.recommendation.splice(index, 1);
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//get factId
	// 				var fact = {
	// 					user: userId,
	// 					item: dbMovie,
	// 				};
	// 				var reqBody = {
	// 					fact: fact,
	// 					query: 'check'
	// 				};
	// 				dataService.saveFact(reqBody, function(response){
	// 					console.log('Response fact: '+ response.data.fact);
	// 					console.log(response.data.fact);
	// 					if(response.data.fact !== undefined){
	// 						$scope.deleteFact(response.data.fact, listId);
	// 					}
	// 				});
	// 			});
	// 		});
	// 	};

	// 	$scope.uncheckmark = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running uncheckmark');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'seen'){
	// 				listId = list._id;
	// 				var index = list.items.indexOf(item);
	// 				list.items.splice(index, 1);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 		console.log('Found seen list: '+ listId);
	// 			//change like on scope and add class
	// 			item.checkmarked = false;			

	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				listId: listId,
	// 				action: 'deleteSeen'
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				action: 'delete',
	// 				item: {
	// 					imdbID: item.imdbID,
	// 					Type: item.Type
	// 				}
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			var index = item.seen.indexOf(listId);
	// 			item.seen.splice(index, 1);
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//get factId
	// 				var fact = {
	// 					user: userId,
	// 					item: dbMovie,
	// 				};
	// 				var reqBody = {
	// 					fact: fact,
	// 					query: 'check'
	// 				};
	// 				dataService.saveFact(reqBody, function(response){
	// 					console.log('Response fact: '+ response.data.fact);
	// 					console.log(response.data.fact);
	// 					if(response.data.fact !== undefined){
	// 						$scope.deleteFact(response.data.fact, listId);
	// 					}
	// 				});
	// 			});
	// 		});
	// 	};

	// 	$scope.unbookmark = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running unbookmark');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'watchlist'){
	// 				listId = list._id;
	// 				var index = list.items.indexOf(item);
	// 				list.items.splice(index, 1);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 		console.log('Found watchlist: '+ listId);
	// 			//change like on scope and add class
	// 			item.bookmarked = false;			

	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				listId: listId,
	// 				action: 'deleteWatchlist'
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				action: 'delete',
	// 				item: {
	// 					imdbID: item.imdbID,
	// 					Type: item.Type
	// 				}
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			var index = item.watchlist.indexOf(listId);
	// 			item.watchlist.splice(index, 1);
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//get factId
	// 				var fact = {
	// 					user: userId,
	// 					item: dbMovie,
	// 				};
	// 				var reqBody = {
	// 					fact: fact,
	// 					query: 'check'
	// 				};
	// 				dataService.saveFact(reqBody, function(response){
	// 					console.log('Response fact: '+ response.data.fact);
	// 					console.log(response.data.fact);
	// 					if(response.data.fact !== undefined){
	// 						$scope.deleteFact(response.data.fact, listId);
	// 					}
	// 				});
	// 			});
	// 		});
	// 	};

	// 	$scope.undislike = function(item){
	// 		var userId = $scope.user._id;
	// 		var listId = "";
	// 		var date = Date.now();
	// 		console.log('Running undislike');
	// 		var dbMovie = {imdbID: item.imdbID};
	// 		//localiza lista de recommendations do usuário
	// 		angular.forEach($scope.user.lists, function(list){
	// 			if (list.type === 'dislike'){
	// 				listId = list._id;
	// 				var index = list.items.indexOf(item);
	// 				list.items.splice(index, 1);
	// 				list.dateOfChange = date;
	// 			}
	// 		});
	// 		console.log('Found dislike list: '+ listId);
	// 			//change like on scope and add class
	// 			item.disliked = false;			

	// 			var reqBody = {
	// 				movie: dbMovie,
	// 				listId: listId,
	// 				action: 'deleteDislike'
	// 			};
	// 			var reqBody3 = {
	// 				listId: listId,
	// 				action: 'delete',
	// 				item: {
	// 					imdbID: item.imdbID,
	// 					Type: item.Type
	// 				}
	// 			};
	// 		//upsert item to database or remove listid from item
	// 		dataService.updateMovieToDatabase(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			var index = item.dislike.indexOf(listId);
	// 			item.dislike.splice(index, 1);
	// 		}, function(){
	// 			//then updates list with new item to list database
	// 			dataService.updateListToDatabase(reqBody3, function(response3){
	// 				console.log(response3.data.message);
	// 				//get factId
	// 				var fact = {
	// 					user: userId,
	// 					item: dbMovie,
	// 				};
	// 				var reqBody = {
	// 					fact: fact,
	// 					query: 'check'
	// 				};
	// 				dataService.saveFact(reqBody, function(response){
	// 					console.log('Response fact: '+ response.data.fact);
	// 					console.log(response.data.fact);
	// 					if(response.data.fact !== undefined){
	// 						$scope.deleteFact(response.data.fact, listId);
	// 					}
	// 				});
	// 			});
	// 		});
	// 	};

	// 	$scope.getFactId = function(userId, dbItem){
	// 		var fact = {
	// 			user: userId,
	// 			item: dbItem,
	// 		};
	// 		var reqBody = {
	// 			fact: fact,
	// 			query: 'check'
	// 		};
	// 		dataService.saveFact(reqBody, function(response){
	// 			console.log('Response fact: '+ response.data.fact);
	// 			console.log(response.data.fact);
	// 			if(response.data.fact !== undefined){
	// 				return true;
	// 			} else {
	// 				return response.data.fact;
	// 			}
	// 		});
	// 	};

	// 	$scope.loadListOfLists = function(array){
	// 		$scope.listOfLists = [];
	// 		angular.forEach(array, function(listInput){
	// 			if(listInput.privacy == "public"){
	// 				$scope.listOfLists.push(listInput);
	// 			} else {
	// 				dataService.getList(listInput, function(response){
	// 					var list = response.data;
	// 		 			if (list.privacy == "public"){
	// 						dataService.getUsername(list.user[0]._id, function(response){
	// 							list.user[0] = response.data;
	// 							$scope.listOfLists.push(list);
	// 						});
	// 		 			};
	// 				});
	// 			};
	// 		});
	// 	};


	// //---------- FACTS -------------//

	// 	$scope.generateFact = function(userId, item, listId, privacy){
	// 		console.log('Inside generate fact');
	// 		var dbItem = {
	// 			type: item.Type,
	// 			imdbID: item.imdbID
	// 		};
	// 		var fact = {
	// 			user: userId,
	// 			item: dbItem,
	// 			list: [listId],
	// 			privacy: privacy,
	// 			time: Date.now()
	// 		};
	// 		var reqBody = {
	// 			fact: fact,
	// 			query: 'check'
	// 		};
	// 		dataService.saveFact(reqBody, function(response){
	// 			console.log('Response data: '+ response.data);
	// 			console.log(response.data.fact);
	// 			if(response.data.fact !== undefined){
	// 				var factId = response.data.fact._id
	// 				console.log(factId);
	// 				//add new action to existing fact
	// 				var reqBody2 = {
	// 					fact: factId,
	// 					newList: listId,
	// 					time: Date.now(),
	// 					action: 'update',
	// 					user: userId
	// 				};
	// 				dataService.updateFact(reqBody2, function(response){
	// 					console.log(response.data.message);
	// 					var basicFact = response.data.fact;
	// 					console.log(response.data.fact);
	// 					//criar um fato que inicialmente é igual ao fato básico
	// 					var queue = [];
	// 					var scopeFact = basicFact;
	// 					//definir o usuário basico do fato
	// 			 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 						scopeFact.user = response.data;
	// 					});
	// 					queue.push(r1);
	// 					//definir a lista básica do fato
	// 					var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 						scopeFact.list = response.data;
	// 					});
	// 					queue.push(r2);
	// 					//pegar poster em alta resolução
	// 					//checar se está no netflix
	// 					$q.all(queue).then(function(){
	// 						//definir item
	// 						$scope.getMovieDetails(basicFact.item, function(){
	// 							//ver se fato já está no scopeFacts
	// 							var index = 0;
	// 							angular.forEach($scope.facts, function(fact){
	// 								if(fact._id === scopeFact._id){
	// 									$scope.facts.splice(index, 1);
	// 								} else {
	// 									index += 1;
	// 								}
	// 							});
	// 							index = 0;
	// 							angular.forEach($scope.user.facts, function(fact){
	// 								if(fact._id === scopeFact._id){
	// 									$scope.user.facts.splice(index, 1);
	// 								} else {
	// 									index += 1;
	// 								}
	// 							});
	// 							//adicionar esse fato ao array de fatos no scope
	// 							$scope.facts.unshift(scopeFact);
	// 							$scope.user.facts.unshift(scopeFact);
	// 							$scope.user.new = false;
	// 						});
	// 					});
	// 				});
	// 			} else {
	// 				//Didn't find fact so create new one
	// 				var reqBody2 = {
	// 					fact: fact,
	// 					query: 'create'
	// 				};
	// 				dataService.saveFact(reqBody2, function(response){
	// 					console.log(response.data.message);
	// 					var basicFact = response.data.fact;
	// 					//adicionar factId ao movie
	// 					var factId = basicFact._id;
	// 					var reqBody = {
	// 						movie: dbItem,
	// 						factId: factId,
	// 						action: 'addFact'
	// 					};
	// 					//update item to database with factId in item.facts array
	// 					dataService.updateMovieToDatabase(reqBody, function(response){
	// 						console.log(response.data.message);
	// 					});

	// 					//criar um fato que inicialmente é igual ao fato básico
	// 					var queue = [];
	// 					var scopeFact = basicFact;
	// 					//definir o usuário basico do fato
	// 			 		var r1 = dataService.getUsername(basicFact.user, function(response){
	// 						scopeFact.user = response.data;
	// 					});
	// 					queue.push(r1);
	// 					//definir a lista básica do fato
	// 					var r2 = dataService.getList(basicFact.list[basicFact.list.length-1], function(response){
	// 						scopeFact.list = response.data;
	// 					});
	// 					queue.push(r2);
	// 					//pegar poster em alta resolução
	// 					//checar se está no netflix
	// 					$q.all(queue).then(function(){
	// 						//definir item
	// 						$scope.getMovieDetails(scopeFact.item, function(){
	// 							//adicionar esse fato ao array de fatos no scope
	// 							$scope.facts.unshift(scopeFact);
	// 							$scope.user.facts.unshift(scopeFact);
	// 							$scope.user.new = false;
	// 						});
	// 					});
	// 				});
	// 			};
	// 		});
	// 	};

	// 	$scope.deleteFact = function(fact, listId){
	// 		//se fact.action.length === 1
	// 		if (fact.list.length === 1){
	// 			//delete fact no db
	// 			dataService.deleteFact(fact._id, function(response){
	// 				//deletar fato do item
	// 				var reqBody = {
	// 					movie: {imdbID: fact.item.imdbID},
	// 					factId: fact._id,
	// 					action: 'deleteFact'
	// 				};
	// 				//update item to database with deletefact
	// 				dataService.updateMovieToDatabase(reqBody, function(response){
	// 					console.log(response.data.message);
	// 				});					
	// 				//delete fact no scope
	// 				var index = 0;
	// 				angular.forEach($scope.facts, function(scopeFact){
	// 					if(fact._id === scopeFact._id){
	// 						$scope.facts.splice(index, 1);
	// 					} else {
	// 						index += 1;
	// 					}
	// 				});
	// 				index = 0
	// 				angular.forEach($scope.user.facts, function(scopeFact){
	// 					if(fact._id === scopeFact._id){
	// 						$scope.user.facts.splice(index, 1);
	// 					} else {
	// 						index += 1;
	// 					}
	// 				});
	// 			});
	// 		} else {
	// 			//dá um update fact que vai pull essa action e a lista correspondente
	// 			var reqBody = {
	// 				fact: fact._id,
	// 				deleteList: listId,
	// 				action: 'deleteList',
	// 				user: $scope.user._id
	// 			};
	// 			dataService.updateFact(reqBody, function(response){
	// 				//delete fact no scope
	// 				var index = 0;
	// 				angular.forEach($scope.facts, function(scopeFact){
	// 					if(fact._id === scopeFact._id){
	// 						$scope.facts.splice(index, 1);
	// 					} else {
	// 						index += 1;
	// 					}
	// 				});
	// 				index = 0
	// 				angular.forEach($scope.user.facts, function(scopeFact){
	// 					if(fact._id === scopeFact._id){
	// 						$scope.user.facts.splice(index, 1);
	// 					} else {
	// 						index += 1;
	// 					}
	// 				});
	// 			});
	// 		}
	// 	};

	// 	$scope.likeFact = function(fact){
	// 		//primeiro colore ou descolore o coração
	// 		fact.like = !fact.like;
	// 		var action = "like";
	// 		var userId = $scope.user._id;
	// 		//se ação era para desfazer o like
	// 		if (!fact.like) {
	// 			action = "unlike";
	// 			var index = fact.likes.indexOf(userId);
	// 			fact.likes.splice(index, 1);
	// 		} else {
	// 			fact.likes.unshift(userId);
	// 		};

	// 		var factId = fact._id;
	// 		var reqBody = {
	// 			user: userId,
	// 			action: action,
	// 			fact: factId
	// 		};
	// 		dataService.updateFact(reqBody, function(response){
	// 			console.log(response.data.message);
	// 			socket.emit('fact-change-to-server', reqBody);		
	// 			if(fact.like && fact.user._id !== userId){
	// 				$scope.notifyLike(userId, fact);
	// 			}
	// 		});
	// 	};


	// 	$scope.submitComment = function(fact){
	// 		if (fact.newComment) {
	// 			var action = "comment";
	// 			var userId = $scope.user._id
	// 			var dbUser = {
	// 				_id: userId,
	// 				displayName: $scope.user.displayName
	// 			};
	// 			var factId = fact._id;
	// 			var comment = {
	// 				user: dbUser,
	// 				text: fact.newComment,
	// 				time: Date.now()
	// 			};
	// 			fact.newComment = "";
	// 			var reqBody = {
	// 				user: userId,
	// 				action: action,
	// 				fact: factId,
	// 				comment: comment
	// 			};
	// 			dataService.updateFact(reqBody, function(response){
	// 				console.log(response.data.message);
	// 				socket.emit('fact-change-to-server', reqBody);
	// 				fact.comments.push(comment);
	// 				if(fact.user._id !== userId){
	// 					$scope.notifyComment(userId, fact);
	// 				};
	// 			});
	// 		} else {
	// 			console.log('No comment');
	// 		}
	// 	};

	// //---------- INTERACTION BETWEEN USERS -------------//

	// 	$scope.follow = function(followee){
	// 		var person = followee;
	// 			$scope.person.isFollowing = true;
	// 			$scope.user.following.unshift(person);
	// 			//atualizar user
	// 			var user = $scope.user;
	// 			var reqBody1 = {
	// 				user: {_id: person._id},
	// 				followerId: user._id,
	// 				action: 'followers'
	// 			};
	// 			var reqBody2 = {
	// 				user: {_id: user._id},
	// 				followingId: person._id,
	// 				action: 'following'
	// 			};
	// 			dataService.updateUserToDatabase(reqBody1, function(response){
	// 				console.log(response.data.message);
	// 			});
	// 			dataService.updateUserToDatabase(reqBody2, function(response){
	// 				console.log(response.data.message);
	// 			});

	// 			$scope.person.followers.unshift({_id: user._id});
	// 			//notificar friend
	// 			$scope.notifyFollower(person._id, user._id);
	// 	};

	// 	$scope.notifyFollower = function(targetId, followerId){
	// 		var target = targetId;
	// 		var notification = {
	// 			user: followerId,
	// 			type: 'follow',
	// 			read: false,
	// 			time: Date.now() 
	// 		};
	// 		var data = {
	// 			to: target,
	// 			notification: notification
	// 		};
	// 		dataService.notify(target, notification, function(response){
	// 			console.log(response.data.message);
	// 			socket.emit('notification-to-server', data);
	// 		});
	// 	};

	// 	$scope.notifyLike = function(likerId, fact){
	// 		var target = fact.user._id;
	// 		var dbItem = {
	// 			imdbID: fact.item.imdbID,
	// 			Poster: fact.item.Poster,
	// 			Title: fact.item.Title
	// 		};
	// 		var dbFact = {
	// 			_id: fact._id,
	// 			item: dbItem
	// 		};
	// 		var notification = {
	// 			user: likerId,
	// 			type: 'like',
	// 			fact: dbFact,
	// 			read: false,
	// 			time: Date.now() 
	// 		};
	// 		var data = {
	// 			to: target,
	// 			notification: notification
	// 		};
	// 		dataService.notify(target, notification, function(response){
	// 			console.log(response.data.message);
	// 			socket.emit('notification-to-server', data);
	// 		});
	// 	};

	// 	$scope.notifyComment = function(commenterId, fact){
	// 		var target = fact.user._id;
	// 		var dbItem = {
	// 			imdbID: fact.item.imdbID,
	// 			Poster: fact.item.Poster,
	// 			Title: fact.item.Title
	// 		};
	// 		var dbFact = {
	// 			_id: fact._id,
	// 			item: dbItem
	// 		};
	// 		var notification = {
	// 			user: commenterId,
	// 			type: 'comment',
	// 			fact: dbFact,
	// 			read: false,
	// 			time: Date.now() 
	// 		};
	// 		var data = {
	// 			to: target,
	// 			notification: notification
	// 		};
	// 		dataService.notify(target, notification, function(response){
	// 			console.log(response.data.message);
	// 			socket.emit('notification-to-server', data);
	// 		});
	// 	};


	// });

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';

	function MainCtrl ($scope, dataService, $q, $filter, $interval, $timeout, $location, $anchorScroll) {

	//Loading Home
		dataService.getUser(function(response){ 
	    	console.log('Loaded user ' + response.data.displayName);
	    	var user = response.data;
	    	$scope.user = user;
	    	if (user.signup !== false){
	    		$scope.createDefaultLists(user);
	    	};
	//    	$scope.loadFeed(response.data);
			var friendsIds = [];
		    for (var i = 0; i < user.following.length; i++) {
		      friendsIds.push(user.following[i]);
		    };
			friendsIds.push(user._id);
			$scope.defineListIds();
	    }, function(response){
	//    	$scope.user.lists = $scope.loadListsLight($scope.user.lists);
			$scope.country = [
		      "29",
		      "br",
		      "Brazil ",
		      "83",
		      "171",
		      "21",
		      "4078",
		      "833",
		      "3245",
		      "BRL",
		      "19.9",
		      "22.9",
		      "29.9"
		    ];
	    	$scope.loaded = true;
	    });

		$scope.defineListIds = function(){
		    for (var i = 0; i < $scope.user.lists.length; i++) {
		      if($scope.user.lists[i].type === 'recommendation'){
		      	$scope.user.recommendationID = $scope.user.lists[i]._id;
		      } else if($scope.user.lists[i].type === 'dislike'){
				$scope.user.dislikeID = $scope.user.lists[i]._id;;
			  } else if($scope.user.lists[i].type === 'watchlist'){
				$scope.user.watchlistID = $scope.user.lists[i]._id;;
			  };
		    };		
		};

		$scope.collapse = false;

		$scope.createDefaultLists = function(user){
			var dbuser = {
				displayName: user.displayName,
				_id: user._id
			};

			var watchlist = {
				name: 'Watchlist',
				type: 'watchlist',
				user: dbuser,
				privacy: 'public',
				items: [],
				dateOfCreation: Date.now(),
				dateOfChange: Date.now()
			};

			var recommendation = {
				name: 'Recommendations',
				type: 'recommendation',
				user: dbuser,
				privacy: 'public',
				items: [],
				dateOfCreation: Date.now(),
				dateOfChange: Date.now()
			};

			var dislike = {
				name: 'Dislike',
				type: 'dislike',
				user: dbuser,
				privacy: 'public',
				items: [],
				dateOfCreation: Date.now(),
				dateOfChange: Date.now()
			};

			var queue = [];

			var r1 = dataService.addNewListToDb(watchlist, function(response){
				console.log(response.data.message);
				var list = response.data.list;
			//then add the list to the user in the scope
				$scope.user.lists.unshift(list);
			//then updates user with new list to user database
				var userId = $scope.user._id;
			//trocar por salvar só lista
			 	var reqBody = {
					user: {_id: userId},
					action: 'addList',
					listId: list._id
				};
				dataService.updateUserToDatabase(reqBody, function(response){
					console.log(response.data.message);
				});
			});

			queue.push(r1);

			var r3 = dataService.addNewListToDb(recommendation, function(response){
				console.log(response.data.message);
				var list = response.data.list;
			//then add the list to the user in the scope
				$scope.user.lists.unshift(list);
			//then updates user with new list to user database
				var userId = $scope.user._id;
			//trocar por salvar só lista
			 	var reqBody = {
					user: {_id: userId},
					action: 'addList',
					listId: list._id
				};
				dataService.updateUserToDatabase(reqBody, function(response){
					console.log(response.data.message);
				});
			});

			queue.push(r3);

			var r4 = dataService.addNewListToDb(dislike, function(response){
				console.log(response.data.message);
				var list = response.data.list;
			//then add the list to the user in the scope
				$scope.user.lists.unshift(list);
			//then updates user with new list to user database
				var userId = $scope.user._id;
			//trocar por salvar só lista
			 	var reqBody = {
					user: {_id: userId},
					action: 'addList',
					listId: list._id
				};
				dataService.updateUserToDatabase(reqBody, function(response){
					console.log(response.data.message);
				});
			});

			queue.push(r4);

			var reqBody = {
				user: {_id: user._id},
				action: 'signup'
			};

			$q.all(queue).then(function(response){
				$scope.user.signup = false;
				dataService.updateUserToDatabase(reqBody, function(response){
					console.log(response.data.message);
					$scope.defineListIds();
				});
			});
		};


	//------NAVIGATION BOOLEANS-----//
		$scope.alert = {
			text: "",
			show: false
		};

	//-----NAVIGATION FUNCTIONS---------//

		$scope.selectListOfUsers = function(array, title) {
			$scope.listOfUsers = {
				users: [],
				Title: title
			};
			if (array[0] && !array[0].displayName) {
				array = dataService.getBasicUsers(array).then(function(res){
					console.log(res.data.message);
					$scope.listOfUsers.users = res.data.users;
				});
	//			array = $scope.loadUsersBasicArray(array);
			};
		};


	//Saving list to database
		$scope.exportList = function(){
			var list = $scope.list;
			var dblist = {
				name: list.name,
				type: list.type,
				user: list.user,
				privacy: list.privacy,
				items: list.items,
				dateOfCreation: Date.now(),
				dateOfChange: Date.now()
			};
			console.log('Created exportable list for ' + dblist.name);
			return dblist;		
		};

		$scope.addNewListToDb = function() {
			//convert the scope list to an exportable list which saves only the user's id to its user
			var dblist = $scope.exportList();
			console.log('Controller is still working and has the object dblist whose name is ' + dblist.name);
			dataService.addNewListToDb(dblist, function(response){
				console.log(response.data.message);
				var listId = response.data.list._id;
				$scope.list._id = listId;
				$scope.list.dateOfCreation = response.data.list.dateOfCreation,
				$scope.list.dateOfChange = response.data.list.dateOfChange,
			//then add the list to the user in the scope
				$scope.user.lists.unshift($scope.list);
			//then updates user with new list to user database
				var userId = $scope.user._id;
			//trocar por salvar só lista
			 	var reqBody = {
					user: {_id: userId},
					action: 'addList',
					listId: listId
				};
				dataService.updateUserToDatabase(reqBody, function(response){
					console.log(response.data.message);
				});
			});
		};

		$scope.newListNext = function(){
			var list = $scope.list;
			//if list name is empty, ask again
			if(list.name === "") {
				$scope.emptyListName = true;
			} else {
			//else load list content UI for new empty list
				$scope.loadListContent(list);
				if($scope.emptyListName) {
					$scope.emptyListName = false;
				};
			//then add the new list to the list's database
				$scope.addNewListToDb();
			};
		};

	//-------------- DELETE LIST -------------//

		$scope.deleteList = function(){
			//close listContent UI
			$scope.go.closeListContent();
			//identify desired list position in scope.user.lists
			var list = $scope.list;
			var id = $scope.list._id;
			var lists = $scope.user.lists;

			//For each item in the list
			var queue = [];
			angular.forEach(list.items, function(item){
				//delete the list from its lists
				var request;
					//pull a lista do filme no database de filmes
					var dbMovie = {imdbID: item.imdbID};
					var reqBody = {
						movie: dbMovie,
						listId: id,
						action: 'delete'
					};
					//update item to database with list in item.lists array
					request = dataService.updateMovieToDatabase(reqBody, function(response){
						console.log(response.data.message);
					});

				queue.push(request);
			});

			$q.all(queue).then(function(){
			//Find list position in user lists
			var $index;
			var i = -1;
			angular.forEach(lists, function(list){
				i += 1;
				if (list._id === id) {
					$index = i;
				};
			});

			//Remove list from $scope.user.lists
			if ( $index !== -1) {
				$scope.user.lists.splice($index, 1);
			};
			//Remove list from List database
			dataService.deleteList(id, function(response){
				console.log(response.data.message);
			});
			dataService.deleteFactsFromList(id, function(response){
				console.log(response.data.message);
				$scope.user.facts = [];
				$scope.loadUserFacts($scope.user._id, Date.now());
			});
			dataService.getUser(function(response){ 
		    	$scope.loadFeed(response.data);
		    });
			//Update user to database
			var userId = $scope.user._id;
			var listId = list._id;

		 	var reqBody = {
				user: {_id: userId},
				action: 'deleteList',
				listId: listId
			};
			dataService.updateUserToDatabase(reqBody, function(response){
				console.log(response.data.message);
			});
			//Show success alert
			});
		};


		$scope.loadListOfLists = function(array){
			$scope.listOfLists = [];
			angular.forEach(array, function(listInput){
				if(listInput.privacy == "public"){
					$scope.listOfLists.push(listInput);
				} else {
					dataService.getList(listInput, function(response){
						var list = response.data;
			 			if (list.privacy == "public"){
							dataService.getUsername(list.user[0]._id, function(response){
								list.user[0] = response.data;
								$scope.listOfLists.push(list);
							});
			 			};
					});
				};
			});
		};

	}

	module.exports = MainCtrl;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';

	function AdminCtrl ($scope, dataService, $q, $filter, $interval, $timeout, $location, $anchorScroll) {
		$scope.helloAdmin = function(){
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
			console.log('Hello Admin');
		};

		$scope.helloAdmin();
	}

	module.exports = AdminCtrl;

/***/ })
]);