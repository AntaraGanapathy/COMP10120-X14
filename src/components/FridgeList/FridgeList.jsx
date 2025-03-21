import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useNavigate, Link } from "react-router-dom";
import { logo } from "../../assets";
import '../styles/main.css';

const Fridge = () => {
  const [fridge, setFridge] = useState([]);
  const session = JSON.parse(localStorage.getItem("kitchenSession"));
  const { roomId } = session || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const fridgeRef = ref(database, `rooms/${roomId}/fridge`);

    const unsubscribe = onValue(fridgeRef, (snapshot) => {
      if (snapshot.exists()) {
        const fridgeList = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        console.log("Updated fridge:", fridgeList); // Debugging
        setFridge(fridgeList);

      } else {
        setFridge([]);
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

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
        <h2 className="text-3xl text-black font-bold mb-6 mt-4 text-center">Fridge List</h2>
  
          <div className="text-center mb-4 ">
            <button
              onClick={() => navigate("/add-fridge")}
              className="btn-primary mr-10"
            >
              Add New Fridge Item
            </button>
          </div>
  
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl text-black">
            <table className="w-full border-collapse border border-gray-300 text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2">Item Name</th>
                  <th className="border px-4 py-2">Number</th>
                  <th className="border px-4 py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {fridge.length > 0 ? (
                  fridge.map((data) => (
                    <tr key={data.id} className="border">
                      <td className="border px-4 py-2">{data.itemName}</td>
                      <td className="border px-4 py-2">{data.number} {data.unit}</td>
                      <td className="border px-4 py-2">{data.owner}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center py-4 text-gray-500">
                      No fridge entries yet.
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

export default Fridge;