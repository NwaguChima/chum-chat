import React from 'react';
import Avatar from './Avatar';

const ContactList = ({ userId, username, onClick, selected, online }) => {
  return (
    <div
      onClick={() => onClick(userId)}
      key={userId}
      className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer
transition duration-200 ease-in-out hover:bg-blue-50
 ${selected ? 'bg-blue-50' : ''}`}
    >
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}
      <div className="flex gap-2 py-3 pl-4 items-center">
        <Avatar online={online} userId={userId} username={username} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
};

export default ContactList;
