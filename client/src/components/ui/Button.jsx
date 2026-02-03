/**
 * Button Component
 * Reusable button with multiple variants
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} loading - Show loading state
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary:
      'bg-linear-to-r from-primary-600 to-primary-500 hover:to-primary-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 border-transparent',
    secondary:
      'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:border-gray-300',
    danger:
      'bg-linear-to-r from-red-600 to-red-500 hover:to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 border-transparent',
    outline:
      'border border-gray-200 hover:border-primary-500 text-gray-600 hover:text-primary-600 bg-white hover:bg-primary-50/10 shadow-sm',
    ghost:
      'hover:bg-primary-50 text-gray-600 hover:text-primary-700 border-transparent shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium tracking-wide',
    md: 'px-5 py-2.5 text-sm font-medium tracking-wide',
    lg: 'px-7 py-3 text-base font-medium tracking-wide',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300
        focus:outline-none focus:ring-4 focus:ring-primary-500/20 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
