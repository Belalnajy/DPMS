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

  useEffect(() => {
    api
      .get(`/doctors/patients/${id}`)
      .then((res) => {
        setPatient(res.data);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load patient details');
        setLoading(false);
      });
  }, [id, refresh]);

  // Get status info
  const getStatusInfo = (value, mealType) => {
    const isAfter = mealType?.includes('after');
    if (!isAfter) {
      if (value < 70) return { label: 'Low', variant: 'low' };
      if (value <= 180) return { label: 'Normal', variant: 'normal' };
      return { label: 'High', variant: 'high' };
    } else {
      if (value < 100) return { label: 'Low', variant: 'low' };
      if (value <= 220) return { label: 'Normal', variant: 'normal' };
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

  // Handle message send
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!messageForm.message.trim()) return;
    try {
      await api.post(`/doctors/patients/${id}/messages`, {
        doctor_id: user.id,
        message: messageForm.message,
        is_urgent: messageForm.is_urgent,
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
    <DashboardLayout>
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
        {latestStatus && (
          <div className="flex flex-col items-end">
            <div className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide text-[0.7rem]">
              Current Status
            </div>
            <Badge variant={latestStatus.variant} className="text-lg px-5 py-2">
              {latestReading?.value} mg/dL • {latestStatus.label}
            </Badge>
          </div>
        )}
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

      {/* Chart and Treatment */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Glucose Trend Chart */}
        <Card className="xl:col-span-2 flex flex-col h-[500px]">
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

        {/* Update Treatment Plan */}
        <Card>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Treatment Plan</h3>
          </div>

          {treatmentSuccess && (
            <Alert variant="success" className="mb-4">
              Treatment plan updated successfully!
            </Alert>
          )}
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
      </div>

      {/* Send Message and Recent Readings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Send Message */}
        <div className="space-y-8">
          {/* Send Message */}
          <Card className="h-fit">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Send Message</h3>
            </div>

            {messageSuccess && (
              <Alert variant="success" className="mb-4">
                Message sent successfully!
              </Alert>
            )}
            <form onSubmit={handleMessageSubmit}>
              <div className="mb-4">
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="Type your message to the patient..."
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({ ...messageForm, message: e.target.value })
                  }
                  required
                />
              </div>
              <label className="flex items-center gap-3 mb-6 cursor-pointer p-3 rounded-lg border border-transparent hover:bg-red-50 hover:border-red-100 transition-colors">
                <input
                  type="checkbox"
                  checked={messageForm.is_urgent}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      is_urgent: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span
                  className={`text-sm font-medium ${messageForm.is_urgent ? 'text-red-700' : 'text-gray-700'}`}>
                  Mark as high priority / urgent alert
                </span>
              </label>
              <Button
                type="submit"
                fullWidth
                variant={messageForm.is_urgent ? 'danger' : 'primary'}
                className="gap-2">
                <Send className="w-4 h-4" />
                {messageForm.is_urgent ? 'Send Urgent Alert' : 'Send Message'}
              </Button>
            </form>
          </Card>

          {/* Patient Notes */}
          <Card className="max-h-[400px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Patient Inquiries
              </h3>
            </div>

            {notes?.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                        {note.week}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notes submitted.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Readings List */}
        <Card className="xl:col-span-2">
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
                            <Badge variant={status.variant} className="text-xs">
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
    </DashboardLayout>
  );
};

export default DoctorPatientDetails;
