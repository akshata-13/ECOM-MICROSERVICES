import React, { useState } from 'react';
import Header from './components/Layout/Header';
import HomePage from './components/Layout/HomePage';
import ProductList from './components/Products/ProductList';
import CreateProduct from './components/Products/CreateProduct';
import InventoryManager from './components/Inventory/InventoryManager';
import AddInventoryItem from './components/Inventory/AddInventoryItem';
import OrderList from './components/Orders/OrderList';
import CreateOrder from './components/Orders/CreateOrder';
import UserList from './components/Users/UserList';
import CreateUser from './components/Users/CreateUser';
import UserDetail from './components/Users/UserDetail';
import './tailwind.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Reset to main tabs when clicking header tabs
  const handleTabChange = (tabId) => {
    setSelectedUserId(null); // Clear user detail view
    setActiveTab(tabId); // Set the active tab
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  const handleBackFromUserDetail = () => {
    setSelectedUserId(null);
  };

  const renderContent = () => {
    // If a user is selected, show user detail page
    if (selectedUserId) {
      return (
        <UserDetail 
          userId={selectedUserId} 
          onBack={handleBackFromUserDetail} 
        />
      );
    }

    // Otherwise show the regular tab content
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'products':
        return (
          <div className="space-y-6">
            <CreateProduct onProductCreated={refreshData} />
            <ProductList key={refreshKey} />
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-6">
            <AddInventoryItem onInventoryAdded={refreshData} />
            <InventoryManager key={refreshKey} />
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <CreateOrder onOrderCreated={refreshData} />
            <OrderList key={refreshKey} />
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <CreateUser onUserCreated={refreshData} />
            <UserList onUserSelect={handleUserSelect} key={refreshKey} />
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;