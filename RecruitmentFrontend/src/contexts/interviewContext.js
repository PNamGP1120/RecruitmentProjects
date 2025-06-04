// src/contexts/interviewContext.js
import React, { createContext, useState, useContext } from 'react';

const InterviewContext = createContext();

export const useInterview = () => {
  return useContext(InterviewContext);
};

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);

  const addInterview = (interview) => {
    setInterviews((prev) => [...prev, interview]);
  };

  const updateInterview = (id, interviewData) => {
    setInterviews((prev) =>
      prev.map((interview) =>
        interview.id === id ? { ...interview, ...interviewData } : interview
      )
    );
  };

  const deleteInterview = (id) => {
    setInterviews((prev) => prev.filter((interview) => interview.id !== id));
  };

  return (
    <InterviewContext.Provider value={{ interviews, addInterview, updateInterview, deleteInterview }}>
      {children}
    </InterviewContext.Provider>
  );
};
