const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Item = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');

// 1. CREATE NEW SALE (BILLING) & AUTO DEDUCT STOCK
router.post('/', protect, async (req, res) => {
  const { customerName, customerPhone, items, totalAmount, discount, netAmount, paymentMode } = req.body;

  try {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Deduct stock for each purchased item
    for (let cartItem of items) {
      const dbItem = await Item.findById(cartItem.itemId);
      if (dbItem) {
        dbItem.stockQuantity = Math.max(0, dbItem.stockQuantity - cartItem.quantity);
        await dbItem.save();
      }
    }

    const sale = new Sale({
      invoiceNumber,
      customerName,
      customerPhone,
      items,
      totalAmount,
      discount,
      netAmount,
      paymentMode
    });

    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2. GET ALL SALES
router.get('/', protect, async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. DELETE SALE
router.delete('/:id', protect, async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DASHBOARD STATS & DYNAMIC CIRCLE GRAPH DATA
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    const sales = await Sale.find();
    const items = await Item.find();

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.netAmount, 0);
    const totalOrders = sales.length;
    const totalProducts = items.length;
    const lowStockCount = items.filter(item => item.stockQuantity <= item.minStockAlert).length;

    // Calculate Dynamic Data for Circle/Donut Chart (Payment Modes Distribution)
    const paymentStats = { Cash: 0, UPI: 0, Card: 0 };
    sales.forEach(s => {
      if (paymentStats[s.paymentMode] !== undefined) {
        paymentStats[s.paymentMode] += s.netAmount;
      }
    });

    const chartData = [
      { name: 'Cash', value: paymentStats.Cash },
      { name: 'UPI', value: paymentStats.UPI },
      { name: 'Card', value: paymentStats.Card }
    ];

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount,
      chartData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;