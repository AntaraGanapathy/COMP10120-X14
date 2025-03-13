import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/firebase';
import { ref, push, onValue, set } from 'firebase/database';
import { useAuth } from '../../contexts/authContext';
import './chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState('group'); // 'group' or userId for private
  const [users, setUsers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load users
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersList = Object.entries(usersData).map(([id, data]) => ({
          id,
          ...data
        }));
        setUsers(usersList.filter(user => user.id !== currentUser.uid));
      }
    });

    // Load messages based on active chat
    const messagesRef = activeChat === 'group' 
      ? ref(database, 'groupChat')
      : ref(database, `privateChats/${getChatId(currentUser.uid, activeChat)}`);

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg
        }));
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });
  }, [activeChat, currentUser.uid]);

  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      sender: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      timestamp: Date.now()
    };

    if (activeChat === 'group') {
      push(ref(database, 'groupChat'), messageData);
    } else {
      const chatId = getChatId(currentUser.uid, activeChat);
      push(ref(database, `privateChats/${chatId}`), messageData);
    }

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div 
          className={`chat-option ${activeChat === 'group' ? 'active' : ''}`}
          onClick={() => setActiveChat('group')}
        >
          Kitchen Group Chat
        </div>
        <div className="private-chats">
          <h3>Private Chats</h3>
          {users.map(user => (
            <div
              key={user.id}
              className={`chat-option ${activeChat === user.id ? 'active' : ''}`}
              onClick={() => setActiveChat(user.id)}
            >
              {user.displayName || user.email}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          {activeChat === 'group' ? 'Kitchen Group Chat' : 
            users.find(u => u.id === activeChat)?.displayName || 'Private Chat'}
        </div>
        
        <div className="messages-container">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`message ${message.sender === currentUser.uid ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-sender">{message.senderName}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
