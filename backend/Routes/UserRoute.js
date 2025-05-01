const express=require('express');
const router=express.Router();
const User=require('../models/User');


router.get("/",async(req,res)=>{
    try{
        const users=await User.find();
        res.status(200).json(users);
    }catch(err){
        console.log(err);

    }
    
    
})
module.exports=router;