import React from 'react';
import useApi from '../../hooks/useApi';
import api from '../../services/api';

const OrderList = () => {
  const { data: orders, loading, error } = useApi(api.getOrders);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error loading orders: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {orders?.map((order) => (
          <div key={order.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Order #{order.id}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  User ID: {order.user_id} • Product ID: {order.product_id} • Quantity: {order.quantity}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Placed
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {(!orders || orders.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderList;