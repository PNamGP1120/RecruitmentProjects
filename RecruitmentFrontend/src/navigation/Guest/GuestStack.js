// src/navigation/Guest/GuestStack.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StartScreen from '../../screens/Guest/StartScreen'; // Màn hình khởi động
import Login from '../../screens/Guest/Login'; // Màn hình đăng nhập

const GuestStack = () => {
  return (
    <div>
      <h1>Welcome, Guest!</h1>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={StartScreen} />
      </Switch>
    </div>
  );
};

export default GuestStack;
