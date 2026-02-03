/**
 * Register Page
 * Patient registration form with Tailwind CSS
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Check, User, Upload, Heart } from 'lucide-react';
import api from '../services/api';
import { Button, FormInput, Alert } from '../components/ui';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    national_id: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    diabetes_type: 'Type 1',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      // Only allow numbers and symbols
      value = value.replace(/[^\d+\s]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (profilePicture) {
        data.append('profile_picture', profilePicture);
      }

      await api.post('/auth/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/login');
    } catch (err) {
      const errorData =
        err.response?.data?.error || err.message || 'Registration failed';
      setError(
        typeof errorData === 'object' ? JSON.stringify(errorData) : errorData,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 my-4">
          {/* Logo */}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="DiaMonitor Logo"
              className="h-10 w-auto"
            />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-gray-500 text-lg">
              Start monitoring your glucose levels today.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="error"
              className="animate-in fade-in slide-in-from-top-2">
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Picture Upload */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer">
                <div
                  className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${previewUrl ? 'border-primary-500 shadow-md ring-2 ring-primary-100' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-primary-500 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-medium">Upload Photo</span>
                    </div>
                  )}
                  {previewUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                      <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                        Change
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="National ID"
                type="text"
                name="national_id"
                placeholder="Unique National ID"
                value={formData.national_id}
                onChange={handleChange}
                required
                className="mb-0"
              />
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mb-0"
              />
            </div>

            <FormInput
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="mb-0"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="+966 XX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mb-0"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[0.7rem]">
                  Gender
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input appearance-none bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[0.7rem]">
                Diabetes Type
              </label>
              <div className="relative">
                <select
                  name="diabetes_type"
                  value={formData.diabetes_type}
                  onChange={handleChange}
                  className="input appearance-none bg-white">
                  <option value="Type 1">Type 1 Diabetes</option>
                  <option value="Type 2">Type 2 Diabetes</option>
                  <option value="Gestational">Gestational Diabetes</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mb-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mb-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-6 shadow-lg shadow-primary-500/20">
              Create Account
            </Button>
          </form>

          <p className="text-center text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600 to-primary-900 opacity-90"></div>
        <img
          src="https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Medical Research"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />

        <div className="relative z-10 flex flex-col justify-center px-16 h-full text-white max-w-2xl">
          <h2 className="text-4xl font-bold mb-10 font-display leading-tight">
            Take control of your diabetes management journey
          </h2>
          <ul className="space-y-6">
            {[
              'Real-time glucose tracking & analytics',
              'Direct secure messaging with your doctor',
              'Personalized treatment plans',
              'Critical alerts and emergency notifications',
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-4 text-lg font-medium text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shrink-0">
                  <Check className="w-4 h-4 text-primary-200" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
