import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Alert Component
 * Displays important messages with appropriate styling
 * @param {string} variant - 'info' | 'success' | 'warning' | 'error'
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  className = '',
  onClose,
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
    },
  };

  const style = variants[variant] || variants.info;
  const Icon = style.icon;

  return (
    <div
      className={`
        rounded-lg border p-4 ${style.bg} ${className}
      `}
      role="alert">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${style.text}`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${style.text}`}>{title}</h4>
          )}
          <div className={`text-sm ${style.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${style.text} hover:opacity-70 transition-opacity`}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
