import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BEVERAGES, PRICES } from '../types';

const OrderForm: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, addIndividualOrder, menuItems, loading } = useAppContext();
  const navigate = useNavigate();

  const order = orderId ? getOrder(orderId) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    hasThreeRollCombo: false,
    threeRollCombo: ['', '', ''],
    hasSingleRoll: false,
    singleRoll: '',
    beverage: '',
    misoSoup: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

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
          <p className="text-gray-600 mb-4">This order link is invalid or has been deleted.</p>
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

  // Format date as "Monday, October 6, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateTotal = () => {
    let total = 0;
    if (formData.hasThreeRollCombo) total += PRICES.THREE_ROLL_COMBO;
    if (formData.hasSingleRoll) total += PRICES.SINGLE_ROLL;
    if (formData.beverage) total += PRICES.BEVERAGE;
    if (formData.misoSoup) total += PRICES.MISO_SOUP;
    return total;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.hasThreeRollCombo) {
      const selectedRolls = formData.threeRollCombo.filter(r => r);
      if (selectedRolls.length !== 3) {
        newErrors.threeRollCombo = 'Please select exactly 3 rolls';
      }
    }

    if (formData.hasSingleRoll && !formData.singleRoll) {
      newErrors.singleRoll = 'Please select a roll';
    }

    if (!formData.hasThreeRollCombo && !formData.hasSingleRoll && !formData.beverage && !formData.misoSoup) {
      newErrors.items = 'Please select at least one item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const individualOrder = {
      name: formData.name,
      threeRollCombo: formData.hasThreeRollCombo ? formData.threeRollCombo.filter(r => r) : undefined,
      singleRoll: formData.hasSingleRoll ? formData.singleRoll : undefined,
      beverage: formData.beverage || undefined,
      misoSoup: formData.misoSoup,
      total: calculateTotal(),
      packaged: false,
      paid: false
    };

    try {
      await addIndividualOrder(orderId!, individualOrder);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  const handleRollChange = (index: number, value: string) => {
    const newCombo = [...formData.threeRollCombo];
    newCombo[index] = value;
    setFormData({ ...formData, threeRollCombo: newCombo });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Submitted!</h2>
            <p className="text-gray-600 mb-2">Your order has been added to the group.</p>
            <p className="text-2xl font-bold text-indigo-600 mb-6">Total: ${calculateTotal().toFixed(2)}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    hasThreeRollCombo: false,
                    threeRollCombo: ['', '', ''],
                    hasSingleRoll: false,
                    singleRoll: '',
                    beverage: '',
                    misoSoup: false
                  });
                  setSubmitted(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Add Another Order
              </button>
              <button
                onClick={() => navigate(`/manage/${orderId}`)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🍣 Sushi Counter - Group Order</h1>
            <p className="text-gray-600 mb-4">{formatDate(order.date)}</p>
            <button
              onClick={() => navigate(`/manage/${orderId}`)}
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              View Orders
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Three Roll Combo */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="threeRollCombo"
                  checked={formData.hasThreeRollCombo}
                  onChange={(e) => setFormData({ ...formData, hasThreeRollCombo: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <label htmlFor="threeRollCombo" className="ml-3 font-semibold text-gray-900">
                  3-Roll Combo <span className="text-indigo-600">${PRICES.THREE_ROLL_COMBO}</span>
                </label>
              </div>
              {formData.hasThreeRollCombo && (
                <div className="space-y-3 ml-8">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      <label className="block text-sm text-gray-600 mb-1">Roll {index + 1}</label>
                      <select
                        value={formData.threeRollCombo[index]}
                        onChange={(e) => handleRollChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select a roll</option>
                        {menuItems.map(item => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {errors.threeRollCombo && <p className="text-red-500 text-sm mt-2 ml-8">{errors.threeRollCombo}</p>}
            </div>

            {/* Single Roll */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="singleRoll"
                  checked={formData.hasSingleRoll}
                  onChange={(e) => setFormData({ ...formData, hasSingleRoll: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <label htmlFor="singleRoll" className="ml-3 font-semibold text-gray-900">
                  Single Roll <span className="text-indigo-600">${PRICES.SINGLE_ROLL}</span>
                </label>
              </div>
              {formData.hasSingleRoll && (
                <div className="ml-8">
                  <select
                    value={formData.singleRoll}
                    onChange={(e) => setFormData({ ...formData, singleRoll: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a roll</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {errors.singleRoll && <p className="text-red-500 text-sm mt-2 ml-8">{errors.singleRoll}</p>}
            </div>

            {/* Beverage */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Beverage <span className="text-gray-400">(+${PRICES.BEVERAGE})</span>
              </label>
              <select
                value={formData.beverage}
                onChange={(e) => setFormData({ ...formData, beverage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">None</option>
                {BEVERAGES.map(bev => (
                  <option key={bev} value={bev}>{bev}</option>
                ))}
              </select>
            </div>

            {/* Miso Soup */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="misoSoup"
                checked={formData.misoSoup}
                onChange={(e) => setFormData({ ...formData, misoSoup: e.target.checked })}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label htmlFor="misoSoup" className="ml-3 font-semibold text-gray-900">
                Miso Soup <span className="text-indigo-600">+${PRICES.MISO_SOUP}</span>
              </label>
            </div>

            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

            {/* Total */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="text-gray-700">Total:</span>
                <span className="text-indigo-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Submit Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;

