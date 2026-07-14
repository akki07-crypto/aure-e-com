import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlassModal } from '../components/GlassModal';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, ShoppingCart, Laptop, Users, Plus, Edit2, Trash2, 
  Loader2, AlertTriangle, Image as ImageIcon, Sparkles, TrendingUp
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation tab state: 'stats' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState('stats');

  // Stats tab data
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Products manager data
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Orders manager data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Modal forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSpecs, setFormSpecs] = useState('');
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Initial Fetches
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadStats();
    loadProducts();
    loadOrders();
  }, [token, navigate]);

  const loadStats = () => {
    setStatsLoading(true);
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(err => {
        console.error('Stats loading error', err);
        setStatsLoading(false);
      });
  };

  const loadProducts = () => {
    setProductsLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch(err => {
        console.error('Products loading error', err);
        setProductsLoading(false);
      });
  };

  const loadOrders = () => {
    setOrdersLoading(true);
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setOrdersLoading(false);
      })
      .catch(err => {
        console.error('Orders loading error', err);
        setOrdersLoading(false);
      });
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed.');

      setFormImage(data.imageUrl);
    } catch (err) {
      console.error(err);
      setFormError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Create Product Open
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingProductId(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Audio');
    setFormStock('');
    setFormDescription('');
    setFormImage('');
    setFormFeatured(false);
    setFormSpecs('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Edit Product Open
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormDescription(product.description);
    setFormImage(product.image);
    setFormFeatured(product.featured);
    setFormSpecs(product.specs ? product.specs.join('\n') : '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Product Form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formPrice || !formCategory || !formStock || !formDescription) {
      setFormError('Please enter all required fields.');
      return;
    }

    setActionLoading(true);

    const bodyData = {
      name: formName,
      price: Number(formPrice),
      category: formCategory,
      stock: Number(formStock),
      description: formDescription,
      image: formImage,
      featured: formFeatured,
      specs: formSpecs.split('\n').filter(s => s.trim())
    };

    const url = modalMode === 'create' ? '/api/products' : `/api/products/${editingProductId}`;
    const method = modalMode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed.');

      setIsModalOpen(false);
      loadProducts();
      loadStats(); // update totals
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save product details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Delete failed.');
      }

      loadProducts();
      loadStats();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete product.');
    }
  };

  // Change Order Status
  const handleChangeOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update order status.');
      }

      loadOrders();
      loadStats(); // update revenue count
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to change order status.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  return (
    <div className="container admin-container">
      
      {/* Top Header Row */}
      <div className="admin-header">
        <div className="admin-title-row">
          <h1>Control Panel</h1>
          <span className="admin-badge">Admin Mode</span>
        </div>
        {activeTab === 'products' && (
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} />
            Create Product
          </button>
        )}
      </div>

      {/* Tabs list */}
      <div className="admin-tabs">
        <div 
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Overview Statistics
        </div>
        <div 
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Manage Catalog
        </div>
        <div 
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Customer Orders
        </div>
      </div>

      {/* Tab 1: Stats */}
      {activeTab === 'stats' && (
        <div>
          {statsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '200px' }}>
              <Loader2 size={24} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Calculating analytics...</span>
            </div>
          ) : stats ? (
            <div>
              {/* Stat Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><DollarSign size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">${stats.totals.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><ShoppingCart size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{stats.totals.totalOrders}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Laptop size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Products Active</span>
                    <span className="stat-value">{stats.totals.totalProducts}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Users size={24} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Circle Users</span>
                    <span className="stat-value">{stats.totals.totalUsers}</span>
                  </div>
                </div>
              </div>

              {/* Lower dashboard widgets grid */}
              <div className="dashboard-details-grid">
                
                {/* Low Stock Alerts */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                    Inventory Low Stock Alerts
                  </h3>
                  {stats.lowStock.length === 0 ? (
                    <p style={{ color: 'var(--success)', fontSize: '14px' }}>✓ All products are healthy and in stock.</p>
                  ) : (
                    <ul style={{ listStyle: 'none' }}>
                      {stats.lowStock.map(p => (
                        <li 
                          key={p.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '10px 0', 
                            borderBottom: '1px solid var(--border-glass)',
                            fontSize: '14px'
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{p.name}</span>
                          <span style={{ color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                            {p.stock === 0 ? 'Depleted' : `${p.stock} units left`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
                    Recent Business Orders
                  </h3>
                  {stats.recentOrders.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No orders placed yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none' }}>
                      {stats.recentOrders.map(o => (
                        <li 
                          key={o.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '10px 0', 
                            borderBottom: '1px solid var(--border-glass)',
                            fontSize: '13px'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--accent)' }}>{o.id}</strong>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>{o.customerName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 600 }}>${o.totalAmount.toLocaleString()}</span>
                            <span className={`order-status status-pending`} style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                              {o.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <p>Failed to load analytics summaries.</p>
          )}
        </div>
      )}

      {/* Tab 2: Catalog Products Manager */}
      {activeTab === 'products' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {productsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '40px' }}>
              <Loader2 size={24} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Loading catalog items...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-cell">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="table-product-thumb" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td style={{ fontWeight: 600 }}>${p.price.toLocaleString()}</td>
                      <td style={{ color: p.stock <= 5 ? 'var(--warning)' : 'inherit', fontWeight: p.stock <= 5 ? 600 : 'normal' }}>
                        {p.stock} units
                      </td>
                      <td>
                        {p.featured ? (
                          <span style={{ color: 'var(--accent)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> Yes
                          </span>
                        ) : 'No'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleOpenEdit(p)} 
                            className="btn btn-secondary btn-icon" 
                            style={{ width: '32px', height: '32px' }}
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id, p.name)} 
                            className="btn-danger btn btn-icon" 
                            style={{ width: '32px', height: '32px' }}
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Customer Orders Manager */}
      {activeTab === 'orders' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {ordersLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '40px' }}>
              <Loader2 size={24} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Loading transactions...</span>
            </div>
          ) : orders.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No orders have been submitted yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Products Count</th>
                    <th>Total Charged</th>
                    <th>Tracking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{o.id}</span>
                      </td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                        </div>
                      </td>
                      <td>
                        {o.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td style={{ fontWeight: 600 }}>${o.totalAmount.toLocaleString()}</td>
                      <td>
                        <select 
                          value={o.status} 
                          onChange={(e) => handleChangeOrderStatus(o.id, e.target.value)}
                          className={`select-field`}
                          style={{ 
                            fontSize: '12px', 
                            padding: '4px 10px', 
                            borderRadius: '4px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            color: o.status === 'Delivered' ? 'var(--success)' : 
                                   o.status === 'Cancelled' ? 'var(--danger)' : 
                                   o.status === 'Pending' ? 'var(--warning)' : 'var(--accent)'
                          }}
                        >
                          <option value="Pending" style={{ color: '#000' }}>Pending</option>
                          <option value="Processing" style={{ color: '#000' }}>Processing</option>
                          <option value="Shipped" style={{ color: '#000' }}>Shipped</option>
                          <option value="Delivered" style={{ color: '#000' }}>Delivered</option>
                          <option value="Cancelled" style={{ color: '#000' }}>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CRUD Product Modal Dialog */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Collection Item' : 'Edit Collection Item'}
        footerButtons={
          <>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProduct} 
              disabled={actionLoading || uploadingImage}
              className="btn btn-primary"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="logo-dot" style={{ animation: 'spin 1s linear infinite', backgroundColor: 'transparent', boxShadow: 'none' }} />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </>
        }
      >
        {formError && <div className="form-error" style={{ marginBottom: '16px' }}>{formError}</div>}

        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label>Product Name*</label>
            <input 
              type="text" 
              placeholder="e.g. Aura Earbuds" 
              value={formName} 
              onChange={(e) => setFormName(e.target.value)} 
              required 
              className="input-field" 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Retail Price ($)*</label>
              <input 
                type="number" 
                placeholder="249" 
                value={formPrice} 
                onChange={(e) => setFormPrice(e.target.value)} 
                required 
                className="input-field" 
              />
            </div>
            <div className="form-group">
              <label>Inventory Stock*</label>
              <input 
                type="number" 
                placeholder="20" 
                value={formStock} 
                onChange={(e) => setFormStock(e.target.value)} 
                required 
                className="input-field" 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category*</label>
              <select 
                value={formCategory} 
                onChange={(e) => setFormCategory(e.target.value)} 
                className="select-field"
                style={{ width: '100%' }}
              >
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
                <option value="Home Tech">Home Tech</option>
                <option value="Display">Display</option>
                <option value="Accessories">Accessories</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}>
                <input 
                  type="checkbox" 
                  checked={formFeatured} 
                  onChange={(e) => setFormFeatured(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                />
                Feature this product on homepage hero
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Image Source Route / URL</label>
            <input 
              type="text" 
              placeholder="/images/product_name.png" 
              value={formImage} 
              onChange={(e) => setFormImage(e.target.value)} 
              className="input-field" 
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OR upload local image:</span>
              <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <ImageIcon size={12} />
                {uploadingImage ? 'Uploading File...' : 'Choose File'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Description*</label>
            <textarea 
              placeholder="Provide a premium descriptive summary of the product..." 
              value={formDescription} 
              onChange={(e) => setFormDescription(e.target.value)} 
              required 
              className="input-field"
              rows="3"
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 16px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Specifications (One per line)</label>
            <textarea 
              placeholder="e.g. Active Noise Cancellation&#10;Up to 30h battery life&#10;Waterproof design" 
              value={formSpecs} 
              onChange={(e) => setFormSpecs(e.target.value)} 
              className="input-field"
              rows="3"
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 16px' }}
            />
          </div>
        </form>
      </GlassModal>

    </div>
  );
};
