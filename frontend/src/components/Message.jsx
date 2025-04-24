import React, { useState, useEffect } from "react";
import ChatRoom from "./ChatRoom"; // Assuming ChatRoom is a component that handles chat messages
export default function Message() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/user");
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

  return (
    <>
      {selectedUser ? (
        <ChatRoom selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      ) : (
        <UserList 
          users={users} 
          setSelectedUser={setSelectedUser} 
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}

function UserList({ users, setSelectedUser, loading, error }) {
  return (
    <div className="flex flex-col bg-gray-50 p-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Users</h2>
      <p className="text-sm text-gray-500 mb-4">
        Select a user to start chatting
      </p>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-gray-500">Loading users...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <ul className="space-y-3 overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-medium text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user);
                }}
              >
                Chat
              </button>
            </li>
          ))
        ) : (
          !loading && (
            <li className="text-center text-gray-600 py-8">
              No users available to chat.
            </li>
          )
        )}
      </ul>
    </div>
  );
}

// Mock ChatRoom component to make this standalone

