// src/hooks/useNotification.js
import { useState, useEffect } from 'react';
import { getNotifications } from '../api/notificationApi';

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsData = await getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
  };
};

export default useNotification;
