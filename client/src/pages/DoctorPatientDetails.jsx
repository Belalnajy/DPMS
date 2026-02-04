/**
 * Doctor Patient Details Page
 * Detailed view of a specific patient with glucose trends and treatment management
 */
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  Droplets,
  User,
  ArrowLeft,
  Calendar,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  Save,
  Send,
  Pill,
  Syringe,
  FileText,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Button, Alert, FormInput } from '../components/ui';
import { Line } from 'react-chartjs-2';
import { getProfilePictureUrl } from '../utils/imageUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DoctorPatientDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Treatment form
  const [treatmentForm, setTreatmentForm] = useState({
    breakfast_insulin: '',
    lunch_insulin: '',
    dinner_insulin: '',
    long_acting_insulin: '',
    medication: '',
    diet_recommendations: '',
  });
  const [treatmentSuccess, setTreatmentSuccess] = useState(false);

  // Message form
  const [messageForm, setMessageForm] = useState({
    message: '',
    is_urgent: false,
  });
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'inquiry'

  // Glucose Targets management
  const [targets, setTargets] = useState({
    fastingMin: 70,
    fastingMax: 180,
    postMealMin: 100,
    postMealMax: 220,
  });
  const [targetsSuccess, setTargetsSuccess] = useState(false);

  const recommendations = [
    'Urgent Hospital Visit Required',
    'Follow treatment plan strictly',
    'Increase water intake',
    'Reduce carbohydrate consumption',
    'Schedule a follow-up appointment',
  ];

  useEffect(() => {
    api
      .get(`/doctors/patients/${id}`)
      .then((res) => {
        setPatient(res.data);
        setUnreadCount(res.data.unreadCount || 0);

        // Mark as read if there are unread messages from this patient
        const hasUnread = res.data.messages?.some(
          (m) => !m.is_read && m.sender_id === parseInt(id),
        );

        if (hasUnread) {
          api
            .put(`/doctors/patients/${id}/messages/read`)
            .then(() => {
              // Optionally refresh to update local count, but we already have the count from API
              // For better UX, we could decrement unreadCount locally if we were sure it only counted this patient,
              // but it's a global count. So we just mark as read on backend.
            })
            .catch((err) => console.error('Failed to mark read:', err));
        }

        if (res.data.treatmentPlan) {
          setTreatmentForm({
            breakfast_insulin: res.data.treatmentPlan.breakfast_insulin || '',
            lunch_insulin: res.data.treatmentPlan.lunch_insulin || '',
            dinner_insulin: res.data.treatmentPlan.dinner_insulin || '',
            long_acting_insulin:
              res.data.treatmentPlan.long_acting_insulin || '',
            medication: res.data.treatmentPlan.medication || '',
            diet_recommendations:
              res.data.treatmentPlan.diet_recommendations || '',
          });
        }

        // Parse patient settings for targets
        if (res.data.user && res.data.user.settings) {
          try {
            const parsed = JSON.parse(res.data.user.settings);
            if (parsed.glucoseTargets) {
              setTargets(parsed.glucoseTargets);
            }
          } catch (e) {
            console.error('Error parsing settings', e);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load patient details');
        setLoading(false);
      });
  }, [id, refresh]);

  // Get status info using patient-specific targets
  const getStatusInfo = (value, mealType) => {
    const isAfter = mealType?.includes('after');
    if (!isAfter) {
      if (value < targets.fastingMin) return { label: 'Low', variant: 'low' };
      if (value <= targets.fastingMax)
        return { label: 'Normal', variant: 'normal' };
      return { label: 'High', variant: 'high' };
    } else {
      if (value < targets.postMealMin) return { label: 'Low', variant: 'low' };
      if (value <= targets.postMealMax)
        return { label: 'Normal', variant: 'normal' };
      return { label: 'High', variant: 'high' };
    }
  };

  // Handle treatment update
  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/doctors/patients/${id}/treatment`, treatmentForm);
      setTreatmentSuccess(true);
      setTimeout(() => setTreatmentSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle targets update
  const handleTargetsSave = async () => {
    try {
      const settings = JSON.stringify({ glucoseTargets: targets });
      await api.put(`/doctors/patients/${id}/settings`, { settings });
      setTargetsSuccess(true);
      setTimeout(() => setTargetsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save targets', err);
      alert('Failed to save glucose targets');
    }
  };

  // Handle message send
  const handleMessageSubmit = async (
    e,
    forcedMessage = null,
    forcedType = 'chat',
  ) => {
    if (e) e.preventDefault();
    const finalMessage = forcedMessage || messageForm.message;
    if (!finalMessage.trim()) return;

    try {
      await api.post(`/doctors/patients/${id}/messages`, {
        doctor_id: user.id,
        message: finalMessage,
        is_urgent:
          forcedType === 'recommendation' ? true : messageForm.is_urgent,
        type: forcedType,
      });
      setMessageForm({ message: '', is_urgent: false });
      setMessageSuccess(true);
      setRefresh((prev) => prev + 1);
      setTimeout(() => setMessageSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading patient details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12">
          <Alert variant="error">{error}</Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { user: info, readings, treatmentPlan, messages, notes } = patient;
  const latestReading = readings?.[0];
  const latestStatus = latestReading
    ? getStatusInfo(latestReading.value, latestReading.meal_type)
    : null;

  // Chart data
  const chartData = {
    labels:
      readings
        ?.slice(0, 14)
        .reverse()
        .map((r) =>
          new Date(r.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        ) || [],
    datasets: [
      {
        label: 'Glucose Level',
        data:
          readings
            ?.slice(0, 14)
            .reverse()
            .map((r) => r.value) || [],
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(20, 184, 166, 0.2)');
          gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');
          return gradient;
        },
        borderColor: 'rgb(20, 184, 166)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(255, 255, 255)',
        pointBorderColor: 'rgb(20, 184, 166)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 350,
        grid: { color: '#f1f5f9', borderDash: [4, 4] },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' },
      },
    },
  };

  return (
    <DashboardLayout unreadCount={unreadCount}>
      {/* Back Button */}
      <Link
        to="/doctor/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{' '}
        Back to Patient List
      </Link>

      {/* Patient Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl text-gray-400 font-semibold overflow-hidden ring-4 ring-gray-50">
            {info?.profile_picture ? (
              <img
                src={getProfilePictureUrl(info.profile_picture)}
                alt={info?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {info?.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md font-medium text-gray-700">
                <User className="w-3.5 h-3.5" /> {info?.diabetes_type}
              </span>
              <span>
                ID: <span className="font-mono">{info?.national_id}</span>
              </span>
            </div>
          </div>
        </div>
        {latestStatus ? (
          <div className="flex flex-col items-end">
            <div className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide text-[0.7rem]">
              Current Status
            </div>
            <Badge variant={latestStatus.variant} className="text-lg px-5 py-2">
              {latestReading?.value} mg/dL • {latestStatus.label}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Droplets className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Latest Reading
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {latestReading?.value || '—'}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            mg/dL
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Activity className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            7-Day Average
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {readings?.length
              ? Math.round(
                  readings.reduce((a, b) => a + b.value, 0) / readings.length,
                )
              : '—'}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            mg/dL
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <ClipboardList className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Total Readings
          </div>
          <div className="text-3xl font-bold text-primary-600 tracking-tight">
            {readings?.length || 0}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            Logged
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <MessageSquare className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Messages Sent
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {messages?.length || 0}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            To Date
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 items-start">
        {/* Left Column: Data & Trends */}
        <div className="xl:col-span-2 space-y-8">
          {/* Glucose Trend Chart */}
          <Card className="flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Glucose Trends
                </h3>
              </div>
              <select className="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-primary-500 focus:border-primary-500">
                <option>Last 14 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="flex-1 w-full min-h-0">
              {readings?.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Activity className="w-12 h-12 mb-3 stroke-1" />
                  <p>No enough data to display trends</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Readings List */}
          <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Recent Readings Log
              </h3>
            </div>

            {readings?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 top-0 sticky z-10 text-xs font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-5 py-3">Value</th>
                        <th className="px-5 py-3">Meal Context</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {readings.slice(0, 15).map((reading) => {
                        const status = getStatusInfo(
                          reading.value,
                          reading.meal_type,
                        );
                        return (
                          <tr
                            key={reading.id}
                            className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-gray-900">
                                {reading.value}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                mg/dL
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-600 text-sm capitalize">
                              {reading.meal_type.replace(/_/g, ' ')}
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                variant={status.variant}
                                className="text-xs">
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-right text-sm text-gray-500 font-mono">
                              {new Date(reading.date).toLocaleDateString()}{' '}
                              <span className="text-gray-300">|</span>{' '}
                              {new Date(reading.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <p>No readings recorded yet for this patient.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Treatment & Management */}
        <div className="xl:col-span-1 space-y-8">
          {/* Update Treatment Plan */}
          <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Treatment Plan
              </h3>
            </div>

            {treatmentSuccess ? (
              <Alert variant="success" className="mb-4">
                Treatment plan updated successfully!
              </Alert>
            ) : null}
            <form onSubmit={handleTreatmentSubmit} className="space-y-4">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Syringe className="w-4 h-4 text-primary-500" />
                  Insulin Dosage (Units)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Breakfast"
                    type="number"
                    placeholder="0"
                    value={treatmentForm.breakfast_insulin}
                    onChange={(e) =>
                      setTreatmentForm({
                        ...treatmentForm,
                        breakfast_insulin: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                  <FormInput
                    label="Lunch"
                    type="number"
                    placeholder="0"
                    value={treatmentForm.lunch_insulin}
                    onChange={(e) =>
                      setTreatmentForm({
                        ...treatmentForm,
                        lunch_insulin: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                  <FormInput
                    label="Dinner"
                    type="number"
                    placeholder="0"
                    value={treatmentForm.dinner_insulin}
                    onChange={(e) =>
                      setTreatmentForm({
                        ...treatmentForm,
                        dinner_insulin: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                  <FormInput
                    label="Long-acting"
                    type="number"
                    placeholder="0"
                    value={treatmentForm.long_acting_insulin}
                    onChange={(e) =>
                      setTreatmentForm({
                        ...treatmentForm,
                        long_acting_insulin: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormInput
                  label="Medication (Pills Dosage)"
                  placeholder="e.g., Metformin 500mg"
                  value={treatmentForm.medication}
                  onChange={(e) =>
                    setTreatmentForm({
                      ...treatmentForm,
                      medication: e.target.value,
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[0.7rem]">
                    Diet Recommendations
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Enter diet recommendations..."
                    value={treatmentForm.diet_recommendations}
                    onChange={(e) =>
                      setTreatmentForm({
                        ...treatmentForm,
                        diet_recommendations: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth className="gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Glucose Targets Management */}
          <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Glucose Targets
              </h3>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Define reference ranges for charts and status alerts.
            </p>

            {targetsSuccess && (
              <Alert variant="success" className="mb-4">
                Targets updated successfully!
              </Alert>
            )}

            <div className="space-y-6">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <label className="text-sm font-semibold text-gray-700 block text-[0.7rem] uppercase tracking-wider">
                  Target Range (Fasting)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={targets.fastingMin}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          fastingMin: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center bg-white"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">—</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={targets.fastingMax}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          fastingMax: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center bg-white"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
                <label className="text-sm font-semibold text-gray-700 block text-[0.7rem] uppercase tracking-wider">
                  Target Range (Post-meal)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={targets.postMealMin}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          postMealMin: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center bg-white"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">—</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={targets.postMealMax}
                      onChange={(e) =>
                        setTargets({
                          ...targets,
                          postMealMax: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center bg-white"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleTargetsSave} fullWidth className="gap-2">
                  <Save className="w-4 h-4" /> Save Targets
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Readings List was moved into the main grid above */}

      {/* Messaging & Conversations */}
      <div className="space-y-6">
        <Card className="h-[550px] flex flex-col p-0 overflow-hidden shadow-lg border-purple-50">
          <div className="p-0 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex w-full">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <MessageSquare className="w-4 h-4" />
                Chat History
                <Badge variant="default" className="ml-1 text-[0.6rem] px-1.5">
                  {messages?.length || 0}
                </Badge>
              </button>
              <button
                onClick={() => setActiveTab('inquiry')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'inquiry'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}>
                <FileText className="w-4 h-4" />
                Patient Inquiries
                <Badge variant="default" className="ml-1 text-[0.6rem] px-1.5">
                  {notes?.length || 0}
                </Badge>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20">
            {activeTab === 'chat' && (
              <>
                {(messages || [])
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((msg, idx) => {
                    const isFromDoctor =
                      msg.sender_id === user?.id ||
                      msg.doctor_id === user?.id ||
                      msg.type === 'recommendation';

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex ${isFromDoctor ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            msg.type === 'recommendation'
                              ? 'bg-amber-100 border border-amber-200 text-amber-900 shadow-amber-100/50'
                              : isFromDoctor
                                ? msg.is_urgent
                                  ? 'bg-red-500 text-white'
                                  : 'bg-primary-600 text-white'
                                : 'bg-white border border-gray-100 text-gray-900'
                          }`}>
                          {!isFromDoctor ? (
                            <div className="flex items-center gap-1.5 mb-1 text-[0.6rem] font-bold uppercase text-indigo-400">
                              Patient Message
                            </div>
                          ) : null}
                          {msg.type === 'recommendation' ? (
                            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-amber-200 text-[0.65rem] font-bold uppercase text-amber-700">
                              <Activity className="w-3 h-3" />
                              Doctor Recommendation
                            </div>
                          ) : null}
                          {isFromDoctor &&
                          Boolean(msg.is_urgent) &&
                          msg.type !== 'recommendation' ? (
                            <div className="flex items-center gap-1.5 mb-1 text-[0.65rem] font-bold uppercase text-red-100">
                              <AlertCircle className="w-3 h-3" />
                              Urgent Alert
                            </div>
                          ) : null}
                          <p className="text-sm leading-relaxed">
                            {msg.message}
                          </p>
                          <div
                            className={`text-[0.6rem] mt-1 text-right ${
                              isFromDoctor &&
                              msg.is_urgent &&
                              msg.type !== 'recommendation'
                                ? 'text-white/70'
                                : isFromDoctor
                                  ? 'text-primary-100/70'
                                  : 'text-gray-400'
                            }`}>
                            {new Date(msg.date).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {!messages?.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">No chat history yet.</p>
                  </div>
                ) : null}
              </>
            )}

            {activeTab === 'inquiry' && (
              <>
                {(notes || [])
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((note, idx) => (
                    <div key={note.id || idx} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm bg-white border border-gray-100 text-gray-800">
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-gray-100 text-[0.65rem] font-bold uppercase text-indigo-600">
                          <FileText className="w-3 h-3" />
                          Inquiry - {note.week}
                        </div>
                        <p className="text-sm leading-relaxed">{note.text}</p>
                        <div className="text-[0.6rem] mt-1 text-gray-400">
                          {new Date(note.date).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                {!notes?.length && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                    <FileText className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">No inquiries from patient yet.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            {messageSuccess && (
              <Alert variant="success" className="mb-3 py-2 text-xs">
                Sent successfully!
              </Alert>
            )}

            <div className="mb-4">
              <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Quick Recommendations
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() =>
                      handleMessageSubmit(null, rec, 'recommendation')
                    }
                    className="text-[0.7rem] bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors font-medium">
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleMessageSubmit} className="space-y-3">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[60px]"
                  placeholder={
                    activeTab === 'chat'
                      ? 'Type your message...'
                      : 'Reply to inquiry...'
                  }
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, message: e.target.value })
                  }
                  required
                />
                <button
                  type="submit"
                  className="h-[60px] w-[60px] bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20 disabled:bg-gray-300 disabled:shadow-none"
                  disabled={!messageForm.message.trim()}>
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent-check"
                    checked={messageForm.is_urgent}
                    onChange={(e) =>
                      setMessageForm({
                        ...messageForm,
                        is_urgent: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="urgent-check"
                    className={`text-xs font-semibold cursor-pointer ${messageForm.is_urgent ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    Mark as Urgent alert
                  </label>
                </div>
                <div className="text-[0.6rem] text-gray-400 italic">
                  * Recommendations are always marked as important for the
                  patient.
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientDetails;
