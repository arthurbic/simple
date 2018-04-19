var express  = require('express');
var router   = express.Router();
var crypto   =require('crypto');
var bcrypt = require('bcrypt-nodejs');
var async    =require('async');
var User     = require('../models/user');
var List = require('../models/list');

//var mid      = require('../middleware');//"connect-ensure-login" can do this for us
var passport = require('passport');
var passportStrategies=require('./passportStrategies')
var conEnsure=require('connect-ensure-login');//midleware used to check authentication of every request 


//setting up passport configuration
passportStrategies(passport);

//GET /login
router.get('/login',conEnsure.ensureLoggedOut("/") ,function(req, res, next){
	return res.render('login', { title: 'Spready | Spread the word'})
});

//POST /login
router.post('/login',passport.authenticate('local',{ failureRedirect: '/login' }), function(req, res){
	 res.redirect("/");
});

//GET /user
router.get('/user',conEnsure.ensureLoggedIn("/login"),function(req, res, next){
  if (! req.user._id) {
    var err = new Error('You are not authorized to view this page.');
    err.status = 403;
    return next(err);
  }
  var id = req.user._id;
  console.log('Received user request: ', id);
  User.findById(id)
    .exec(function(error, user){
    if (error) {
      return next(error);
    } else {
      console.log('Found user: ', user.displayName);
      var listIds = user.lists;
      List.find({"_id": { $in: listIds }})
        .exec(function(error, lists){
          if (error) {
            return next(error);
          } else {
            //deal with user facts
            console.log('Found user lists');
           var dbUser = {
             _id: user.id,
             email: user.local.email ||user.facebook.email||user.google.email,
             activated: user.local.activated,
             displayName: user.displayName||user.facebook.name||user.google.name,
             pictureUrl: user.pictureUrl||"",
//                     chats: user.chats||[],
             followers: user.followers||[],
             following: user.following||[],
             lists: lists,
             signup: user.signup,
             facts: [],
             location: user.location||[],
           };
           return res.json(dbUser);

              }
      }); //List.find
    }
  });
});



//GET /person + id
router.get('/person/:id', conEnsure.ensureLoggedIn("/login"), function(req, res){
  var id = req.params.id;
  User.findById(id)
    .exec(function(error, user){
    if (error) {
      return next(error);
    } else {
      var dbuser = {
        _id: user._id,
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
        lists: user.lists,
        followers: user.followers,
        following: user.following,
        facts: []
      };
      return res.json(dbuser);
    }
  });
});

//POST /basicUsers + ids
router.post('/data/basicUsers', function(req, res){
  var ids = req.body;
  console.log(ids);
  User.find({"_id": {$in: ids}})
    .exec(function(error, users){
    if (error) {
      res.status(404).json(error);
    }
    else if(users && users.length){
     var obj={},
     //-------make the users array compatible with the front end 
     users=users.map(function(user){
        obj={
          _id        : user._id,
          displayName: user.displayName,
          pictureUrl: user.pictureUrl,
          lists: user.lists,
          followers: user.followers,
          following: user.following
        };
        console.log(obj);
        return obj;
     });
     res.json({"Response": true, "users": users, "message": 'users loaded'});
    }
    else res.json({"Response": true, "users": users, "message": 'users loaded'});
  })  
});



//GET /data/profile + id
router.get('/data/profile/:id', conEnsure.ensureLoggedIn("/login"), function(req, res){
  var id = req.params.id;
  User.findById(id)
    .exec(function(error, user){
    if (error) {
      return next(error);
    } else {
      var listIds = user.lists;
      List.find({"_id": { $in: listIds }})
        .exec(function(error, lists){
          if (error) {
            return next(error);
          } else {
            //deal with user facts
            Fact.find({"user": id, "privacy": "public"}).limit(6).sort({$natural:-1})
              .exec(function(error, facts){
              if (error) {
                res.status(404).json(error);
              }
              else if(facts && facts.length){
               console.log(facts);
               var obj={},
               //-------make the users array compatible with the front end 
               facts=facts.map(function(fact){
                  obj={
                    _id        : fact._id,
                    user       : user,
                    time       : fact.time,
                    list       : fact.list,
                    item       : fact.item,
                    action     : fact.action,
                    privacy    : fact.privacy,
                    likes      : fact.likes || [],
                    comments   : fact.comments || []
                  };
                  return obj;
               });

              for (var i = 0; i < facts.length; i++) {
                for (var j = 0; j < lists.length; j++){
                  if (facts[i].list[0] === lists[j].id){
                    facts[i].list = lists[j]; 
                  }
                }                
              };

              var imdbIDs = [];
              for (var i = 0; i < facts.length; i++) {
                imdbIDs.push(facts[i].item.imdbID)
              };

              Movie.find({"imdbID": { $in: imdbIDs }})
                .exec(function(error, movies){
                  if (error) {
                    return next(error);
                  } else {
                      for (var i = 0; i < facts.length; i++) {
                        for (var j = 0; j < imdbIDs.length; j++){
                          if (facts[i].item.imdbID === movies[j].imdbID){
                            facts[i].item = movies[j];
                          }
                        }
                      };
                      var dbuser = {
                        _id: user._id,
                        displayName: user.displayName,
                        pictureUrl: user.pictureUrl,
                        lists: lists,
                        followers: user.followers,
                        following: user.following,
                        facts: facts
                      };
                      return res.json(dbuser);
                    }
                  })
                } else {
                        var dbuser = {
                          _id: user._id,
                          displayName: user.displayName,
                          pictureUrl: user.pictureUrl,
                          lists: lists,
                          followers: user.followers,
                          following: user.following,
                          facts: facts
                        };
                        return res.json(dbuser);
                  }
                }) //Fact.find
              }
      }); //List.find
    }
  });
});


//PUT /user + id
router.put('/user/:id',conEnsure.ensureLoggedIn("/login"), function(req, res){
  var id = req.params.id;
  var action = req.body.action;
  var user = req.body.user;
  console.log(req.body);
  var notifications = req.body.notifications;
  var chat = req.body.chat;
  if (user && user._id !== id) {
    return res.status(500).json({ err: "Ids don't match!" });
  }
  if (action == 'full'){
      User.findByIdAndUpdate(id, user, {new: true}, function(err, user) {
      if (err) {
          return res.status(500).json({ err: err.message });
        };
        return res.json({ 'user': user, message: 'User updated' });
      });
  };
  if (action == 'signup'){
      User.findByIdAndUpdate(id, { $set: { signup: false} }, function(err, user) {
      if (err) {
          return res.status(500).json({ err: err.message });
        };
        return res.json({ 'user': user, message: 'User default list creation completed' });
      });
  };
  if (action == 'addList'){
      var listId = req.body.listId;
      User.update({_id: id}, { $push: { lists: listId} }, function(err) {
        if (err) {
            return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'List added to user database' });
      });
  };
  if (action == 'deleteList'){
      var listId = req.body.listId;
      User.update({_id: id}, { $pull: { lists: listId} }, function(err) {
        if (err) {
            return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'List added to user database' });
      });
  };
  if (action == 'followers'){
      var followerId = req.body.followerId;
      User.update({_id: id}, { $push: { followers: followerId} }, function(err) {
        if (err) {
            return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'Follower added to person\'s database' });
      });
  };
  if (action == 'following'){
      var followingId = req.body.followingId;
      User.update({_id: id}, { $push: { following: followingId} }, function(err) {
        if (err) {
            return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'Following person added to user\'s database' });
      });
  };
  if (action == 'updateNotifications'){
      User.update({_id: id}, { $set: { notifications: notifications} }, function(err) {
        if (err) {
          return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'Notifications updated to database' });
      });
  };
  if (action == 'newChat'){
      User.update({_id: id}, { $push: { chats: chat} }, function(err) {
        if (err) {
            return res.status(500).json({ err: err.message });
          };
        return res.json({ 'user': user, message: 'Chat added to ' + user.displayName + '\'s database' });
      });
  };
});


//GET /logout
router.get('/logout', conEnsure.ensureLoggedIn("/login"),function(req, res, next){
	if (req.session) {
		//delete session object
		req.session.destroy(function(err){
			if(err){
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});


// GET /home
router.get('/home',conEnsure.ensureLoggedIn("/login"), function(req, res){
		res.render('home', {title: 'Home'});
});


/* GET home page. */
router.get('/',conEnsure.ensureLoggedIn("/login"),function(req, res) {
	return res.render('home', { title: 'Express'})
});


//SPREADY routes

//POST /list
router.post('/list', function(req, res){
  var list = req.body;
  console.log(list);
  List.create(list, function(err, list){
    if (err) {
      return res.status(500).json({ err: err.message });
    } else {
      return res.json({list, message: 'List added to database'});
  }
  });
});

//GET /username + id
router.get('/username/:id', function(req,res){
  var id = req.params.id;
  User.findById(id)
    .exec(function(error, user){
    if (error) {
      return next(error);
    } else if (user._id){
        var dbuser = {
          _id: user._id,
          displayName: user.displayName,
          pictureUrl: user.pictureUrl
        };
        return res.json(dbuser);        
      } else {
        return res.json({});
      }
  })
});

//GET /list + id
router.get('/list/:id', function(req,res){
  var id = req.params.id;
  List.findById(id)
    .exec(function(error, list){
    if (error) {
      return next(error);
    } else {
      var dbList = {
        _id: list.id,
        name: list.name,
        type: list.type,
        privacy: list.privacy,
        user: list.user,
        allowed: list.allowed,
        items: list.items,
        hasItem: false,
        dateOfChange: list.dateOfChange,
        dateOfCreation: list.dateOfCreation
      };
      return res.json(dbList);
    }
  })  
});

//GET /data/listcontent + id
router.get('/data/list/:id', function(req,res){
  var id = req.params.id;
  List.findById(id)
    .exec(function(error, list){
      if (error) {
        return next(error);
      } else {
          //Pegar array de imdbIDs
          var imdbIDs = [];
          for (var i = 0; i < list.items.length; i++) {
            imdbIDs.push(list.items[i].imdbID)
          }; 
          //buscar pelo array no movie database
          var imdbID = list.items[0].imdbID;
          Movie.find({"imdbID": { $in: imdbIDs }})
            .exec(function(error, movies){
              if (error) {
                return next(error);
              } else {
                var dbList = {
                  _id: list.id,
                  name: list.name,
                  type: list.type,
                  privacy: list.privacy,
                  user: list.user,
                  allowed: list.allowed,
                  items: movies,
                  hasItem: false,
                  dateOfChange: list.dateOfChange,
                  dateOfCreation: list.dateOfCreation
                };
                return res.json(dbList);
              }
          });
      }
    });
});

//DELETE /list + id
router.delete('/list/:id', function(req,res){
  var id = req.params.id;
  List.findById(id)
        .exec(function(err, doc) {
            if (err || !doc) {
                res.statusCode = 404;
                res.send({});
            } else {
                doc.remove(function(err) {
                    if (err) {
                        res.statusCode = 403;
                        res.json({err: err.message});
                    } else {
                        res.json({message: 'List deleted'});
                    }
                });
            }
        });
});


//PUT /list + id
router.put('/list/:id', function(req, res){
  var id = req.params.id;
  var action = req.body.action;
  var item = req.body.item;
  if (action === 'add'){
    var date = req.body.date;
    List.update({_id: id}, { $push: { items: item}, dateOfChange: date }, function(err) {
      if (err) {
          return res.status(500).json({ err: err.message });
        };
      return res.json({message: 'Movie added to list database'})
    });
  };  
  if (action === 'delete'){
    List.update({_id: id}, { $pull: { items: item} }, function(err, list) {
      if (err) {
          return res.status(500).json({ err: err.message });
       };
      return res.json({message: 'Item removed from list database' })
    });
  };
});

module.exports = router;