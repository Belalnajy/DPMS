/**
 * Patient Messages Page
 * Conversational view for messages between patient and doctor
 */
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Alert } from '../components/ui';
import { MessageSquare, Send, User, AlertCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) return;

    // Mark all as read immediately when viewing
    api
      .put(`/patients/${user.id}/messages/read-all`)
      .catch((err) => console.error('Failed to mark messages read', err));

    fetchMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = () => {
    api
      .get(`/patients/${user.id}/dashboard`)
      .then((res) => {
        setMessages(res.data.messages || []);
        setUnreadCount(0); // View is cleared
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/patients/${user.id}/messages/send`, {
        message: newMessage,
      });

      toast.success('Message sent to your doctor!');
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout unreadCount={unreadCount}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading conversation...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout unreadCount={unreadCount}>
      <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] overflow-hidden">
        {/* Header - Ultra Compact */}
        <div className="mb-2 lg:mb-3 shrink-0 px-2 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-none">
                Health Communications
              </h1>
              <Badge
                variant="default"
                className="text-[0.6rem] px-2 py-0.5 bg-white border border-gray-100 shadow-sm">
                {messages.length} messages
              </Badge>
            </div>
            <p className="hidden md:block text-gray-500 text-xs">
              Secure chat with Dr. Ayman
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6 px-2 min-h-0">
          {/* Helper Sidebar - Hidden on small screens to save space */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 overflow-y-auto pb-4">
            <Card className="bg-primary-50 border-primary-100 border p-4 shrink-0">
              <h4 className="font-bold text-primary-900 mb-2 flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" /> Message Support
              </h4>
              <p className="text-xs text-primary-700 leading-relaxed">
                Use this chat to ask about your treatment plan, report symptoms,
                or clarify insulin dosages.
              </p>
            </Card>

            <Card className="p-4 shrink-0">
              <h4 className="font-bold text-gray-900 mb-2 text-sm">
                Medical Team
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-800">Dr. Ayman</p>
                  <p className="text-[0.65rem] text-gray-500">
                    Endocrinologist
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Conversation Box - Flex Column to keep input at bottom */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-lg border-gray-100 min-h-0 bg-white">
              {/* Conversation Header */}
              <div className="px-4 py-2 lg:px-6 lg:py-3 border-b border-gray-100 bg-white flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm">
                  <User className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs lg:text-sm">
                    Dr. Ayman
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[0.6rem] text-gray-500 font-medium uppercase tracking-wider">
                      Online Support
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages - Scrollable Area */}
              <div className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto space-y-4 bg-gray-50/30 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-gray-100">
                      <MessageSquare className="w-8 h-8 opacity-20 text-primary-500" />
                    </div>
                    <p className="text-sm font-medium">No messages yet.</p>
                  </div>
                ) : (
                  messages
                    .slice()
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((msg) => {
                      // Heuristic: Recommendations and Urgent alerts are always from Doctor.
                      // For others, we assume messages using our new 'type' or having is_urgent are from doctor.
                      // Actually, let's look at the current structure: patient messages are usually replies.
                      const isRecommendation = msg.type === 'recommendation';
                      const isDoctorMessage = Boolean(
                        msg.sender_id && user?.id
                          ? msg.sender_id !== user.id
                          : isRecommendation ||
                              msg.is_urgent ||
                              msg.is_read === true,
                      );
                      // Note: is_read is only set when doctor reads it? Or when patient reads it?
                      // In PatientMessages, we mark all as read.

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isDoctorMessage ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                              isRecommendation
                                ? 'bg-amber-100 border border-amber-200 text-amber-900 shadow-amber-100/50'
                                : isDoctorMessage
                                  ? msg.is_urgent
                                    ? 'bg-red-500 text-white border-2 border-red-300'
                                    : 'bg-white border border-gray-100 text-gray-900'
                                  : 'bg-primary-600 text-white'
                            }`}>
                            {isRecommendation ? (
                              <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-amber-200 text-amber-700">
                                <Activity className="w-3.5 h-3.5" />
                                <span className="text-[0.6rem] font-bold uppercase tracking-wider">
                                  Recommendation
                                </span>
                              </div>
                            ) : null}
                            {isDoctorMessage &&
                            Boolean(msg.is_urgent) &&
                            !isRecommendation ? (
                              <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-red-400">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-[0.6rem] font-bold uppercase tracking-wider">
                                  Urgent Alert
                                </span>
                              </div>
                            ) : null}
                            {isDoctorMessage &&
                            !isRecommendation &&
                            !Boolean(msg.is_urgent) ? (
                              <div className="flex items-center gap-1.5 mb-1 text-[0.6rem] font-bold uppercase text-gray-400">
                                Doctor Message
                              </div>
                            ) : null}
                            {!isDoctorMessage ? (
                              <div className="flex items-center gap-1.5 mb-1 text-[0.65rem] font-bold uppercase text-primary-100">
                                Your Message
                              </div>
                            ) : null}
                            <p
                              className={`text-sm leading-relaxed mb-1 ${isRecommendation ? 'font-medium' : ''}`}>
                              {msg.message}
                            </p>
                            <div
                              className={`text-[0.6rem] ${
                                isRecommendation
                                  ? 'text-amber-600'
                                  : isDoctorMessage
                                    ? msg.is_urgent
                                      ? 'text-red-100'
                                      : 'text-gray-400'
                                    : 'text-primary-100 text-right'
                              }`}>
                              {new Date(msg.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Fixed at bottom of Card */}
              <div className="p-2 lg:p-4 border-t border-gray-100 bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
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
                    className="bg-primary-600 text-white rounded-xl px-4 flex items-center justify-center hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 disabled:grayscale disabled:opacity-50 disabled:shadow-none shrink-0">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientMessages;
