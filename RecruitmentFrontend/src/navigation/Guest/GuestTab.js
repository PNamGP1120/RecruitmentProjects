// src/navigation/Guest/GuestTab.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const GuestTab = () => {
  return (
    <div>
      <h2>Guest Navigation</h2>
      <ul>
        <li><NavLink to="/login">Login</NavLink></li>
        <li><NavLink to="/">Home</NavLink></li>
      </ul>
    </div>
  );
};

export default GuestTab;
