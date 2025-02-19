import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';

import SaveRoomID from './components/roomid/SaveRoomID';
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Header from "./components/header";
//import Dashboard from "./components/dashboard";
import { AuthProvider } from "./contexts/authContext";
import Dashboard from './components/dashboard';

function AppRoutes() {
  const routesArray = [
    {
      path: "*",
      element: <Dashboard />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/roomid",
      element: <SaveRoomID />,
    },
  ];
  return useRoutes(routesArray);
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
         <Header />
        
        <AppRoutes />
        
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;