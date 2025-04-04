import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ref, onValue, remove, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { doSignOut } from '../../firebase/auth';
import { logo } from "../../assets";
import Schedule from '../Schedule'; // Add this import
import '../styles/main.css';

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
      <div className="bg-[#F7F8F3] min-h-screen min-w-screen flex items-center justify-center">
        <div className="text-center">
          {/* <p className="text-xl mb-4 text-black">Hello {currentUser.displayName || currentUser.email}</p> */}
          <h1 className="text-3xl font-bold mb-6 text-black">Welcome to Kitchen Manager</h1>
          <button onClick={() => navigate('/manage-room')} className="btn-primary mt-4">
            Create or Join a Kitchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8F3]">
      <nav className="bg-[#002C3E] d fixed w-full z-20 top-0 start-0">
         <div className="bg-[#002C3E] max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
           <Link to={'/dashboard'} className="flex items-center space-x-3 rtl:space-x-reverse">
               <img src={logo} className="h-8" alt="Logo"></img>
               <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Dish-it-Out</span>
           </Link>
           <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
               <button type="button" onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className="btn-primary hover:text-[#F7444E]">Logout</button>
           </div>
           <div className="items-center justify-between bg-[#002C3E] hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
             <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium rounded-lg bg-[#002C3E] md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ">
               <li>
                  <Link aria-current="page" to={'/cost-splitter'} className="link text-bold">Cost Splitter</Link>
               </li>
               <li>
                  <Link to={'/calendar-page'} className="link">Calendar</Link>
               </li>
               <li>
                  <Link to={'/fridge'} className="link">Fridge Manager</Link>
               </li>
               <li>
                  <Link to={'/chat'} className="link">Chat</Link>
               </li>
             </ul>
           </div>
         </div>
       </nav>

      <div className="flex flex-row min-w-screen">
        <div className="pl-20 pt-15 mt-16 flex flex-col gap-6 min-h-screen">
          <div className="flex flex-col bg-white rounded-lg shadow-md p-6 max-w-lg">
            <h1 className="text-3xl font-bold text-black">{kitchenData?.name || kitchenName}</h1>
            <p className="text-[#002C3E] mt-2">Kitchen ID: {roomId}</p>
            <p className="text-sm text-gray-500 mt-2 text-right">Logged in as {currentUser.displayName || currentUser.email}</p>
            <p className="text-sm text-gray-500 text-right">Your role: {role}</p>
            <div className="space-y-3 mt-6">
              {members.map(([username, data]) => (
                <div key={username} className="flex items-center text-black justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">{username}</span>
                    {data.role === 'creator' && (
                      <span className="ml-4 px-2 py-1 bg-[#78BCC4]/50 text-[#002C3E] text-xs rounded-full">Creator</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">Joined: {new Date(data.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <button onClick={handleLeaveKitchen} className="btn-danger">Leave Kitchen</button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/calendar-page')} className="btn-primary">Calendar</button>
            <button onClick={() => navigate('/cost-splitter')} className="btn-primary">Cost Splitter</button>
            <button onClick={() => navigate('/fridge')} className="btn-primary">Fridge List</button>
            <button onClick={() => navigate('/chat', { state: session })} className="btn-primary">Chat</button>
          </div>
        </div>

          <div className="pl-20 pt-15 mt-16  flex flex-col rounded-lg p-6 max-w-md min-w-lg">
            <Schedule roomId={roomId} />
          </div>
        {/* </div> */}
      </div>
      
    </div>
  );
};

export default Dashboard;
