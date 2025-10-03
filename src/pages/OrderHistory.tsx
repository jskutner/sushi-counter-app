import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const OrderHistory: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder } = useAppContext();
  const navigate = useNavigate();

  const order = orderId ? getOrder(orderId) : undefined;

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

  const totalAmount = order.orders.reduce((sum, o) => sum + o.total, 0);
  const paidCount = order.orders.filter(o => o.paid).length;
  const packagedCount = order.orders.filter(o => o.packaged).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
              <p className="text-gray-600">{order.date}</p>
              {order.venmoId && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Organizer Venmo:</span> {order.venmoId}
                </p>
              )}
              <span className="inline-block mt-2 bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                Completed
              </span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back Home
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-blue-600">{order.orders.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Packaged</p>
              <p className="text-2xl font-bold text-green-600">{packagedCount}/{order.orders.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-yellow-600">{paidCount}/{order.orders.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-purple-600">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
          
          <div className="space-y-4">
            {order.orders.map((individualOrder) => (
              <div
                key={individualOrder.id}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {individualOrder.name}
                      </h3>
                      {individualOrder.packaged && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                          ✓ Packaged
                        </span>
                      )}
                      {individualOrder.paid && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                          ✓ Paid
                        </span>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 text-gray-700">
                      {individualOrder.threeRollCombo && (
                        <div>
                          <span className="font-medium">3-Roll Combo:</span>
                          <ul className="ml-6 list-disc">
                            {individualOrder.threeRollCombo.map((roll, idx) => (
                              <li key={idx}>{roll}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {individualOrder.singleRoll && (
                        <div>
                          <span className="font-medium">Single Roll:</span> {individualOrder.singleRoll}
                        </div>
                      )}
                      {individualOrder.beverage && (
                        <div>
                          <span className="font-medium">Beverage:</span> {individualOrder.beverage}
                        </div>
                      )}
                      {individualOrder.misoSoup && (
                        <div>
                          <span className="font-medium">Miso Soup</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-indigo-600">
                      ${individualOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-300 mt-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">Grand Total:</span>
              <span className="text-3xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;

