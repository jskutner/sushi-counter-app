import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Home: React.FC = () => {
  const { createOrder, orders } = useAppContext();
  const navigate = useNavigate();
  const [showVenmoPrompt, setShowVenmoPrompt] = useState(false);
  const [venmoId, setVenmoId] = useState('');

  const handleCreateOrder = async () => {
    if (!venmoId.trim()) {
      alert('Please enter your Venmo ID');
      return;
    }
    try {
      const newOrder = await createOrder(venmoId);
      setVenmoId('');
      setShowVenmoPrompt(false);
      navigate(`/manage/${newOrder.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const activeOrders = orders.filter(o => o.status === 'active');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🍣 Sushi Counter</h1>
          <p className="text-xl text-gray-600">Group Order Coordinator</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Group Order</h2>
          <p className="text-gray-600 mb-6">
            Start a new order session and share the link with your group to collect everyone's orders.
          </p>
          
          {!showVenmoPrompt ? (
            <button
              onClick={() => setShowVenmoPrompt(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Create Group Order
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Venmo ID <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Others will pay you for their orders. Enter your Venmo username.
                </p>
                <input
                  type="text"
                  value={venmoId}
                  onChange={(e) => setVenmoId(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  Create Order
                </button>
                <button
                  onClick={() => {
                    setShowVenmoPrompt(false);
                    setVenmoId('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {activeOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Active Orders</h2>
            <div className="space-y-3">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition cursor-pointer"
                  onClick={() => navigate(`/manage/${order.id}`)}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{order.date}</p>
                    <p className="text-sm text-gray-600">{order.orders.length} participant(s)</p>
                  </div>
                  <span className="text-indigo-600 font-medium">Manage →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Completed Orders</h2>
            <div className="space-y-3">
              {completedOrders.slice(-5).reverse().map(order => {
                const paidCount = order.orders.filter(o => o.paid).length;
                const totalCount = order.orders.length;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/manage/${order.id}`)}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{order.date}</p>
                      <p className="text-sm text-gray-600">
                        {totalCount} participant(s) • {paidCount}/{totalCount} Paid
                      </p>
                    </div>
                    <span className="text-gray-600">Manage →</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/menu')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-semibold py-6 px-8 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 block">📋</span>
            View Menu
          </button>
          <button
            onClick={() => navigate('/menu-editor')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-semibold py-6 px-8 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-3xl mb-2 block">⚙️</span>
            Menu Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

