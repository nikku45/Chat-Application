import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import PostCard from './postcard'
import PostForm from './postForm'   

function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

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
            <PostForm onPostCreated={fetchPosts} />
            {loading ? (
                <p>Loading...</p>
            ) : (
                posts.map((post) => <PostCard key={post._id} posts={post} />)
            )}
        </div>
    )
}

export default Feed