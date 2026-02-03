/**
 * Card Component
 * Reusable card container with consistent styling
 * @param {string} className - Additional classes to apply
 * @param {boolean} hover - Enable hover effect
 */
const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`
        card
        ${hover ? 'card-hover cursor-pointer' : ''}
        p-6
        ${className}
      `}
      {...props}>
      {children}
    </div>
  );
};

export default Card;
