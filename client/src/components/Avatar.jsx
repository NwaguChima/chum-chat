import React from 'react';

const Avatar = ({ userId, username, online }) => {
  const colors = [
    'bg-red-200',
    'bg-blue-200',
    'bg-yellow-200',
    'bg-purple-200',
    'bg-pink-200',
    'bg-indigo-200',
    'bg-gray-200',
    'bg-teal-200',
  ];

  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;

  return (
    <div
      className={`w-8 h-8 relative rounded-full text-center flex items-center justify-center ${colors[colorIndex]}`}
    >
      <span className="opacity-50">{username[0].toUpperCase()}</span>
      {online ? (
        <small className="absolute w-3 h-3 bg-green-400 -bottom-1 right-0 rounded-full border border-white" />
      ) : (
        <small className="absolute w-3 h-3 bg-gray-400 -bottom-1 right-0 rounded-full border border-white" />
      )}
    </div>
  );
};

export default Avatar;
