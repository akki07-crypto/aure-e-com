import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react';

export const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTarget = searchParams.get('redirect') || '';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (redirectTarget) {
        navigate(`/${redirectTarget}`);
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      
      // Navigate on success
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (redirectTarget) {
        navigate(`/${redirectTarget}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px 24px' }}>
      <div className="glass-card form-container" style={{ marginTop: '40px' }}>
        <h1 className="form-title">Welcome Back</h1>
        <p className="form-subtitle">Access your premium smart catalog settings</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-search-container" style={{ width: '100%' }}>
              <Mail size={16} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Password</label>
            <div className="input-search-container" style={{ width: '100%' }}>
              <Lock size={16} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        {/* Credentials guide block */}
        <div 
          className="glass-card" 
          style={{ 
            backgroundColor: 'rgba(226, 168, 87, 0.03)', 
            border: '1px solid rgba(226, 168, 87, 0.15)', 
            padding: '16px', 
            marginTop: '30px', 
            fontSize: '12px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600, marginBottom: '6px' }}>
            <KeyRound size={14} />
            Administrator Credentials (Seeded):
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong>Email:</strong> admin@aura.com <br />
            <strong>Password:</strong> AdminPass123!
          </div>
        </div>

        <div className="form-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};
