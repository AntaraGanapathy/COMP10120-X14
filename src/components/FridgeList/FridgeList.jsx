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

    const fridgeRef = ref(database, `rooms/${roomId}/fridge`);

    onValue(fridgeRef, (snapshot) => {
      if (snapshot.exists()) {
        const fridgeList = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setFridge(Object.entries(data.fridge || {}));
      } else {
        setFridge([]);
      }
    });
  }, [roomId]);

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

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">owner</th>
              <th className="border px-4 py-2">number</th>
            </tr>
          </thead>
          <tbody>
            {costs.length > 0 ? (
              fridge.map((itemName, data) => (
                <tr key={itemName} className="border">
                  <td className="border px-4 py-2">{data.num}</td>
                  <td className="border px-4 py-2">{data.owner}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
