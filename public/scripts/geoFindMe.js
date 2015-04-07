//var gps_lat = 0.0;
//var gps_lng = 0.0;

function geoFindMe() {

	var output = document.getElementById("out");

        if (!navigator.geolocation) {
          console.log("<p>Geolocation is not supported by your browser</p>");
          return;
        }

        function success(position) {
        	var latitude  = position.coords.latitude;
        	var longitude = position.coords.longitude;

        	gps_lat = latitude;
        	gps_lng = longitude;

        	console.log(gps_lat);
        	console.log(gps_lng);

        	newLocation(gps_lat, gps_lng);
        };

        function error() {
        	console.log("Unable to retrieve your location");
        };

        navigator.geolocation.getCurrentPosition(success, error);

        return(success);
}

