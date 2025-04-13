// src/Guide.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Guide.css'; // Your CSS file

// --- Import your screenshots ---
import screenshotRegister from './assets/guide-imgs/register.jpeg';
import screenshotWorkoutPage from './assets/guide-imgs/workout-page.jpeg';
import screenshotSelectExercise from './assets/guide-imgs/add-exercise.jpeg';
import screenshotCustomExercise from './assets/guide-imgs/custom-exercise.jpeg';
import screenshotCreateWorkout from './assets/guide-imgs/create-workout.jpeg';
import screenshotHistory from './assets/guide-imgs/history.jpeg';
import screenshotInstall from './assets/guide-imgs/install.jpeg';
// import screenshotInstall from './assets/screenshot-install.png'; // Optional

const steps = [
    {
      image: screenshotRegister,
      title: "1. Create Your Account",
      description: "Sign up for RepIt and select your role — User or Trainer. If you're a user, you can optionally connect with a trainer for personalized guidance."
    },
    {
      image: screenshotWorkoutPage,
      title: "2. Begin Building Your Workout",
      description: "Tap on 'Add New Workout' to start. You’ll be taken to the exercise selection screen where you can choose from our library or create your own."
    },
    {
      image: screenshotSelectExercise,
      title: "3. Pick Your Exercises",
      description: "Browse our library by muscle group. Can't find what you need? Create and add your own custom exercises."
    },
    {
      image: screenshotCustomExercise,
      title: "4. Add a Custom Exercise",
      description: "Easily create your own exercises with custom names, target muscles, and equipment — perfect for personal routines."
    },
    {
      image: screenshotCreateWorkout,
      title: "5. Log Your Workout",
      description: "Input sets, reps, weight, time, or distance based on the exercise type. Keep your progress organized and detailed."
    },
    {
      image: screenshotHistory,
      title: "6. Review Your Progress",
      description: "Head to the History tab to view all completed workouts. Tap any card to see full workout stats and track improvements."
    },
    {
      image: screenshotInstall,
      title: "7. Install RepIt to Home Screen",
      description: "Add RepIt to your phone’s home screen for instant access — like a real app, just one tap away anytime!"
    }
  ];


function Guide() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // --- PWA Install Prompt Logic ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      // Only make the button visible if the prompt is available
      if (event) {
        setShowInstallButton(true);
      }
      console.log("beforeinstallprompt event fired and stashed");
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      alert("To add to Home Screen:\nOn iOS (Safari): Tap Share -> Add to Home Screen.\nOn Android (Chrome): Tap Menu -> Install app / Add to Home screen.");
      return;
    }
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setInstallPromptEvent(null); // Can only be used once
    setShowInstallButton(false); // Hide button after use
  };
  // --- End PWA Install Logic ---

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/register'); // Go to register after the last step
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/'); // Go back to landing page if on first step
    }
  };

  const handleSkip = () => {
    navigate('/register');
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="app-guide-container">
      <button className="topButton guide-back-button" onClick={() => navigate('/')}>
         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
       </button>

      <div className="guide-step">
        {/* Conditionally render image */}
        {steps[currentStep].image && (
          <img src={steps[currentStep].image} alt={`Step ${currentStep + 1}: ${steps[currentStep].title}`} className="guide-screenshot" />
        )}
        <h3>{steps[currentStep].title}</h3>
        <p>{steps[currentStep].description}</p>
      </div>

      {/* Show Install Button ONLY on the last step AND if available */}
      {isLastStep && showInstallButton && (
        <div className="install-section">
          <button onClick={handleInstallClick} className="install-button">
            Add RepIt to Home Screen
          </button>
        </div>
      )}

      <div className="guide-navigation">
        <button onClick={handlePrev} disabled={currentStep === 0}>
          Previous
        </button>
        <span>Step {currentStep + 1} of {steps.length}</span>
        <button onClick={handleNext}>
          {isLastStep ? 'Register' : 'Next'}
        </button>
      </div>
      <div className="skip-link-area">
      <button onClick={handleSkip} className="skip-button">Skip Guide & Register</button>
      </div>
    </div>
  );
}

export default Guide;