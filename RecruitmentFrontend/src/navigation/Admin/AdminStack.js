// src/navigation/Admin/AdminStack.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AdminDashboard from '../../screens/Admin/AdminDashboard'; // Màn hình Dashboard Admin
import ManageRecruiters from '../../screens/Admin/ManageRecruiters'; // Quản lý nhà tuyển dụng
import ManageJobs from '../../screens/Admin/ManageJobs'; // Quản lý tin tuyển dụng

const AdminStack = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/manage-recruiters" component={ManageRecruiters} />
        <Route path="/admin/manage-jobs" component={ManageJobs} />
      </Switch>
    </div>
  );
};

export default AdminStack;
