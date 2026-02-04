/**
 * Patient Settings Page
 * Account and notification preferences
 */
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { Card, Button, FormInput, Alert } from '../components/ui';
import { getProfilePictureUrl } from '../utils/imageUtils';
import api from '../services/api';
import { User } from 'lucide-react';

const PatientSettings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState({
    fastingMin: 70,
    fastingMax: 180,
    postMealMin: 100,
    postMealMax: 220,
  });

  useEffect(() => {
    if (user && user.settings) {
      try {
        const parsed = JSON.parse(user.settings);
        if (parsed.glucoseTargets) {
          setTargets(parsed.glucoseTargets);
        }
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }
  }, [user]);

  // Fetch unread count
  useEffect(() => {
    if (!user) return;
    api
      .get(`/patients/${user.id}/dashboard`)
      .then((res) => {
        setUnreadCount(res.data.unreadCount || 0);
        if (res.data.user) {
          setProfile(res.data.user);
        }
      })
      .catch((err) => console.error('Failed to load unread count', err));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      const settings = JSON.stringify({ glucoseTargets: targets });
      // Optimistically update user context if possible, or just API
      // ideally update context, but for now just API
      await api.put(`/patients/${user.id}/settings`, { settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings');
    }
  };

  return (
    <DashboardLayout unreadCount={unreadCount}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Profile Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Profile Information
          </h3>

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden">
              {user?.profile_picture ? (
                <img
                  src={getProfilePictureUrl(user.profile_picture)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
          </div>

          {saved && (
            <Alert variant="success" className="mb-4">
              Changes saved!
            </Alert>
          )}

          <FormInput
            label="Full Name"
            type="text"
            value={profile?.name || user?.name || ''}
            disabled
          />

          <FormInput
            label="Phone Number"
            type="tel"
            value={profile?.phone || user?.phone || ''}
            placeholder="+20 XXX XXX XXXX"
            disabled
          />

          <div className="mb-6">
            <label className="label">Gender</label>
            <select
              value={profile?.gender || user?.gender || 'Male'}
              className="input"
              disabled>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="text-xs text-gray-400 text-center mt-4">
            Profile details are managed by your administrator.
          </div>
        </Card>

        {/* Settings Column */}
        <div className="space-y-6">
          {/* Glucose Targets */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Glucose Targets
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Your reference range for charts and alerts.
            </p>
            <div className="space-y-4">
              <div>
                <label className="label">Target Range (Fasting)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targets.fastingMin}
                    className="input w-24 text-center bg-gray-50 color-gray-500 cursor-not-allowed"
                    readOnly
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    value={targets.fastingMax}
                    className="input w-24 text-center bg-gray-50 color-gray-500 cursor-not-allowed"
                    readOnly
                  />
                  <span className="text-sm text-gray-500">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="label">Target Range (Post-meal)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targets.postMealMin}
                    className="input w-24 text-center bg-gray-50 color-gray-500 cursor-not-allowed"
                    readOnly
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    value={targets.postMealMax}
                    className="input w-24 text-center bg-gray-50 color-gray-500 cursor-not-allowed"
                    readOnly
                  />
                  <span className="text-sm text-gray-500">mg/dL</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 italic text-xs text-center text-gray-400">
              Glucose targets are managed and updated by your healthcare
              provider to ensure your safety.
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
