import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnded = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Duración de la animación de salida
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className={`splash-container ${isExiting ? 'fade-out' : ''}`}>
      <video 
        autoPlay 
        muted 
        playsInline 
        onEnded={handleEnded}
        className="splash-video"
      >
        <source src="/intro.mp4" type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      
      <button className="skip-btn" onClick={handleSkip}>
        SALTAR INTRO
      </button>

      <div className="splash-overlay"></div>
    </div>
  );
};

export default SplashScreen;
