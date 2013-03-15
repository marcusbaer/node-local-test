var argv = require('optimist').argv,            // handles console arguments
    sys = require('util'),                      // used for system logs
	fs = require('fs'),
    db = require('dirty')('log/locations.db'),  // simple key value storage
    http = require('http'),
    express = require('express'),               // the application server
    journey = require('journey'),               // handles all service routes
    io = require('socket.io'),
    services = require('./services/local-services'); // handles all services

// CREATE APP AND ROUTER

var app = express();
var httpServer = require('http').createServer(app);
io = io.listen(httpServer);

var router = new(journey.Router);
var service = new(services.Service);

// SET SERVER VARIABLES

app.set('env', argv.env || 'production');
app.set('static', argv.static || './static');
app.set('bin', argv.bin || './bin');
app.set('port', argv.port || 80);

service.set({
    env: app.get('env'),
    static: app.get('static'),
    port: app.get('port')
});

// SET SERVER ENVIRONMENT

app.configure(function () {
    app.set('title', 'LOCATION');
    app.set('views', 'jade');
    app.set('view engine', 'jade');
});

// DEFINE MIDDLEWARE

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'ci8cr34nzICooPDOP4T34DQWfn4if343r3rizutf9t8d4t98HZGdcrt45s' }));
//app.use(app.router);

app.use(express.static(app.get('static')));
//app.use(express.logger());

// DEFINE DATA SOURCES

service.dataSource(db);

// DEFINE JOURNEY ROUTES

router.get(/^service\/([a-z]+)(\/){0,1}([0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    res.send( service.call(servicename, 'get', id, params) );
});
router.put(/^service\/([a-z]+)(\/){0,1}([0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    res.send( service.call(servicename, 'put', id, params) );
});
router.del(/^service\/([a-z]+)(\/){0,1}([0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    res.send( service.call(servicename, 'del', id, params) );
});
router.post(/^service\/([a-z]+)(\/){0,1}([0-9]*)$/).bind(function (req, res, servicename, slash, id, params) {
    res.send( service.call(servicename, 'post', id, req.body) );
});

// DEFINE SOCKET SERVICES

io.sockets.on('connection', function (socket) {

    socket.on('service', function (params) {
        var respondedJson = service.call(params.name, params.type, params.id, params);
        if (respondedJson) {
            socket.emit('service', respondedJson);
            socket.broadcast.emit('service', respondedJson);
        }
    });

});


// DEFINE EXPRESS ROUTES

app.get('/test', function(req, res){
    res.render('test', { title: app.get('title') });
});

app.get('/index', function(req, res){
    res.render('index', { title: app.get('title') });
});

// REDIRECTS

app.get('/', function(req, res){
    res.redirect('index');
});

// DIRECT TO SERVICES

app.get('/service/*', function(req, res){
    routerHandle(req, res);
});
app.put('/service/*', function(req, res){
    routerHandle(req, res);
});
app.del('/service/*', function(req, res){
    routerHandle(req, res);
});
app.post('/service/*', function(req, res){
    routerHandle(req, res);
});

// START EXPRESS SERVER LISTENING ON PORT

app.listen(app.get('port'));

sys.log("Start TEST server with environment " + app.get('env') + ' on port ' + app.get('port'));

// SOME METHODS

function routerHandle (req, res) {
    router.handle(req, '', function(obj){
        if (obj.status === 404) {
            return;
        } else {
            res.writeHead(obj.status, obj.headers);
            res.end(obj.body);
        }
    });
}
