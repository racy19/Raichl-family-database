import React from 'react';

const InputSelect = ({ label, value, onChange, name, options, multiple, required = false }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}
      <select
        id={name}
        name={name}
        value={value}
        size={3}
        onChange={onChange}
        required={required}
        className="form-control"
        multiple={multiple}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      </label>
    </div>
  );
};

export default InputSelect;