import React from 'react';
import Navigation from '../components/navigation';
import landingPage from '../images/landing-page.jpg';

function Dashboard() {
  return (
    <div>
      <Navigation />
      <div className="container">
        <div>
          <img
            src={landingPage}
            alt="Landing Page"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
