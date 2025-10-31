import React from 'react';
import useApi from '../../hooks/useApi';
import api from '../../services/api';

const UserList = ({ onUserSelect }) => {
  const { data: users, loading, error } = useApi(api.getUsers);

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
        <p>Error loading users: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {users?.length || 0} users
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-400">
                User ID: #{user.id}
              </div>
              <button
                onClick={() => onUserSelect(user.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <span>View Orders</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {(!users || users.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserList;