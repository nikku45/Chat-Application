import React, { useState, useEffect } from "react";
import ChatRoom from "./ChatRoom";

export default function Message() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessages, setShowMessages] = useState(true); // Control visibility of message sidebar

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

  // Function to handle when user closes the chat room
  const handleChatClose = () => {
    setSelectedUser(null);
    setShowMessages(true); // Show the messages list when closing a chat
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users Sidebar - Show only when not in mobile view or when showMessages is true */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white shadow-md flex-col border-r border-gray-200`}>
        <UserList
          users={users}
          setSelectedUser={setSelectedUser}
          loading={loading}
          error={error}
        />
      </div>
      
      {/* Chat Area */}
      {selectedUser && (
        <div className="flex-8 w-full md:w-2/3 bg-white shadow-md flex flex-col">
          <ChatRoom 
            selectedUser={selectedUser} 
            setSelectedUser={handleChatClose} // Pass the handler to close chat
          />
        </div>
      )}
      
      {/* Empty state when no chat is selected */}
      {!selectedUser && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your messages</h2>
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
    <>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Message category</h2>
        <p className="text-sm text-gray-500">{`${localStorage.getItem('userId')}`}</p>
        
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search Message..." 
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
            
      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        )}
              
        {error && (
          <div className="bg-red-100 text-red-700 p-3 m-4 rounded-md text-sm">
            {error}
          </div>
        )}
              
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center text-gray-600 py-8 px-4">
            <p>No users available to chat.</p>
            {searchQuery && <p className="mt-2 text-sm">Try a different search term.</p>}
          </div>
        )}
              
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-800">{user.username}</h3>
                    <span className="text-xs text-gray-500">12:34 PM</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{user.email || "No recent messages"}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
        
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-base font-semibold text-gray-700">Direct Message</h3>
      </div>
    </>
  );
}