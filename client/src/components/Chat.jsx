import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const wsClient = new WebSocket('ws://localhost:4000');
    setWs(wsClient);

    wsClient.addEventListener('message', handleMessage);
  }, []);

  function showOnlineUsers(onlineArr) {
    const people = {};

    onlineArr.forEach(({ userId, username }) => {
      people[userId] = username;
    });

    setOnlineUsers(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);

    if ('online' in messageData) {
      showOnlineUsers(messageData.online);
    }
  }

  function handleSelectContact(userId) {
    setSelectedContact(userId);
  }

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <div className="text-blue-600 font-bold text-xl mb-4 flex gap-2 items-center p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          Chat Panel
        </div>
        {Object.keys(onlineUsers).map((userId) => (
          <div
            onClick={() => handleSelectContact(userId)}
            key={userId}
            className={`border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer
            transition duration-200 ease-in-out hover:bg-blue-50
             ${selectedContact === userId ? 'bg-blue-50 pl-6' : ''}`}
          >
            <Avatar userId={userId} username={onlineUsers[userId]} />
            <span className="text-gray-800">{onlineUsers[userId]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">Messages</div>
        <div className="flex gap-2">
          <input
            type="text"
            className="bg-white border p-2 flex-grow rounded-sm"
            placeholder="Type your message here..."
          />
          <button className="bg-blue-500 p-2 text-white rounded-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
