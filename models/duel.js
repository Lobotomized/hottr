var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    playerOne:{
        type:String,
        required:true,
        ref: 'User'
    },
    playerTwo:{
        type:String,
        required:true,
        ref: 'User'     
    },
    score:{
        type:Number,
        required:true,
        default:0,
        max:3,
        min:-3
    },
    roundsPassed:{
        type:Number, 
        required:true,
        default:0,
        max:3
    },
    gender:{
        type:String,
        required:true
    },
    Started:{ type: Date, default: Date.now },
    voters:[{type:String,ref:'User'}] 
  
});

module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
