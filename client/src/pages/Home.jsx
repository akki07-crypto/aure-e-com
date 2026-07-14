import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error loading catalog. Please check that the server is running.');
        setLoading(false);
      });
  }, []);

  const handleScrollToCatalog = () => {
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
  };

  // Filter & sort logic
  const filteredProducts = products
    .filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      
      // Default: featured first, then name
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const categories = ['All', 'Audio', 'Wearables', 'Home Tech', 'Display', 'Accessories', 'Lifestyle'];

  return (
    <div>
      {/* Hero section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  backgroundColor: 'rgba(226, 168, 87, 0.1)', 
                  color: 'var(--accent)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '20px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                <Sparkles size={12} />
                Now Launching: Aura Sight Curved QD-OLED
              </div>
              <h1>
                Precision Craft.<br />
                <span>Structural Sound.</span>
              </h1>
              <p>
                A collection of premium lifestyle electronics engineered for minimalists. Fabric-wrapped soundbars, titanium timepieces, and acoustic masterpieces.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={handleScrollToCatalog} className="btn btn-primary">
                  Explore Collection
                </button>
                <a href="#about-philosophy" className="btn btn-secondary">
                  Our Philosophy
                </a>
              </div>
            </div>
            
            <div className="hero-image-container">
              <div className="hero-image-glow"></div>
              <img 
                src="/images/aura_arc_headphones.png" 
                alt="Aura Arc Premium Headphones" 
                className="hero-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog section */}
      <section id="catalog" style={{ padding: '60px 0', borderTop: '1px solid var(--border-glass)' }}>
        <div className="container">
          
          <div className="catalog-header">
            <h2>The Catalog</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Refining daily interactions through geometric precision and materials that endure.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            {/* Category tabs */}
            <ul className="category-tabs">
              {categories.map(cat => (
                <li 
                  key={cat} 
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>

            {/* Search & Sort options */}
            <div className="search-sort-group">
              <div className="input-search-container">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <Loader2 size={36} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Loading catalog...</p>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)', maxWidth: '500px', margin: '0 auto' }}>
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Filter size={32} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '18px', fontWeight: 600 }}>No Products Found</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Try resetting your category tab or tweaking your search keywords.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Brand Philosophy Segment */}
      <section id="about-philosophy" style={{ padding: '80px 0', borderTop: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Our Philosophy</span>
          <h2 style={{ fontSize: '36px', marginTop: '12px', marginBottom: '24px' }}>Form follow material. Integrity follows craft.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
            We believe consumer electronics shouldn't be disposable plastic boxes. AURA constructs interfaces using anodized aluminum, American walnut hardwood, X-Pac fabrics, and sapphire crystal. We build tools that feel solid in the hand, run with surgical precision, and integrate silently into beautiful living spaces.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'left' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--accent)', marginBottom: '8px' }}>Organic Materials</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Authentic walnut hardwoods, lambskin, and heavy wool elements.</p>
            </div>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--accent)', marginBottom: '8px' }}>Tactile Response</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mechanical keypads and machined brass dials engineered to click.</p>
            </div>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--accent)', marginBottom: '8px' }}>Zero Carbon Goals</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Crafted with 100% recycled packaging and lifetime-repair designs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
