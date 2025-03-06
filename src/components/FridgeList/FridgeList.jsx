import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, onValue, remove, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { doSignOut } from '../../firebase/auth'

const Fridge = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [kitchenData, setKitchenData] = useState(null);
    const [members, setMembers] = useState([]);
    const [fridge, setFridge] = useState([]);

    const session = JSON.parse(localStorage.getItem('kitchenSession')) || location.state;
    const { roomId, userName, role, kitchenName } = session || {};

    useEffect(() => {
        if (!roomId) return;
    
        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setKitchenData(data);
            setMembers(Object.entries(data.users || {}));
            setFridge(Object.entries(data.fridge || {}));
          } else {
            localStorage.removeItem('kitchenSession');
            navigate('/dashboard', { replace: true });
          }
        });
    
        return () => unsubscribe();
      }, [roomId, navigate]);



    return (
        <div className="min-w-screen mx-auto p-6 flex flex-col xl:flex-row  justify-center items-center">
            {/* <div className="flex flex-col md:flex-row justify-center items-center min-h-screen min-w-screen gap-6 p-6"> */}
        
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 mr-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-black">{kitchenData?.name || kitchenName}</h1>
                    <p className="text-gray-600 mt-2">Kitchen ID: {roomId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 pl-10 align-middle">
                      Logged in as {currentUser.displayName || currentUser.email} 
                      <br></br>
                      Your role: {role}
                    </p>
                  </div>
                </div>
        
                <div className="border-t pt-6">
                  <h2 className="text-xl text-black font-semibold mb-4">Kitchen Fridge</h2>
                  <div className="space-y-3">
                    {fridge.map(([itemname, data]) => (
                      <div 
                      key={itemname}
                      className="flex text-black justify-between p-3 bg-gray-50 rounded-md"
                    >
                  <span className="font-medium">{itemname}</span>
                 <span className="aligh-justify">{data.owner}</span>
                <span className="text-sm text-gray-500">
                  {data.num}{data.unit}
                </span>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
    )
}

export default Fridge