const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL ITEMS
router.get('/', protect, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD NEW ITEM
router.post('/', protect, async (req, res) => {
  const { name, category, unit, price, stockQuantity, minStockAlert } = req.body;
  try {
    const newItem = new Item({
      name,
      category,
      unit,
      price,
      stockQuantity,
      minStockAlert: minStockAlert || 5
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. UPDATE ITEM
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE ITEM
router.delete('/:id', protect, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;