import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const App = () => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null); // State for WebSocket

  // Method for login and getting httpOnly cookie
  const login = useCallback(async () => {
    try {
      await axios.post('http://localhost:3000/auth/login', {
        telegramData: "query_id=AAGJmbgcAAAAAImZuBzq4C-i&user=%7B%22id%22%3A481859977%2C%22first_name%22%3A%22Anton%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22AntonKiya%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1725784407&hash=955641bc96911345a61277570dc8458574c20d09c517cb9bc811cf35913a0811"
      }, {
        withCredentials: true  // Enables sending cookies with cross-domain requests
      });

      console.log('Login successful. Cookies were set by the server.');

      // Connect to WebSocket after successful login using httpOnly cookies
      connectToWebSocket();
    } catch (error) {
      console.error('Error during login:', error);
    }
  }, []);

  // Connecting to WebSocket (cookies will be sent automatically by the browser)
  const connectToWebSocket = () => {
    const newSocket = io('http://localhost:3000/', {
      withCredentials: true  // Allows the browser to send cookies with cross-domain requests
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
      const response = await axios.get('http://localhost:3000/users/me', {
        withCredentials: true  // Automatically sends httpOnly cookies with the request
      });

      setUser(response.data);
      console.log('Current user:', response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Initialize app and login on mount
  useEffect(() => {
    // Connect only once on mount
    login();

    // Return a function to close the WebSocket connection on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('WebSocket connection closed');
      }
    };
  }, [login]);  // Add login as a dependency because it uses useCallback

  return (
    <div>
      <h1>Test WebSocket App</h1>
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
