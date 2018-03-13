var mongoose = require('mongoose');
var User = require('./user');

module.exports = new mongoose.Schema({
    player:{ type: mongoose.Schema.ObjectId, ref: 'User' },
    SendedTime:{ type: Date, default: Date.now },
    text:{type:String,required:true},
    seen:{type:Boolean, default:false}
  
});
 
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
        