const express=require('express');
const mongoose=require('mongoose');
const app=express();

const router=express.Router();
const Post=require('../models/Post.js');
const User=require('../Models/User.js');
const verifyToken=require('../middleware.js');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

router.post('/:id/like',verifyToken,async(req,res)=>{
    
    try{   
    let id=req.params.id;
    const likeduser=await User.findById(req.user.id);
    let post=await Post.findById(id);
    post.likes.count+=1;
    post.likes.users=likeduser;
    await post.save();
    res.status(200).json({likes:post.likes.count,message:"work done"})
    }catch(err){
        res.status(501).json({message:"Internal server error"});
    }

})

//create comment
router.post('/:id/comment',async(req,res)=>{
    
    try{   
    const {comment}=req.body;
    let id=req.params.id;
    // const commentuser=await User.findById(req.user.id);
    let post=await Post.findById(id);
    post.comments.content=comment;
    // post.comments.user=commentuser;
    await post.save();
    res.status(200).json({message:"work done"})
    }catch(err){
        res.status(501).json({message:"Internal server error"});
    }

})

module.exports=router;