/**
 * Header Component
 * Top header bar with title and user info
 */
import { useContext } from 'react';
import { User } from 'lucide-react';
import { getProfilePictureUrl } from '../../utils/imageUtils';

const Header = ({ title, subtitle }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between mb-8">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {/* User Info (optional right side) */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-gray-700">{user?.name}</div>
          <div className="text-xs text-gray-500">
            {user?.role === 'doctor' ? 'Physician' : 'Patient'}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden">
          {user?.profile_picture ? (
            <img
              src={getProfilePictureUrl(user.profile_picture)}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
