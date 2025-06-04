// src/navigation/RootNavigator.js
import React, { useContext } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import AdminNavigator from './Admin/AdminStack'; // Điều hướng cho Admin
import RecruiterNavigator from './Recruiter/RecruiterStack'; // Điều hướng cho Recruiter
import JobSeekerNavigator from './JobSeeker/JobSeekerStack'; // Điều hướng cho JobSeeker
import GuestNavigator from './Guest/GuestStack'; // Điều hướng cho Guest

const RootNavigator = () => {
  const { user } = useAuth(); // Lấy thông tin người dùng từ context

  if (!user) {
    // Nếu chưa đăng nhập, điều hướng đến GuestNavigator
    return <GuestNavigator />;
  }

  switch (user.roles[0]) {
    case 'Admin':
      return <AdminNavigator />;
    case 'Recruiter':
      return <RecruiterNavigator />;
    case 'JobSeeker':
      return <JobSeekerNavigator />;
    default:
      return <Redirect to="/" />;
  }
};

export default RootNavigator;
