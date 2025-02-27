import { useState } from "react";

const CostSplitter = ({ roomData }) => {
  const [itemName, setItemName] = useState("");
  const [cost, setCost] = useState("");
  const [payer, setPayer] = useState("");
  const [peopleWhoOwe, setPeopleWhoOwe] = useState([]);

  const users = Object.keys(roomData.users || {});

  const handleCheckboxChange = (person) => {
    setPeopleWhoOwe((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      itemName,
      cost: parseFloat(cost),
      payer,
      peopleWhoOwe,
    };
    console.log("Submitted Data:", formData);
    // Handle form submission (e.g., send data to backend)
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Cost Splitter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Cost</label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Payer</label>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="" disabled>Select payer</option>
            {users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">People Who Owe</label>
          {users.map((user) => (
            <div key={user} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={user}
                checked={peopleWhoOwe.includes(user)}
                onChange={() => handleCheckboxChange(user)}
              />
              <label htmlFor={user}>{user}</label>
            </div>
          ))}
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

export default CostSplitter;
