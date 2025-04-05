import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import specific icons needed
import { FaDumbbell, FaFolderOpen, FaBookOpen, FaUsers, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { MdTimer, MdTrendingUp, MdSmartphone, MdArrowForward } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri"; // Example for custom exercises
import './LandingPage.css';
function LandingPage() {
  return (
    <div>
      {/* Navigation */}
      <nav>
        <div className="logo-container">
          <img src="/repit-logo.png" alt="Repit Logo" className="logo" />
        </div>
        <button className="btnlogin btn-secondary"  onClick={() => window.location.href='/login'}>Login</button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Transform Your Fitness Journey</h1>
          <p>Track, analyze, and achieve your fitness goals with Repit</p>
          <button className="btnregister btn-primary"  onClick={() => window.location.href='/register'} >Get Started Free</button>
        </div>
      </section>

      
            {/* Features Section */}
            <section className="features-section">
                <div className="container"> {/* Added container for consistent padding */}
                    <h2 className="section-title">Everything You Need to Succeed</h2>
                    <div className="features-grid">
                        {/* Feature 1: Logging */}
                        <div className="feature-card">
                            <MdTimer className="feature-icon" size={48} />
                            <h3>Log Everything</h3>
                            <p>Easily record sets, reps, weight, duration, and distance for all your exercises.</p>
                        </div>

                        {/* Feature 2: History */}
                        <div className="feature-card">
                            {/* Using FaBookOpen for history/journal */}
                            <FaBookOpen className="feature-icon" size={48} />
                            <h3>Track Your Journey</h3>
                            <p>View your complete workout history and monitor changes in body measurements.</p>
                        </div>

                        {/* Feature 3: Progress */}
                        <div className="feature-card">
                            <MdTrendingUp className="feature-icon" size={48} />
                            <h3>See Your Progress</h3>
                            <p>Visualize your gains and stay motivated with detailed progress tracking.</p>
                        </div>

                        {/* Feature 4: Templates & Folders */}
                        <div className="feature-card">
                            <FaFolderOpen className="feature-icon" size={48} />
                            <h3>Plan Like a Pro</h3>
                            <p>Create reusable workout templates and organize them into custom folders.</p>
                        </div>

                        {/* Feature 5: Exercise Library */}
                        <div className="feature-card">
                            {/* Using RiUserAddLine for adding custom exercises */}
                            <RiUserAddLine className="feature-icon" size={48} />
                            <h3>Your Exercise List</h3>
                            <p>Access a large library and add your own custom exercises.</p>
                        </div>

                        {/* Feature 6: Trainer/Client Connect */}
                        <div className="feature-card">
                            <FaUsers className="feature-icon" size={48} />
                            <h3>Connect & Collaborate</h3>
                            <p>Seamlessly work with your trainer or manage your clients.</p>
                        </div>

                        {/* Feature 7: Mobile Optimized */}
                        <div className="feature-card">
                            <MdSmartphone className="feature-icon" size={48} />
                            <h3>Train On-the-Go</h3>
                            <p>Designed for a smooth, mobile-first experience.</p>
                        </div>
                    </div>
                </div>
            </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>About the Developer</h3>
            <p>
            I'm Rohan Patel, a fitness-enthusiast and full-stack developer who leveraged technical skills and creative vision to design and build RepIt.
            </p>
          </div>
          <div className="footer-section">
            <h3>Connect With Me</h3>
            <div className="footer-links">
              <a href="" className="footer-link">rhpatel2004@gmail</a>
              <a href="https://github.com/rhpatel2004" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
              <a href="https://www.linkedin.com/in/rohan-patel-6826822b6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Repit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;