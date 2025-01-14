import React from 'react';
import './gauge.css';

const LoadingGauge: React.FC = () => {
  return (
    <div className="loading-gauge-container">
      <div className="loading-gauge">
        <div className="gauge-dial">
          <div className="gauge-needle"></div>
          <div className="gauge-center"></div>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingGauge; 