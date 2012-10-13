
/**
 * Module dependencies.
 */

var express  = require('express');
var routes   = require('./routes');
var user     = require('./routes/user');
var http     = require('http');
var path     = require('path');
var socketio = require('socket.io');
var async    = require('async');
var redis    = require('redis').createClient();
var voting   = require('./voting');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  voting.getTeams(function (err, teams) {
    res.render('index', { teams: teams  });
  });
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(server);

io.sockets.on('user:vote', function (data) {
  var tasks = [];
  
  tasks.push(function (cb) {
    voting.vote(data.name, data.first, data.second, data.thrid, cb);
  });

  tasks.push(function (cb) {
    voting.getScores(cb);
  });

  async.series(tasks, function (err, results) {
    io.sockets.emit('team:scores', voting.joinEveryOther(results[1]));
    io.sockets.emit('vote:feed', data);
  });

});
