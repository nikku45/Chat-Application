import React from 'react'
import { useState } from 'react'


function postCard({posts}){
    return(
        <>
         <div className="card border-0 mb-3 bg-black" style={{width: "18rem"}}>
            <h1>nitin</h1>
            <p>{posts.content}</p>
            
          </div>
        </>
    )
}
export default postCard 