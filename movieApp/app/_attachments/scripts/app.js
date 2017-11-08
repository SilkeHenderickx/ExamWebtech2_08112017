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
    .controller('homeCtrl', function ($scope, actorCouchdbSrv, actorIMDBSrv, putCouchdbSrv) {
    	$('#searchButton').on('click', function(e){
    		var actor = $('#actor').val().toLowerCase();
    		var BY_ACTOR = '_view/byActor';
    		var IMDB = 'http://theimdbapi.org/api/find/person?name=';
    		var COUCHDB = '../../' + actor;
    		
    		actorCouchdbSrv.getCouchdbData(BY_ACTOR, actor).then(function(data){
    			console.log('CouchDB view with key=actor')
    			console.log(data);
    			if(data.data.rows.length == 0){
    				console.log("actor does not yet exist");
    				actorIMDBSrv.getIMDBData(IMDB, actor).then(function(data){
    	    			console.log(data);
    	    			
    	    			var movies = [];
    	    			
    	    			var htmlString = '<ul>';
    	    			for (var i = 0; i < data.filmography.actor.length; i++) {
							movies.push(data.filmography.actor[i].title);
							htmlString += '<li>' + data.filmography.actor[i].title + '</li>';
						}
    	    			htmlString += '</ul>';
    	    			var doc = {};
    	        		
    	        		doc.name = data.title;
    	        		doc.movies = movies;
    	        		doc.type = 'actor';
    	    			
    	        		var json = JSON.stringify(doc);
    	        		console.log(json);
    	        		
    	        		$('#movies').html(htmlString);
    	        		
    	    			putCouchdbSrv.putCouchdbData(COUCHDB, json).then(function(data){
    	    				console.log(data);
    	    			})
    	    		})
    				}
    			else {
    				console.log('actor exists in couchDB');
    				
    				var htmlString = '<ul>';
	    			for (var i = 0; i < data.data.rows[0].value.length; i++) {
						
						htmlString += '<li>' + data.data.rows[0].value[i] + '</li>';
					}
	    			htmlString += '</ul>';
	    			$('#movies').html(htmlString);
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
    			if(data.data !== null){
    			q.resolve(data.data[0]);
    			}
    			else{
    				alert("The name you entered is not an actor.");
    			}
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
    		var url = url + '?key=%22' + actor + '%22';

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
    })
    .service('putCouchdbSrv', function($http, $q){
    	
    	var q = $q.defer();

    	this.putCouchdbData = function(url, json){

    		console.log(url);
    		$http.put(url, json)
    			.then(function(data){
    				q.resolve(data);
    			}, function error(err){
    				q.reject(err);
    				console.log(err);
    			});
    		return q.promise;
    	};
    })
    