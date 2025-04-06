import React  from "react";
import { useState } from "react";
function postForm({onPostCreated}) {
    const [content,setContent]=useState();
    const handleSubmit=(e)=>{
        e.preventDefault();
        const res=fetch("/api/post/create",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({content})
        })
       console.log(res);
        setContent('');
        onPostCreated(); // Call the function passed from the parent component to refresh the posts
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