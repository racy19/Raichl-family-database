import React from 'react';

const RadioButton = ({ label, name, value, onChange, options }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="form-check-input"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RadioButton;