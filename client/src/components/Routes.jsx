import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import AuthenticationForm from '../pages/AuthenticationForm';
import Chat from './Chat';

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (id) return <Chat />;

  return <AuthenticationForm />;
};

export default Routes;
