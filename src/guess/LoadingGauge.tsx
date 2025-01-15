import React from 'react';
import '../gauge/gauge.css';

const LoadingGauge: React.FC = () => {
  return (
    <div className="loading-gauge-container">
      <div className="loading-gauge">
        <div className="gauge-dial">
          <div className="gauge-needle"></div>
          <div className="gauge-center"></div>
          <div className="loading-text">LOADING</div>
          <div className="steam">
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
            <span className="steam-cloud"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingGauge; 