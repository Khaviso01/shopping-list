import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import type { AppDispatch, RootState } from './redux/store';
import { resumeSession } from './redux/authSlice';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);
  const sessionStatus = useSelector((state: RootState) => state.auth?.sessionStatus);

  // On load, try to resume a previous session by re-fetching the profile
  // from the json-server backend using the saved user id (no credentials
  // are ever kept in the browser).
  useEffect(() => {
    dispatch(resumeSession());
  }, [dispatch]);

  // While we're still verifying a saved session against the server (e.g.
  // right after a page refresh), hold off on rendering any route — this is
  // what stops a logged-in user from being bounced to /login for a split
  // second before resumeSession finishes.
  if (sessionStatus === 'checking') {
    return (
      <div className="session-loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Global Toast Notifications Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Geist, sans-serif',
            fontSize: '14px',
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/home" /> : <RegistrationPage />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;