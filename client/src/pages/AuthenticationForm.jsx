import axios from 'axios';
import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';

const AuthenticationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
  const userContext = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      isLoginOrRegister === 'register' ? '/auth/register' : '/auth/login';

    const response = await axios.post(url, { username, password });
    console.log('response', response);
    userContext.setUsername(username);
    userContext.setId(response.data.id);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' ? (
            <>
              <span>Already a member? </span>
              <button
                onClick={() => {
                  setIsLoginOrRegister('login');
                }}
              >
                Login here
              </button>
            </>
          ) : (
            <>
              <span>Don't have an account? </span>
              <button
                onClick={() => {
                  setIsLoginOrRegister('register');
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthenticationForm;
