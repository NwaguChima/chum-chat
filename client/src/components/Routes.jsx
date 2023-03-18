import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import AuthenticationForm from '../pages/AuthenticationForm';

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username && id) return <h1>Logged in {username}</h1>;

  return <AuthenticationForm />;
};

export default Routes;
