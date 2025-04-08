import React  from "react";
import { useState } from "react";
import { toast } from 'react-toastify';

function postForm({onPostCreated}) {
    const [content,setContent]=useState('');
    
    const handleSubmit=async (e)=>{
        e.preventDefault();
        console.log("in handlesubmit")
        try{
        const res=await fetch("/api/post/create",{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                 Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body:JSON.stringify({content})
        })
 

        if(res.status==200){
            console.log(res);
            setContent('');
            onPostCreated();
            toast.success("Post created successfully!");
        }else{
            setContent('')
            toast.error("Failed to create post. Please try again.");
        }
    
}catch(err){
      console.log("error in generating post",{err});
     
    }
}



    return(
        <>
        <form onSubmit={handleSubmit}>
        <textarea
        rows="3"
        value={content}
        placeholder="What's on your mind?"
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
           <button className="btn">Submit</button>

        </form>
        </>
    )
}

export default postForm