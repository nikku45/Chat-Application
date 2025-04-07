const express = require("express");
const jwt = require("jsonwebtoken");


const router = express.Router();
const secret = "mysecret"; 

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    console.log("in verifytoken")
  

    if (!token) {
        console.log("token is invalid")
        return res.status(401).json({ message: "Access Denied" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid Token Format" });
    }

    try {
        const verified = jwt.verify(tokenParts[1], secret);
      

        req.user = verified; // Attach user data to request
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid Token" });
    }
};




module.exports = verifyToken;
