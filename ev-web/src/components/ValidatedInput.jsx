import { useState, useEffect } from 'react';

const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  validator,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  min,
  max,
  step,
  options = [], // For select inputs
  showFormatHint = false,
  formatFunction,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validate when value changes
  useEffect(() => {
    if (touched && validator) {
      const validation = validator(value);
      setError(validation.message || '');
      setIsValid(validation.isValid);
    }
  }, [value, validator, touched]);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Apply formatting if provided
    if (formatFunction && type !== 'select') {
      newValue = formatFunction(newValue);
    }
    
    onChange(e.target.name, newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (validator) {
      const validation = validator(value);
      setError(validation.message || '');
      setIsValid(validation.isValid);
    }
  };

  const getInputClassName = () => {
    let baseClass = `w-full px-3 py-2 border rounded-md text-sm transition-colors ${className}`;
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    } else {
      baseClass += ' bg-white';
    }
    
    if (touched) {
      if (isValid && value) {
        baseClass += ' border-green-500 focus:border-green-500 focus:ring-green-200';
      } else if (!isValid) {
        baseClass += ' border-red-500 focus:border-red-500 focus:ring-red-200';
      } else {
        baseClass += ' border-gray-300 focus:border-blue-500 focus:ring-blue-200';
      }
    } else {
      baseClass += ' border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    }
    
    baseClass += ' focus:outline-none focus:ring-2';
    
    return baseClass;
  };

  const renderInput = () => {
    const commonProps = {
      name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      disabled,
      className: getInputClassName(),
      placeholder,
      maxLength,
      required,
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={getInputClassName() + ' resize-vertical'}
          />
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input */}
      {renderInput()}

      {/* Format Hint */}
      {showFormatHint && (
        <p className="mt-1 text-xs text-gray-500">
          {getFormatHint()}
        </p>
      )}

      {/* Error Message */}
      {touched && error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Success Indicator */}
      {touched && isValid && value && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Valid
        </p>
      )}
    </div>
  );

  function getFormatHint() {
    switch (name) {
      case 'customerId':
        return 'Format: 9 digits + V/X (e.g., 123456789V) or 12 digits (e.g., 200012345678)';
      case 'customerPhone':
        return 'Format: +94XXXXXXXXX or 0XXXXXXXXX';
      case 'licensePlate':
        return 'Format: ABC-1234 or AB-1234';
      case 'duration':
        return 'In 30-minute increments (0.5, 1.0, 1.5, etc.) Max: 8 hours';
      default:
        return '';
    }
  }
};

export default ValidatedInput;