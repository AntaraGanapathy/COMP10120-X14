import React, { useEffect } from 'react';
import { BrowserRouter, useRoutes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/authContext";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Dashboard from './components/dashboard';
import RoomManager from './components/roommanager';
import AddSplitterItem from './components/costSplitter/addSplitterItem';
import CostSplitterMaster from './components/costSplitter/costSplitterMaster';
import MyCalendar from './components/calendar';
import Chat from './components/chat/Chat';

function AppRoutes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const session = JSON.parse(localStorage.getItem('kitchenSession'));
      if (session && (window.location.pathname === "/login" || window.location.pathname === "/register")) {
        if (window.location.pathname !== "/dashboard") {
          navigate('/dashboard', { state: session });
        }
      }
    }
  }, [currentUser, navigate]);

  const routesArray = [
    { path: "*", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/register", element: <Register /> },
    { path: "/manage-room", element: <RoomManager /> },
    { path: "/add-item", element:<AddSplitterItem />},
    { path: "/cost-splitter", element:<CostSplitterMaster />},
    { path: "/calendar-page", element:<MyCalendar />},
    { path: "/chat", element: <Chat />}
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