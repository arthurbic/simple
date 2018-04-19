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

