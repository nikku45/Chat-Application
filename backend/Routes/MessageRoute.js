const express = require("express");
const mongoose=require('mongoose');
const router = express.Router();
const Message=require('../models/Messages.js');


router.post("/", async(req,res)=>{
    try{
        console.log(req.fileurl);
        const{msg,userId,roomId,fileurl}=req.body
        
        const message=new Message({roomId,message:msg,sender:userId,fileurl});
        const result= await message.save();
       ;
        res.status(200).json("message has benn saved");
        
    }catch(err){
        res.status(500).json(err);
    }
 

})
router.get("/:roomId",async(req,res)=>{
    try{
        const {roomId}=req.params;
   
        const messages=await Message.find({roomId}).sort({ timestamp: 1 });
      
        res.status(200).json(messages);
    }catch(err){
          res.status(500).json(err)
    }
})
module.exports=router;