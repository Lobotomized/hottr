var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      lowercase: true
    },
    gender:{
      type: String,
      required:true
    },
    picture: {
      type: String,
      required: true,
      match: /^http:\/\//i
    },
    fbToken:{
      type:String,
    },
    oauth: { type: String, required: true },
    rank:{
        type: Number, 
        required: true,
        default: 100,
        max:100,
        min:0
    },
    legend:{
        type: Number,
        required: true, 
        default: -1
    },
    points:{
      type:Number,
      required:true,
      default:3 
    }
  
});

module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
