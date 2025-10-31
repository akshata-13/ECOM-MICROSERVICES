import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import orderService from '../../services/orderService';

const UserDetail = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch user details
        const userResponse = await api.getUser(userId);
        setUser(userResponse.data);
        
        // Fetch all orders
        const ordersResponse = await api.getOrders();
        const allOrders = ordersResponse.data;
        
        // Filter orders for this specific user
        const userOrders = allOrders.filter(order => order.user_id === parseInt(userId));
        
        // Get product details for each order
        const ordersWithDetails = await Promise.all(
          userOrders.map(async (order) => {
            try {
              const productResponse = await api.getProduct(order.product_id);
              return {
                ...order,
                product: productResponse.data
              };
            } catch (error) {
              return {
                ...order,
                product: { name: 'Unknown Product', price: 0 }
              };
            }
          })
        );
        
        setOrders(ordersWithDetails);
        
      } catch (err) {
        setError('Failed to load user details and orders');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Calculate statistics
  const totalSpent = orders.reduce((total, order) => {
    const productPrice = order.product?.price || 0;
    return total + (productPrice * order.quantity);
  }, 0);

  const totalItems = orders.reduce((total, order) => total + order.quantity, 0);
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  // Get favorite products
  const favoriteProducts = Array.from(new Set(orders.map(order => order.product_id)))
    .map(productId => {
      const productOrders = orders.filter(order => order.product_id === productId);
      const product = productOrders[0]?.product || { name: 'Unknown Product', price: 0 };
      const totalQuantity = productOrders.reduce((sum, order) => sum + order.quantity, 0);
      const totalSpentOnProduct = productOrders.reduce((sum, order) => sum + (order.product?.price || 0) * order.quantity, 0);
      
      return {
        product,
        totalQuantity,
        totalOrders: productOrders.length,
        totalSpent: totalSpentOnProduct
      };
    })
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Get recent activity (last 5 orders)
  const recentOrders = [...orders].sort((a, b) => b.id - a.id).slice(0, 5);

  // Get monthly spending (simulated since we don't have dates)
  const monthlySpending = {
    'Current Month': { 
      total: totalSpent, 
      orders: orders.length 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading user details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
        <button 
          onClick={onBack}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <p>User not found</p>
        <button 
          onClick={onBack}
          className="mt-2 text-yellow-600 hover:text-yellow-800 font-medium"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <span>←</span>
          <span>Back to Users</span>
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">User ID: #{user.id}</span>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600 text-lg">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {orders.length} Order{orders.length !== 1 ? 's' : ''}
                </span>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {totalItems} Item{totalItems !== 1 ? 's' : ''} Purchased
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Lifetime Value</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <nav className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'orders', label: 'All Orders', icon: '📦' },
            { id: 'products', label: 'Products', icon: '🛍️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'activity', label: 'Activity', icon: '🕒' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                activeSection === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-gray-800">${totalSpent.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl mb-2">🛒</div>
              <div className="text-2xl font-bold text-gray-800">{totalItems}</div>
              <div className="text-sm text-gray-600">Items Purchased</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-800">${averageOrderValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
          </div>

          {/* Recent Orders & Favorite Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📦</div>
                    <p>No recent orders</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">🛒</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Order #{order.id}</div>
                          <div className="text-sm text-gray-600">
                            {order.quantity} x {order.product?.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ${((order.product?.price || 0) * order.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Favorite Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Favorite Products</h3>
              <div className="space-y-4">
                {favoriteProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🛍️</div>
                    <p>No favorite products</p>
                  </div>
                ) : (
                  favoriteProducts.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <span className="text-green-600">⭐</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{item.product.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.totalOrders} order{item.totalOrders !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{item.totalQuantity}</div>
                        <div className="text-xs text-gray-500">items</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Orders Section */}
      {activeSection === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">All Orders</h3>
            <p className="text-sm text-gray-600 mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} • ${totalSpent.toFixed(2)} total spent
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Orders Found</h3>
              <p className="text-gray-600">This user hasn't placed any orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">🛒</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold text-gray-800">Order #{order.id}</h4>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Completed
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Product:</span> {order.product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Quantity:</span> {order.quantity} • 
                            <span className="font-medium"> Unit Price:</span> ${order.product?.price || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Product ID:</span> #{order.product_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${((order.product?.price || 0) * order.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {order.quantity} item{order.quantity !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Section */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Product Purchase History</h3>
            
            {favoriteProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🛍️</div>
                <p>No products purchased yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteProducts.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{item.product.name}</h4>
                          <p className="text-gray-600">${item.product.price} per unit</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {item.totalOrders} order{item.totalOrders !== 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {item.totalQuantity} total items
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">${item.totalSpent.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">total spent</div>
                      </div>
                    </div>
                    
                    {/* Progress bar for favorite product */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Purchase frequency</span>
                        <span>{totalItems > 0 ? Math.round((item.totalQuantity / totalItems) * 100) : 0}% of all items</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${totalItems > 0 ? Math.min(100, (item.totalQuantity / totalItems) * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Distribution</h3>
              <div className="space-y-4">
                {favoriteProducts.slice(0, 5).map((item, index) => {
                  const percentage = totalSpent > 0 ? (item.totalSpent / totalSpent) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.product.name}</span>
                        <span className="text-gray-600">${item.totalSpent.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Total Orders</span>
                  <span className="text-blue-700 font-bold text-xl">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">Items per Order (Avg)</span>
                  <span className="text-green-700 font-bold text-xl">
                    {orders.length > 0 ? (totalItems / orders.length).toFixed(1) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-700 font-medium">Average Order Value</span>
                  <span className="text-purple-700 font-bold text-xl">${averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-700 font-medium">Most Purchased Product</span>
                  <span className="text-orange-700 font-bold text-sm text-right">
                    {favoriteProducts[0]?.product.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending</h3>
            <div className="space-y-3">
              {Object.entries(monthlySpending).map(([month, data]) => (
                <div key={month} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600">📅</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{month}</div>
                      <div className="text-sm text-gray-600">{data.orders} order{data.orders !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${data.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      {data.orders > 0 ? `$${(data.total / data.orders).toFixed(2)} avg/order` : 'No orders'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Section */}
      {activeSection === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity Timeline</h3>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🕒</div>
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    {index < recentOrders.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🛒</span>
                        <span className="font-medium text-gray-800">Placed Order #{order.id}</span>
                      </div>
                      <span className="text-sm text-gray-500">Recently</span>
                    </div>
                    <p className="text-gray-600 mt-1 ml-7">
                      Purchased {order.quantity} {order.quantity !== 1 ? 'units' : 'unit'} of {order.product?.name} for ${((order.product?.price || 0) * order.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetail;