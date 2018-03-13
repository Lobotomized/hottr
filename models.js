var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
  //mongoose.connect('mongodb://localhost:27017/hotter');
    mongoose.connect('mongodb://asenegei:asenegei@ds159696.mlab.com:59696/hottr');
  var User =
    mongoose.model('User', require('./models/user'), 'users');

  var Duel =
    mongoose.model('Duel', require('./models/duel'), 'duels');

  var Challenge = 
    mongoose.model('Challenge', require('./models/challenge'), 'challenges');

  var Notification = 
    mongoose.model('Notification', require('./models/notification'), 'notifications')

  var models = {
    User: User,
    Duel: Duel,
    Challenge: Challenge,
    Notification: Notification
  };

  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });

  return models;
};
