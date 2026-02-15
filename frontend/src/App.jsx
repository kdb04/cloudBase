import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/layout';
import {
  HomePage,
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  BookingPage,
  AboutPage,
  ContactPage,
  AdminPage,
  FlightStatusPage
} from './pages';
import { getUserRole } from './utils/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserRole(getUserRole(email));
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
            <Route path="/sign-up" element={<SignUpPage onLoginSuccess={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/booking" element={<BookingPage isLoggedIn={isLoggedIn} />} />
            <Route path="/flight-status" element={<FlightStatusPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/admin"
              element={
                isLoggedIn && userRole === 'admin' ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
