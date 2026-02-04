/**
 * Doctor Dashboard
 * Main dashboard for doctors showing patient list and stats
 */
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  BarChart2,
  TrendingUp,
  Search,
  ChevronRight,
  User,
  Heart,
  Clock,
  Filter,
  MessageCircle,
  Grid,
  LayoutList,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Button, Alert } from '../components/ui';
import { getProfilePictureUrl } from '../utils/imageUtils';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setError(null);
    // Fetch patients
    api
      .get('/doctors/patients')
      .then((res) => {
        setPatients(res.data.patients || []);
        setUnreadCount(res.data.unreadCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load patients. Please try again.');
        setLoading(false);
      });

    // Fetch messages
    api
      .get('/doctors/messages')
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
      });
  }, []);

  // Helper to get glucose status (Doctor rules)
  const getStatusInfo = (reading) => {
    if (!reading) return { label: 'No Data', variant: 'default' };
    const { value } = reading;

    if (value < 70) return { label: 'Low', variant: 'low' }; // Yellow
    if (value <= 180) return { label: 'Normal', variant: 'normal' }; // Green
    if (value <= 300) return { label: 'High', variant: 'high' }; // Orange
    return { label: 'Critical', variant: 'critical' }; // Red
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading patient data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <Alert variant="error">
            {error}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const criticalCount = patients.filter((p) => {
    const { label } = getStatusInfo(p.latestReading);
    return label === 'Critical' || label === 'Low';
  }).length;

  const totalGlucose = patients.reduce(
    (acc, p) => acc + (p.latestReading?.value || 0),
    0,
  );
  const avgGlucose = patients.length
    ? Math.round(totalGlucose / patients.length)
    : 0;

  // Calculate normal patients count
  const normalCount = patients.filter((p) => {
    const { label } = getStatusInfo(p.latestReading);
    return label === 'Normal';
  }).length;

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    if (filter === 'All') return true;
    const { label } = getStatusInfo(p.latestReading);
    if (filter === 'Critical') return label === 'Critical';
    if (filter === 'High') return label === 'High';
    if (filter === 'Warning') return label === 'Low';
    if (filter === 'Normal') return label === 'Normal';
    return true;
  });

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className="flex flex-col">
        {/* Header - Fixed */}
        <div className="mb-8 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Patient Overview
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Monitor and manage your patients' glucose levels
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-8 custom-scrollbar">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium text-sm">
                  Total Patients
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {patients.length}
              </div>
              <div className="flex items-center gap-2 h-6">
                <span className="text-sm text-gray-500">Active this month</span>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium text-sm">
                  Critical Alerts
                </span>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {criticalCount}
              </div>
              <div className="flex items-center gap-2 h-6">
                <span className="text-sm text-gray-500">Need attention</span>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart2 className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium text-sm">
                  Avg Glucose
                </span>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {avgGlucose}
              </div>
              <div className="flex items-center gap-2 h-6">
                <span className="text-sm text-gray-500">mg/dL average</span>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Heart className="w-24 h-24" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium text-sm">
                  Normal Range
                </span>
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {normalCount}
              </div>
              <div className="flex items-center gap-2 h-6">
                <span className="text-sm text-gray-500">Patients stable</span>
              </div>
            </Card>
          </div>

          {/* Patient Overview Cards */}
          <Card className="overflow-hidden p-0">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Patient Overview
                </h2>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Filter Buttons */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg overflow-x-auto">
                  {['All', 'Critical', 'High', 'Warning', 'Normal'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        filter === f
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Grid View">
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="List View">
                    <LayoutList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No patients found
                  </h3>
                  <p>Try adjusting your filters or search criteria.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPatients.map((patient) => {
                    const status = getStatusInfo(patient.latestReading);
                    const isCritical =
                      status.label === 'Critical' || status.label === 'Low';

                    // Count messages for this patient
                    const patientMessages = messages.filter(
                      (m) => m.patient_id === patient.id,
                    );
                    const messageCount = patientMessages.length;

                    return (
                      <div
                        key={patient.id}
                        className={`
                      bg-white rounded-xl border-2 p-5 shadow-sm hover:shadow-md transition-all duration-200
                      ${isCritical ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-primary-200'}
                    `}>
                        {/* Patient Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                            {patient.profile_picture ? (
                              <img
                                src={getProfilePictureUrl(
                                  patient.profile_picture,
                                )}
                                alt={patient.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-7 h-7" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                              {patient.name}
                            </h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                              {patient.diabetes_type}
                            </p>
                          </div>
                          {messageCount > 0 ? (
                            <div className="shrink-0">
                              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                                <MessageCircle className="w-3 h-3" />
                                <span>{messageCount}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Latest Reading */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Latest Glucose Reading
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-3xl font-bold text-gray-900">
                                {patient.latestReading?.value || '—'}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                mg/dL
                              </span>
                            </div>
                            <Badge variant={status.variant} className="mb-1">
                              {status.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Reading Details */}
                        <div className="flex items-center justify-between text-sm mb-4">
                          <div className="text-gray-600">
                            <span className="capitalize">
                              {patient.latestReading?.meal_type?.replace(
                                /_/g,
                                ' ',
                              ) || 'No data'}
                            </span>
                          </div>
                          <div className="text-gray-500 font-mono text-xs">
                            {patient.latestReading?.date
                              ? new Date(
                                  patient.latestReading.date,
                                ).toLocaleDateString()
                              : '—'}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link to={`/doctor/patient/${patient.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 border border-primary-100 gap-2">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // List View
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Patient</th>
                        <th className="px-6 py-4">Last Reading</th>
                        <th className="px-6 py-4">Context</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Messages</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPatients.map((patient) => {
                        const status = getStatusInfo(patient.latestReading);
                        const patientMessages = messages.filter(
                          (m) => m.patient_id === patient.id,
                        );
                        const messageCount = patientMessages.length;

                        return (
                          <tr
                            key={patient.id}
                            className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium overflow-hidden ring-2 ring-white shadow-sm">
                                  {patient.profile_picture ? (
                                    <img
                                      src={getProfilePictureUrl(
                                        patient.profile_picture,
                                      )}
                                      alt={patient.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {patient.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {patient.diabetes_type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900 text-lg">
                                {patient.latestReading?.value || '—'}
                              </span>
                              <span className="font-medium text-gray-400 text-xs ml-1">
                                mg/dL
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600 capitalize text-sm">
                                {patient.latestReading?.meal_type?.replace(
                                  /_/g,
                                  ' ',
                                ) || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {messageCount > 0 ? (
                                <div className="flex items-center gap-1.5 text-purple-700">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="font-semibold">
                                    {messageCount}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm font-mono">
                              {patient.latestReading?.date
                                ? new Date(
                                    patient.latestReading.date,
                                  ).toLocaleDateString()
                                : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/doctor/patient/${patient.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                                  View Details
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Patient Messages Preview */}
          <Card className="mt-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Messages
                </h2>
              </div>
              <Link to="/doctor/messages">
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All
                </Button>
              </Link>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No messages sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 5).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                      msg.is_urgent
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-gray-50/50 border-gray-100'
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {msg.patient_name || `Patient #${msg.patient_id}`}
                          </span>
                          {Boolean(msg.is_urgent) ? (
                            <Badge variant="danger" className="text-[0.65rem]">
                              URGENT
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {msg.message.length > 60
                            ? `${msg.message.substring(0, 60)}...`
                            : msg.message}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 font-mono whitespace-nowrap">
                        {new Date(msg.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
