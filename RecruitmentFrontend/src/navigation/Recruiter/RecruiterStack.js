// src/navigation/Recruiter/RecruiterStack.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import RecruiterDashboard from '../../screens/Recruiter/RecruiterDashboard'; // Màn hình Dashboard Recruiter
import ManageCandidates from '../../screens/Recruiter/ManageCandidates'; // Quản lý ứng viên
import PostJob from '../../screens/Recruiter/PostJob'; // Đăng tin tuyển dụng

const RecruiterStack = () => {
  return (
    <div>
      <h1>Recruiter Dashboard</h1>
      <Switch>
        <Route path="/recruiter/dashboard" component={RecruiterDashboard} />
        <Route path="/recruiter/manage-candidates" component={ManageCandidates} />
        <Route path="/recruiter/post-job" component={PostJob} />
      </Switch>
    </div>
  );
};

export default RecruiterStack;
