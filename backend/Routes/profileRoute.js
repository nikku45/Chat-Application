const express=require('express');
const router=express.Router();
const User=require('../Models/User');
const verifyToken=require('../middleware.js');


router.get("/profile",verifyToken,async(req,res)=>{
  
   try{
    console.log("hitted")
    console.log(req.user.id)
    const foundeduser=await User.findById(req.user.id).select("-password");
    if(!foundeduser){
      res.json({message:"user not found"})
    }
    console.log(foundeduser);
    res.status(200).json(foundeduser);
   }catch(err){
    res.status(500).json(err);
   }
})

module.exports=router;