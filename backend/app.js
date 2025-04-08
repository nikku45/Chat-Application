require('dotenv').config();
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const cors=require('cors');
const auth=require('./Routes/authroutes');
const profile=require('./Routes/profileRoute')
const post=require('./Routes/postRoute')
const likecomment=require('./Routes/likecommentroute')



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.use("/api/auth",auth);
app.use("/api",profile);
app.use("/api/post",post);
app.use("/api/posts",likecomment)







const PORT=process.env.PORT||5000;
const MONGO_URI=process.env.MONGO_URI||'mongodb://localhost:27017/Chat-App';
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

mongoose.connect(MONGO_URI)
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.log(err));

