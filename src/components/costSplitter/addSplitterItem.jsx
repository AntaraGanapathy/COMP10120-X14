import { useState, useEffect } from "react";
import { ref, set, get, update } from "firebase/database";
import { database } from "../../firebase/firebase";

const AddSplitterItem = () => {
  const [itemName, setItemName] = useState("");
  const [cost, setCost] = useState("");
  const [payer, setPayer] = useState("");
  const [peopleWhoOwe, setPeopleWhoOwe] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCosts = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
        const snapshot = await get(ref(database, `rooms/${sessionData.roomId}/costSplitter`));
        if (snapshot.exists()) {
          const costData = snapshot.val();
          setItemName(costData.itemName || "");
          setCost(costData.cost || "");
          setPayer(costData.payer || "");
          setPeopleWhoOwe(costData.peopleWhoOwe || "");
        } else {
          console.log("No cost data available");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getCosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
    const roomRef = ref(database, `rooms/${sessionData.roomId}/users`);
    try {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const updatedUsers = { ...users };
        
        Object.keys(updatedUsers).forEach((user) => {
          if (user === payer || peopleWhoOwe.includes(user)) {
            if (!updatedUsers[user].costSplitter) {
              updatedUsers[user].costSplitter = [];
            }
            updatedUsers[user].costSplitter.push({
              item: itemName,
              payer: payer,
              peopleWhoOwe: peopleWhoOwe,
              cost: cost,
            });
          }
        });
        
        await update(roomRef, updatedUsers);
        console.log("Cost data successfully added");
      }
    } catch (error) {
      console.error("Error updating cost data: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Cost Splitter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-black">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-black">Cost</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-black">Payer</label>
          <input
            type="text"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-black">People Who Owe</label>
          <input
            type="text"
            value={peopleWhoOwe}
            onChange={(e) => setPeopleWhoOwe(e.target.value)}
            className="w-full p-2 border rounded-md text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddSplitterItem;