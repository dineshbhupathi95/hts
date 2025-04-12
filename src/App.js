import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import MainLayout from './components/MainView';
import Reports from './components/Report';
import './App.css';
import appConfig from './ApiConfig';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    }
  }, []);
  
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${appConfig.userBaseURL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsAuthenticated(false);
    }
  };
  
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={logout} />
        <main className="container">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Login onLogin={login} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Register />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <MainLayout user={user}/> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/medicines"
              element={
                isAuthenticated ? 
                <MainLayout user={user}/>: 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/sale"
              element={
                isAuthenticated ? 
                <MainLayout user={user}/>: 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
             <Route path="*" element={<MainLayout user={user}/>} /> {/* Handles unknown routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;