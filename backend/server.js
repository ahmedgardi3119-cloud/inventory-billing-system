const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS force karta hai

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// REGISTER ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));

app.get('/', (req, res) => {
  res.send('🚀 Inventory & Billing API Server is Ready!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});