/**
 * Patient Logbook Page
 * Complete glucose reading history
 */
import { useState, useEffect, useContext } from 'react';
import {
  BookOpen,
  Calendar,
  Droplets,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Search,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge } from '../components/ui';
import toast from 'react-hot-toast';

const PatientLogbook = () => {
  const { user } = useContext(AuthContext);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/patients/${user.id}/dashboard`)
      .then((res) => {
        setReadings(res.data.readings || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const getStatusInfo = (value, meal) => {
    const isAfter = meal.includes('after');
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

  // Group readings by date
  const groupedReadings = readings.reduce((acc, reading) => {
    const date = reading.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(reading);
    return acc;
  }, {});

  // Weekly Note State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteWeek, setNoteWeek] = useState(
    new Date().toISOString().slice(0, 10),
  ); // Default to "today" as visual, or user picks week. User said "Linked to the week".
  // Let's just capture a date or text. "Inquiry or Note".

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/patients/${user.id}/notes`, {
        week: noteWeek,
        text: noteText,
      });
      setShowNoteModal(false);
      setNoteText('');
      setNoteText('');
      // Optional: show success alert
      toast.success('Note sent to doctor successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send note');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading logbook...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Weekly Inquiry / Note
            </h3>
            <form onSubmit={handleAddNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date / Week
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  value={noteWeek}
                  onChange={(e) => setNoteWeek(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Note
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 h-32"
                  placeholder="Type your question or observation here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium shadow-sm transition-colors">
                  Send Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Logbook
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            Complete history of your glucose readings
          </p>
        </div>
        <button
          onClick={() => setShowNoteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium shadow-sm transition-all">
          <BookOpen className="w-4 h-4" />
          Add Weekly Note
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Total Readings
          </div>
          <div className="text-3xl font-bold text-primary-600 tracking-tight">
            {readings.length}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            Logged
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Average Glucose
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {readings.length
              ? Math.round(
                  readings.reduce((a, b) => a + b.value, 0) / readings.length,
                )
              : 0}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            mg/dL
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowUp className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Highest Reading
          </div>
          <div className="text-3xl font-bold text-red-600 tracking-tight">
            {readings.length ? Math.max(...readings.map((r) => r.value)) : 0}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            mg/dL
          </div>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <ArrowDown className="w-20 h-20" />
          </div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            Lowest Reading
          </div>
          <div className="text-3xl font-bold text-teal-600 tracking-tight">
            {readings.length ? Math.min(...readings.map((r) => r.value)) : 0}
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase mt-1">
            mg/dL
          </div>
        </Card>
      </div>

      {/* Readings by Date */}
      <Card>
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Reading History</h3>
        </div>

        {Object.keys(groupedReadings).length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">
              No readings recorded yet.
            </p>
            <p className="text-gray-500 mt-1">
              Start logging your glucose levels from the Dashboard!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedReadings).map(([date, dayReadings]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="text-md font-bold text-gray-800 uppercase tracking-wide">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h4>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {dayReadings.length} readings
                  </span>
                </div>

                <div className="grid gap-3">
                  {dayReadings.map((r) => {
                    const status = getStatusInfo(r.value, r.meal_type);
                    return (
                      <div
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              status.variant === 'critical' ||
                              status.variant === 'high'
                                ? 'bg-red-50 text-red-600'
                                : status.variant === 'low'
                                  ? 'bg-yellow-50 text-yellow-600'
                                  : 'bg-green-50 text-green-600'
                            }`}>
                            <Droplets className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-gray-900">
                                {r.value}
                              </span>
                              <span className="text-sm font-medium text-gray-500">
                                mg/dL
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 capitalize flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              {r.meal_type.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-50">
                          <div className="text-sm text-gray-400 font-mono">
                            {new Date(r.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <Badge
                            variant={status.variant}
                            className="px-3 py-1 text-xs">
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default PatientLogbook;
