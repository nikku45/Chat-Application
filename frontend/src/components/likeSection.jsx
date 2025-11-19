// LikeButton.jsx
import React, { useState } from "react";
import { Heart, ThumbsUp } from "lucide-react";

const LikeButton = ({ post, setPosts }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [animated, setAnimated] = useState(false);
  const isLiked = post.likes?.isLiked || false;
  const likeCount = post.likes?.count || 0;

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setAnimated(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Response status:", response);
     
      const data = await response.json();
      
      // Optimistically update the UI
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: {
                  ...p.likes,
                  count: data.likes,
                  isLiked: !isLiked
                }
              }
            : p
        )
      );
      
    } catch (error) {
      console.log("Error liking post:", error);
    } finally {
      setIsLoading(false);
      // Reset animation after it completes
      setTimeout(() => setAnimated(false), 500);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 ${
        isLiked 
          ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
      aria-label={isLiked ? "Unlike post" : "Like post"}
    >
      {/* Like icon with animation */}
      <Heart
        size={18} 
        className={`${
          animated ? "animate-bounce" : ""
        } ${
          isLiked ? "fill-red-600" : ""
        } transition-all`}
      />
      
      {/* Like count */}
      <span className={`text-sm font-medium ${animated ? "animate-pulse" : ""}`}>
        {likeCount > 0 ? likeCount : "Like"}
      </span>
    </button>
  );
};

export default LikeButton;

