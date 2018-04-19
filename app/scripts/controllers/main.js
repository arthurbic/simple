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