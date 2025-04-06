const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const postSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
    timestamp:{
        type: Date,
        default: Date.now
    },
    likes: {
        count: {
            type: Number,
            default: 0
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
   
})
const Post=mongoose.model('Post',postSchema);
module.exports=Post;

