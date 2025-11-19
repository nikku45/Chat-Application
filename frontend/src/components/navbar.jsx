import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings, User } from "lucide-react";
import AvatarMenu from "./menuAvatar";


const Navbar = () => {
 const navigate = useNavigate();

const handleClick = () => {
  
  navigate("/login");
  window.location.reload();
};
  return (
    <nav className="bg-purple-500 px-6 py-4 flex items-center justify-between">
      <h1 className="text-white text-2xl font-bold">Himate</h1>
      
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-purple-400 bg-opacity-50 text-white placeholder-purple-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-white hover:bg-purple-400 p-2 rounded-lg transition">
          <Bell className="w-6 h-6" />
        </button>
        
        <AvatarMenu />
      </div>
    </nav>
  );
};

export default Navbar;
