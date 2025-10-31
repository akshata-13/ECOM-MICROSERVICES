import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import api from '../../services/api';

const InventoryManager = () => {
  const { data: inventory, loading, error, refetch } = useApi(api.getInventory);
  const [updating, setUpdating] = useState(null);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setUpdating(productId);
      await api.updateInventory(productId, newQuantity);
      await refetch();
    } catch (err) {
      alert('Failed to update inventory: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error loading inventory: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {inventory?.length || 0} items
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory?.map((item) => (
              <tr key={item.product_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{item.product_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity} units
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.quantity > 10
                        ? 'bg-green-100 text-green-800'
                        : item.quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.quantity > 10 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      disabled={updating === item.product_id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {updating === item.product_id ? '...' : '+1'}
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(item.product_id, Math.max(0, item.quantity - 1))}
                      disabled={updating === item.product_id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {updating === item.product_id ? '...' : '-1'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!inventory || inventory.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No inventory items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;