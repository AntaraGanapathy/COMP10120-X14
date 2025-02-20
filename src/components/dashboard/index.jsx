import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, onValue, remove, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { doSignOut } from '../../firebase/auth'

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [kitchenData, setKitchenData] = useState(null);
  const [members, setMembers] = useState([]);

  const session = JSON.parse(localStorage.getItem('kitchenSession')) || location.state;
  const { roomId, userName, role, kitchenName } = session || {};

  useEffect(() => {
    const verifySession = async () => {
      if (!session) return;
      
      try {
        const userRef = ref(database, `rooms/${session.roomId}/users/${session.userName}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          localStorage.removeItem('kitchenSession');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Session verification failed:', error);
      }
    };

    verifySession();
  }, [navigate, session]);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setKitchenData(data);
        setMembers(Object.entries(data.users || {}));
      } else {
        localStorage.removeItem('kitchenSession');
        navigate('/dashboard', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  const handleLeaveKitchen = async () => {
    if (!window.confirm('Are you sure you want to leave this kitchen?')) return;

    try {
      const userRef = ref(database, `rooms/${roomId}/users/${userName}`);
      await remove(userRef);

      const membersSnapshot = await get(ref(database, `rooms/${roomId}/users`));
      if (!membersSnapshot.exists() || Object.keys(membersSnapshot.val()).length === 0) {
        await remove(ref(database, `rooms/${roomId}`));
      }

      localStorage.removeItem('kitchenSession');
      navigate('/dashboard', { 
        replace: true,
        state: null
      });

    } catch (error) {
      console.error('Error leaving kitchen:', error);
      alert('Failed to leave kitchen. Please try again.');
    }
  };

  if (!roomId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Kitchen Manager</h1>
        <p className="text-xl mb-4">
          Hello {currentUser.displayName || currentUser.email}
        </p>
        <button
          onClick={() => navigate('/manage-room')}
          className="bg-blue-500 text-black px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create or Join a Kitchen
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{kitchenData?.name || kitchenName}</h1>
            <p className="text-gray-600 mt-2">Kitchen ID: {roomId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Logged in as: {currentUser.displayName || currentUser.email}
            </p>
            <p className="text-sm text-gray-500">Your role: {role}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl text-black font-semibold mb-4">Kitchen Members</h2>
          <div className="space-y-3">
            {members.map(([username, data]) => (
              <div 
                key={username}
                className="flex items-center text-black justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <span className="font-medium">{username}</span>
                  {data.role === 'creator' && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Creator
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  Joined: {new Date(data.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          {/* Add Kitchen Features section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Kitchen Features</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => navigate('/calendar')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Calendar
              </button>
              <button
                onClick={() => navigate('/cost-splitter')}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Cost Splitter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Kitchen Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/manage-room')}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Kitchen Manager
          </button>
          <button
            onClick={handleLeaveKitchen}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Leave Kitchen
          </button>
          <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className='text-sm text-white'>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
