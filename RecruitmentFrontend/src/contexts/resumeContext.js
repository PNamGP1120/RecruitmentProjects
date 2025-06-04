// src/contexts/resumeContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo context để quản lý thông tin CV
const ResumeContext = createContext();

export const useResume = () => {
  return useContext(ResumeContext);
};

export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);

  const addResume = (resume) => {
    setResumes((prevResumes) => [...prevResumes, resume]);
  };

  const updateResume = (id, updatedResume) => {
    setResumes((prevResumes) =>
      prevResumes.map((resume) => (resume.id === id ? { ...resume, ...updatedResume } : resume))
    );
  };

  const deleteResume = (id) => {
    setResumes((prevResumes) => prevResumes.filter((resume) => resume.id !== id));
  };

  return (
    <ResumeContext.Provider value={{ resumes, addResume, updateResume, deleteResume }}>
      {children}
    </ResumeContext.Provider>
  );
};
