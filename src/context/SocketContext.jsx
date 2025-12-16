import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getToken } from '../api/localStorageService';
import { receiveSocketMessage, markConversationRead } from '../store/chatSlice';
import messageSound from '../assets/sounds/message-sound.wav';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user); // Re-connect on login
  
  // We can track the current active conversation ID to auto-mark read
  // However, tracking it in Redux is better. Let's assume we handle "mark read" in the UI components 
  // or via a dedicated Redux state for "activeConversationId".
  // For now, the global listener just updates the data.

  useEffect(() => {
    const token = getToken();
    
    // Only connect if we have a token (user logged in)
    if (!token) {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        return;
    }

    // If socket already exists and connected, don't recreate
    if (socket && socket.connected) return;

    // Initialize Socket
    const newSocket = new io("http://localhost:8099", {
        query: { token },
        transports: ['websocket'], // Force websocket for better performance
        reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket Connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    // Global Message Listener
    newSocket.on("message", (messageStr) => {
      try {
        const message = JSON.parse(messageStr);
        console.log("📩 Socket received message:", message);
        
        // Dispatch to Redux -> Updates MessagePage & Popup
        dispatch(receiveSocketMessage(message));

        // Play notification sound if message is incoming (not from me)
        const isMe = message.me || message.isMe;
        if (!isMe) {
          const audio = new Audio(messageSound);
          audio.play().catch(e => console.warn("Audio play failed:", e));
        }

        // Future: Handle Notification logic here
        // dispatch(receiveNotification(message)); 

      } catch (error) {
        console.error("Socket message parse error:", error);
      }
    });

    // Save socket instance
    setSocket(newSocket);

    // Cleanup on unmount or logout
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, dispatch]); // Re-run when auth status changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
