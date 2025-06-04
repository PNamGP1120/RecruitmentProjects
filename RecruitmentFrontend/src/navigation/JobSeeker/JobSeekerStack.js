// src/navigation/JobSeeker/JobSeekerStack.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import JobSeekerDashboard from '../../screens/JobSeeker/JobSeekerDashboard'; // Màn hình Dashboard JobSeeker
import ApplyJob from '../../screens/JobSeeker/ApplyJob'; // Ứng tuyển công việc
import ManageProfile from '../../screens/JobSeeker/ManageProfile'; // Quản lý hồ sơ Job Seeker

const JobSeekerStack = () => {
  return (
    <div>
      <h1>Job Seeker Dashboard</h1>
      <Switch>
        <Route path="/job-seeker/dashboard" component={JobSeekerDashboard} />
        <Route path="/job-seeker/apply-job" component={ApplyJob} />
        <Route path="/job-seeker/manage-profile" component={ManageProfile} />
      </Switch>
    </div>
  );
};

export default JobSeekerStack;
