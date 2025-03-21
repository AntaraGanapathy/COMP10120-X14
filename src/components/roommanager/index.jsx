import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const RoomManager = () => {
  const navigate = useNavigate();
  const [kitchenName, setKitchenName] = useState('');
  const [createUserName, setCreateUserName] = useState('');
  const [joinUserName, setJoinUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

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
    if (!kitchenName.trim() || !createUserName.trim()) {
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
          [createUserName]: {
            role: 'creator',
            timestamp: Date.now()
          }
        }
      });

      const sessionData = {
        roomId: newRoomId,
        userName: createUserName,
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
    if (!roomId.trim() || !joinUserName.trim()) {
      setStatusMessage('Please provide both kitchen ID and your name');
      return;
    }

    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const userRef = ref(database, `rooms/${roomId}/users/${joinUserName}`);

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

      const sessionData = {
        roomId,
        userName: joinUserName,
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
    <div className="bg-[#F7F8F3] min-h-screen min-w-screen flex items-center justify-center">
      <div className="p-4 border rounded-lg shadow-md bg-white max-w-md min-w-sm mx-auto pt-15">
        <p className="text-3xl text-black font-bold mb-6 mt-4 text-center"> Kitchen Manager </p>
        <p className="block font-medium text-black mb-2 text-center mb-8">{showJoinForm ? 'Join an existing kitchen' : 'Create your kitchen space'}</p>

        {showJoinForm ? (
          <div className="space-y-4 flex flex-col items-center">
            <input
              type="text"
              placeholder="Kitchen ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-5/6 p-2 border rounded-md text-black mb-6"
            />
            <input
              type="text"
              placeholder="Your Name"
              value={joinUserName}
              onChange={(e) => setJoinUserName(e.target.value)}
              className="w-5/6 p-2 border rounded-md text-black mb-6"
            />
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowJoinForm(false)}
                className="btn-primary w-full p-2 mt-4 mb-2"
              >
                Back
              </button>
              <button
                onClick={handleJoinRoom}
                className="btn-primary w-full p-2 mt-4 mb-2"
              >
                Join Kitchen
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 flex flex-col items-center">
              <input
                type="text"
                placeholder="Kitchen Name"
                value={kitchenName}
                onChange={(e) => setKitchenName(e.target.value)}
                className="w-5/6 p-2 border rounded-md text-black mb-6"
              />
              <input
                type="text"
                placeholder="Your Name"
                value={createUserName}
                onChange={(e) => setCreateUserName(e.target.value)}
                className="w-5/6 p-2 border rounded-md text-black mb-4"
              />
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={handleCreateRoom}
                className="btn-primary w-3/4 p-2 mb-4 mt-4"
              >
                Create Kitchen
              </button>

              <div className='flex flex-row text-center w-full'>
                  <div className='border-b-2 mb-2.5 mr-2 w-full'></div><div className='text-sm font-bold w-fit text-black'>OR</div><div className='border-b-2 mb-2.5 ml-2 w-full'></div>
              </div>

              <button
                onClick={() => setShowJoinForm(true)}
                className="btn-primary w-3/4 p-2 mt-4 mb-2"
              >
                Join an existing kitchen
              </button>
            </div>
          </>
        )}

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