import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Dashboard from './components/dashboard';
import RoomManager from './components/RoomManager';
import CostSplitter from './components/groceryList/addItem';

function AppRoutes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const session = JSON.parse(localStorage.getItem('kitchenSession'));
      if (session) {
        navigate('/dashboard', { state: session });
      }
    }
  }, [currentUser, navigate]);

  const routesArray = [
    { path: "*", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/register", element: <Register /> },
    { path: "/manage-room", element: <RoomManager /> },
    // { path: "/grocery-list", element: <CostSplitter /> },
  ];
  
  return useRoutes(routesArray);
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;