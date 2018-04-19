'use strict';

var angular = require('angular');
var uiRouter = require('angular-ui-router');

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

require('./scripts/services');
require('./scripts/directives');
require('./scripts/controllers');



console.log('App.js has been properly loaded')
