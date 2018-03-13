var timer = require('./timers');

module.exports = function(wagner) {

  wagner.factory('timers', timer);

};
