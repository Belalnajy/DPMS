/**
 * Badge Component
 * Status badge for glucose levels and other indicators
 * @param {string} variant - 'low' | 'normal' | 'high' | 'critical' | 'default'
 */
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    low: 'bg-status-low text-status-low-text border border-status-low/50',
    normal:
      'bg-status-normal text-status-normal-text border border-status-normal/50',
    high: 'bg-status-high text-status-high-text border border-status-high/50',
    critical:
      'bg-status-critical text-status-critical-text border border-status-critical/50',
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-primary-50 text-primary-700 border border-primary-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
        shadow-sm
        ${variants[variant] || variants.default}
        ${className}
      `}>
      {children}
    </span>
  );
};

export default Badge;
