import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { logo } from "../../assets";
import '../styles/main.css';

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
    <div className="min-h-screen min-w-screen">
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

      <div className="flex flex-col items-center min-h-screen bg-[#F7F8F3] m-auto pt-25 ">
      <h2 className="text-3xl text-black font-bold mb-6 mt-4 text-center">Cost Splitter</h2>

        <div className="text-center mb-4 ">
          <button
            onClick={() => navigate("/add-item")}
            className="btn-primary mr-10"
          >
            Add New Cost Item
          </button>
        {/* </div>
        <div className="text-center mb-5"> */}
          <button
            onClick={handleDeleteModeToggle}
            className={`${
              isDeleteMode && selectedItems.length > 0
                ? "btn-primary"
                : "btn-primary"
            } text-white px-4 py-2 rounded-md`}
          >
            {isDeleteMode && selectedItems.length > 0
              ? `Delete Selected (${selectedItems.length})`
              : "Delete Owed Items"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl text-black">
          <table className="w-full border-collapse border border-gray-300 text-center">
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
    </div>
  );
};

export default CostSplitterMaster;