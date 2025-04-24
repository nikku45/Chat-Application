const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const MessageSchema=new Schema({
    roomId:{
        type:String
    },
    message:{
        type:String
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
})

const Message=mongoose.model('Message',MessageSchema);
module.exports=Message;