// src/hooks/useInterview.js
import { useState, useEffect } from 'react';
import { getInterviews, createInterview, updateInterview, deleteInterview, cancelInterview, completeInterview } from '../api/applicationApi';

const useInterview = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const interviewData = await getInterviews();
        setInterviews(interviewData);
      } catch (error) {
        console.error('Error fetching interviews', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const scheduleInterview = async (applicationId, interviewData) => {
    setIsLoading(true);
    try {
      const newInterview = await createInterview(applicationId, interviewData);
      setInterviews((prev) => [...prev, newInterview]);
    } catch (error) {
      console.error('Error scheduling interview', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateInterviewDetails = async (id, interviewData) => {
    setIsLoading(true);
    try {
      await updateInterview(id, interviewData);
      setInterviews((prev) =>
        prev.map((interview) => (interview.id === id ? { ...interview, ...interviewData } : interview))
      );
    } catch (error) {
      console.error('Error updating interview', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeInterview = async (id) => {
    setIsLoading(true);
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((interview) => interview.id !== id));
    } catch (error) {
      console.error('Error deleting interview', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInterview = async (id) => {
    setIsLoading(true);
    try {
      await cancelInterview(id);
      setInterviews((prev) =>
        prev.map((interview) => (interview.id === id ? { ...interview, status: 'Canceled' } : interview))
      );
    } catch (error) {
      console.error('Error canceling interview', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeInterview = async (id) => {
    setIsLoading(true);
    try {
      await completeInterview(id);
      setInterviews((prev) =>
        prev.map((interview) => (interview.id === id ? { ...interview, status: 'Completed' } : interview))
      );
    } catch (error) {
      console.error('Error completing interview', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    interviews,
    isLoading,
    scheduleInterview,
    updateInterviewDetails,
    removeInterview,
    cancelInterview,
    completeInterview,
  };
};

export default useInterview;
