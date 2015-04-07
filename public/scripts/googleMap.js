//var route = [];
//var directionsDisplay;
//var directionsService;
//var map;
//var route_result;


function initialize() {
        
	var coor = geoFindMe();
        
	var rendererOptions = {
		draggable: true,
       		preserveViewport: true
	}
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
        directionsService = new google.maps.DirectionsService();

        var mapOptions = {
        	center: { lat: 39.50, lng: -98.35},
        	zoom: 4,
        	draggableCursor: 'crosshair'
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	//=====Events=====
	var input = document.getElementById('pac-input');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var searchBox = new google.maps.places.SearchBox(input);

        directionsDisplay.setMap(map);
        //================
        
	//===Listeners====
	google.maps.event.addListener(searchBox, 'places_changed', function() {
          
        	var places = searchBox.getPlaces();

        	if(places.length > 0) {
            		var place = places[0];

            		var nlat = place.geometry.location.lat();
            		var nlng = place.geometry.location.lng();
            		console.log("New center at: Lat = " + nlat + " Lng = " + nlng);

            		newLocation(nlat, nlng);
            
            		route.length = 0;
            		calculateRoute();

          	}
     	});
        
        google.maps.event.addListener(map, "click", function(event) {
        
        	if(route.length < 8) {
            		var lat = event.latLng.lat();
          		var lng = event.latLng.lng();
            		console.log("Lat=" + lat + "; Lng=" + lng);
          
            		route.push(new google.maps.LatLng(lat, lng));

            		calculateRoute();
          	} else {
			//do something
		}
        });

        google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
          	route_result = directionsDisplay.getDirections()
          	computeTotalDistance();
        });

        //================
}	




function computeTotalDistance() {

    	var dist = 0;
        var myroute = route_result.routes[0];
        for (i = 0; i < myroute.legs.length; i++) {
          
          	dist += myroute.legs[i].distance.value; //calc total distance
		if(i > 0) {
            		route[i-1] = myroute.legs[i].start_location; //update route waypoint information
          	}
        }

	dist = dist / 1000.0;

        if(document.getElementById('dist_sys').value === 'metric') {
          	document.getElementById('total').innerHTML = dist + ' km';
        } else {
          	dist = dist * .621371;
          	dist = dist.toFixed(3);
          	document.getElementById('total').innerHTML = dist + ' mi';
        }
}

function newLocation(newLat, newLng) {
        map.setCenter({
          	lat : newLat,
          	lng : newLng
        });

        window.gps_lat = newLat;
        window.gps_lng = newLng;

        map.setZoom(14);

        home_marker = new google.maps.Marker({
         	map: map,
          	draggable: false,
          	position: new google.maps.LatLng(newLat, newLng)
        });
}

function calculateRoute() {
        
	console.log("calculating route...");
          
        waypts = [];
        for(var i = 0; i < route.length; i++) {
        	waypts.push({
             		location: route[i],
             		stopover: true});
        }
     	console.log(waypts);
        waypts_request = {
           	origin: new google.maps.LatLng(gps_lat, gps_lng),
           	destination: new google.maps.LatLng(gps_lat, gps_lng),
           	waypoints: waypts,
           	optimizeWaypoints: true,
           	provideRouteAlternatives: true,//false
           	avoidHighways: true,
           	travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(waypts_request, function(response, status) {
       		if(status == google.maps.DirectionsStatus.OK) {
              		console.log("SUCCESS!");
              		console.log(response);

              		directionsDisplay.setDirections(response);

          	}
        });
}

//google.maps.event.addDomListener(window, 'load', initialize);





















