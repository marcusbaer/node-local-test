var socket, local;

$(document).ready(function(){

//    console.log(window.location.host);
//    socket = io.connect( window.location.host );
//    socket.emit('service', { name: 'location', type: 'PUT', id: 123 });

    $('body').append('<div id="log"></div><div id="position"></div>');

    initGeolocation();
    logLocation();

});

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
                setTimeout(logLocation, 1000 * 300); // all five minutes
            }
        });
        $('#position').text('Latitude: ' + position.coords.latitude + " / \nLongitude: " + position.coords.longitude + "\n");
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

function getCurrentPosition (callback) {
    local.getCurrentPosition(callback);
}