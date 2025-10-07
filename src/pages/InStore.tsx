import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const InStore: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, updateIndividualOrder, updateTip, loading } = useAppContext();
  const navigate = useNavigate();
  const [editingTip, setEditingTip] = useState<boolean>(false);
  const [tipInput, setTipInput] = useState<string>('');

  const order = orderId ? getOrder(orderId) : undefined;

  // Initialize tip from order when order is loaded
  useEffect(() => {
    if (order) {
      setTipInput(order.tip > 0 ? order.tip.toString() : '');
    }
  }, [order?.id]);

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

  const handleSaveTip = async () => {
    if (!orderId) return;
    try {
      const tipAmount = parseFloat(tipInput) || 0;
      await updateTip(orderId, tipAmount);
      setEditingTip(false);
    } catch (error) {
      console.error('Error updating tip:', error);
      alert('Failed to update tip. Please try again.');
    }
  };

  const packagedCount = order.orders.filter(o => o.packaged).length;
  const tipAmount = order.tip || 0;
  const numberOfPeople = order.orders.length;
  const tipPerPerson = numberOfPeople > 0 ? tipAmount / numberOfPeople : 0;

  // Calculate summary totals
  const rollCounts: { [key: string]: number } = {};
  const beverageCounts: { [key: string]: number } = {};
  let totalMisoSoup = 0;

  order.orders.forEach(individualOrder => {
    // Count rolls from 3-roll combos
    if (individualOrder.threeRollCombo) {
      individualOrder.threeRollCombo.forEach(roll => {
        rollCounts[roll] = (rollCounts[roll] || 0) + 1;
      });
    }
    
    // Count single rolls
    if (individualOrder.singleRoll) {
      rollCounts[individualOrder.singleRoll] = (rollCounts[individualOrder.singleRoll] || 0) + 1;
    }
    
    // Count beverages
    if (individualOrder.beverage) {
      beverageCounts[individualOrder.beverage] = (beverageCounts[individualOrder.beverage] || 0) + 1;
    }
    
    // Count miso soups
    if (individualOrder.misoSoup) {
      totalMisoSoup++;
    }
  });

  const totalRolls = Object.values(rollCounts).reduce((sum, count) => sum + count, 0);
  const totalBeverages = Object.values(beverageCounts).reduce((sum, count) => sum + count, 0);

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

        {/* Summary Section */}
        {order.orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📊 Order Summary</h2>
            
            {/* Rolls Breakdown */}
            {totalRolls > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  🍣 Rolls (Total: {totalRolls})
                </h3>
                <div className="space-y-1 ml-2">
                  {Object.entries(rollCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([roll, count]) => (
                      <div key={roll} className="flex justify-between text-sm">
                        <span className="text-gray-700">{roll}</span>
                        <span className="font-semibold text-indigo-600">×{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Beverages Breakdown */}
            {totalBeverages > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">
                  🥤 Beverages (Total: {totalBeverages})
                </h3>
                <div className="space-y-1 ml-2">
                  {Object.entries(beverageCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([beverage, count]) => (
                      <div key={beverage} className="flex justify-between text-sm">
                        <span className="text-gray-700">{beverage}</span>
                        <span className="font-semibold text-indigo-600">×{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Miso Soup */}
            {totalMisoSoup > 0 && (
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-700">🍜 Miso Soup</h3>
                  <span className="font-semibold text-indigo-600 text-lg">×{totalMisoSoup}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tip Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mt-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">💰 Tip</h2>
            {!editingTip && (
              <button
                onClick={() => setEditingTip(true)}
                className="text-gray-500 hover:text-indigo-600 transition text-sm"
                title="Edit Tip"
              >
                ✏️ Edit
              </button>
            )}
          </div>
          
          {editingTip ? (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <span className="text-xl font-bold text-gray-700">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tipInput}
                  onChange={(e) => setTipInput(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTip}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  ✓ Save
                </button>
                <button
                  onClick={() => {
                    setTipInput(order.tip > 0 ? order.tip.toString() : '');
                    setEditingTip(false);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tip:</span>
                <span className="text-2xl font-bold text-yellow-700">${tipAmount.toFixed(2)}</span>
              </div>
              {tipAmount > 0 && numberOfPeople > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Per Person ({numberOfPeople} people):</span>
                  <span className="font-semibold text-yellow-600">${tipPerPerson.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InStore;

