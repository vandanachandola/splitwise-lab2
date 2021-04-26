import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import './App.css';
import PrivateRoute from './components/private-route';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import Activity from './pages/activity';
import CreateGroup from './pages/create-group';
import MyGroups from './pages/my-groups';
import Profile from './pages/profile';
import AllGroups from './pages/all-groups';
import Group from './pages/group';
import UserAuth from './shared/user-auth';
import LandingPage from './pages/landing-page';

const redirectToDashboard = () => <Redirect to="/dashboard" />;

const isUserLoggedIn = () => {
  if (UserAuth.getUserId()) {
    return true;
  }
  return false;
};

function App() {
  return (
    <Router>
      <PrivateRoute
        path="/"
        exact
        trueComponent={redirectToDashboard}
        falseComponent={LandingPage}
        decisionFunc={isUserLoggedIn}
      />
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/signup">
        <Signup />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/activity">
        <Activity />
      </Route>
      <Route path="/all-groups">
        <AllGroups />
      </Route>
      <Route path="/group/:id" render={(props) => <Group {...props} />} />
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/new-group">
        <CreateGroup />
      </Route>
      <Route path="/my-groups">
        <MyGroups />
      </Route>
    </Router>
  );
}

export default App;
