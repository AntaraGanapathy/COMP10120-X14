import React, { useState } from "react";
import axios from "axios";
import './chatbot.css';


const Chatbot = async (inputText) => {
  // const [messages, setMessages] = useState([]);
  // const [input, setInput] = useState("");
  // const [loading, setLoading] = useState(false);

  const API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const API_KEY = "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"; 

  console.log("Chatbot function called with input:", inputText); 

  // if (!inputText.trim()) return;

  // const newMessages = [...messages, { text: input, sender: "user" }];
  // setMessages(newMessages);
  // setInput("");
  // setLoading(true);

  let cleanText = "No Response";

  try {
    console.log("Sending request to API...");
    const response = await axios.post(
      API_URL,
      {
        model: "undi95/toppy-m-7b:free", 
        messages: [
          {role: "system", content:"You are chatbot that helps people find recipes and you never respond with code, respond in simple words without any LaTeX formatting and don't use curly braces in your output"},
          {role: "user", content: inputText }           
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    //console.log(response.data.choices[0])
    const botReply = response.data.choices[0]?.message?.content || "No response";
    cleanText = botReply.replace(/\\[a-zA-Z]+{(.*?)}/g, "$1").replace(/\\[a-zA-Z]+/g, "");
    // console.log("Cleaned Response:", cleanText); // Log the final clean response
    //setMessages([...newMessages, { text: cleanText, sender: "bot" }]);
  } catch (error) {
    console.error("Error:", error);
    if (error.response) {
      console.error("Error Response:", error.response.data)
      console.error("Error Status", error.response.status)
    }
    // setMessages([...newMessages, { text: "Error fetching response", sender: "bot" }]);
  } 

  return cleanText;

  // return (
  //   <div className="chat-container">
  //     <div className="chat-box">
  //       {messages.map((msg, index) => (
  //         <div key={index} className={`message ${msg.sender}`}>
  //           {msg.text}
  //         </div>
  //       ))}
  //       {loading && <div className="message bot"> Typing ... </div>}
  //     </div>
  //     <div className="input-container">
  //       <input
  //         type="text"
  //         value={input}
  //         onChange={(e) => setInput(e.target.value)}
  //         placeholder="Type a message..."
  //       />
  //       <button onClick={sendMessage}>Send</button>
  //     </div>
  //   </div>
  // );
};

export default Chatbot;
