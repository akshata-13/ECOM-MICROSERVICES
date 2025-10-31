import React from 'react';
import useApi from '../../hooks/useApi';
import api from '../../services/api';

const HomePage = () => {
  const { data: products } = useApi(api.getProducts);
  const { data: users } = useApi(api.getUsers);
  const { data: inventory } = useApi(api.getInventory);
  const { data: orders } = useApi(api.getOrders);

  const stats = [
    {
      title: 'Total Products',
      value: products?.length || 0,
      icon: '📦',
      color: 'blue'
    },
    {
      title: 'Total Users', 
      value: users?.length || 0,
      icon: '👤',
      color: 'green'
    },
    {
      title: 'Inventory Items',
      value: inventory?.length || 0,
      icon: '🏬',
      color: 'purple'
    },
    {
      title: 'Total Orders',
      value: orders?.length || 0,
      icon: '🧾',
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to EcoMicro Store 🛍️
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your e-commerce operations efficiently with our microservices-based platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-gray-600 font-medium">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium text-gray-800">Add Product</div>
            <div className="text-sm text-gray-600">Create new product</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-gray-800">Add User</div>
            <div className="text-sm text-gray-600">Register new user</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-800">Manage Inventory</div>
            <div className="text-sm text-gray-600">Update stock levels</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-medium text-gray-800">Create Order</div>
            <div className="text-sm text-gray-600">Process new order</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Products</h3>
          <div className="space-y-3">
            {products?.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{product.name}</div>
                  <div className="text-sm text-gray-600">${product.price}</div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">ID: {product.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users?.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">ID: {user.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;