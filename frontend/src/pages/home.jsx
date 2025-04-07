import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Feed from "../components/feed";
export default function Home() {
  const handleLogout = () => {
    console.log("handlelogout")
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <>
      
      <button  className="bg black"onClick={handleLogout}>
          Logout
          </button>
        
        <Feed />
       
     
    </>
  );
}