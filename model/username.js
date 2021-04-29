const mongoose = require("mongoose");

const UsernameSchema = new mongoose.Schema({
    username: {
        type: String,
        unique:true
    },
    name: {
        type:String
    },
    image: {
      type:String  
    },
    ofUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", 
    }
})

const Username = mongoose.model("Username", UsernameSchema)
module.exports = Username;