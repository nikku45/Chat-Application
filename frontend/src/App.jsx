
import React from 'react'   
import { useState } from 'react'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  Login  from './pages/login'
import Signup from './pages/signup'
import Home from './pages/home'
import Profile from './pages/profile'
import PrivateRoute from './utils/PrivateRoute'
import VideoChat from './pages/VideoChat'




function App() {
  
  return (
    <>
    <ToastContainer position="top-right" />
    <Router>
       <Routes>
          <Route path='/'      element ={<Home/>} />
          <Route path='/login' element ={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path="/profile" element={
          <PrivateRoute>
             <Profile />
          </PrivateRoute>
          } />
        
          <Route path='/videochat/:roomId' element={<VideoChat/>}/>
          
          

        </Routes>
      </Router>
      </>
  )
}

export default App
