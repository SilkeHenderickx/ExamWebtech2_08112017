'use strict'

angular.module('movieApp', ['ngRoute'])

.config(function($routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'assets/views/home.html',
                controller: 'homeCtrl'
            })
            .otherwise({
            	redirectTo: '/home'
            });
            
    })
    .controller('homeCtrl', function ($scope, actorCouchdbSrv, actorIMDBSrv) {
    	$('#searchButton').on('click', function(e){
    		var actor = $('#actor').val();
    		var BY_ACTOR = '_view/byActor';
    		var IMDB = 'http://theimdbapi.org/api/find/person?name=';
    		
    		actorCouchdbSrv.getCouchdbData(BY_ACTOR, actor).then(function(data){
    			
    			console.log(data);
    			if(data.data.total_rows == 0){
    				console.log("actor does not yet exist");
    				actorIMDBSrv.getIMDBData(IMDB, actor).then(function(data){
    	    			console.log(data);
    	    		})
    				}
    			});
    		
    	})
    })
    .service('actorIMDBSrv', function($http, $q){
    	
    	var q = $q.defer();
    	
    	this.getIMDBData = function(url, actor){
    		var url = url + actor;
    		
    		
    		$http.get(url)
    		.then(function(data){
    			q.resolve(data.data[0].filmography.actor);
    		}, function error(err){
    			q.reject(err);
    			console.log(err);
    		});
    		return q.promise;
    	}
    })
    .service('actorCouchdbSrv', function($http, $q){
    	
    	var q = $q.defer();
    	
    	
    	
    	this.getCouchdbData = function(url, actor){
    		
    		
    		
    		console.log(url);
    		$http.get(url)
    			.then(function(data){
    				q.resolve(data);
    			}, function error(err){
    				q.reject(err);
    				console.log(err);
    			});
    		return q.promise;
    	};
    });
    