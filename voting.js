var async    = require('async');
var redis    = require('redis').createClient();

module.exports.vote = function (name, first, second, third, callback) {
  redis.get(name+':voted', function (err, reply) {
    if (err) {
      callback(err); 
    }

    if (reply) {
      return callback(new Error('Voter '+name+' has already voted'));
    }

    console.log(reply);

    redis.multi()
      .zincrby('results', 3 , first) 
      .zincrby('results', 2 , second) 
      .zincrby('results', 1 , third) 
      .sadd(first, name+':first')
      .sadd(second, name+':second')
      .sadd(third, name+':thrid')
      .set(name+':voted', new Date().getTime())
      .exec(callback);

    });
};


module.exports.createTeam = function (name, callback) {
  redis.sadd('teams', name, callback);
};

module.exports.getTeams = function (callback) {
  redis.smembers('teams', callback);
};
