'use strict'

angular.module('parkingApp', ['ngRoute'])

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
    .controller('homeCtrl', function ($scope, addressSrv, zoneSrv) {
    	$('#searchButton').on('click', function(e){
    		var address = $('#addressText').val();
    		
    		addressSrv.getCoordinates(address).then(function(data){
    			
    			console.log(data);
    			var lat = parseFloat(data.lat);
    			var lon = parseFloat(data.lon);
    			console.log(lat);
    			console.log(lon);
    			
    			var zones ;
    			
    			zoneSrv.getZones().then(function(data){
    				zones = data;
    				$scope.color = zoneSrv.getTariff(lon, lat, data.data);
    			})
    			
    		})
    	});
    })
    .service('addressSrv', function($http, $q){
    	//$q = promises implementatie
    	//$hhtp = ajax
    	
    	var q = $q.defer();
    	
    	this.getCoordinates = function(address){
    		var url= 'http://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(address) + '&format=json'
    		console.log(url);
    		
    		$http.get(url)
    			.then(function(data){
    				q.resolve(data.data[0]);
    			}, function error(err){
    				q.reject(err);
    				console.log(err);
    			});
    		return q.promise;
    	};
    })
    .service('zoneSrv', function($http, $q){
    	//gecopieerde code van digitap
    	this.inPolygon = function(location, polyLoc){
            var lastPoint = polyLoc[polyLoc.length-1];
            var isInside = false;
            var x = location[0];

            for(var i = 0; i < polyLoc.length; i++){
                var point = polyLoc[i];
                var x1 = lastPoint[0];
                var x2 = point[0];
                var dx = x2 - x1;

                if(Math.abs(dx) > 180.0){
                    if(x > 0){
                        while(x1 < 0)
                            x1 += 360;
                        while(x2 < 0)
                            x2 += 360;
                    }
                    else{
                        while(x1 > 0)
                            x1 -= 360;
                        while(x2 > 0)
                            x2 -= 360;
                    }
                    dx = x2 - x1;
                }

                if((x1 <= x && x2 > x) || (x1 >= x && x2 < x)){
                    var grad = (point[1] - lastPoint[1]) / dx;
                    var intersectAtLat = lastPoint[1] + ((x - x1) * grad);

                    if(intersectAtLat > location[1])
                        isInside = !isInside;
                }
                lastPoint = point;
            }
            return isInside;
        };
        this.getZones = function(){
        	var q = $q.defer();
        	
        	$http.get('http://datasets.antwerpen.be/v4/gis/paparkeertariefzones.json')
        		.then(function(data, status, headers, config){
        			q.resolve(data.data)
        		}, function error(err){
        			q.reject(err);
        		});
        	
        	return q.promise;
        };
        this.getTariff = function(lng, lat, zones){
        	for(var i = 0; i< zones.length; i++){
        		var geo = JSON.parse(zones[i].geometry);
        		var coordinates = geo.coordinates[0];
        		if(this.inPolygon([lng, lat], coordinates) == true){
        			return zones[i].tariefkleur;
        		}
        	}
        };
    });