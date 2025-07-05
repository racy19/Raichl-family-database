import React from 'react';

const InputField = ({ label, value, onChange, name, type = 'text', required = false, className }) => {
  return (
    <div className={className + " form-group"}>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-control"
      />
    </div>
  );
};

export default InputField;