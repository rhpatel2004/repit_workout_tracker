import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaBookOpen, FaUsers } from "react-icons/fa";
import { MdTimer, MdTrendingUp, MdSmartphone } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navLandingPage">
        <div className="logo-container">
          <img src="/repit-icon.png" alt="Repit Logo" className="logo" />
          <h2>REPIT</h2>
        </div>
        <button className="btnlogin btn-secondary" onClick={() => navigate('/login')}>
          Login
        </button>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Transform Your Fitness Journey</h1>
          <p>Track, analyze, and achieve your fitness goals with Repit</p>
          <button className="btnregister btn-primary" onClick={() => navigate('/guide')}>
            Get Started Free
          </button>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <div className="features-grid">
            <div className="feature-card">
              <MdTimer className="feature-icon" size={48} />
              <h3>Log Everything</h3>
              <p>Easily record sets, reps, weight, duration, and distance for all your exercises.</p>
            </div>

            <div className="feature-card">
              <FaBookOpen className="feature-icon" size={48} />
              <h3>Track Your Journey</h3>
              <p>View your complete workout history and monitor changes in body measurements.</p>
            </div>

            <div className="feature-card">
              <MdTrendingUp className="feature-icon" size={48} />
              <h3>See Your Progress</h3>
              <p>Visualize your gains and stay motivated with detailed progress tracking.</p>
            </div>

            <div className="feature-card">
              <FaFolderOpen className="feature-icon" size={48} />
              <h3>Plan Like a Pro</h3>
              <p>Create reusable workout templates and organize them into custom folders.</p>
            </div>

            <div className="feature-card">
              <RiUserAddLine className="feature-icon" size={48} />
              <h3>Your Exercise List</h3>
              <p>Access a large library and add your own custom exercises.</p>
            </div>

            <div className="feature-card">
              <FaUsers className="feature-icon" size={48} />
              <h3>Connect & Collaborate</h3>
              <p>Seamlessly work with your trainer or manage your clients.</p>
            </div>

            <div className="feature-card">
              <MdSmartphone className="feature-icon" size={48} />
              <h3>Train On-the-Go</h3>
              <p>Designed for a smooth, mobile-first experience.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About REPIT</h3>
            <p>REPIT is your mobile-first fitness companion. Log workouts, monitor progress, and take charge of your fitness goals anytime, anywhere.</p>
          </div>


          <div className="footer-bottom">
            <p>© 2025 REPIT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
