require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const http = require("http");
const socketIO = require("socket.io");
const app=express();
const server = http.createServer(app);
const io = socketIO(server);
const path=require('path')

const cors=require('cors');
const auth=require('./Routes/authroutes');
const profile=require('./Routes/profileRoute')
const post=require('./Routes/postRoute')
const likecomment=require('./Routes/likecommentroute');
const userRoute=require('./Routes/UserRoute')
const MessageRoute=require('./Routes/MessageRoute');
const FilesRoute=require('./Routes/FilesRoute')


const { join } = require('path');
const { isKeyObject } = require('util/types');




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));




io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
    socket.on("joinRoom",(roomId)=>{
        socket.join(roomId);
        console.log(`user joined on ${roomId}`)
    })
   
    socket.on("sendMessage", ({ roomId, message,sender,fileurl }) => {
     
        // Broadcast the message to everyone in the room
        io.to(roomId).emit("receiveMessage", { sender:sender, message ,fileurl});
        console.log(`${sender} send the ${message} on ${roomId}`);
       
    });
    
   
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth",auth);
app.use("/api",profile);
app.use("/api/post",post);
app.use("/api/posts",likecomment)
app.use("/api/user",userRoute)
app.use("/api/message",MessageRoute);
app.use("/api/filesharing",FilesRoute);








const PORT=process.env.PORT||5000;
const MONGO_URI=process.env.MONGO_URI||'mongodb://localhost:27017/Chat-App';
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

mongoose.connect(MONGO_URI)
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.log(err));

