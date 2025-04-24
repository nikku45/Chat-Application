const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const secret = "mysecret"; 

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

      
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

      
        const token = jwt.sign({ id: newUser._id }, secret, { expiresIn: "1h" });

        res.status(200).json({ token, message: "User created successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return res.status(400).json({ message: "User not found" });
        }

       
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

       
        const token = jwt.sign({ id: foundUser._id }, secret, { expiresIn: "1h" });

        res.status(200).json({ token, userId: foundUser._id });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
