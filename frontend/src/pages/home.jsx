import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import Feed from "../components/feed";
export default function Home() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <>
      <div className="container mx-auto mt-4">
        <Feed />
        <button className="btn" onClick={handleLogout}/>
          Logout
        </div>
     
    </>
  );
}