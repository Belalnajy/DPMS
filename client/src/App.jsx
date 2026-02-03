import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientDetails from './pages/DoctorPatientDetails';
import DoctorMessages from './pages/DoctorMessages';
// Patient Pages
import PatientDashboard from './pages/PatientDashboard';
import PatientLogbook from './pages/PatientLogbook';
import PatientMessages from './pages/PatientMessages';
import PatientSettings from './pages/PatientSettings';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patient/:id"
        element={
          <ProtectedRoute role="doctor">
            <DoctorPatientDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/messages"
        element={
          <ProtectedRoute role="doctor">
            <DoctorMessages />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/logbook"
        element={
          <ProtectedRoute role="patient">
            <PatientLogbook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/messages"
        element={
          <ProtectedRoute role="patient">
            <PatientMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <ProtectedRoute role="patient">
            <PatientSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
