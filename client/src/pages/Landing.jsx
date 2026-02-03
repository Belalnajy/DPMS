/**
 * Landing Page
 * Clean medical-themed landing page with Tailwind CSS
 */
import { Link } from 'react-router-dom';
import {
  Activity,
  Hospital,
  BarChart,
  Users,
  Check,
  Zap,
  ClipboardList,
  TrendingUp,
  Shield,
  ArrowRight,
  User,
  Heart,
} from 'lucide-react';
import { Button } from '../components/ui';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="DiaMonitor Logo" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Hospital className="w-4 h-4" />
              <span>Trusted by 500+ Healthcare Providers</span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Smart Diabetes Management for{' '}
              <span className="text-primary-600">Better Health</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect patients and doctors in real-time. Track glucose levels,
              manage treatment plans, and get urgent alerts - all in one secure
              platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              <Link
                to="/login?role=doctor"
                className="group flex flex-col items-center justify-center p-6 bg-white border-2 border-primary-100 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 w-56 cursor-pointer text-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform mx-auto">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Doctor Login
                </h3>
              </Link>

              <Link
                to="/login?role=patient"
                className="group flex flex-col items-center justify-center p-6 bg-white border-2 border-primary-100 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 w-56 cursor-pointer text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Patient Login
                </h3>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-12 pt-8 border-t border-gray-100">
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-gray-500">Patients Monitored</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-500">Healthcare Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="bg-linear-to-br from-primary-50 to-primary-100 rounded-3xl p-8 relative">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                  <BarChart className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Glucose Trends
                  </div>
                  <div className="text-sm text-gray-500">Last 7 days</div>
                </div>
              </div>
              {/* Simple chart representation */}
              <div className="flex items-end gap-2 h-32">
                {[65, 80, 45, 90, 70, 85, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary-200 rounded-t"
                    style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-4 bottom-20 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Normal Level
                </div>
                <div className="text-xs text-gray-500">120 mg/dL</div>
              </div>
            </div>

            <div className="absolute -right-4 top-20 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Dr. Connected
                </div>
                <div className="text-xs text-gray-500">Real-time sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for diabetes management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for patients and healthcare providers to work
              together effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart,
                title: 'Real-time Monitoring',
                description:
                  'Track glucose levels throughout the day with instant reporting and visual trends.',
              },
              {
                icon: Users,
                title: 'Doctor Dashboard',
                description:
                  'Healthcare providers get a complete view of all patients with critical alerts.',
              },
              {
                icon: Zap,
                title: 'Urgent Alerts',
                description:
                  'Automatic notifications for critical readings that require immediate attention.',
              },
              {
                icon: ClipboardList,
                title: 'Treatment Plans',
                description:
                  'Doctors can adjust insulin dosages and medication plans remotely.',
              },
              {
                icon: TrendingUp,
                title: 'Weekly Reports',
                description:
                  'Comprehensive weekly summaries with average levels and trends analysis.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description:
                  'HIPAA-compliant platform with end-to-end encryption for all health data.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of patients and doctors already using DiaMonitor.
          </p>
          <Link to="/register">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="DiaMonitor Logo" className="h-8 w-auto" />
          </div>
          <div className="text-gray-500 text-sm">
            © 2024 DiaMonitor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
