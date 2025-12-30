import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const api = {
  // Product APIs
  getProducts: () => axios.get(ENDPOINTS.products),
  getProduct: (id) => axios.get(ENDPOINTS.productById(id)),
  createProduct: (productData) => axios.post(ENDPOINTS.products, productData),
  
  // Inventory APIs
  getInventory: () => axios.get(ENDPOINTS.inventory),
  getInventoryItem: (id) => axios.get(ENDPOINTS.inventoryById(id)),
  updateInventory: (id, quantity) => axios.put(ENDPOINTS.inventoryById(id), { quantity }),
  createInventoryItem: (inventoryData) => axios.post(ENDPOINTS.inventory, inventoryData),
  
  // User APIs
  getUsers: () => axios.get(ENDPOINTS.users),
  getUser: (id) => axios.get(ENDPOINTS.userById(id)),
  createUser: (userData) => axios.post(ENDPOINTS.users, userData),
  
  // Order APIs
  getOrders: () => axios.get(ENDPOINTS.orders),
  createOrder: (orderData) => axios.post(ENDPOINTS.orders, orderData),
};

export default api;