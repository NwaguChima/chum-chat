import { createContext, useState } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
