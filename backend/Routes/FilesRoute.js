
const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig.js')
const parser = multer({ storage });

router.post('/chat/upload', parser.single('file'),(req, res) => {
  // Check if the file exists
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

 
  res.status(200).json({ fileUrl: req.file.path });
});

router.post('/chat/upload-voice', (req, res, next) => {
 
  parser.single('audio')(req, res, (err) => {
    if (err) {
      console.error("Error in file parser middleware:", err);
      return res.status(500).json({ error: "File upload failed", details: err.message });
    }
    next();
  });
}, (req, res) => {
 

  // Check if the file exists
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

 
  res.status(200).json({ fileUrl: req.file.path });
});


module.exports = router;