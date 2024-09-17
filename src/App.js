import React, { useState, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// query_id=AAGJmbgcAAAAAImZuBzq4C-i&user=%7B%22id%22%3A481859977%2C%22first_name%22%3A%22Anton%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22AntonKiya%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1725784407&hash=955641bc96911345a61277570dc8458574c20d09c517cb9bc811cf35913a0811

const App = () => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null); // State for WebSocket
  const [telegramData, setTelegramData] = useState(''); // State for input

  // Method for login and getting httpOnly cookie
  const login = useCallback(async () => {
    try {
      await axios.post(
        'http://localhost:3005/auth/login',
        {
          telegramData, // Using the input value from state
        },
        {
          withCredentials: true, // Enables sending cookies with cross-domain requests
        }
      );

      console.log('Login successful. Cookies were set by the server.');

      // Connect to WebSocket after successful login using httpOnly cookies
      connectToWebSocket();
    } catch (error) {
      console.error('Error during login:', error);
    }
  }, [telegramData]);

  // Connecting to WebSocket (cookies will be sent automatically by the browser)
  const connectToWebSocket = () => {
    const newSocket = io('http://localhost:3005/', {
      withCredentials: true, // Allows the browser to send cookies with cross-domain requests
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connection established');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket connection disconnected');
    });

    setSocket(newSocket); // Save the connection in state

    // Return a function to close the connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  };

  // Request current user data
  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:3005/users/me', {
        withCredentials: true, // Automatically sends httpOnly cookies with the request
      });

      setUser(response.data);
      console.log('Current user:', response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Handler for telegramData input change
  const handleInputChange = (e) => {
    setTelegramData(e.target.value);
  };

  return (
    <div>
      <h1>Test WebSocket App</h1>

      <div>
        <input
          type="text"
          placeholder="Enter Telegram Data"
          value={telegramData}
          onChange={handleInputChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={login}>Login</button>
      </div>

      <button onClick={fetchUser}>Fetch Current User (me)</button>

      {user && (
        <div>
          <h2>Current User:</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
