import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const Fridge = () => {
  const [fridge, setFridge] = useState([]);
  const session = JSON.parse(localStorage.getItem("kitchenSession"));
  const { roomId } = session || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFridge(Object.entries(data.fridge || {}));
      } else {
        setFridge([]);
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">Fridge Table</h2>

      <div className="text-center mb-4">
        <button
          onClick={() => navigate("/add-item")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add New Fridge Item
        </button>
      </div>

      <div className="bg-black rounded-lg shadow-md p-6 w-full max-w-3xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">owner</th>
              <th className="border px-4 py-2">number</th>
            </tr>
          </thead>
          <tbody>
            {fridge.map((data) => (
              <tr key={data.id} className="border">
                <td className="border px-4 py-2">EGGGGGG</td>
                <td className="border px-4 py-2">{data.owner}</td>
                <td className="border px-4 py-2">5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fridge;