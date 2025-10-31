import React, { useState } from 'react';
import api from '../../services/api';

const AddInventoryItem = ({ onInventoryAdded }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.createInventoryItem({
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity)
      });
      setMessage('✅ Inventory item added successfully!');
      setFormData({ product_id: '', quantity: '' });
      if (onInventoryAdded) onInventoryAdded();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Failed to add inventory item'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Inventory Item</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="number"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Quantity
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter initial quantity"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding Item...' : 'Add Inventory Item'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddInventoryItem;