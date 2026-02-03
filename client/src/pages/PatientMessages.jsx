/**
 * Patient Messages Page
 * View messages from doctor
 */
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Alert } from '../components/ui';
import { MessageSquare } from 'lucide-react';
import { User } from 'lucide-react';
const PatientMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Mark all as read immediately when viewing
    api
      .put(`/patients/${user.id}/messages/read-all`)
      .catch((err) => console.error('Failed to mark messages read', err));

    api
      .get(`/patients/${user.id}/dashboard`)
      .then((res) => {
        setMessages(res.data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const urgentMessages = messages.filter((m) => m.is_urgent);
  const regularMessages = messages.filter((m) => !m.is_urgent);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">
          Communications from your healthcare team
        </p>
      </div>

      {/* Urgent Alerts */}
      {urgentMessages.length > 0 && (
        <Card className="bg-red-50 border border-red-200 mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <span>⚠️</span> Urgent Alerts
          </h3>
          <div className="space-y-3">
            {urgentMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white p-4 rounded-lg border border-red-200">
                <div className="font-semibold text-red-700 mb-1">
                  {msg.message}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(msg.date).toLocaleDateString()} • Dr. Ayman
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Regular Messages */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Inbox</h3>

        {regularMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No messages from your doctor yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {regularMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Ayman</div>
                    <div className="text-xs text-gray-500">
                      {new Date(msg.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 ml-13">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default PatientMessages;
