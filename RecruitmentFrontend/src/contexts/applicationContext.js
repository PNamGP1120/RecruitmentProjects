// src/contexts/applicationContext.js
import React, { createContext, useState, useContext } from 'react';

const ApplicationContext = createContext();

export const useApplication = () => {
  return useContext(ApplicationContext);
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);

  const addApplication = (application) => {
    setApplications((prev) => [...prev, application]);
  };

  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((application) =>
        application.id === id ? { ...application, status } : application
      )
    );
  };

  const deleteApplication = (id) => {
    setApplications((prev) => prev.filter((application) => application.id !== id));
  };

  return (
    <ApplicationContext.Provider
      value={{ applications, addApplication, updateApplicationStatus, deleteApplication }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
