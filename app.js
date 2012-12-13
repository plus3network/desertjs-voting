
/**
 * Module dependencies.
 */

var express  = require('express');
var user     = require('./routes/user');
var http     = require('http');
var path     = require('path');
var socketio = require('socket.io');
var async    = require('async');
var redis    = require('redis').createClient();
var _        = require('underscore');
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
  voting.getScores(function (err, teams) {
    res.render('index', { teams: JSON.stringify(teams)});
  });
});


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
  socket.on('user:vote', function (data) {
    var tasks = [];

    console.log(data);
    
    tasks.push(function (cb) {
      voting.vote(data.name, data.first, data.second, data.third, cb);
    });

    tasks.push(function (cb) {
      voting.getScores(cb);
    });

    async.series(tasks, function (err, results) {
      if (err) {
        return console.log(err);
      }
      socket.emit('team:scores', results[1]);
      socket.emit('vote:feed', data);
      socket.broadcast.emit('team:scores', results[1]);
      socket.broadcast.emit('vote:feed', data);
    });

  });
});
