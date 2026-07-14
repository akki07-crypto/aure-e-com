import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react';

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'AURA10') {
      setDiscountPercent(10);
      setPromoSuccess('Promo code "AURA10" applied successfully! 10% off.');
    } else if (promoCode.trim().toUpperCase() === 'AURA20') {
      setDiscountPercent(20);
      setPromoSuccess('Promo code "AURA20" applied successfully! 20% off.');
    } else {
      setPromoError('Invalid promo code. Try "AURA10".');
      setDiscountPercent(0);
    }
  };

  const calculateSubtotal = getCartTotal();
  const discountAmount = (calculateSubtotal * discountPercent) / 100;
  const shippingCost = 0; // Free delivery
  const estimatedTax = (calculateSubtotal - discountAmount) * 0.08; // 8% tax
  const totalAmount = calculateSubtotal - discountAmount + shippingCost + estimatedTax;

  const handleCheckoutClick = () => {
    if (!user) {
      alert('Please log in or register an account to proceed with checkout.');
      navigate('/login?redirect=checkout');
    } else {
      // Pass promo discount details to checkout page via state
      navigate('/checkout', { 
        state: { 
          discountPercent, 
          discountAmount, 
          tax: estimatedTax, 
          total: totalAmount 
        } 
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="cart-empty glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <ShoppingCart size={64} style={{ animation: 'bounce 2s infinite ease-in-out' }} />
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any luxury devices to your basket yet.</p>
          <Link to="/" className="btn btn-primary">
            Browse The Collection
          </Link>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 className="cart-title">Your Basket</h1>

      <div className="cart-layout">
        
        {/* Left: Cart Items List */}
        <div className="cart-items-panel">
          {cartItems.map((item) => (
            <div key={item.productId} className="cart-item">
              <img 
                src={item.image} 
                alt={item.name} 
                className="cart-item-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop';
                }}
              />
              
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.name}</h3>
                <span className="cart-item-price">${item.price.toLocaleString()}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                  (Max stock: {item.maxStock})
                </span>
              </div>

              <div className="cart-item-actions">
                {/* Quantity adjust */}
                <div className="quantity-selector" style={{ padding: '2px' }}>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                    className="quantity-btn" 
                    style={{ width: '26px', height: '26px' }}
                  >
                    -
                  </button>
                  <div className="quantity-val" style={{ width: '30px', fontSize: '13px' }}>{item.quantity}</div>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                    className="quantity-btn" 
                    style={{ width: '26px', height: '26px' }}
                  >
                    +
                  </button>
                </div>

                {/* Line total */}
                <div style={{ fontWeight: 600, minWidth: '80px', textAlign: 'right', fontSize: '15px' }}>
                  ${(item.price * item.quantity).toLocaleString()}
                </div>

                {/* Delete button */}
                <button 
                  onClick={() => removeFromCart(item.productId)} 
                  className="btn-danger btn btn-icon" 
                  style={{ width: '36px', height: '36px' }}
                  title="Remove Item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <Link to="/" className="btn btn-secondary" style={{ fontSize: '13px' }}>
              ← Keep Shopping
            </Link>
            <button onClick={clearCart} className="btn btn-danger" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Clear Entire Basket
            </button>
          </div>
        </div>

        {/* Right: Summary panel */}
        <div className="cart-summary-panel">
          <h3 className="summary-title">Order Summary</h3>
          
          <div className="summary-row">
            <span>Subtotal ({getCartCount()} items)</span>
            <span>${calculateSubtotal.toLocaleString()}</span>
          </div>

          {/* Promo code display */}
          {discountPercent > 0 && (
            <div className="summary-row" style={{ color: 'var(--success)', fontWeight: 500 }}>
              <span>Discount ({discountPercent}%)</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>Complimentary</span>
          </div>

          <div className="summary-row">
            <span>Estimated Sales Tax (8%)</span>
            <span>${estimatedTax.toLocaleString()}</span>
          </div>

          <div className="summary-row total">
            <span>Estimated Total</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>

          {/* Promo Code form */}
          <form onSubmit={handleApplyPromo} style={{ margin: '24px 0 16px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Apply Promo Code
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Try AURA10" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Apply
              </button>
            </div>
            {promoError && <p style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '6px' }}>{promoError}</p>}
            {promoSuccess && <p style={{ color: 'var(--success)', fontSize: '11px', marginTop: '6px' }}>{promoSuccess}</p>}
          </form>

          {/* Checkout CTA */}
          <button 
            onClick={handleCheckoutClick}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '16px' }}
          >
            Proceed to Secure Checkout
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
