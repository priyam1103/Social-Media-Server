const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    image: {
       type:String
    },
    caption: {
        type: String,
        
    },
    likes: {
        type: Number,
        default:0
    },
    comments: {
        type:Array
    },
    ofUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", 
    }
},{timestamp:true})

const Posts = mongoose.model("Post", PostSchema)
module.exports = Posts;