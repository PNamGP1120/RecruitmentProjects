// src/navigation/JobSeeker/JobSeekerTab.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const JobSeekerTab = () => {
  return (
    <div>
      <h2>Job Seeker Navigation</h2>
      <ul>
        <li><NavLink to="/job-seeker/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/job-seeker/apply-job">Apply Job</NavLink></li>
        <li><NavLink to="/job-seeker/manage-profile">Manage Profile</NavLink></li>
      </ul>
    </div>
  );
};

export default JobSeekerTab;
