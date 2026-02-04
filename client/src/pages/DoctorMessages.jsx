/**
 * Doctor Messages Page
 * Conversation-style messaging with patient list sidebar
 */
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge } from '../components/ui';
import {
  MessageSquare,
  AlertTriangle,
  User,
  Search,
  Send,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DoctorMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedPatient?.messages]);

  const recommendations = [
    'Urgent Hospital Visit Required',
    'Follow treatment plan strictly',
    'Increase water intake',
    'Reduce carbohydrate consumption',
    'Schedule a follow-up appointment',
  ];

  useEffect(() => {
    // Fetch all messages
    api
      .get('/doctors/messages')
      .then((res) => {
        setMessages(res.data);

        // Group messages by patient
        const patientMap = new Map();
        res.data.forEach((msg) => {
          const patientId = msg.patient_id;
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              name: msg.patient_name || `Patient #${patientId}`,
              nationalId: msg.patient_national_id,
              messages: [],
              lastMessage: msg,
              unreadCount: 0,
            });
          }
          patientMap.get(patientId).messages.push(msg);
        });

        // Convert to array and sort by latest message
        const patientsArray = Array.from(patientMap.values()).sort(
          (a, b) => new Date(b.lastMessage.date) - new Date(a.lastMessage.date),
        );

        setPatients(patientsArray);

        // Auto-select first patient if available
        if (patientsArray.length > 0) {
          setSelectedPatient(patientsArray[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nationalId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Global unread count for doctor
  const unreadCount = messages.filter(
    (m) => !m.is_read && m.sender_id === m.patient_id,
  ).length;

  // Mark as read when selectedPatient changes
  useEffect(() => {
    if (selectedPatient && user) {
      const hasUnread = selectedPatient.messages.some(
        (m) => !m.is_read && m.sender_id === selectedPatient.id,
      );

      if (hasUnread) {
        api
          .put(`/doctors/patients/${selectedPatient.id}/messages/read`)
          .then(() => {
            const updateMsgs = (msgs) =>
              msgs.map((m) =>
                m.patient_id === selectedPatient.id &&
                m.sender_id === selectedPatient.id
                  ? { ...m, is_read: true }
                  : m,
              );

            setMessages((prev) => updateMsgs(prev));
            setPatients((prev) =>
              prev.map((p) =>
                p.id === selectedPatient.id
                  ? { ...p, messages: updateMsgs(p.messages) }
                  : p,
              ),
            );
            setSelectedPatient((prev) => ({
              ...prev,
              messages: updateMsgs(prev.messages),
            }));
          })
          .catch((err) => console.error('Failed to mark read:', err));
      }
    }
  }, [selectedPatient?.id, user?.id]);

  const urgentCount = messages.filter((m) => m.is_urgent).length;

  const handleSendMessage = async (
    e,
    forcedMessage = null,
    forcedType = 'chat',
  ) => {
    if (e) e.preventDefault();
    if (!forcedMessage && !newMessage.trim()) return;
    if (!selectedPatient) return;

    const finalMessage = forcedMessage || newMessage;
    const messageType = forcedType || 'chat';

    setSending(true);
    try {
      await api.post(`/doctors/patients/${selectedPatient.id}/messages`, {
        doctor_id: user?.id || 1,
        message: finalMessage,
        is_urgent: messageType === 'recommendation' ? true : isUrgent,
        type: messageType,
      });

      toast.success(
        isUrgent ? 'Urgent alert sent!' : 'Message sent successfully',
      );
      setNewMessage('');
      setIsUrgent(false);

      // Refresh messages
      const res = await api.get('/doctors/messages');
      setMessages(res.data);

      // Update patient messages
      const updatedPatient = patients.find((p) => p.id === selectedPatient.id);
      if (updatedPatient) {
        updatedPatient.messages = res.data.filter(
          (m) => m.patient_id === selectedPatient.id,
        );
        setSelectedPatient({ ...updatedPatient });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout unreadCount={0}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)] overflow-hidden">
        {/* Header - Fixed Height */}
        <div className="mb-4 shrink-0 px-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-500 text-sm">
                Patient communications and alerts
              </p>
            </div>
            <div className="flex gap-4">
              <Badge variant="default" className="bg-white border text-xs">
                {patients.length} Patients
              </Badge>
              <Badge variant="danger" className="text-xs">
                {urgentCount} Urgent
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Messaging Interface */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 px-2 pb-2">
          {/* Patient List Sidebar */}
          <div className="hidden lg:flex lg:col-span-4 h-full flex-col min-h-0">
            <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-sm border-gray-100 min-h-0 bg-white">
              <div className="p-4 border-b border-gray-100 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <span className="text-4xl block mb-3">💬</span>
                    <p className="text-gray-500 text-sm">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const hasUrgentMessage = patient.messages.some(
                      (m) => m.is_urgent,
                    );
                    const isSelected = selectedPatient?.id === patient.id;

                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          isSelected
                            ? 'bg-primary-50 border-l-4 border-primary-500'
                            : ''
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {patient.name}
                              </h4>
                              {hasUrgentMessage && (
                                <Badge
                                  variant="danger"
                                  className="text-[0.6rem] px-1.5 py-0.5 shrink-0">
                                  URGENT
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {patient.lastMessage.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[0.65rem] text-gray-400">
                                {new Date(
                                  patient.lastMessage.date,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-[0.65rem] text-gray-500">
                                {patient.messages.length} msg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Conversation Thread */}
          <div className="col-span-12 lg:col-span-8 h-full flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-lg border-gray-100 min-h-0 bg-white">
              {selectedPatient ? (
                <>
                  {/* Conversation Header */}
                  <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {selectedPatient.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.65rem] text-gray-500 font-medium">
                          ID: {selectedPatient.nationalId || selectedPatient.id}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="default" className="text-xs">
                        {selectedPatient.messages.length} messages
                      </Badge>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto space-y-4 bg-gray-50/30 custom-scrollbar">
                    {selectedPatient.messages
                      .slice()
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((msg) => {
                        const isFromDoctor = Boolean(
                          msg.sender_id && user?.id
                            ? msg.sender_id === user.id
                            : msg.type === 'recommendation' ||
                                msg.is_urgent ||
                                msg.is_read ||
                                (user && msg.doctor_id === user.id),
                        );

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isFromDoctor ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                msg.type === 'recommendation'
                                  ? 'bg-amber-100 border border-amber-200 text-amber-900'
                                  : isFromDoctor
                                    ? msg.is_urgent
                                      ? 'bg-red-500 text-white border-2 border-red-300'
                                      : 'bg-primary-600 text-white'
                                    : 'bg-white border border-gray-100 text-gray-900'
                              }`}>
                              {msg.type === 'recommendation' ? (
                                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-amber-200">
                                  <Activity className="w-3.5 h-3.5" />
                                  <span className="text-[0.6rem] font-bold uppercase tracking-wider">
                                    Recommendation
                                  </span>
                                </div>
                              ) : null}
                              {isFromDoctor &&
                              Boolean(msg.is_urgent) &&
                              msg.type !== 'recommendation' ? (
                                <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-red-400">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span className="text-[0.6rem] font-bold uppercase tracking-wider">
                                    Urgent Alert
                                  </span>
                                </div>
                              ) : null}
                              {!isFromDoctor ? (
                                <div className="flex items-center gap-1.5 mb-1 text-[0.6rem] font-bold uppercase text-primary-600">
                                  Patient Message
                                </div>
                              ) : null}
                              <p className="text-sm leading-relaxed mb-1">
                                {msg.message}
                              </p>
                              <div
                                className={`text-[0.6rem] ${
                                  isFromDoctor
                                    ? 'text-white/70 text-right'
                                    : 'text-gray-400'
                                }`}>
                                {new Date(msg.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input - Fixed at bottom of Card */}
                  <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                    <div className="mb-3">
                      <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                        Quick Recommendations
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recommendations.map((rec) => (
                          <button
                            key={rec}
                            type="button"
                            onClick={() =>
                              handleSendMessage(null, rec, 'recommendation')
                            }
                            className="text-[0.65rem] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-md hover:bg-amber-100 transition-colors font-semibold">
                            {rec}
                          </button>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <textarea
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none min-h-[44px] max-h-[100px]"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          disabled={sending}
                          rows="1"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="bg-primary-600 text-white rounded-xl px-4 flex items-center justify-center hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 disabled:grayscale disabled:opacity-50 disabled:shadow-none shrink-0 h-[44px]">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="urgent"
                          checked={isUrgent}
                          onChange={(e) => setIsUrgent(e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label
                          htmlFor="urgent"
                          className="text-xs text-gray-700 cursor-pointer flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          Mark as urgent
                        </label>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-gray-100 inline-block">
                      <MessageSquare className="w-12 h-12 opacity-20 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a Patient
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Choose a patient from the list to view the conversation
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorMessages;
