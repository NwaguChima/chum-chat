import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import Register from '../pages/Register';

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username && id) return <h1>Logged in</h1>;

  return <Register />;
};

export default Routes;
