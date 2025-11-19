import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Users,
  Settings
} from "lucide-react";

const Sidebar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/chat", icon: MessageSquare, label: "Chat", protected: true },
    { path: "/friends", icon: Users, label: "Friends" },
    { path: "/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <aside className="ml-2 mt-5 w-64 rounded-tl-[50px] bg-purple-500 bg-opacity-30 p-6">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          const handleClick = () => {
            if (item.protected && !token) {
              navigate("/login"); // Redirect to login instead of alert
              return;
            }
            navigate(item.path);
          };

          return (
            <button
              key={item.path}
              onClick={handleClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-purple-400 bg-opacity-50 text-white"
                  : "text-purple-100 hover:bg-purple-400 hover:bg-opacity-30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
