/**
 * Doctor Messages Page
 * View all sent messages and alerts
 */
import { useState, useEffect } from 'react';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Button, Alert } from '../components/ui';
import { MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
const DoctorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/doctors/messages')
      .then((res) => {
        console.log('API Response:', res.data);
        setMessages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages Center</h1>
        <p className="text-gray-500 mt-1">
          View and manage patient communications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {messages.length}
              </div>
              <div className="text-sm text-gray-500">Total Messages</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {messages.filter((m) => m.is_urgent).length}
              </div>
              <div className="text-sm text-gray-500">Urgent Alerts</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {messages.filter((m) => !m.is_urgent).length}
              </div>
              <div className="text-sm text-gray-500">Regular Messages</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          All Messages
        </h3>

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">💬</span>
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">
              Send alerts from patient details page
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg border ${
                  msg.is_urgent
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-100'
                }`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      msg.is_urgent ? 'bg-red-100' : 'bg-gray-200'
                    }`}>
                    {msg.is_urgent ? '⚠️' : '💬'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {msg.patient_name ? (
                          <>
                            To: {msg.patient_name}{' '}
                            <span className="text-gray-500 font-normal ml-1">
                              ({msg.patient_national_id})
                            </span>
                          </>
                        ) : (
                          `To: Patient #${msg.patient_id}`
                        )}
                      </span>
                      {msg.is_urgent && <Badge variant="danger">Urgent</Badge>}
                    </div>
                    <p className="text-gray-700">{msg.message}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(msg.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default DoctorMessages;
