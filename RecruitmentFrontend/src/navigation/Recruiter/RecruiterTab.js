// src/navigation/Recruiter/RecruiterTab.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const RecruiterTab = () => {
  return (
    <div>
      <h2>Recruiter Navigation</h2>
      <ul>
        <li><NavLink to="/recruiter/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/recruiter/manage-candidates">Manage Candidates</NavLink></li>
        <li><NavLink to="/recruiter/post-job">Post Job</NavLink></li>
      </ul>
    </div>
  );
};

export default RecruiterTab;
