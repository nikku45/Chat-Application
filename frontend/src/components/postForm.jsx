import React  from "react";
import { useState } from "react";
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
        }else{
            setContent('')
            alert("You have to login for creating a Post")
        }
    
}catch(err){
      console.log("error in generating post",{err});
      alert("some error occured please try again")
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