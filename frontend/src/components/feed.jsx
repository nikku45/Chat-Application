import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import {motion} from 'framer-motion'
import PostCard from './postcard'
import PostForm from './postForm'   

function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const[showPostform,setshowPostform]=useState(false)

    const fetchPosts = async () => {
        const res = await fetch('/api/post/getposts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        const data = await res.json();
        setPosts(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [])
    

    return (
        <div className="container">
          {showPostform && <PostForm onPostCreated={fetchPosts} />}
          <button
   style={{
    position: "fixed",
    bottom: "30px",
    right: "30px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "14px 18px",
    borderRadius: "50%",
    fontSize: "24px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: 1000
  }}
  onClick={() => setshowPostform(!showPostform)}
  >
  +
</button>

            
            
            {loading ? (
                <p>Loading...</p>
            ) : (
              posts.map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0.2, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            )}
         </div>
    )
}

export default Feed