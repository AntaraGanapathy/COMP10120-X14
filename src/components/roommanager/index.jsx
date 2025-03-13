import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const RoomManager = () => {
  const navigate = useNavigate();
  const [kitchenName, setKitchenName] = useState('');
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Check for existing session on component mount
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('kitchenSession'));
    if (session) {
      navigate('/dashboard', { state: session });
    }
  }, [navigate]);

  const generateRoomId = () => Math.floor(100000 + Math.random() * 900000);

  const checkRoomExists = async (id) => {
    const snapshot = await get(ref(database, `rooms/${id}`));
    return snapshot.exists();
  };

  const handleCreateRoom = async () => {
    if (!kitchenName.trim() || !userName.trim()) {
      setStatusMessage('Please provide both kitchen name and your name');
      return;
    }

    try {
      let newRoomId;
      let roomExists;
      
      do {
        newRoomId = generateRoomId();
        roomExists = await checkRoomExists(newRoomId);
      } while (roomExists);

      await set(ref(database, `rooms/${newRoomId}`), {
        name: kitchenName,
        created: Date.now(),
        users: {
          [userName]: {
            role: 'creator',
            timestamp: Date.now()
          }
        }
      });

      // Save session to localStorage
      const sessionData = {
        roomId: newRoomId,
        userName,
        role: 'creator',
        kitchenName
      };
      localStorage.setItem('kitchenSession', JSON.stringify(sessionData));

      navigate('/dashboard', { state: sessionData });

    } catch (error) {
      setStatusMessage(`Error creating kitchen: ${error.message}`);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim() || !userName.trim()) {
      setStatusMessage('Please provide both kitchen ID and your name');
      return;
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const userRef = ref(database, `rooms/${roomId}/users/${userName}`);

      const roomSnapshot = await get(roomRef);
      if (!roomSnapshot.exists()) {
        setStatusMessage('Kitchen ID not found');
        return;
      }

      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        setStatusMessage('Username already taken in this kitchen');
        return;
      }

      await set(userRef, {
        role: 'member',
        timestamp: Date.now()
      });

      // Save session to localStorage
      const sessionData = {
        roomId,
        userName,
        role: 'member',
        kitchenName: roomSnapshot.val().name
      };
      localStorage.setItem('kitchenSession', JSON.stringify(sessionData));

      navigate('/dashboard', { state: sessionData });

    } catch (error) {
      setStatusMessage(`Error joining kitchen: ${error.message}`);
    }
  };

  return (
    <div className="min-w-screen flex items-center justify-center mt-4 mb-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-3xl font-bold text-gray-800">
            Kitchen Manager
          </p>
          <p className="text-gray-600">Organize your culinary space</p>
        </div>

        {/* Create Section */}
        <div className="space-y-4 ">
          <input
            type="text"
            placeholder="Kitchen Name"
            value={kitchenName}
            onChange={(e) => setKitchenName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <button
            onClick={handleCreateRoom}
            className="w-full py-3 text-black font-medium rounded-lg "
          >
            Create Kitchen
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-gray-500 text-sm">
              or join existing
            </span>
          </div>
        </div>

        {/* Join Section */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Kitchen ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-black font-medium rounded-lg transition-colors"
          >
            Join Kitchen
          </button>
        </div>

        {/* Error Messages */}
        {statusMessage && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg text-center animate-fade-in">
            <p className="text-red-600 text-sm font-medium">
              {statusMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


export default RoomManager;