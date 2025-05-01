const express=require('express');
const app=express()
const router=express.Router();
const User=require('../Models/User');
const verifyToken=require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js')
const parser = multer({ storage });

app.use(express.urlencoded({ extended: true }));
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

// Correct implementation of the profile update route
router.put("/profile/update", 
  verifyToken, 
  parser.single('profilePicture'), 
  async (req, res) => {
    console.log("in the api");
    console.log(req.user.id);
    
    const { username, bio } = req.body;
    const updateData = { username, bio };
    
 
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }
    
    try {
      
      let updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      );
      
      console.log(updatedUser);
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);


  
  
  

  


module.exports=router;