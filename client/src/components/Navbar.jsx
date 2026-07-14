import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, UserCheck, Shield, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener to add background styling on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when location changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  // Click outside listener to close user profile dropdown
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownOpen && !e.target.closest('.user-menu-wrapper')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="logo-link">
          AURA
          <div className="logo-dot"></div>
        </Link>

        {/* Desktop Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Catalog
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Admin Portal
              </NavLink>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Shopping Cart Trigger */}
          <Link to="/cart" className="btn-icon" title="View Cart">
            <ShoppingBag size={20} />
            {getCartCount() > 0 && <span className="badge">{getCartCount()}</span>}
          </Link>

          {/* User Profile Dropdown / Login */}
          {user ? (
            <div className="user-menu-wrapper" style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="btn-secondary btn" 
                style={{ 
                  padding: '6px 12px 6px 6px', 
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div className="profile-avatar" style={{ width: '28px', height: '28px', margin: 0, fontSize: '12px' }}>
                  {getInitials(user.name)}
                </div>
                <span className="user-name-label" style={{ fontSize: '13px', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>

              {dropdownOpen && (
                <div 
                  className="glass-card" 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    minWidth: '220px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 1000,
                    boxShadow: 'var(--shadow-premium)'
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>

                  <Link 
                    to="/profile" 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-secondary)',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.backgroundColor = 'transparent'; }}
                  >
                    <UserCheck size={16} />
                    My Account
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="btn" 
                      style={{ 
                        width: '100%', 
                        justifyContent: 'flex-start', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-secondary)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={(e) => { e.target.style.color = 'var(--accent)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.backgroundColor = 'transparent'; }}
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'flex-start', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--danger)',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              <User size={16} />
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="btn-icon mobile-menu-btn" 
            style={{ display: 'none' }} /* toggled via client CSS on small layouts */
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation side menu */}
      {mobileMenuOpen && (
        <div 
          className="glass-card" 
          style={{
            position: 'absolute',
            top: scrolled ? '64px' : '80px',
            left: 0,
            width: '100%',
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            padding: '20px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-premium)',
            backgroundColor: 'rgba(9, 9, 11, 0.95)',
          }}
        >
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Catalog
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Admin Portal
            </Link>
          )}
          {user && (
            <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              My Account
            </Link>
          )}
        </div>
      )}
      
      {/* Styles for mobile navigation display toggle */}
      <style>{`
        @media (max-width: 576px) {
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .user-name-label { display: none !important; }
        }
      `}</style>
    </header>
  );
};
