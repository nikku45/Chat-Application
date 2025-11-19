import React from "react";
import { Construction, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white text-center px-6">
      
      {/* Icon */}
      <div className="p-6 bg-white bg-opacity-20 rounded-full shadow-xl animate-bounce">
        <AlertTriangle size={70} />
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-bold mt-6">Oops!</h1>

      {/* Message */}
      <p className="text-lg mt-3 max-w-md">
        This page is either <span className="font-semibold">not found</span> or currently  
        <span className="font-semibold"> under development.</span>
      </p>

      {/* Under Development Icon */}
      <div className="flex items-center gap-3 mt-4 opacity-90">
        <Construction size={26} />
        <span className="text-md">We’re building something amazing 👷‍♂️🚧</span>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl shadow-lg flex items-center gap-2 hover:bg-purple-100 transition"
      >
        <ArrowLeft size={18} /> Go Back Home
      </button>

    </div>
  );
}

export default NotFound;
