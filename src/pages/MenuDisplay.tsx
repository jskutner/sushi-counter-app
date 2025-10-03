import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { PRICES } from '../types';

const MenuDisplay: React.FC = () => {
  const { menuItems } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block"
          >
            ← Back Home
          </button>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🍣 Sushi Menu</h1>
          <p className="text-xl text-gray-600">Sushi Counter</p>
        </div>

        {/* Pricing Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-indigo-900">3-Roll Combo</p>
              <p className="text-3xl font-bold text-indigo-600">${PRICES.THREE_ROLL_COMBO}</p>
              <p className="text-sm text-gray-600 mt-1">Choose any 3 rolls</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-purple-900">Single Roll</p>
              <p className="text-3xl font-bold text-purple-600">${PRICES.SINGLE_ROLL}</p>
              <p className="text-sm text-gray-600 mt-1">One roll of your choice</p>
            </div>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-green-900">Beverages</p>
              <p className="text-3xl font-bold text-green-600">${PRICES.BEVERAGE}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-yellow-900">Miso Soup</p>
              <p className="text-3xl font-bold text-yellow-600">${PRICES.MISO_SOUP}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rolls</h2>
          
          {menuItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No menu items available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition bg-gradient-to-br from-white to-gray-50"
                >
                  {item.image && (
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;

