import React from 'react';

const Rating = ({ rating, onRatingChange, readOnly = false }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i}
        className={`star ${i <= rating ? 'filled' : ''} ${!readOnly ? 'clickable' : ''}`}
        onClick={() => !readOnly && onRatingChange && onRatingChange(i)}
      >
        ★
      </span>
    );
  }
  
  return <div className="rating">{stars}</div>;
};

export default Rating;