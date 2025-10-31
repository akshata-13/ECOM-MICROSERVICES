import React from 'react';
import useApi from '../../hooks/useApi';
import api from '../../services/api';
import ProductCard from './ProductCard';

const ProductList = () => {
  const { data: products, loading, error } = useApi(api.getProducts);

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
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {products?.length || 0} products
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;