import React from 'react';

import './../../styles/StepButtons.css';

const StepButtons = (props) => {
  return (
    <div className="StepButtons">
      {
        props.stepIndex !== 1 
        &&
        <a className="cta cta--secondary cta--dark prev" onClick={props.onPrevClick}>
          { props.backText }
        </a>
      }
      <a className="cta cta--secondary cta--arrow next" href="#" onClick={props.onNextClick}>
        { props.nextText }
      </a>
    </div>
  );
}

export default StepButtons;