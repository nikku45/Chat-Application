import React, { useState, useEffect } from "react";
import Message from "./Message"; // Assuming you have a Message component for the chat
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, Avatar, IconButton } from "@mui/material";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const [isChatOpen, setIsChatOpen] = useState(false); // For chat sidebar
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") ? true : false); // For login state
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null); // For profile dropdown
  const navigate = useNavigate();

  useEffect(() => {
    if (isChatOpen) setIsOpen(false);
  }, [isChatOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleProfileMenuClick = (option) => {
    handleProfileMenuClose();
    if (option === "Profile") {
      navigate("/profile");
    } else if (option === "Logout") {
      handleLogout();
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors">
          MyWebsite
        </div>

        {/* Menu for larger screens */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#" className="hover:text-blue-200 transition-colors py-1">
            Home
          </a>
          <a href="#" className="hover:text-blue-200 transition-colors py-1">
            About
          </a>
          {isLoggedIn && (
            <button
              className="hover:text-blue-200 transition-colors py-1 relative"
              onClick={() => setIsChatOpen(true)}
            >
              Chat
            </button>
          )}
          {!isLoggedIn ? (
            <button
              className="hover:text-blue-200 transition-colors py-1"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar alt="Profile" src="/path-to-avatar.jpg" />
            </IconButton>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Profile Dropdown */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleProfileMenuClick("Profile")}>
          Profile
        </MenuItem>
        <MenuItem onClick={() => handleProfileMenuClick("Logout")}>
          Logout
        </MenuItem>
      </Menu>

      {/* Dropdown Menu for Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-3 space-y-2 bg-blue-700 p-4 rounded-lg">
          <a href="#" className="block hover:text-blue-200 transition-colors py-2">
            Home
          </a>
          <a href="#" className="block hover:text-blue-200 transition-colors py-2">
            About
          </a>
          <button
            className="block w-full text-left hover:text-blue-200 transition-colors py-2"
            onClick={() => setIsChatOpen(true)}
          >
            Chat
          </button>
          {!isLoggedIn ? (
            <button
              className="block w-full text-left hover:text-blue-200 transition-colors py-2"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <button
              className="block w-full text-left hover:text-blue-200 transition-colors py-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && isLoggedIn && (
        <div
          className={`fixed top-0 left-0 h-full bg-white shadow-xl w-full md:w-340 transform ${
            isChatOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="p-4 flex justify-between items-center bg-blue-600 text-white">
            <h2 className="text-xl font-bold">Chat</h2>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-blue-200 text-2xl font-bold focus:outline-none transition-colors"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>
          <div className="h-full overflow-y-auto pb-20">
            <Message />
          </div>
        </div>
      )}
    </nav>
  );
}
