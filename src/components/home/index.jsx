import React from 'react'
import { useAuth } from '../../contexts/authContext'

function Home() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Room App</h1>
        
        <Link
          to="/create-room"
          className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        >
          Create a Room
        </Link>
        
        <Link
          to="/join-room"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Join a Room
        </Link>
      </div>
    );
  }
  
  export default Home;