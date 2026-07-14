import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Star, ShieldAlert, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('The product you are looking for does not exist or the server could not be reached.');
        setLoading(false);
      });
  }, [id]);

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} x ${product.name} added to your cart.`);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Retreiving architectural specs...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <ShieldAlert size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h2>Item Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>{error || 'Error loading product details.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Back button */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px' }} className="nav-link">
        <ArrowLeft size={16} />
        Back to Catalog
      </Link>

      <div className="product-details-grid">
        
        {/* Left Column: Image Panel */}
        <div className="details-image-panel">
          <img 
            src={product.image} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop';
            }}
          />
        </div>

        {/* Right Column: Information Panel */}
        <div className="details-content-panel">
          <span className="details-category">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          
          {/* Stars & Reviews */}
          <div className="details-rating-row">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(product.rating) ? 'var(--accent)' : 'none'} 
                  stroke="var(--accent)" 
                />
              ))}
            </div>
            <span>{product.rating} ({product.reviewsCount} customer reviews)</span>
          </div>

          <div className="details-price">${product.price.toLocaleString()}</div>
          
          <p className="details-desc">{product.description}</p>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="details-specs">
              <h4>Architectural Specifications</h4>
              <ul>
                {product.specs.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="details-actions">
            
            {/* Quantity control */}
            {!isOutOfStock && (
              <div className="quantity-selector">
                <button onClick={handleDecreaseQty} className="quantity-btn" disabled={quantity <= 1}>-</button>
                <div className="quantity-val">{quantity}</div>
                <button onClick={handleIncreaseQty} className="quantity-btn" disabled={quantity >= product.stock}>+</button>
              </div>
            )}

            {/* Add to Cart button */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary"
              style={{
                flexGrow: 1,
                backgroundColor: isOutOfStock ? 'var(--bg-glass-active)' : 'var(--accent)',
                color: isOutOfStock ? 'var(--text-muted)' : '#000',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingBag size={18} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Stock inventory warning */}
          <div className="stock-status">
            {isOutOfStock && <span className="stock-out">✕ Depleted. This item is temporarily out of stock.</span>}
            {isLowStock && <span className="stock-low">⚠ Alert: Only {product.stock} units remaining in inventory.</span>}
            {!isOutOfStock && !isLowStock && <span className="stock-available">✓ In Stock. Ready for shipment within 24 hours.</span>}
          </div>

        </div>

      </div>
    </div>
  );
};
