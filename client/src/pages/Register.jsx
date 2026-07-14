import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

export const Register = () => {
  const { register, user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTarget = searchParams.get('redirect') || '';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (redirectTarget) {
        navigate(`/${redirectTarget}`);
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all input fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      // Success triggers AuthContext useEffect which redirects automatically
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Email might already be taken.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px 24px' }}>
      <div className="glass-card form-container" style={{ marginTop: '40px' }}>
        <h1 className="form-title">Create Account</h1>
        <p className="form-subtitle">Register to store order history and track deliveries</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-search-container" style={{ width: '100%' }}>
              <User size={16} />
              <input 
                type="text" 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-search-container" style={{ width: '100%' }}>
              <Mail size={16} />
              <input 
                type="email" 
                placeholder="jane@example.com" 
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
                placeholder="At least 6 characters" 
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};
