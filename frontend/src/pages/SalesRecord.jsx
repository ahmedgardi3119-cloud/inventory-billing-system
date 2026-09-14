import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Search } from 'lucide-react';

export default function SalesRecord({ token, userRole = 'admin' }) {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Direct Instant Delete Without Any Confirmation Popup
  const handleDelete = async (id) => {
    if (userRole !== 'admin') {
      alert('Access Denied: Only Admin can delete sales history!');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales(); // Refresh table immediately
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    return (
      (sale.customerName && sale.customerName.toLowerCase().includes(term)) ||
      (sale.invoiceNumber && sale.invoiceNumber.toString().toLowerCase().includes(term)) ||
      (sale.paymentMode && sale.paymentMode.toLowerCase().includes(term)) ||
      (sale.customerPhone && sale.customerPhone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by customer, invoice no, mode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-600 uppercase font-semibold">
              <th className="p-4">Invoice No</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Net Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-indigo-600">{sale.invoiceNumber}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {sale.customerName || 'Valued Customer'}
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {sale.paymentMode}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">₹{sale.netAmount}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {userRole === 'admin' ? (
                      <button
                        onClick={() => handleDelete(sale._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                        title="Delete Sale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium italic">Read-only</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                  No sales record found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}