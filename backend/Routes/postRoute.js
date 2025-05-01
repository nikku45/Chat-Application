const express=require('express');
const mongoose=require('mongoose');


const router=express.Router();
const Post=require('../models/Post');
const User=require('../models/User');
const verifyToken=require('../middleware.js');


// Create a new post
router.post('/create',verifyToken,async (req, res) => {
   console.log("hitted")
 
 try{
  const{content}=req.body;
  const newpost=new Post({content});
   console.log(newpost)
   const id=req.user.id;
   console.log(id);
   const user=await User.findById(id);
   console.log(user)
   newpost.author=user;
   const result=await newpost.save();
   console.log(result);
  res.status(200).json({message:"done"});
 }catch(err){
  res.status(500).json({message:{err}})
 }



})
//get post
router.get('/getposts',async(req,res)=>{
    try {
        const posts = await Post.find().populate("author", "username").sort({ timestamp: -1 });
        res.status(200).json(posts);
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
})
module.exports=router;