import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2, Calendar, ShieldCheck, Mail } from 'lucide-react';

export const UserProfile = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/orders/my-orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load orders.');
        return res.json();
      })
      .then(data => {
        // Sort orders by newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch your order history.');
        setLoading(false);
      });
  }, [token, navigate]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ marginBottom: '30px' }}>Your Account</h1>

      <div className="profile-layout">
        
        {/* Left Side: Profile Details Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
          </div>
          <h3 className="profile-name">{user?.name}</h3>
          <p className="profile-email">
            <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            {user?.email}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ textTransform: 'capitalize' }}>Role: <strong>{user?.role}</strong></span>
          </div>

          <div className="profile-joined">
            Joined AURA Circle on <br />
            <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</strong>
          </div>
        </div>

        {/* Right Side: Order History */}
        <div className="orders-panel">
          <h2>Order History</h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '40px 0' }}>
              <Loader2 size={24} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Loading transactions...</span>
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '24px', color: 'var(--danger)' }}>{error}</div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3 style={{ marginBottom: '8px' }}>No Orders Found</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px' }}>You haven't ordered any premium devices yet.</p>
              <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Browse Catalog
              </button>
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-meta-info">
                      <div className="order-meta-item">
                        <span className="order-meta-label">Order Placed</span>
                        <span className="order-meta-value">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-meta-label">Total Amount</span>
                        <span className="order-meta-value" style={{ fontWeight: 600 }}>
                          ${order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-meta-label">Order Number</span>
                        <span className="order-meta-value" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          {order.id}
                        </span>
                      </div>
                    </div>

                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div className="order-body">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-row">
                        <div className="order-item-info">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="order-item-thumb" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-qty">Quantity: {item.quantity}</div>
                          </div>
                        </div>
                        <span className="order-item-price">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    
                    {/* Delivery summary subtext */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>Shipping Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
