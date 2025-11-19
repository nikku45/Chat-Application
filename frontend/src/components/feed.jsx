import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostCard from './postcard';
import PostForm from './postForm';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostform, setshowPostform] = useState(false);

    const fetchPosts = async () => {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/post/getposts`, {
            method: 'GET',
        });
        const data = await res.json();
        setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <main className="flex-1 bg-white rounded-tl-3xl p-8 relative  ">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">General Feed</h2>

            {showPostform && <PostForm onPostCreated={fetchPosts} />}

            {/* Floating "+" button */}
            <button
                className="fixed bottom-8 right-8 bg-purple-500 hover:bg-purple-600 text-white w-14 h-14 rounded-full text-3xl shadow-lg z-50 flex items-center justify-center transition-all duration-200"
                onClick={() => setshowPostform(!showPostform)}
            >
                +
            </button>

            {/* Scrollable posts section */}
            <div className="space-y-6 overflow-y-auto h-[70vh] pr-2">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    posts.map((post) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0.2, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5 }}
                        >
                            <PostCard post={post} setPosts={setPosts} />
                        </motion.div>
                    ))
                )}
            </div>
        </main>
    );
}

export default Feed;
