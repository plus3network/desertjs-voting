
//---------------------------------------------------
// Server Side
//---------------------------------------------------

var io = require('socket.io').listen(80);

io.sockets.on('connection', function (socket) {
  
  socket.on('my other event', function (data) {
    console.log(data);
  });

});


/*
 * Send List of the Teams down to client
 */
function send_teams(){
	
	//Call redis and get the list of teams
	var teams = [];


	socket.emit('team:list', { data: teams });
}


/*
 * Send voting results down to client
 */
function send_results(){
	
	//Call redis and get the list
	var results = [];


	socket.emit('team:scores', { data: results });
}


/*
 * Send New Vote down to client
 */
function send_vote(){
	
	//Call redis and get the list
	var vote = {};


	socket.emit('votes:feed', { data: vote });
}



//---------------------------------------------------
// Client Side
//---------------------------------------------------

<script src="/socket.io/socket.io.js"></script>
<script>

//Connect to Socket IO Server
var socket = io.connect('http://localhost:81');

// Listen for updates to the Team Scores
socket.on('team:scores', function (data) {
	console.log(data);
});

// Listen for changes to list of teams
socket.on('team:list', function (data) {
	
	//Save list of teams
	var teams = data;
});

// Listen for results from server
socket.on('team:scores', function (data) {
	console.log(data);
});

// Send an Event
socket.emit('my other event', { my: 'data' });
</script>
