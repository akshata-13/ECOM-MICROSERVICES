import api from './api';

// Since backend doesn't have a specific endpoint for user orders,
// we'll filter orders by user_id on the frontend
export const orderService = {
  // Get orders for a specific user
  getUserOrders: async (userId) => {
    try {
      const response = await api.getOrders();
      const allOrders = response.data;
      // Filter orders by user_id
      return allOrders.filter(order => order.user_id === parseInt(userId));
    } catch (error) {
      throw new Error('Failed to fetch user orders');
    }
  },

  // Get order details with product and user information
  getOrderDetails: async (order) => {
    try {
      const [product, user] = await Promise.all([
        api.getProduct(order.product_id),
        api.getUser(order.user_id)
      ]);
      
      return {
        ...order,
        product: product.data,
        user: user.data
      };
    } catch (error) {
      // Return basic order info if details fail
      return order;
    }
  },

  // Get all orders with detailed information
  getAllOrdersWithDetails: async () => {
    try {
      const ordersResponse = await api.getOrders();
      const orders = ordersResponse.data;
      
      // Get details for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          try {
            const [product, user] = await Promise.all([
              api.getProduct(order.product_id).catch(() => ({ data: { name: 'Unknown Product', price: 0 } })),
              api.getUser(order.user_id).catch(() => ({ data: { name: 'Unknown User', email: 'N/A' } }))
            ]);
            
            return {
              ...order,
              product: product.data,
              user: user.data
            };
          } catch (error) {
            return {
              ...order,
              product: { name: 'Unknown Product', price: 0 },
              user: { name: 'Unknown User', email: 'N/A' }
            };
          }
        })
      );
      
      return ordersWithDetails;
    } catch (error) {
      throw new Error('Failed to fetch orders with details');
    }
  }
};

export default orderService;