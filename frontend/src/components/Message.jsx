import React, { useState, useEffect } from "react";
import ChatRoom from "./ChatRoom";

export default function Message() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessages, setShowMessages] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/user`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
       
    fetchUsers();
  }, []);

  const handleChatClose = () => {
    setSelectedUser(null);
    setShowMessages(true);
  };

  return (
  <div className="flex h-[calc(100vh-143px)] overflow-hidden"> 
    {/* Users Sidebar */}
    <div 
      className={`${selectedUser ? "hidden md:flex" : "flex"} 
      w-full md:w-96 bg-purple-500 bg-opacity-30 flex-col h-full overflow-hidden rounded-tl-2xl`}>
      
      <UserList
        users={users}
        setSelectedUser={setSelectedUser}
        loading={loading}
        error={error}
      />
    </div>

    {/* Chat Area */}
    {selectedUser && (
      <div className="flex-1 flex flex-col h-full overflow-hidden ml-2">
        <ChatRoom
          selectedUser={selectedUser}
          setSelectedUser={handleChatClose}
        />
      </div>
    )}

    {/* Empty state when no chat is selected */}
    {!selectedUser && (
      <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-tl-3xl ml-2">
        <div className="text-center p-8">
          <div className="mx-auto w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your messages</h2>
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    )}
  </div>
);

}

function UserList({ users, setSelectedUser, loading, error }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-6 border-b border-purple-400 border-opacity-30 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-1">Messages</h2>
        <p className="text-xs text-purple-100">{`${localStorage.getItem('userId')}`}</p>
        
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-400 bg-opacity-50 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* User List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        )}
              
        {error && (
          <div className="bg-red-400 bg-opacity-30 text-white p-4 m-4 rounded-xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}
              
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center text-purple-100 py-12 px-4">
            <p className="font-medium">No users available to chat.</p>
            {searchQuery && <p className="mt-2 text-sm text-purple-200">Try a different search term.</p>}
          </div>
        )}
              
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="rounded-xl hover:bg-purple-400 hover:bg-opacity-30 transition-all cursor-pointer mb-2"
            onClick={() => setSelectedUser(user)}
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-500"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-white">{user.username}</h3>
                    <span className="text-xs text-purple-200">12:34 PM</span>
                  </div>
                  <p className="text-sm text-purple-100 mt-0.5 truncate">{user.email || "No recent messages"}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer - Fixed */}
      <div className="p-4 border-t border-purple-400 border-opacity-30 flex-shrink-0">
        <h3 className="text-sm font-semibold text-purple-100">Direct Messages</h3>
      </div>
    </div>
  );
}