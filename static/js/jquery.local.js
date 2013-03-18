var socket, local, map, markers;

$(document).ready(function(){

//    console.log(window.location.host);
//    socket = io.connect( window.location.host );
//    socket.emit('service', { name: 'location', type: 'PUT', id: 123 });

    $('body').append('<div id="log"></div><div id="position"></div><div id="basicMap"></div>');

//	listAllLocations();
	
    initGeolocation();
	initMap();
    logLocation();

});

function listAllLocations () {
	$.ajax('/service/locations/1', {
		type: 'get',
		error: function(res) {
			$('#log').text('Service error!');
		},
		success: function(res) {
			_.each(res, function(location){
				var d = new Date(new Number(location.time));
				$('#position').append('<a href="http://maps.google.com/maps?q='+location.latitude+',+'+location.longitude+'+(Hier+war+ich)&iwloc=A&hl=de">'+d.toLocaleString()+'</a><br/>');
			});
		}
	});
}

function logLocation () {
    getCurrentPosition(function(position){
        var d = new Date();
        var data = position.coords;
        data.time = d.getTime();
		$.ajax('/service/location/1', {
		type: 'post',
			data: data,
			error: function(res) {
				$('#log').text('Service error!');
			},
			success: function(res) {
				if (res.msg === 'ok') {
					$('#log').text('Log done');
				} else {
					$('#log').text('Log error!');
				}
				setTimeout(logLocation, 1000 * 30); // each thirty seconds
//				setTimeout(logLocation, 1000 * 300); // each five minutes
			}
		});
        $('#position').text('Latitude: ' + position.coords.latitude + " / \nLongitude: " + position.coords.longitude + "\n");
		displayPositionOnMap(position);
    });
}

function initGeolocation () {
    function GeoLocater () {
        this.watchId = null;
        if (!navigator.geolocation) {
            $('#log').text('Your browser does not support geolocation!')
        }
    }
    GeoLocater.prototype.getCurrentPosition = function(callback) {
        navigator.geolocation.getCurrentPosition(function(position){ callback(position); }, function() {
            $('#log').text('Your position could not be detected!');
        });
    };
    GeoLocater.prototype.watchPosition = function(callback) {
        this.watchId = navigator.geolocation.watchPosition(function(position){
            callback(position);
        });
    };
    GeoLocater.prototype.clearWatch = function(callback) {
        navigator.geolocation.clearWatch(this.watchId); // cancel watching
        if (callback) {
            callback();
        }
    };
    local = new GeoLocater();
}

function initMap () {
	map = new OpenLayers.Map("basicMap");
	var mapnik = new OpenLayers.Layer.OSM();
	markers = new OpenLayers.Layer.Markers( "Markers" );
	map.addLayer(mapnik);
	map.setCenter(new
	OpenLayers.LonLat(3,3) // Center of the map
	  .transform(
		new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
	  ), 15 // Zoom level
	 );
	map.addLayer(markers);
	var posss = new OpenLayers.Marker(0,0);
	markers.addMarker(posss);
}

function displayPositionOnMap (position) {
	var lonLat = new OpenLayers
		.LonLat(position.coords.longitude, position.coords.latitude)
		.transform(
			new OpenLayers.Projection("EPSG:4326"), //transform from WGS 1984
			map.getProjectionObject() //to Spherical Mercator Projection
		);
	markers.clearMarkers();                                
	markers.addMarker(new OpenLayers.Marker(lonLat));
	//posss.lonlat(lonLat);
	map.setCenter(lonLat, 14 // Zoom level
	);
}

function getCurrentPosition (callback) {
    local.getCurrentPosition(callback);
}