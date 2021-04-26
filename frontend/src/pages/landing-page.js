import React from 'react';
import NavigationWhite from '../components/navigation-white';
import android from '../images/android.png';
import './landing-page.css';

function LandingPage() {
  return (
    <div>
      <NavigationWhite />
      <div className="container">
        <div>
          <section className="main-section">
            <div className="left-section">
              <div
                style={{
                  margin: '9rem 2rem 2rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  letterSpacing: '0.25rem',
                  fontSize: '3rem',
                  color: '#373B3F',
                  lineHeight: '1',
                }}
              >
                <p>Less stress when </p>
                <p>sharing expenses</p>
                <p style={{ color: '#A6002F' }}>with your partner.</p>
              </div>
              <div>
                <div
                  style={{
                    width: '3rem',
                    margin: '0rem 2rem',
                    textAlign: 'left',
                    float: 'left',
                  }}
                >
                  <svg
                    className="fill-current w-9 lg:w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 36 35"
                    style={{ fill: '#1CC29F' }}
                  >
                    <path d="M7.844 0L1.961 3.5l11.766 7 3.922 2.333L9.805 17.5 3.922 14 0 16.333l3.922 2.334 1.961 1.166L3.922 21l1.961 1.167V24.5l1.961-1.167v7L11.766 28v-7l7.844-4.667V35l3.922-2.333 1.96-1.167v-7l1.962-1.167V21l-1.961 1.167v-2.334l1.96-1.166v-2.334l-1.96 1.167v-4.667l5.883-3.5L35.298 7V4.667L33.337 3.5l-9.805 5.833L19.61 7l1.961-1.167-1.961-1.166-1.961 1.166-1.961-1.166 1.96-1.167-1.96-1.167L13.727 3.5z" />
                  </svg>
                </div>
                <div
                  style={{
                    width: '3rem',
                    margin: '0rem 2rem',
                    textAlign: 'left',
                    float: 'left',
                  }}
                >
                  <svg
                    className="fill-current w-9 lg:w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 34 32"
                    style={{ fill: '#8656cd' }}
                  >
                    <path d="M27.736 15.229V31.02H20.56V22.6h-7.177v8.423H6.207V15.228l7.176-4.211 3.588-2.106 10.765 6.317zm-.03-6.335l5.412 3.176v2.106H29.53l-12.559-7.37-12.558 7.37H.824V12.07l16.147-9.475 7.177 4.211V.49h3.557v8.405z" />
                  </svg>
                </div>
                <div
                  style={{
                    width: '3rem',
                    margin: '0rem 2rem',
                    textAlign: 'left',
                    float: 'left',
                  }}
                >
                  <svg
                    className="fill-current w-9 lg:w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 31 29"
                    style={{ fill: '#A6002F' }}
                  >
                    <path d="M15.163 4.311L7.653-.043.143 4.311v15.237l15.02 8.707 15.02-8.707V4.311l-7.51-4.354z" />
                  </svg>
                </div>
                <div
                  style={{
                    width: '3rem',
                    margin: '0rem 2rem',
                    textAlign: 'left',
                    float: 'left',
                  }}
                >
                  <svg
                    className="fill-current w-9 lg:w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 29 30"
                    style={{ fill: 'grey' }}
                  >
                    <path d="M11.673.979v9.055L3.519 5.506.461 10.6l8.154 4.528-8.154 4.527L3.52 24.75l8.154-4.528v9.056h6.115V20.22l8.154 4.528L29 19.655l-8.154-4.527L29 10.6l-3.058-5.094-8.154 4.528V.979z" />
                  </svg>
                </div>
              </div>
              <div
                style={{
                  textAlign: 'left',
                  float: 'left',
                  margin: '2rem',
                  fontSize: '1.2rem',
                }}
              >
                <p>
                  Keep track of your shared expenses and balances with
                  housemates, trips, groups, friends, and family.
                </p>
              </div>
              <div
                style={{
                  margin: '2rem 2rem',
                  textAlign: 'left',
                  float: 'left',
                }}
              >
                <a
                  className="btn btn-large"
                  data-toggle="modal"
                  href="#settle_up_form"
                  style={{
                    backgroundColor: '#A6002F',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'small',
                    color: '#FFF',
                    padding: '16px 64px',
                    fontSize: '18px',
                  }}
                >
                  Sign up
                </a>
              </div>
            </div>
            <div className="right-section">
              <img
                src={android}
                alt={android}
                style={{ height: '45rem', float: 'right', marginRight: '2rem' }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
