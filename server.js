// Load environment variables at the absolute top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Product, Order, initDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aura-secret-luxury-electronics-key-2026';

// Initialize Database Connection
initDB()
  .then(() => console.log('Database system initialized successfully.'))
  .catch(err => console.error('Database system initialization failed:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure upload and static paths exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Setup Multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Authenticate token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
}

// Require Admin role middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// ==========================================
// AUTHENTICATION API
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    // Automatically make accounts with @admin.com or aura.com/admin email admins
    const role = (email.includes('@admin.com') || email.includes('admin@aura.com')) ? 'admin' : 'user';

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get current user details
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving credentials.' });
  }
});

// ==========================================
// PRODUCTS API
// ==========================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving products.' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving product.' });
  }
});

// Create product (Admin)
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, name, description, price, category, image, stock, featured, specs } = req.body;
    
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const formattedSpecs = Array.isArray(specs) ? specs : (specs ? specs.split('\n').filter(s => s.trim()) : []);
    
    // Generate a unique custom id/slug if not provided
    const slugId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalId = id || `${slugId}-${Date.now().toString().slice(-4)}`;

    // Verify uniqueness of custom id
    const existingProduct = await Product.findOne({ id: finalId });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this unique ID already exists.' });
    }

    const newProduct = await Product.create({
      id: finalId,
      name,
      description,
      price: Number(price),
      category,
      image: image || '/images/placeholder.png',
      stock: Number(stock),
      featured: featured === true || featured === 'true',
      specs: formattedSpecs
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating product.' });
  }
});

// Update product (Admin)
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, stock, featured, specs } = req.body;
    const formattedSpecs = Array.isArray(specs) ? specs : (specs ? specs.split('\n').filter(s => s.trim()) : undefined);

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (image !== undefined) updates.image = image;
    if (stock !== undefined) updates.stock = Number(stock);
    if (featured !== undefined) updates.featured = (featured === true || featured === 'true');
    if (formattedSpecs !== undefined) updates.specs = formattedSpecs;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating product.' });
  }
});

// Delete product (Admin)
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Product.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product successfully deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting product.' });
  }
});

// Image Upload Endpoint (Admin)
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading image.' });
  }
});

// ==========================================
// ORDERS API
// ==========================================

// Get user orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// Place order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0 || !shippingAddress || !totalAmount) {
      return res.status(400).json({ message: 'Missing fields for checkout.' });
    }

    // Verify stock availability
    for (let item of items) {
      const dbProd = await Product.findOne({ id: item.productId });
      if (!dbProd || dbProd.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
      }
    }

    // Update stock levels
    for (let item of items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    const newOrder = await Order.create({
      id: 'AURA-' + Math.floor(100000 + Math.random() * 900000),
      userId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      totalAmount: Number(totalAmount)
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// Get all orders (Admin)
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
});

// Update order status (Admin)
app.patch('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const orders = await Order.find({});

    const completedOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockProducts = await Product.find({ stock: { $lte: 5 } });
    const formattedLowStock = lowStockProducts.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock
    }));

    // Category distribution counts
    const products = await Product.find({});
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    // Recent orders (last 5) sorted by date
    const recentOrdersList = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = recentOrdersList.map(o => ({
      id: o.id,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    }));

    res.json({
      totals: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers
      },
      lowStock: formattedLowStock,
      categoryDistribution: categoryCounts,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading admin stats.' });
  }
});

// Serve static assets in production
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(CLIENT_DIST));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running in watch mode on port ${PORT}`);
});

