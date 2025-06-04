// src/contexts/recruiterContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo context để quản lý thông tin hồ sơ nhà tuyển dụng
const RecruiterContext = createContext();

export const useRecruiter = () => {
  return useContext(RecruiterContext);
};

export const RecruiterProvider = ({ children }) => {
  const [recruiterProfile, setRecruiterProfile] = useState({
    company_name: '',
    industry: '',
    company_website: '',
    address: '',
  });

  const updateRecruiterProfile = (newProfile) => {
    setRecruiterProfile((prevProfile) => ({ ...prevProfile, ...newProfile }));
  };

  return (
    <RecruiterContext.Provider value={{ recruiterProfile, updateRecruiterProfile }}>
      {children}
    </RecruiterContext.Provider>
  );
};
