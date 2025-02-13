import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';

import SaveRoomID from './components/roomid/SaveRoomID';
import Login from "./components/auth/login";
import Register from "./components/auth/register";
// import Header from "./components/header";
import Home from "./components/home";
import { AuthProvider } from "./contexts/authContext";

function AppRoutes() {
  const routesArray = [
    {
      path: "*",
      element: <SaveRoomID />,
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
      path: "/home",
      element: <Home />,
    },
  ];
  return useRoutes(routesArray);
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <Header /> */}
        {/* <div className="w-full h-screen "> */}
        <AppRoutes />
        {/* </div> */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;