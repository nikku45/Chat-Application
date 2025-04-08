import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, ChevronDown, ChevronUp } from "lucide-react";

const CommentSection = ({ post, setPosts }) => {
    const [comment, setComment] = useState("");
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [loading, setLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [animateInput, setAnimateInput] = useState(false);
    const maxCharLimit = 250;
    const commentInputRef = useRef(null);
    
    // Auto-focus input when comment section opens
    useEffect(() => {
        if (showCommentSection && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [showCommentSection]);

    const handleComment = async () => {
        if (!post?._id) {
            console.error("Post ID is undefined");
            return;
        }

        if (!comment.trim()) {
            setAnimateInput(true);
            setTimeout(() => setAnimateInput(false), 820);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/posts/${post._id}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ content: comment }),
            });

            if (!res.ok) {
                console.error("Failed to add comment");
                setLoading(false);
                return;
            }

            const data = await res.json();

            // Optimistically update the comments section
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p._id === post._id
                        ? { ...p, comments: [...p.comments, { user: { username: "You" }, content: comment, isNew: true }] }
                        : p
                )
            );

            setComment(""); // Clear input
            setCharCount(0); // Reset character count
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= maxCharLimit) {
            setComment(value);
            setCharCount(value.length);
        }
    };

    const getProgressColor = () => {
        if (charCount < maxCharLimit * 0.7) return "bg-green-500";
        if (charCount < maxCharLimit * 0.9) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="w-full transition-all duration-300">
            {/* Button to toggle comments */}
            <button
                onClick={() => setShowCommentSection(!showCommentSection)}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition-all duration-300 text-sm font-medium"
                aria-expanded={showCommentSection}
            >
                <MessageSquare size={18} className="text-blue-500" />
                <span className="text-gray-700">
                    {post.comments.length || 0} {post.comments.length === 1 ? "Comment" : "Comments"}
                </span>
                {showCommentSection ? 
                    <ChevronUp size={16} className="text-gray-500" /> : 
                    <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {/* Comment section with slide animation */}
            {showCommentSection && (
                <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
                    {/* Comment input area */}
                    <div className="p-4 border-b border-gray-100">
                        <div className={`relative rounded-lg border ${animateInput ? "animate-shake border-red-500" : "border-gray-200"} transition-all`}>
                            <textarea
                                ref={commentInputRef}
                                value={comment}
                                onChange={handleInputChange}
                                placeholder="Share your thoughts..."
                                className="p-3 w-full rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                                rows="2"
                            ></textarea>
                            
                            {/* Character count and send button */}
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-b-lg">
                                <div className="relative h-1 w-24 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`absolute h-full ${getProgressColor()} transition-all duration-300`}
                                        style={{ width: `${(charCount / maxCharLimit) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500 mr-2">{charCount}/{maxCharLimit}</span>
                                
                                <button
                                    onClick={handleComment}
                                    disabled={loading}
                                    className={`rounded-full p-2 ${loading || !comment.trim() ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-all duration-300 flex items-center justify-center`}
                                    aria-label="Post comment"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={16} className="translate-x-px -translate-y-px" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comments list */}
                    <div className="max-h-80 overflow-y-auto">
                        {post.comments.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {post.comments.map((c, index) => (
                                    <li 
                                        key={index} 
                                        className={`p-4 transition-all duration-300 hover:bg-gray-50 ${c.isNew ? 'animate-fadeIn bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                                                
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                                               {c?.user?.username?.charAt(0)?.toUpperCase() || "?"}
                                            </div>

                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900">{c.user.username}</h4>
                                                    {c.isNew && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">New</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 mt-1 text-sm">{c.content}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                    <MessageSquare size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">No comments yet</p>
                                <p className="text-gray-400 text-xs mt-1">Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;