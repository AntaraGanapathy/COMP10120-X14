import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, onValue, remove, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { doSignOut } from '../../firebase/auth'

const GroceryListMaster = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [kitchenData, setKitchenData] = useState(null);
    const [members, setMembers] = useState([]);
    
    const session = JSON.parse(localStorage.getItem('kitchenSession')) || location.state;
    const { roomId, userName, role, kitchenName } = session || {};

    return(
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 mr-4">
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
            </div>
        </div>
    )
}

export default GroceryListMaster