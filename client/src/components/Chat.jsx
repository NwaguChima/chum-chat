import React, { useState, useEffect, useRef, useContext } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import ContactList from './ContactList';

const Chat = () => {
  const initialized = useRef(false);
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

  // to show online users
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
      if (messageData.sender === selectedContact) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    }
  }

  function handleSelectContact(userId) {
    setSelectedContact(userId);
  }

  function onInputChanged(ev) {
    setNewMessageText(ev.target.value);
  }

  async function handleMessageSend(ev, file = null) {
    if (ev) {
      ev.preventDefault();
    }

    if (!newMessageText.trim() && !file.data) return;

    const message = {
      recipient: selectedContact,
      text: newMessageText.trim(),
      sender: id,
      file,
      _id: Date.now(),
    };

    ws.send(JSON.stringify(message));

    if (file) {
      axios
        .get(`/messages/${selectedContact}`)
        .then((res) => {
          let response = res.data;
          setMessages(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setNewMessageText('');
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          recipient: selectedContact,
          text: newMessageText.trim(),
          sender: id,
          _id: Date.now(),
        },
      ]);
    }
  }

  function handleLogout() {
    axios
      .post('/auth/logout')
      .then((res) => {
        if (res.status === 200) {
          setUsername('');
          setId('');
          setWs(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleFileUpload(ev) {
    const file = ev?.target?.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      handleMessageSend(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
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
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            <small className="font-bold">{username}</small>
          </span>
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
                        {message.file && (
                          <div className="">
                            <a
                              target={'_blank'}
                              rel="noreferrer"
                              className="border-b flex items-center gap-1"
                              href={
                                axios.defaults.baseURL +
                                '/uploads/' +
                                message.file
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {message.file}
                            </a>
                          </div>
                        )}
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
            <label
              type="button"
              className="bg-blue-200 text-gray-600 p-2 rounded-sm border border-blue-300 cursor-pointer"
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
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
