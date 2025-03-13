import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebase/firebase';
import { ref, push, onValue } from 'firebase/database';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import './chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState('group');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [currentKitchenName, setCurrentKitchenName] = useState('');
  const [roomId, setRoomId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('kitchenSession'));
    if (!session?.roomId) {
      navigate('/');
      return;
    }
    
    setRoomId(session.roomId);
    setCurrentKitchenName(session.userName);
    setLoading(true);

    // Get kitchen members
    const roomUsersRef = ref(database, `rooms/${session.roomId}/users`);
    onValue(roomUsersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        // Get all users except current user
        const usersList = Object.keys(usersData)
          .filter(name => name !== session.userName)
          .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
        setUsers(usersList);
      }
    });

    // Load messages based on active chat
    const messagesRef = activeChat === 'group' 
      ? ref(database, `rooms/${session.roomId}/groupChat`)
      : ref(database, `rooms/${session.roomId}/privateChats/${getChatId(session.userName, activeChat)}`);

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    // Focus input when changing chats
    inputRef.current?.focus();
  }, [activeChat, navigate]);

  const getChatId = (user1, user2) => {
    return [user1, user2].sort().join('_');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !currentKitchenName || !roomId) return;

    const messageData = {
      text,
      sender: currentKitchenName,
      timestamp: Date.now()
    };

    if (activeChat === 'group') {
      push(ref(database, `rooms/${roomId}/groupChat`), messageData);
    } else {
      const chatId = getChatId(currentKitchenName, activeChat);
      push(ref(database, `rooms/${roomId}/privateChats/${chatId}`), messageData);
    }

    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const switchChat = (chatName) => {
    setActiveChat(chatName);
    setNewMessage('');
    setLoading(true);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <button 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          ← Back to Dashboard
        </button>
        <div 
          className={`chat-option ${activeChat === 'group' ? 'active' : ''}`}
          onClick={() => switchChat('group')}
        >
          Kitchen Group Chat
        </div>
        <div className="private-chats">
          <h3>Kitchen Members ({users.length})</h3>
          {users.map(username => (
            <div
              key={username}
              className={`chat-option ${activeChat === username ? 'active' : ''}`}
              onClick={() => switchChat(username)}
            >
              {username}
            </div>
          ))}
          {users.length === 0 && !loading && (
            <div className="text-sm text-gray-500 px-4 py-2">
              No other members in the kitchen
            </div>
          )}
          {loading && users.length === 0 && (
            <div className="text-sm text-gray-500 px-4 py-2">
              Loading members...
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          {activeChat === 'group' ? 'Kitchen Group Chat' : `Chat with ${activeChat}`}
        </div>
        
        <div className="messages-container">
          {loading ? (
            <div className="text-center text-gray-500 mt-4">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id}
                className={`message ${message.sender === currentKitchenName ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <div className="message-sender">{message.sender}</div>
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${activeChat === 'group' ? 'kitchen group' : activeChat}...`}
            className="message-input"
            ref={inputRef}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!newMessage.trim() || loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
