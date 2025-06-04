// src/navigation/Admin/AdminTab.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminTab = () => {
  return (
    <div>
      <h2>Admin Navigation</h2>
      <ul>
        <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/admin/manage-recruiters">Manage Recruiters</NavLink></li>
        <li><NavLink to="/admin/manage-jobs">Manage Jobs</NavLink></li>
      </ul>
    </div>
  );
};

export default AdminTab;
