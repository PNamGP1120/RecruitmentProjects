// src/hooks/useJobSeekerProfile.js
import { useState, useEffect } from 'react';
import { getJobSeekerProfile, updateJobSeekerProfile } from '../api/jobSeekerApi';

const useJobSeekerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getJobSeekerProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const updatedProfile = await updateJobSeekerProfile(profileData);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading, updateProfile };
};

export default useJobSeekerProfile;
