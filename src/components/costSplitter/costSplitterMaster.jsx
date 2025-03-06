import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const CostSplitterMaster = () => {
  const [costs, setCosts] = useState([]);
  const session = JSON.parse(localStorage.getItem("kitchenSession"));
  const { roomId } = session || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const costsRef = ref(database, `rooms/${roomId}/costSplitter`);

    // Listen for real-time updates
    onValue(costsRef, (snapshot) => {
      if (snapshot.exists()) {
        const costList = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        console.log("Updated costs:", costList); // Debugging
        setCosts(costList);
      } else {
        setCosts([]);
      }
    });
  }, [roomId]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6">Cost Splitter Table</h2>

      <div className="text-center mb-4">
        <button
          onClick={() => navigate("/add-item")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add New Cost Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">Payer</th>
              <th className="border px-4 py-2">People Owed</th>
              <th className="border px-4 py-2">Cost (£)</th> {/* Updated header */}
            </tr>
          </thead>
          <tbody>
            {costs.length > 0 ? (
              costs.map((cost) => (
                <tr key={cost.id} className="border">
                  <td className="border px-4 py-2">{cost.itemName}</td>
                  <td className="border px-4 py-2">{cost.payer}</td>
                  <td className="border px-4 py-2">
                    {cost.peopleWhoOwe && cost.peopleWhoOwe.length > 0
                      ? cost.peopleWhoOwe.join(", ")
                      : ""} {/* Removes "N/A" */}
                  </td>
                  <td className="border px-4 py-2">£{parseFloat(cost.cost).toFixed(2)}</td> 
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No cost entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CostSplitterMaster;

