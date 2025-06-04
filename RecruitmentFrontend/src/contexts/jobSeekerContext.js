// src/contexts/jobSeekerContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo context để quản lý thông tin hồ sơ người tìm việc
const JobSeekerContext = createContext();

export const useJobSeeker = () => {
  return useContext(JobSeekerContext);
};

export const JobSeekerProvider = ({ children }) => {
  const [jobSeekerProfile, setJobSeekerProfile] = useState({
    summary: '',
    skills: [],
    phone_number: '',
    gender: '',
  });

  const updateJobSeekerProfile = (newProfile) => {
    setJobSeekerProfile((prevProfile) => ({ ...prevProfile, ...newProfile }));
  };

  return (
    <JobSeekerContext.Provider value={{ jobSeekerProfile, updateJobSeekerProfile }}>
      {children}
    </JobSeekerContext.Provider>
  );
};
