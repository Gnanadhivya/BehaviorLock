import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--accent-cyan)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(0,229,255,0.2)', borderTop: '3px solid var(--accent-cyan)', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Verifying Authentication Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
