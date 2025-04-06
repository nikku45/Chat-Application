const express=require('express');
const mongoose=require('mongoose');

const router=express.Router();
const Post=require('../models/Post');
const User=require('../Models/User');
const verifyToken=require('../middleware.js');



// Create a new post
router.post('/create',async (req, res) => {
   
 const{content,author,}=req.body;
//  const id=req.user.id;
   const newpost=new Post({content,author});
   const result=await newpost.save();
//   
//    user.push(newpost);
//    user.save();
 res.status(200).json({message:"done"});

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