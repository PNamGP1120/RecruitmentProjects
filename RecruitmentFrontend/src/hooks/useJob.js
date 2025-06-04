// src/hooks/useJob.js
import { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob } from '../api/jobApi';

const useJob = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobData = await getJobs();
        setJobs(jobData);
      } catch (error) {
        console.error('Error fetching jobs', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const addJob = async (jobData) => {
    setIsLoading(true);
    try {
      const newJob = await createJob(jobData);
      setJobs((prevJobs) => [...prevJobs, newJob]);
    } catch (error) {
      console.error('Error creating job', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editJob = async (id, jobData) => {
    setIsLoading(true);
    try {
      const updatedJob = await updateJob(id, jobData);
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === id ? updatedJob : job)));
    } catch (error) {
      console.error('Error updating job', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeJob = async (id) => {
    setIsLoading(true);
    try {
      await deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error('Error deleting job', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { jobs, isLoading, addJob, editJob, removeJob };
};

export default useJob;
