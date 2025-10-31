export const API_BASE_URLS = {
  products: 'http://localhost:8081',
  inventory: 'http://localhost:8082',
  users: 'http://localhost:8083',
  orders: 'http://localhost:8084'
};

export const ENDPOINTS = {
  // Product endpoints
  products: `${API_BASE_URLS.products}/products`,
  productById: (id) => `${API_BASE_URLS.products}/products/${id}`,
  
  // Inventory endpoints
  inventory: `${API_BASE_URLS.inventory}/inventory`,
  inventoryById: (id) => `${API_BASE_URLS.inventory}/inventory/${id}`,
  
  // User endpoints
  users: `${API_BASE_URLS.users}/users`,
  userById: (id) => `${API_BASE_URLS.users}/users/${id}`,
  
  // Order endpoints
  orders: `${API_BASE_URLS.orders}/orders`,
};