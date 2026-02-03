/**
 * Login Page
 * Clean medical dashboard login with Tailwind CSS
 */
import { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Button, FormInput, Alert } from '../components/ui';
import { Eye, EyeOff, Heart, User, Activity } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        national_id: nationalId,
        password,
      });

      // Optional: Check if the logged-in user matches the selected role
      if (res.data.user.role !== role) {
        // You might want to warn them, but for now let's just log them in
        // or specific requirement: "make login separate".
        // The backend auth is unified, so we just redirect correctly.
      }

      login(res.data.token, res.data.user);

      if (res.data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      const errorData =
        err.response?.data?.error || err.message || 'Login failed';
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
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img
              src="/logo.svg"
              alt="DiaMonitor Logo"
              className="h-12 w-auto"
            />
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4 capitalize">
              {role === 'doctor' ? (
                <Activity className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {role} Portal
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-gray-500 text-lg">
              Securely access your {role} dashboard.
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="National ID"
              type="text"
              placeholder="Enter your ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              className="mb-0" // Remove default mb-5 from FormInput if space-y handles it, or keep it. Let's rely on FormInput's internal spacing but space-y helps container gap. Actually FormInput has mb-5.
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide text-[0.7rem]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600 transition-colors">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-4 shadow-lg shadow-primary-500/20">
              Sign In
            </Button>
          </form>

          <p className="text-center text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600 to-primary-900 opacity-90"></div>
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Medical Dashboard"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />

        <div className="relative z-10 flex flex-col justify-center px-16 h-full text-white max-w-2xl">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-12 backdrop-blur-sm border border-white/10">
            <Heart className="text-primary-200 w-8 h-8 fill-primary-200/20" />
          </div>
          <blockquote className="text-3xl font-medium leading-relaxed mb-12 font-display">
            "This platform has revolutionized how I track my glucose levels. My
            doctor and I are finally on the same page."
          </blockquote>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10">
              <User className="text-white w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-lg">Elena Rodriguez</div>
              <div className="text-primary-200 font-medium opacity-80">
                Type 1 Patient since 2018
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
