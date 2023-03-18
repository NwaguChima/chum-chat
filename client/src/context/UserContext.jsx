import axios from 'axios';
import { useEffect } from 'react';
import { createContext, useState } from 'react';

export const UserContext = createContext(null);

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
    axios.get('/auth/profile').then((response) => {
      setId(response.data.userId);
      setUsername(response.data.username);
    });
  });

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
