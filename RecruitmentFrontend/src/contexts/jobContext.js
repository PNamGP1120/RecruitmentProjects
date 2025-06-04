// src/contexts/jobContext.js
import React, { createContext, useState, useContext } from 'react';

const JobContext = createContext();

export const useJob = () => {
  return useContext(JobContext);
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);

  const addJob = (job) => {
    setJobs((prev) => [...prev, job]);
  };

  const updateJob = (id, jobData) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id ? { ...job, ...jobData } : job
      )
    );
  };

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
};
