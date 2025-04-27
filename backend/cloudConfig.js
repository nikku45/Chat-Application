require('dotenv').config();
const cloudinary=require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
let storage;
console.log(process.env.CLOUD_API_KEY)

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
          allowedformat:  ['png','jpg','jpeg'],
         
        },
      });
  }catch(err){
    console.log(err);
  }
 
      
      module.exports={cloudinary,storage};