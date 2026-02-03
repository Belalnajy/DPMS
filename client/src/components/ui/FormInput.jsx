/**
 * FormInput Component
 * Consistent form input with label and error handling
 * @param {string} label - Input label text
 * @param {string} error - Error message to display
 * @param {string} type - Input type (text, password, email, number)
 */
const FormInput = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[0.7rem]">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          input
          ${error ? 'input-error' : ''}
        `}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1.5 mt-2 animate-pulse">
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-medium text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
