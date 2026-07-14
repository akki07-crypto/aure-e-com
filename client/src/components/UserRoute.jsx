import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const UserRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--accent)',
        fontFamily: 'var(--font-heading)',
        fontSize: '24px'
      }}>
        <div className="logo-dot" style={{ animation: 'pulse 1.5s infinite ease-in-out', marginRight: '12px' }}></div>
        Loading Secure Session...
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.8); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};
