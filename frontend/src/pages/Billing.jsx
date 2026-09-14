import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Send, Search } from 'lucide-react';

export default function Billing({ token }) {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // Search state

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time Search Filtering (Name ya Category ke basis par)
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    const existing = cart.find((c) => c.itemId === item._id);
    if (existing) {
      if (existing.quantity >= item.stockQuantity) {
        alert('Cannot add more than available stock!');
        return;
      }
      setCart(
        cart.map((c) =>
          c.itemId === item._id
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          itemId: item._id,
          name: item.name,
          unit: item.unit,
          price: item.price,
          quantity: 1,
          subtotal: item.price
        }
      ]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(
      cart
        .map((c) => {
          if (c.itemId === id) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty, subtotal: newQty * c.price } : null;
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const totalAmount = cart.reduce((sum, c) => sum + c.subtotal, 0);
  const netAmount = Math.max(0, totalAmount - Number(discount));

  // WhatsApp Message Generator & Direct Redirect
  const sendWhatsAppInvoice = (invoiceNumber) => {
    let rawPhone = customerPhone.trim();
    if (!rawPhone) return;

    if (rawPhone.length === 10) {
      rawPhone = `91${rawPhone}`;
    }

    const itemsList = cart
      .map((item) => `• ${item.name} (${item.quantity} ${item.unit}) - ₹${item.subtotal}`)
      .join('\n');

    const message = `🧾 *OFFICIAL STORE INVOICE*
--------------------------------
*Invoice No:* #${invoiceNumber || 'REC-' + Date.now().toString().slice(-4)}
*Customer:* ${customerName || 'Valued Customer'}
*Date:* ${new Date().toLocaleDateString()}

*ITEMS:*
${itemsList}

--------------------------------
*Subtotal:* ₹${totalAmount}
*Discount:* ₹${discount}
*Net Payable Amount:* ₹${netAmount}
*Payment Mode:* ${paymentMode}

Thank you for shopping with us! 🙏`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!');
    if (!customerPhone) return alert('Please enter Customer Phone Number to send WhatsApp invoice!');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/sales',
        { customerName, customerPhone, items: cart, totalAmount, discount: Number(discount), netAmount, paymentMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      sendWhatsAppInvoice(res.data.invoiceNumber);

      alert('Bill Generated & Opening WhatsApp!');

      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      fetchItems();
    } catch (err) {
      alert('Checkout failed!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-800">Available Products</h2>

          {/* 🔍 Search Input Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Product Cards List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition"
              >
                <h4 className="font-bold text-gray-800">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-bold text-indigo-600">₹{item.price}/{item.unit}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    Stock: {item.stockQuantity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400 text-sm">
              No products found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Cart & Billing Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <span>Current Cart</span>
        </h3>

        <div className="p-2 space-y-3">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cart.map((c) => (
              <div key={c.itemId} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">₹{c.price} x {c.quantity} {c.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-700">₹{c.subtotal}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => updateQuantity(c.itemId, -1)} className="p-1 text-gray-500"><Minus className="w-3 h-3" /></button>
                    <button onClick={() => updateQuantity(c.itemId, 1)} className="p-1 text-gray-500"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totalAmount}</span></div>
            <div className="flex justify-between text-gray-600 items-center">
              <span>Discount (₹)</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right px-2 py-0.5 border rounded-lg text-sm"
              />
            </div>
            <div className="flex justify-between font-bold text-lg text-indigo-600 pt-2 border-t">
              <span>Net Amount</span><span>₹{netAmount}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-3 pt-2">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
          />
          <input
            type="text"
            placeholder="Phone Number (e.g., 9876543210)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none"
          />
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none bg-white"
          >
            <option value="Cash">Cash Payment</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="Card">Credit / Debit Card</option>
          </select>

          <button
            onClick={handleCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
          >
            <Send className="w-5 h-5" />
            <span>Generate Bill & Send to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}