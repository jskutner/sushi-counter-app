import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface Coin {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

const PaymentTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, updateIndividualOrder, updateTip, updateVenmoId, loading } = useAppContext();
  const navigate = useNavigate();
  const order = orderId ? getOrder(orderId) : undefined;
  const [tip, setTip] = useState<string>('');
  const [savingTip, setSavingTip] = useState<boolean>(false);
  const [tipSaved, setTipSaved] = useState<boolean>(false);
  const [editingVenmo, setEditingVenmo] = useState<boolean>(false);
  const [venmoId, setVenmoId] = useState<string>('');
  const [coins, setCoins] = useState<Coin[]>([]);

  // Initialize tip from order when order is loaded
  useEffect(() => {
    if (order && order.tip > 0) {
      setTip(order.tip.toString());
    }
  }, [order?.id]);

  // Initialize venmoId from order when order is loaded
  useEffect(() => {
    if (order && order.venmoId) {
      setVenmoId(order.venmoId);
    }
  }, [order?.id]);

  // Save tip to database after user stops typing (debounced)
  useEffect(() => {
    if (!orderId || !order) return;
    
    const tipAmount = parseFloat(tip) || 0;
    
    // Only update if the tip value is different from what's in the order
    if (tipAmount === order.tip) return;

    setSavingTip(true);
    setTipSaved(false);

    const timeoutId = setTimeout(async () => {
      try {
        await updateTip(orderId, tipAmount);
        setSavingTip(false);
        setTipSaved(true);
        // Hide "Saved!" message after 2 seconds
        setTimeout(() => setTipSaved(false), 2000);
      } catch (error) {
        console.error('Error updating tip:', error);
        setSavingTip(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [tip, orderId]);

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

  const tipAmount = order?.tip || 0;
  const numberOfPeople = order?.orders.length || 0;
  const tipPerPerson = numberOfPeople > 0 ? tipAmount / numberOfPeople : 0;
  
  const totalDue = order.orders.reduce((sum, o) => sum + o.total, 0);
  const totalWithTip = totalDue + tipAmount;
  const totalCollected = order.orders.filter(o => o.paid).reduce((sum, o) => sum + o.total + tipPerPerson, 0);
  const paidCount = order.orders.filter(o => o.paid).length;

  const triggerCoinAnimation = () => {
    const newCoins: Coin[] = [];
    for (let i = 0; i < 50; i++) {
      newCoins.push({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 0.5
      });
    }
    setCoins(newCoins);
    
    // Clear coins after animation
    setTimeout(() => {
      setCoins([]);
    }, 3000);
  };

  const handleTogglePaid = async (individualOrderId: string, currentStatus: boolean) => {
    try {
      await updateIndividualOrder(orderId!, individualOrderId, { paid: !currentStatus });
      // Trigger coin animation when marking as paid
      if (!currentStatus) {
        triggerCoinAnimation();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handleSaveVenmoId = async () => {
    if (!orderId) return;
    try {
      await updateVenmoId(orderId, venmoId);
      setEditingVenmo(false);
    } catch (error) {
      console.error('Error updating Venmo ID:', error);
      alert('Failed to update Venmo ID. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Payment Tracking</h1>
              <p className="text-gray-600">{order.date}</p>
              {order.venmoId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg text-gray-700">
                    <span className="font-semibold">Pay to:</span>{' '}
                    {!editingVenmo ? (
                      <span>{order.venmoId}</span>
                    ) : (
                      <input
                        type="text"
                        value={venmoId}
                        onChange={(e) => setVenmoId(e.target.value)}
                        className="inline-block px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    )}
                  </span>
                  {!editingVenmo ? (
                    <button
                      onClick={() => setEditingVenmo(true)}
                      className="text-gray-500 hover:text-indigo-600 transition"
                      title="Edit Venmo ID"
                    >
                      ✏️
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveVenmoId}
                        className="text-green-600 hover:text-green-700 font-semibold px-2 py-1 text-sm"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => {
                          setVenmoId(order.venmoId);
                          setEditingVenmo(false);
                        }}
                        className="text-gray-600 hover:text-gray-700 font-semibold px-2 py-1 text-sm"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(`/manage/${orderId}`)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Order
            </button>
          </div>

          {/* Tip Input */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Add Tip (split among all {numberOfPeople} people)
              </label>
              {savingTip && (
                <span className="text-xs text-gray-500 italic">Saving...</span>
              )}
              {tipSaved && (
                <span className="text-xs text-green-600 font-semibold">✓ Saved!</span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-2xl font-bold text-gray-700">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
              />
              {tipAmount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Per person:</p>
                  <p className="text-lg font-bold text-yellow-700">${tipPerPerson.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-blue-600">${totalWithTip.toFixed(2)}</p>
              {tipAmount > 0 && (
                <p className="text-xs text-gray-500 mt-1">includes ${tipAmount.toFixed(2)} tip</p>
              )}
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">${totalCollected.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-purple-600">${(totalWithTip - totalCollected).toFixed(2)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Payment Progress</span>
              <span>{paidCount}/{order.orders.length} paid</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${order.orders.length > 0 ? (paidCount / order.orders.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Status</h2>

          {order.orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {order.orders.map((individualOrder) => (
                <div
                  key={individualOrder.id}
                  className={`border rounded-lg p-6 transition ${
                    individualOrder.paid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {individualOrder.name}
                        </h3>
                        {individualOrder.paid && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            ✓ Paid
                          </span>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-2 text-sm text-gray-600">
                        {individualOrder.threeRollCombo && <span className="mr-3">• 3-Roll Combo</span>}
                        {individualOrder.singleRoll && <span className="mr-3">• Single Roll</span>}
                        {individualOrder.beverage && <span className="mr-3">• Beverage</span>}
                        {individualOrder.misoSoup && <span>• Miso Soup</span>}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="mb-3">
                        <p className="text-2xl font-bold text-indigo-600">
                          ${(individualOrder.total + tipPerPerson).toFixed(2)}
                        </p>
                        {tipAmount > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            ${individualOrder.total.toFixed(2)} + ${tipPerPerson.toFixed(2)} tip
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleTogglePaid(individualOrder.id, individualOrder.paid)}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${
                          individualOrder.paid
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {individualOrder.paid ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {order.orders.length > 0 && (
            <div className="border-t border-gray-300 mt-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Subtotal (Food):</span>
                  <span className="font-semibold text-gray-900">${totalDue.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Tip:</span>
                    <span className="font-semibold text-yellow-700">${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg border-t border-gray-200 pt-2">
                  <span className="text-gray-700">Total Amount:</span>
                  <span className="font-semibold text-gray-900">${totalWithTip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Amount Collected:</span>
                  <span className="font-semibold text-green-600">${totalCollected.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-900">Outstanding:</span>
                  <span className={totalWithTip - totalCollected > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${(totalWithTip - totalCollected).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coin Animation */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="coin"
          style={{
            position: 'fixed',
            left: `${coin.left}%`,
            bottom: '-50px',
            fontSize: '40px',
            animation: `coinFly ${coin.duration}s ease-out ${coin.delay}s forwards`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          🪙
        </div>
      ))}

      <style>{`
        @keyframes coinFly {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-600px) rotate(720deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh - 100px)) rotate(1080deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentTracking;

