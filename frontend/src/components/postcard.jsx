const PostCard = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200 max-w-xl mx-auto">
      {/* Top section with user info */}
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {post.author.username[0]?.toUpperCase()}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-gray-800">{post.author.username}</h3>
          <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
        </div>
      </div>

      {/* Post content */}
      <div className="text-gray-700 text-base mb-2">
        {post.content}
      </div>

      {/* Like/Comment buttons (placeholders for now) */}
      <div className="flex justify-start gap-4 text-sm text-gray-600 mt-2">
        <button className="hover:text-blue-500">👍 Like</button>
        <button className="hover:text-blue-500">💬 Comment</button>
      </div>
    </div>
  );
};

export default PostCard;
