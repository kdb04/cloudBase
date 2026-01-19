import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/layout';
import {
  HomePage,
  LoginPage,
  BookingPage,
  AboutPage,
  ContactPage,
  AdminPage
} from './pages';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserRole(email == 'admin@example.com' ? 'admin' : 'user');
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Login" element={<LoginPage onLoginSuccess={handleLogin} />} />
            <Route path="/Booking" element={<BookingPage isLoggedIn={isLoggedIn} />} />
            <Route path="/About" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/admin"
              element={
                isLoggedIn && userRole === 'admin' ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/Login" replace />
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
