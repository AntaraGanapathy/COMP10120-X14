import { useState, useEffect } from "react";
import { ref, set, get, update } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate } from 'react-router-dom';

const AddSplitterItem = () => {
  const [itemName, setItemName] = useState("");
  const [cost, setCost] = useState("");
  const [payer, setPayer] = useState("");
  const [peopleWhoOwe, setPeopleWhoOwe] = useState([]);
  const [kitchenMembers, setKitchenMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKitchenData = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
        const roomRef = ref(database, `rooms/${sessionData.roomId}/users`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
          setKitchenMembers(Object.keys(snapshot.val()));
        }
      } catch (error) {
        console.error("Error fetching kitchen members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKitchenData();
  }, []);

  const handleCheckboxChange = (member) => {
    if (member !== payer) {
      setPeopleWhoOwe((prev) =>
        prev.includes(member)
          ? prev.filter((m) => m !== member)
          : [...prev, member]
      );
    }
  };

  const handlePayerChange = (member) => {
    setPayer(member);
    setPeopleWhoOwe((prev) => prev.filter((m) => m !== member));
  };

  const validateForm = () => {
    if (!itemName || !cost || !payer || peopleWhoOwe.length === 0) {
      setError("All fields must be filled, and at least one person must owe.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
    const roomRef = ref(database, `rooms/${sessionData.roomId}/users`);
    try {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const updatedUsers = { ...users };

        peopleWhoOwe.forEach((user) => {
          if (!updatedUsers[user].costSplitter) {
            updatedUsers[user].costSplitter = [];
          }
          updatedUsers[user].costSplitter.push({
            item: itemName,
            payer: payer,
            peopleWhoOwe: peopleWhoOwe,
            cost: cost,
          });
        });

        await update(roomRef, updatedUsers);
        console.log("Cost data successfully added");
      }
    } catch (error) {
      console.error("Error updating cost data:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-w-screen flex items-center justify-center mt-4 mb-4">
      
      <div className="p-4 border rounded-lg shadow-md bg-white max-w-md min-w-sm mx-auto">
        <h2 className="text-3xl text-black font-bold mb-6 mt-4 text-center">Cost Splitter</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
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
            <div className="border rounded-md p-2">
              {kitchenMembers.map((member) => (
                <div key={member} className="flex items-center">
                  <input
                    type="radio"
                    name="payer"
                    id={`payer-${member}`}
                    checked={payer === member}
                    onChange={() => handlePayerChange(member)}
                  />
                  <label htmlFor={`payer-${member}`} className="ml-2 text-black">
                    {member}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium text-black">People Who Owe</label>
            <div className="border rounded-md p-2">
              {kitchenMembers.map((member) => (
                <div key={member} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`owe-${member}`}
                    checked={peopleWhoOwe.includes(member)}
                    onChange={() => handleCheckboxChange(member)}
                    disabled={member === payer}
                  />
                  <label htmlFor={`owe-${member}`} className="ml-2 text-black">
                    {member}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            onClick={() => navigate('/cost-splitter')}
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSplitterItem;
