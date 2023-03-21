import React, { useState, useEffect, useRef, useContext } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from '../context/UserContext';

const Chat = () => {
  const initialized = useRef(false);
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const { username, id } = useContext(UserContext);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      const wsClient = new WebSocket('ws://localhost:4000');
      setWs(wsClient);
      wsClient.addEventListener('message', handleMessage);
    }
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
        <Logo />
        {Object.keys(onlineUsers).map((userId) => {
          if (userId === id) {
            return null;
          }

          return (
            <div
              onClick={() => handleSelectContact(userId)}
              key={userId}
              className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer
            transition duration-200 ease-in-out hover:bg-blue-50
             ${selectedContact === userId ? 'bg-blue-50' : ''}`}
            >
              {userId === selectedContact && (
                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
              )}
              <div className="flex gap-2 py-3 pl-4 items-center">
                <Avatar userId={userId} username={onlineUsers[userId]} />
                <span className="text-gray-800">{onlineUsers[userId]}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {selectedContact ? (
            <div></div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">&larr; Select A Person To Chat</p>
            </div>
          )}
        </div>
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
