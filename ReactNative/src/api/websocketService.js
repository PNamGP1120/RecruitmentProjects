// src/api/websocketService.js

import { useState, useEffect } from "react";

export const useWebSocket = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://<your-django-server>/ws/chat/${conversationId}/`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [conversationId]);

  const sendMessage = (message) => {
    if (socket) {
      socket.send(JSON.stringify({ message }));
    }
  };

  return { messages, sendMessage };
};
