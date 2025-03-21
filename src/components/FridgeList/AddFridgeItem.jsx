import { useState, useEffect } from "react";
import { ref, push, get } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { logo } from "../../assets";
import '../styles/main.css';


const AddFridge = () => {
  const [itemName, setItemName] = useState("");
  const [number, setNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [unit, setUnit] = useState([]);
  const [kitchenMembers, setKitchenMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchKitchenData = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
        if (!sessionData || !sessionData.roomId) return;
         
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

  const validateForm = () => {
    if (!itemName || !number || !owner || unit.length === 0) {
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
    if (!sessionData || !sessionData.roomId) {
      console.error("No kitchen session found");
      return;
    }

    try {
      await push(ref(database, `rooms/${sessionData.roomId}/fridge`), {
        itemName, 
        number, 
        unit, 
        owner
      });
      console.log("fridge item successfully added");

      setItemName("");
      setNumber("");
      setOwner("");
      setUnit([]);

      navigate("/fridge");
    } catch (error) {
      console.error("Error adding fridge item:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#F7F8F3] pt-10 mt-16 flex flex-col gap-6 min-h-screen min-w-screen">
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


      
      <div className="min-w-screen flex items-center justify-center">
        <div className="p-4 border rounded-lg shadow-md bg-white max-w-md min-w-sm mx-auto">
          <h2 className="text-3xl text-black font-bold mb-6 mt-4 text-center">Item Details</h2>
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
              <label className="block font-medium text-black">Number</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-2 border rounded-md text-black"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-black">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border rounded-md text-black"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-black">Owner</label>
              <div className="border rounded-md p-2">
                {kitchenMembers.map((member) => (
                  <div key={member} className="flex items-center">
                    <input
                      type="radio"
                      name="owner"
                      id={`owner-${member}`}
                      checked={owner === member}
                      onChange={() => setOwner(member)}
                      // className="radio-btn"
                    />
                    <label htmlFor={`owner-${member}`} className="ml-2 text-black">
                      {member}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Submit
            </button> 
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFridge;