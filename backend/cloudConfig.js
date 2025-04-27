require('dotenv').config();
const cloudinary=require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
let storage;


  try{
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_Name, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_Secret
    });
    
   storage = new CloudinaryStorage({
         cloudinary:cloudinary,
        params: {
          folder: 'HiBeen_DEV',
          resource_type: 'auto', 
          allowedFormats: ['png', 'jpg', 'jpeg', 'mp3', 'wav']
         
        },
      });
  }catch(err){
    console.log(err);
  }
 
      
      module.exports={cloudinary,storage};