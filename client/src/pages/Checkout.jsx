import React, { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

export const Checkout = () => {
  const { cartItems, getCartTotal, getCartCount, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Load passed state or fallback recalculate
  const discountPercent = location.state?.discountPercent || 0;
  const subtotal = getCartTotal();
  const discountAmount = location.state?.discountAmount || (subtotal * discountPercent) / 100;
  const tax = location.state?.tax || (subtotal - discountAmount) * 0.08;
  const total = location.state?.total || (subtotal - discountAmount + tax);

  // Form states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!address || !city || !stateName || !zip || !cardNumber || !cardExpiry || !cardCvv) {
      setError('Please fill in all shipping and payment details.');
      return;
    }

    setLoading(true);

    try {
      const items = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          shippingAddress: {
            address,
            city,
            state: stateName,
            zip,
            country
          },
          paymentMethod: 'Credit Card',
          totalAmount: total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // Success
      clearCart();
      setOrderSuccess(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  // If order is completed, show success screen
  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="glass-card success-screen">
          <CheckCircle2 size={72} strokeWidth={1.5} />
          <h1>Order Confirmed</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Thank you for shopping with AURA. Your order has been placed successfully.
          </p>
          
          <div 
            className="glass-card" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.01)', 
              padding: '20px', 
              margin: '30px 0', 
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ color: 'var(--accent)' }}>{orderSuccess.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount Charged:</span>
              <strong style={{ color: 'var(--text-primary)' }}>${orderSuccess.totalAmount.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tracking Status:</span>
              <span className="order-status status-pending">{orderSuccess.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
              <span style={{ textAlign: 'right' }}>
                {orderSuccess.shippingAddress.address}, {orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.state}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If page loaded directly with no items in cart
  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <h2>No items to checkout</h2>
          <p style={{ margin: '16px 0 24px', color: 'var(--text-secondary)' }}>Your shopping cart is empty.</p>
          <Link to="/" className="btn btn-primary">Go to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px' }} className="nav-link">
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1 style={{ marginBottom: '30px' }}>Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="cart-layout" style={{ gridTemplateColumns: '1fr 380px' }}>
        
        {/* Left Form Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Shipping details */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px' }}>
              1. Delivery Address
            </h3>
            
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label>Street Address</label>
              <input 
                type="text" 
                placeholder="120 Luxury Way" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required 
                className="input-field" 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  placeholder="San Francisco" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                  className="input-field" 
                />
              </div>

              <div className="form-group">
                <label>State / Province</label>
                <input 
                  type="text" 
                  placeholder="CA" 
                  value={stateName} 
                  onChange={(e) => setStateName(e.target.value)} 
                  required 
                  className="input-field" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zip / Postal Code</label>
                <input 
                  type="text" 
                  placeholder="94103" 
                  value={zip} 
                  onChange={(e) => setZip(e.target.value)} 
                  required 
                  className="input-field" 
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  className="select-field" 
                  style={{ width: '100%' }}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass-card">
            <h3 style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: 'var(--accent)' }} />
              2. Payment Credentials
            </h3>

            <div className="form-group">
              <label>Cardholder Number</label>
              <input 
                type="text" 
                placeholder="4111 2222 3333 4444" 
                maxLength="19"
                value={cardNumber} 
                onChange={(e) => setCardNumber(e.target.value)} 
                required 
                className="input-field" 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  maxLength="5"
                  value={cardExpiry} 
                  onChange={(e) => setCardExpiry(e.target.value)} 
                  required 
                  className="input-field" 
                />
              </div>

              <div className="form-group">
                <label>Security Code (CVV)</label>
                <input 
                  type="password" 
                  placeholder="•••" 
                  maxLength="3"
                  value={cardCvv} 
                  onChange={(e) => setCardCvv(e.target.value)} 
                  required 
                  className="input-field" 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
              Payment details are fully simulated locally. No real charges are made.
            </div>
          </div>

        </div>

        {/* Right Summary Panel */}
        <div className="cart-summary-panel">
          <h3 className="summary-title">Summary Review</h3>
          
          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
                <span style={{ color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.quantity} x {item.name}
                </span>
                <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>

          {discountPercent > 0 && (
            <div className="summary-row" style={{ color: 'var(--success)', fontWeight: 500 }}>
              <span>Discount ({discountPercent}%)</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>Free</span>
          </div>

          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toLocaleString()}</span>
          </div>

          <div className="summary-row total">
            <span>Order Total</span>
            <span>${total.toLocaleString()}</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '24px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
                Authorizing...
              </>
            ) : (
              `Authorize Payment of $${total.toLocaleString()}`
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
