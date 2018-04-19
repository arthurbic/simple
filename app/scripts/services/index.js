'use strict';

var angular = require('angular');

angular.module('spreadyApp').service('dataService', require('./data'));
angular.module('spreadyApp').service('uiRouterService', require('./uir'));