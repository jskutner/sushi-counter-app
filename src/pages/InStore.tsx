import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const InStore: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, updateIndividualOrder, loading } = useAppContext();
  const navigate = useNavigate();

  const order = orderId ? getOrder(orderId) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🍣</div>
          <p className="text-lg text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleTogglePackaged = async (individualOrderId: string, currentStatus: boolean) => {
    try {
      await updateIndividualOrder(orderId!, individualOrderId, { packaged: !currentStatus });
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const packagedCount = order.orders.filter(o => o.packaged).length;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">🍣 In Store</h1>
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              ← Home
            </button>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-gray-600 text-xs">Orders</p>
              <p className="text-lg font-bold text-blue-600">{order.orders.length}</p>
            </div>
            <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
              <p className="text-gray-600 text-xs">Packaged</p>
              <p className="text-lg font-bold text-green-600">{packagedCount}/{order.orders.length}</p>
            </div>
          </div>
        </div>

        {/* Orders List - Mobile Optimized */}
        <div className="space-y-3">
          {order.orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              <p className="text-lg mb-1">No orders yet</p>
              <p className="text-sm">Share the link to start collecting orders</p>
            </div>
          ) : (
            order.orders.map((individualOrder) => (
              <div
                key={individualOrder.id}
                className={`bg-white rounded-xl shadow-md p-4 transition ${
                  individualOrder.packaged ? 'opacity-60' : ''
                }`}
              >
                {/* Row 1: Name and Price */}
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className={`text-2xl font-bold ${
                      individualOrder.packaged ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {individualOrder.name}
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${individualOrder.total.toFixed(2)}
                  </p>
                </div>

                {/* Packaged Badge */}
                {individualOrder.packaged && (
                  <div className="mb-3">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Packaged
                    </span>
                  </div>
                )}

                {/* Row 2: Order Details */}
                <div className="space-y-1 text-base text-gray-700 mb-3 pb-3 border-b border-gray-200">
                  {individualOrder.threeRollCombo && (
                    <div>
                      <span className="font-semibold">3-Roll Combo:</span>
                      <ul className="ml-4 list-disc">
                        {individualOrder.threeRollCombo.map((roll, idx) => (
                          <li key={idx}>{roll}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {individualOrder.singleRoll && (
                    <div>
                      <span className="font-semibold">Single Roll:</span> {individualOrder.singleRoll}
                    </div>
                  )}
                  {individualOrder.beverage && (
                    <div>
                      <span className="font-semibold">Beverage:</span> {individualOrder.beverage}
                    </div>
                  )}
                  {individualOrder.misoSoup && (
                    <div>
                      <span className="font-semibold">Miso Soup</span>
                    </div>
                  )}
                </div>

                {/* Row 3: Buttons */}
                <button
                  onClick={() => handleTogglePackaged(individualOrder.id, individualOrder.packaged)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    individualOrder.packaged
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {individualOrder.packaged ? 'Unmark' : 'Mark Packaged'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InStore;

