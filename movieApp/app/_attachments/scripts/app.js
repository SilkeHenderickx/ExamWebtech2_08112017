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
    .controller('homeCtrl', function ($scope, actorCouchdbSrv) {
    	$('#searchButton').on('click', function(e){
    		var actor = $('#actor').val();
    		var ALL_DOCS = '../../_all_docs?include_docs=true';
    		
    		
    		actorCouchdbSrv.getCouchdbData(ALL_DOCS, actor).then(function(data){
    			
    			console.log(data);
    			if(data == undefined){
    				console.log("actor does not yet exist");
    			}
    		})
    	});
    })
    .service('actorCouchdbSrv', function($http, $q){
    	
    	var q = $q.defer();
    	
    	this.getCouchdbData = function(url, actor){
    		
    		$http.get(url)
    			.then(function(data){
    				q.resolve(data.data[0]);
    			}, function error(err){
    				q.reject(err);
    				console.log(err);
    			});
    		return q.promise;
    	};
    });
    