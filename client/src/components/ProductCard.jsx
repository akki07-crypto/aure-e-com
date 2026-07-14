import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to details page if clicking cart button
    addToCart(product, 1);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      {/* Category and stock badges */}
      {isOutOfStock && <span className="product-card-badge" style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>Out of Stock</span>}
      {!isOutOfStock && product.stock <= 5 && <span className="product-card-badge" style={{ backgroundColor: 'var(--warning)', color: '#000' }}>Low Stock</span>}
      {!isOutOfStock && product.featured && <span className="product-card-badge">Featured</span>}

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="product-img-wrapper">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-card-img" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop';
          }}
        />
      </Link>

      {/* Content */}
      <div className="product-card-content">
        <span className="product-card-cat">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.description}</p>
        
        {/* Card Footer with actions */}
        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toLocaleString()}</span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link 
              to={`/products/${product.id}`} 
              className="btn btn-secondary btn-icon" 
              title="View Details"
              style={{ width: '36px', height: '36px' }}
            >
              <Eye size={16} />
            </Link>
            
            <button 
              onClick={handleAddToCart} 
              disabled={isOutOfStock}
              className="btn btn-primary btn-icon" 
              title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
              style={{ 
                width: '36px', 
                height: '36px',
                backgroundColor: isOutOfStock ? 'var(--bg-glass-active)' : 'var(--accent)',
                color: isOutOfStock ? 'var(--text-muted)' : '#000',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
