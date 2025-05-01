const express=require('express');
const mongoose=require('mongoose');
const app=express();

const router=express.Router();
const Post=require('../models/Post.js');
const User=require('../models/User.js');
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
router.post('/:id/comment',verifyToken, async (req, res) => {
    try {
      const { content } = req.body; // Extract the comment content from the request body
      // Get the authenticated user's ID from the token
      const userid=req.user.id;
      const postId = req.params.id; // Get the post ID from the route parameter
  
      // Find the post by ID
      const post = await Post.findById(postId);
      const founduser=await User.findById(userid)
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Add the new comment to the comments array
      post.comments.push({ content,user:founduser});

  
      // Save the updated post
      const result = (await post.save()).populate("comments", "user" ,"username");
      console.log(result);
  
      res.status(200).json({ message: "Comment added successfully", post: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports=router;