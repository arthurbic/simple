'use strict';

function UiRouterService ($http, $q) {

  this.getProfile = function(_id) {
    return $http.get('/data/profile/'+ _id);
  };

}

module.exports = UiRouterService;

