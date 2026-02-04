/**
 * PatientDashboard
 * Main dashboard for patients to view their health data and log readings
 */
import { useState, useEffect, useContext } from 'react';
import {
  Droplets,
  Activity,
  ClipboardList,
  MessageCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Utensils,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Button, Alert, FormInput } from '../components/ui';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  // Form states
  const [readingForm, setReadingForm] = useState({
    value: '',
    meal_type: 'before_breakfast',
  });
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    setError(null);
    api
      .get(`/patients/${user.id}/dashboard`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError('Patient profile not found. Your session may be invalid.');
        } else {
          setError('Failed to load dashboard. Please try again.');
        }
        setLoading(false);
      });
  }, [user, refresh]);

  // Get status based on glucose value (User specific rules)
  const getStatusInfo = (value, mealType) => {
    let targets = {
      fastingMin: 70,
      fastingMax: 180,
      postMealMin: 100,
      postMealMax: 220,
    };

    if (data?.patient?.settings) {
      try {
        const parsed = JSON.parse(data.patient.settings);
        if (parsed.glucoseTargets) {
          targets = { ...targets, ...parsed.glucoseTargets };
        }
      } catch (e) {
        // ignore
      }
    }

    const isAfter = mealType?.includes('after');
    if (!isAfter) {
      if (value < targets.fastingMin) return { label: 'Low', variant: 'low' }; // Yellow
      if (value <= targets.fastingMax)
        return { label: 'Normal', variant: 'normal' }; // Green
      return { label: 'High', variant: 'high' }; // Red
    } else {
      if (value < targets.postMealMin) return { label: 'Low', variant: 'low' }; // Yellow
      if (value <= targets.postMealMax)
        return { label: 'Normal', variant: 'normal' }; // Green
      return { label: 'High', variant: 'high' }; // Red
    }
  };

  // Handle reading submission
  const handleReadingSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const glucoseValue = parseInt(readingForm.value, 10);
    if (!readingForm.value || isNaN(glucoseValue)) {
      setSubmitError('Please enter a valid glucose value');
      return;
    }
    if (glucoseValue < 0 || glucoseValue > 700) {
      setSubmitError('Glucose value must be between 0 and 700 mg/dL');
      return;
    }

    try {
      await api.post(`/patients/${user.id}/readings`, {
        value: glucoseValue,
        meal_type: readingForm.meal_type,
        date: new Date().toISOString(),
      });
      setReadingForm({ ...readingForm, value: '' }); // Keep meal type
      setSubmitSuccess('Reading added successfully!');
      setRefresh((prev) => prev + 1);
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to add reading');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/patients/${user.id}/messages/send`, {
        message: newMessage,
      });

      toast.success('Message sent to Dr. Ayman');
      setNewMessage('');
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

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
                onClick={() => setRefresh((prev) => prev + 1)}>
                Retry Connection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                Logout
              </Button>
            </div>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const { patient, treatmentPlan, messages, readings, unreadCount } = data;
  const latestReading = readings?.[0];
  const latestStatus = latestReading
    ? getStatusInfo(latestReading.value, latestReading.meal_type)
    : null;

  // Calculate stats
  const avgGlucose = readings?.length
    ? Math.round(readings.reduce((a, b) => a + b.value, 0) / readings.length)
    : 0;

  // Calculate today's stats
  const today = new Date().toDateString();
  const todayReadings =
    readings?.filter((r) => new Date(r.date).toDateString() === today) || [];

  const todayAvg = todayReadings.length
    ? Math.round(
        todayReadings.reduce((a, b) => a + b.value, 0) / todayReadings.length,
      )
    : null;

  const highestToday = todayReadings.length
    ? todayReadings.reduce(
        (max, r) => (r.value > max.value ? r : max),
        todayReadings[0],
      )
    : null;

  const lowestToday = todayReadings.length
    ? todayReadings.reduce(
        (min, r) => (r.value < min.value ? r : min),
        todayReadings[0],
      )
    : null;

  return (
    <DashboardLayout unreadCount={unreadCount || 0}>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            Welcome back,{' '}
            <span className="font-semibold text-gray-700">{patient?.name}</span>
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

      {/* Medical Recommendations */}
      {messages?.filter((m) => m.type === 'recommendation')?.length > 0 ? (
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Latest Medical Recommendations
            </h3>
          </div>
          {messages
            .filter((m) => m.type === 'recommendation')
            .slice(0, 2)
            .map((rec) => (
              <Alert
                key={rec.id}
                variant="warning"
                title="Doctor's Advice"
                className="shadow-sm border-amber-100 bg-amber-50/50">
                <div className="flex flex-col gap-1">
                  <span className="text-amber-900 font-medium">
                    {rec.message}
                  </span>
                  <span className="text-[0.65rem] text-amber-600 font-mono">
                    {new Date(rec.date).toLocaleString()}
                  </span>
                </div>
              </Alert>
            ))}
        </div>
      ) : null}

      {/* Urgent Messages (non-recommendation) */}
      {messages?.filter((m) => m.is_urgent && m.type !== 'recommendation')
        ?.length > 0 ? (
        <Alert
          variant="error"
          title="Important Medical Alert"
          className="mb-8 shadow-md border-red-100">
          {
            messages.filter(
              (m) => m.is_urgent && m.type !== 'recommendation',
            )[0].message
          }
        </Alert>
      ) : null}

      {/* Stats Cards ... (omitted for brevity, but I need to include them in the replace) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Droplets className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium text-sm">
              Latest Reading
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {latestReading?.value || '—'}{' '}
            <span className="text-base font-medium text-gray-400">mg/dL</span>
          </div>
          <div className="flex items-center gap-2 h-6">
            {latestStatus ? (
              <Badge variant={latestStatus.variant}>
                {latestStatus.label} Level
              </Badge>
            ) : (
              <span className="text-sm text-gray-400">No data today</span>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium text-sm">
              Today's Average
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {todayAvg || '—'}
            {todayAvg ? (
              <span className="text-base font-medium text-gray-400 ml-1">
                mg/dL
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 h-6">
            {todayAvg ? (
              <span className="text-sm text-gray-500">
                {todayReadings.length} reading
                {todayReadings.length !== 1 ? 's' : ''} today
              </span>
            ) : (
              <span className="text-sm text-gray-400">No data today</span>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium text-sm">
              Highest Today
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                highestToday && highestToday.value > 180
                  ? 'bg-red-50 text-red-600'
                  : 'bg-orange-50 text-orange-600'
              }`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {highestToday?.value || '—'}
            {highestToday ? (
              <span className="text-base font-medium text-gray-400 ml-1">
                mg/dL
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 h-6">
            {highestToday ? (
              <span className="text-sm text-gray-500 font-mono">
                {new Date(highestToday.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No data today</span>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageCircle className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium text-sm">Messages</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            {messages?.filter((m) => !m.is_read).length || 0}
          </div>
          <div className="flex items-center gap-2 h-6">
            <span className="text-sm text-gray-500">Unread messages</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Log New Reading */}
          <Card>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Log New Reading
                </h3>
                <p className="text-sm text-gray-500">
                  Keep track of your glucose levels
                </p>
              </div>
            </div>

            {submitError && (
              <Alert variant="error" className="mb-6">
                {submitError}
              </Alert>
            )}
            {submitSuccess && (
              <Alert variant="success" className="mb-6">
                {submitSuccess}
              </Alert>
            )}

            <form onSubmit={handleReadingSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FormInput
                    label="Glucose Level (mg/dL)"
                    type="number"
                    min="0"
                    max="700"
                    placeholder="e.g. 110"
                    value={readingForm.value}
                    onChange={(e) =>
                      setReadingForm({ ...readingForm, value: e.target.value })
                    }
                    className="mb-0" // Controlled manually
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide text-[0.7rem]">
                    Meal Type
                  </label>
                  <div className="relative">
                    <select
                      value={readingForm.meal_type}
                      onChange={(e) =>
                        setReadingForm({
                          ...readingForm,
                          meal_type: e.target.value,
                        })
                      }
                      className="input appearance-none bg-white">
                      <option value="before_breakfast">Before Breakfast</option>
                      <option value="after_breakfast">After Breakfast</option>
                      <option value="before_lunch">Before Lunch</option>
                      <option value="after_lunch">After Lunch</option>
                      <option value="before_dinner">Before Dinner</option>
                      <option value="after_dinner">After Dinner</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="shadow-lg shadow-primary-500/20">
                  Add Reading
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Readings Table */}
          <Card className="overflow-hidden p-0">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Recent History
              </h3>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </div>

            {readings?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Context</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {readings.slice(0, 5).map((reading) => {
                      const status = getStatusInfo(
                        reading.value,
                        reading.meal_type,
                      );
                      return (
                        <tr
                          key={reading.id}
                          className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">
                              {reading.value}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">
                              mg/dL
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 capitalize">
                            {reading.meal_type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500 font-mono text-sm">
                            {new Date(reading.date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p>No readings recorded yet.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Treatment Plan */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Treatment Plan
              </h3>
            </div>

            {treatmentPlan ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Insulin Regimen (Units)
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Breakfast</span>
                      <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100">
                        {treatmentPlan.breakfast_insulin || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Lunch</span>
                      <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100">
                        {treatmentPlan.lunch_insulin || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Dinner</span>
                      <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100">
                        {treatmentPlan.dinner_insulin || 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center text-sm">
                      <span className="text-gray-900 font-medium">
                        Long-acting
                      </span>
                      <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                        {treatmentPlan.long_acting_insulin || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Medication
                  </div>
                  <div className="text-sm font-medium text-gray-900 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                    {treatmentPlan.medication || 'No medication set'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Dietary Goals
                  </div>
                  <div className="text-sm text-gray-600 bg-green-50/50 border border-green-100 p-3 rounded-lg leading-relaxed">
                    {treatmentPlan.diet_recommendations ||
                      'No specific recommendations'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p>No treatment plan assigned yet.</p>
              </div>
            )}
          </Card>

          {/* Recent Messages from Doctor */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Doctor Chat</h3>
              </div>
              {unreadCount > 0 ? (
                <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full animate-pulse">
                  <span className="font-bold text-sm">{unreadCount}</span>
                  <span className="text-xs">New</span>
                </div>
              ) : null}
            </div>

            {messages?.filter((m) => m.type !== 'recommendation')?.length >
            0 ? (
              <div className="space-y-4">
                {messages
                  .filter((m) => m.type !== 'recommendation')
                  .slice(0, 3)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border transition-all ${
                        msg.is_urgent
                          ? 'bg-red-50 border-red-200 shadow-sm'
                          : 'bg-gray-50 border-gray-100'
                      }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          Dr. Ayman
                        </span>
                        {Boolean(msg.is_urgent) ? (
                          <Badge variant="danger" className="text-[0.6rem]">
                            URGENT
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {msg.message}
                      </p>
                      <div className="text-[0.65rem] text-gray-400 mt-1 font-mono">
                        {new Date(msg.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                {/* Quick Reply Form */}
                <div className="pt-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-[80px]"
                      placeholder="Type a quick reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                      disabled={sending}
                    />
                    <div className="flex items-center justify-between">
                      <Link
                        to="/patient/messages"
                        className="text-[0.7rem] text-primary-600 font-bold hover:underline">
                        View Chat History
                      </Link>
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-primary-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 hover:bg-primary-700 transition-colors disabled:bg-gray-300">
                        <Send className="w-3 h-3" />
                        {sending ? '...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No messages yet</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-[80px]"
                      placeholder="Start a conversation..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="w-full bg-primary-600 text-white rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors disabled:bg-gray-300">
                      <Send className="w-4 h-4" />
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-indigo-50 border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-indigo-900">
                Inquiry History
              </h3>
            </div>
            <p className="text-xs text-indigo-700 mb-4">
              View your previous questions and observations sent to the doctor.
            </p>
            <Link to="/patient/logbook">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                View All Inquiries
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
