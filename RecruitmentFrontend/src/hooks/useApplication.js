// src/hooks/useApplication.js
import { useState, useEffect } from 'react';
import { getApplications, submitApplication, updateApplicationStatus, deleteApplication } from '../api/applicationApi';

const useApplication = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsData = await getApplications();
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const applyForJob = async (jobId) => {
    setIsLoading(true);
    try {
      const newApplication = await submitApplication(jobId);
      setApplications((prev) => [...prev, newApplication]);
    } catch (error) {
      console.error('Error applying for job', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplication = async (id, status) => {
    setIsLoading(true);
    try {
      await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((application) => (application.id === id ? { ...application, status } : application))
      );
    } catch (error) {
      console.error('Error updating application', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeApplication = async (id) => {
    setIsLoading(true);
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((application) => application.id !== id));
    } catch (error) {
      console.error('Error deleting application', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    applyForJob,
    updateApplication,
    removeApplication,
  };
};

export default useApplication;
