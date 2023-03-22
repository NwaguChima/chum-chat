import React, { useState, useEffect, useRef, useContext } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import ContactList from './ContactList';

const Chat = () => {
  const initialized = useRef(false);
  const initialized2 = useRef(false);
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const { username, id, setId, setUsername } = useContext(UserContext);

  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState({});

  const divUnderMessages = useRef(null);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      connectToWs();
    }
  }, []);

  function connectToWs() {
    const wsClient = new WebSocket('ws://localhost:4000');
    setWs(wsClient);
    let timer;

    wsClient.addEventListener('message', handleMessage);
    wsClient.addEventListener('close', () => {
      console.log('Connection closed. Reconnecting...');
      timer = setTimeout(connectToWs, 2000);
    });

    // cleanup
    return () => {
      wsClient.close();
      clearTimeout(timer);
    };
  }

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
    } else {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    }
  }

  function handleSelectContact(userId) {
    setSelectedContact(userId);
  }

  function onInputChanged(ev) {
    setNewMessageText(ev.target.value);
  }

  async function handleMessageSend(ev) {
    ev.preventDefault();
    if (!newMessageText.trim()) return;

    const message = {
      recipient: selectedContact,
      text: newMessageText.trim(),
      sender: id,
      _id: Date.now(),
    };

    ws.send(JSON.stringify(message));
    setNewMessageText('');
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  function handleLogout() {
    axios
      .post('/auth/logout')
      .then((res) => {
        if (res.status === 200) {
          setUsername('');
          setId('');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    let div = divUnderMessages?.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(onlineUsers).length) {
      let offlinePeople = {};
      axios
        .get('/auth/users')
        .then((res) => {
          const offlineUsers = res.data.filter((user) => {
            if (user._id !== id && !onlineUsers[user._id]) {
              offlinePeople[user._id] = user;
              return user;
            }
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setOfflineUsers(offlinePeople);
        });
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (selectedContact) {
      axios
        .get(`/messages/${selectedContact}`)
        .then((res) => {
          let response = res.data;
          setMessages(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedContact]);

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlineUsers).map((userId) => {
            if (userId === id) {
              return null;
            }

            return (
              <ContactList
                key={userId}
                userId={userId}
                username={onlineUsers[userId] || 'anonymous'}
                onClick={() => handleSelectContact(userId)}
                selected={userId === selectedContact}
                online={true}
              />
            );
          })}
          {Object.keys(offlineUsers).map((userId) => {
            if (userId === id) {
              return null;
            }

            return (
              <ContactList
                key={userId}
                userId={userId}
                username={offlineUsers[userId].username}
                onClick={handleSelectContact}
                selected={userId === selectedContact}
                online={false}
              />
            );
          })}
        </div>
        <div className="p-2 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {selectedContact ? (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute inset-0">
                {messages.map((message) => {
                  return (
                    <div
                      key={message._id}
                      className={`${
                        message.sender === id ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block text-left p-2 my-2 rounded-md text-sm ${
                          message.sender === id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">&larr; Select A Person To Chat</p>
            </div>
          )}
        </div>
        {!!selectedContact && (
          <form className="flex gap-2" onSubmit={handleMessageSend}>
            <input
              type="text"
              className="bg-white border p-2 flex-grow rounded-sm"
              placeholder="Type your message here..."
              value={newMessageText}
              onChange={onInputChanged}
            />
            <button
              className="bg-blue-500 p-2 text-white rounded-sm"
              type="submit"
            >
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
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
