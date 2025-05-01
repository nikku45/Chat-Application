const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        
    },
    profilePicture:{
        type:String,
        default:""
    },
    friends:{
        type:[String],
        default:[]
    },
    chats:{
        type:[String],
        default:[]
    },
  
    bio:{
        type:String
    },
    Followers:{
        type:Number
    },
    stats:{
       posts:[
        {
           type: mongoose.Schema.Types.ObjectId,
           ref:"Post"
        }
       ],
       followers:[
        {
             type: mongoose.Schema.Types.ObjectId,
             ref:"user"
        }
       ],
       following:[
        {
             type: mongoose.Schema.Types.ObjectId,
             ref:"user"
        }
       ]


    },
    lastSeen:{
        type:Date,
        default:Date.now
    },

    status:{
        type:String,
        default:"offline"
    
    },  
    
    
},{timestamps:true})

const User=mongoose.model('User',userSchema);
module.exports=User;