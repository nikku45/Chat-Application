import React from "react";
import { useState } from "react";
import LikeButton from "./likeSection";
import CommentSection from "./commentSection";
import { MessageSquare } from "lucide-react";

const PostCard = ({ post, setPosts }) => {
  const [showcomment, setShowcomment] = useState(false);
 
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Top section with user info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {post.author.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 truncate">
            {post.author.username}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(post.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post content */}
      <div className="text-gray-700 text-base mb-4 leading-relaxed">
        {post.content}
      </div>

      {/* Like/Comment buttons */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
        <LikeButton post={post} setPosts={setPosts} />
        <CommentSection post={post} setPosts={setPosts} />
      </div>
    </div>
  );
};

export default PostCard;