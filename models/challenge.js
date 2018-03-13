var mongoose = require('mongoose');
var User = require('./user');

module.exports = new mongoose.Schema({
    player:{ type: mongoose.Schema.ObjectId, ref: 'User' },
    Started:{ type: Date, default: Date.now },
    rank:{type:Number,default:25},
    gender:{type:String, requied:true}
  
});
 
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
        