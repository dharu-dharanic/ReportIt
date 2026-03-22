import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

let socket;

const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Connect to socket
    socket = io(SOCKET_URL);

    // Join personal room
    if (user?.id) {
      socket.emit('join', user.id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socket;
};

export default useSocket;