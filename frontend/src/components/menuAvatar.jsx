import React, { useState, useEffect, useRef } from "react";
import { LogOut, User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userImage = localStorage.getItem("userImage"); 
  // store user image when login (base64/url)

  const toggleMenu = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 

    // Redirect to home after logout
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleMenu}
        className="w-10 h-10 rounded-full border-2 border-purple-300 overflow-hidden shadow-md hover:scale-105 transition"
      >
        {userImage ? (
          <img src={userImage} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
            {username ? username.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-44 bg-white shadow-lg rounded-xl p-2 z-50 border border-purple-200 animate-fadeIn">
          {token ? (
            <>
              {/* Profile */}
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-700"
                onClick={() => (window.location.href = "/profile")}
              >
                <User size={18} className="text-purple-600" />
                Profile
              </button>

              {/* Logout */}
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-700"
                onClick={handleLogout}
              >
                <LogOut size={18} className="text-purple-600" />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-700"
                onClick={() => (window.location.href = "/login")}
              >
                <LogIn size={18} className="text-purple-600" />
                Login
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AvatarMenu;
