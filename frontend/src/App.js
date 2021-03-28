import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';
import Login from './pages/login';
import Signup from './pages/signup';

function App() {
  return (
    <Router>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/signup">
        <Signup />
      </Route>
    </Router>
  );
}

export default App;
