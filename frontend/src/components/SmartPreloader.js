import React, { useState, useEffect } from 'react';
import './SmartPreloader.css';

const SmartPreloader = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');
  const [showTip, setShowTip] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Banking tips to display during loading
  const bankingTips = [
    "RTFM Capital Bank protects your money with 256-bit encryption",
    "You can open multiple accounts in different currencies",
    "Set up automatic transfers to grow your savings",
    "Enable two-factor authentication for extra security",
    "Monitor your transactions in real-time",
    "RTFM Capital never asks for your password via email",
    "Save on fees by using online banking",
    "Your money is FDIC insured up to $250,000",
    "Set up spending alerts to manage your budget",
    "Mobile banking is available 24/7",
    "You can freeze your card instantly if lost",
    "RTFM Capital supports sustainable investing",
    "Round up purchases to save automatically",
    "Get early direct deposit with qualifying accounts",
    "No monthly fees with minimum balance"
  ];

  // Loading stages
  const loadingStages = [
    'Connecting to secure server...',
    'Verifying credentials...',
    'Loading your accounts...',
    'Fetching transaction history...',
    'Calculating balances...',
    'Initializing dashboard...',
    'Almost there...'
  ];

  useEffect(() => {
    let progressInterval;
    let stageInterval;
    let tipInterval;

    // Simulate progress
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(stageInterval);
          clearInterval(tipInterval);
          
          // Add a small delay before completing
          setTimeout(() => {
            setIsVisible(false);
            if (onLoadingComplete) onLoadingComplete();
          }, 500);
          
          return 100;
        }
        
        // Slow down progress as it gets higher
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Change loading stage
    let stageIndex = 0;
    stageInterval = setInterval(() => {
      stageIndex = (stageIndex + 1) % loadingStages.length;
      setLoadingStage(loadingStages[stageIndex]);
    }, 2000);

    // Show random tips
    tipInterval = setInterval(() => {
      const randomTip = bankingTips[Math.floor(Math.random() * bankingTips.length)];
      setShowTip(randomTip);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(tipInterval);
    };
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="smart-preloader">
      <div className="preloader-container">
        {/* Logo Animation */}
        <div className="logo-container">
          <div className="logo-circle">
            <svg className="logo-svg" viewBox="0 0 100 100">
              <circle 
                className="logo-circle-outer" 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="2"
              />
              <circle 
                className="logo-circle-inner" 
                cx="50" 
                cy="50" 
                r="35" 
                fill="none" 
                stroke="#764ba2" 
                strokeWidth="2"
              />
              <path 
                className="logo-path" 
                d="M30 50 L45 65 L70 35" 
                stroke="#48bb78" 
                strokeWidth="4" 
                fill="none"
                strokeLinecap="round"
              />
              <text 
                x="50" 
                y="55" 
                textAnchor="middle" 
                fill="#fff" 
                fontSize="12"
                fontWeight="bold"
              >
                RTFM
              </text>
            </svg>
          </div>
        </div>

        {/* Bank Name */}
        <h1 className="bank-name">
          RTFM <span className="bank-name-highlight">Capital</span> Bank
        </h1>

        {/* Loading Stage */}
        <div className="loading-stage">
          <span className="stage-indicator"></span>
          <span className="stage-text">{loadingStage}</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-bar-shine"></div>
            </div>
          </div>
          <div className="progress-percentage">{Math.round(progress)}%</div>
        </div>

        {/* Banking Tips */}
        <div className="tip-container">
          <div className="tip-icon">💡</div>
          <div className="tip-text">{showTip}</div>
        </div>

        {/* Security Badge */}
        <div className="security-badge">
          <span className="security-icon">🔒</span>
          <span className="security-text">256-bit SSL Secure</span>
        </div>

        {/* Animated Background Elements */}
        <div className="preloader-background">
          <div className="floating-element element-1">💰</div>
          <div className="floating-element element-2">💳</div>
          <div className="floating-element element-3">🏦</div>
          <div className="floating-element element-4">📊</div>
          <div className="floating-element element-5">🔐</div>
        </div>
      </div>
    </div>
  );
};

export default SmartPreloader;