
const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig.js')
const parser = multer({ storage });

router.post('/upload', parser.single('file'),(req, res) => {
   
  

  // Check if the file exists
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("Uploaded file details:", req.file);
  res.status(200).json({ fileUrl: req.file.path });
});

module.exports = router;