import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Feed from "./components/feed";
import ChatSection from "./components/Message";
import PrivateRoute from "./utils/PrivateRoute";
import Profile from "./pages/Profile";
import VideoChat from "./pages/VideoChat";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import Signup from "./pages/signup";

const App = () => {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-400 to-purple-600">
        
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          <main className="flex-1 p-4 overflow-hidden">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Feed />} />

              {/* Protected */}
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <ChatSection />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <Login/>
                }
              />
              <Route
              path='/signup'
              element={
                <Signup/>
              }
              />
              <Route
              path="/videochat/:roomId"
              element={
                <PrivateRoute>
                  <VideoChat />
                </PrivateRoute>
              }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
};

export default App;
