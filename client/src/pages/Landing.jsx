/**
 * Landing Page
 * Premium medical-themed landing page with Tailwind CSS
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
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation - Glassmorphism Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              DiaMonitor
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/register">
              <Button className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Elegant Mesh Gradient Background */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/40 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-primary-100 shadow-sm">
                <Hospital className="w-3.5 h-3.5" />
                <span>Trusted by 500+ Healthcare Providers</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight">
                Advanced Care for{' '}
                <span className="bg-linear-to-r from-primary-600 via-primary-500 to-emerald-500 bg-clip-text text-transparent">
                  Every Heartbeat
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
                The next generation of diabetes management. Real-time data sync,
                intelligent insights, and direct doctor interaction in one
                premium platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mt-12">
                <Link
                  to="/login?role=doctor"
                  className="group relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl hover:border-primary-200 transition-all duration-300 w-full sm:w-64 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-gray-900">
                      Medical Portal
                    </h3>
                    <p className="text-xs text-gray-400">
                      For healthcare staff
                    </p>
                  </div>
                </Link>

                <Link
                  to="/login?role=patient"
                  className="group relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 transition-all duration-300 w-full sm:w-64 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-gray-900">
                      Patient Portal
                    </h3>
                    <p className="text-xs text-gray-400">For health tracking</p>
                  </div>
                </Link>
              </div>

              {/* Stats Section with Line Separator */}
              <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-gray-100">
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    10k+
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Patients
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    500+
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Doctors
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    99.9%
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Reliability
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup - Ultra Elegant */}
            <div className="relative group animate-float lg:block hidden">
              <div className="absolute inset-0 bg-primary-500/10 blur-[60px] rounded-[3rem] group-hover:bg-primary-500/20 transition-colors"></div>
              <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl p-1 overflow-hidden relative">
                <div className="bg-gray-50/50 rounded-[2.2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-600 border border-gray-100">
                        <BarChart className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          Patient Trends
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          Live monitoring active
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Real-time
                    </div>
                  </div>

                  {/* Chart Representation */}
                  <div className="flex items-end gap-3 h-48 px-2">
                    {[45, 60, 40, 85, 55, 75, 65, 90, 70, 80].map((h, i) => (
                      <div key={i} className="flex-1 group/bar relative">
                        <div
                          className="w-full bg-linear-to-t from-primary-500 to-primary-300 rounded-t-lg transition-all duration-500 group-hover/bar:brightness-110 shadow-sm"
                          style={{ height: `${h}%` }}></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          {h + 100} mg/dL
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-tighter">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Floating Cards - High Precision */}
              <div className="absolute -left-8 top-1/2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-4 border border-white/50 flex items-center gap-3 animate-float duration-[8s]">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                    Status
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Normal Level
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 max-w-[200px] animate-float duration-[10s] border-b-4 border-b-primary-500">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Insight
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-relaxed">
                  "Your average glucose level has stabilized by 12% this week."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section - Ultra Modern */}
      <section className="bg-gray-50/50 py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Designed for precision. Built for peace of mind.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Experience a unified ecosystem where patient health data meets
              clinical expertise through seamless, secure technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {/* Main Feature - Large */}
            <div className="md:col-span-6 lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500">
                  <BarChart className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                  Real-time Health Intelligence
                </h3>
                <p className="text-gray-500 leading-relaxed text-lg mb-8">
                  Get instant tracking and deep visual trends for patient
                  glucose levels. Every reading is analyzed and synced securely
                  to the cloud.
                </p>
                <div className="flex items-center gap-2 text-primary-600 font-bold group/link cursor-pointer">
                  <span>Explore dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </div>
              </div>
              {/* Decorative graphic in card */}
              <div className="absolute right-[-20%] bottom-[-10%] opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-700">
                <Activity className="w-96 h-96" />
              </div>
            </div>

            {/* Sidebar Feature 1 */}
            <div className="md:col-span-6 lg:col-span-4 bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400 mb-6 border border-white/10">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                  Uncompromising Security
                </h3>
                <p className="text-gray-400 leading-relaxed flex-1">
                  HIPAA-compliant, end-to-end encryption for every byte of data.
                  Your privacy is our core foundation.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-primary-400" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                    Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-3 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                Urgent Alerts
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Life-saving notifications triggered by critical levels, sent
                directly to your medical team.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-3 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                Care Plans
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Personalized treatment strategies adjusted by your doctor
                remotely based on real-time data.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="md:col-span-6 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                Predictive Trends
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Advanced analytics that help predict glucose variations before
                they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Elegant & Minimal */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg shadow-primary-500/10 transition-transform group-hover:rotate-12">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">DiaMonitor</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-primary-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                Support
              </a>
            </div>
            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              © 2024 DiaMonitor. Built for care.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
