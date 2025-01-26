import React from 'react';

const Button = ({ label, onClick, type = 'button', className = 'btn btn-primary' }) => {
  return (
    <button type={type} onClick={onClick} className={className}>
      {label}
    </button>
  );
};

export default Button;
