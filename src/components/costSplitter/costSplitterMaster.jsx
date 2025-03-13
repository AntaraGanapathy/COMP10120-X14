import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const CostSplitterMaster = () => {
  const [costs, setCosts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false); // State to toggle delete mode
  const session = JSON.parse(localStorage.getItem("kitchenSession"));
  const { roomId } = session || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const costsRef = ref(database, `rooms/${roomId}/costSplitter`);

    // real-time updates
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

  const handleSelectItem = (id) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((itemId) => itemId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteModeToggle = () => {
    if (isDeleteMode && selectedItems.length > 0) {
      // Delete selected items only 
      selectedItems.forEach((id) => {
        const costRef = ref(database, `rooms/${roomId}/costSplitter/${id}`);
        remove(costRef)
          .then(() => {
            console.log(`Item ${id} deleted successfully`);
          })
          .catch((error) => {
            console.error("Error deleting item:", error);
          });
      });

      setSelectedItems([]); // Clear selected on pressing delete
    }

    setIsDeleteMode((prevMode) => !prevMode); // Toggle delete mode
  };

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
      <div className="text-center mb-5">
        <button
          onClick={handleDeleteModeToggle}
          className={`${
            isDeleteMode && selectedItems.length > 0
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded-md`}
        >
          {isDeleteMode && selectedItems.length > 0
            ? `Delete Selected (${selectedItems.length})`
            : "Delete Owed Items"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              {isDeleteMode && <th className="border px-4 py-2">Select</th>}
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">Payer</th>
              <th className="border px-4 py-2">People Owed</th>
              <th className="border px-4 py-2">Cost (£)</th>
            </tr>
          </thead>
          <tbody>
            {costs.length > 0 ? (
              costs.map((cost) => (
                <tr key={cost.id} className="border">
                  {isDeleteMode && (
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(cost.id)}
                        onChange={() => handleSelectItem(cost.id)}
                      />
                    </td>
                  )}
                  <td className="border px-4 py-2">{cost.itemName}</td>
                  <td className="border px-4 py-2">{cost.payer}</td>
                  <td className="border px-4 py-2">
                    {cost.peopleWhoOwe && cost.peopleWhoOwe.length > 0
                      ? cost.peopleWhoOwe.join(", ")
                      : ""}
                  </td>
                  <td className="border px-4 py-2">£{parseFloat(cost.cost).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isDeleteMode ? 5 : 4} className="text-center py-4 text-gray-500">
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