import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';

const OrderManagement: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder, updateIndividualOrder, deleteIndividualOrder, deleteOrder, completeOrder, loading } = useAppContext();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [deletingIndividualOrderId, setDeletingIndividualOrderId] = useState<string | null>(null);

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

  const shareableLink = `${window.location.origin}/order/${orderId}`;
  const inStoreLink = `${window.location.origin}/instore/${orderId}`;
  const totalAmount = order.orders.reduce((sum, o) => sum + o.total, 0);
  const packagedCount = order.orders.filter(o => o.packaged).length;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTogglePackaged = async (individualOrderId: string, currentStatus: boolean) => {
    try {
      await updateIndividualOrder(orderId!, individualOrderId, { packaged: !currentStatus });
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(orderId!);
      navigate('/');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await completeOrder(orderId!);
      setShowCompleteConfirm(false);
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  const handleDeleteIndividualOrder = async () => {
    if (!deletingIndividualOrderId) return;
    try {
      await deleteIndividualOrder(orderId!, deletingIndividualOrderId);
      setDeletingIndividualOrderId(null);
    } catch (error) {
      console.error('Error deleting individual order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 print:shadow-none">
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{formatDate(order.date)}</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-700 font-medium print:hidden"
            >
              ← Back Home
            </button>
          </div>

          {/* Share Link */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 print:hidden">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    {copiedLink ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs font-semibold text-gray-700">In Store View</label>
                <button
                  onClick={() => navigate(`/instore/${orderId}`)}
                  className="bg-white p-2 rounded-lg border border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer"
                  title="Click to open In Store view"
                >
                  <QRCodeSVG value={inStoreLink} size={80} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-blue-600">{order.orders.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Packaged</p>
              <p className="text-2xl font-bold text-green-600">{packagedCount}/{order.orders.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-purple-600">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              onClick={() => navigate(`/payment/${orderId}`)}
              className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              💰 Payment Tracking
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[150px] bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🖨️ Print Order
            </button>
            {order.status === 'active' && (
              <button
                onClick={() => setShowCompleteConfirm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                ✓ Close Order
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
          
          {order.orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No orders yet</p>
              <p className="text-sm">Share the link above to start collecting orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {order.orders.map((individualOrder) => (
                <div
                  key={individualOrder.id}
                  className={`border rounded-lg p-6 transition ${
                    individualOrder.packaged
                      ? 'bg-gray-50 border-gray-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`text-xl font-semibold ${
                            individualOrder.packaged ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {individualOrder.name}
                        </h3>
                        {individualOrder.packaged && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            ✓ Packaged
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

                    <div className="text-right ml-4 flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-indigo-600">
                        ${individualOrder.total.toFixed(2)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePackaged(individualOrder.id, individualOrder.packaged)}
                          className={`px-4 py-2 rounded-lg font-semibold transition print:hidden ${
                            individualOrder.packaged
                              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {individualOrder.packaged ? 'Unmark' : 'Mark Packaged'}
                        </button>
                        <button
                          onClick={() => setDeletingIndividualOrderId(individualOrder.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition print:hidden"
                          title="Delete order"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          {order.orders.length > 0 && (
            <div className="border-t border-gray-300 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">Grand Total:</span>
                <span className="text-3xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Individual Order Confirmation Modal */}
      {deletingIndividualOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete This Order?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this individual order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingIndividualOrderId(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIndividualOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Order?</h3>
            <p className="text-gray-700 mb-6">
              Mark this order as complete? This will move it to the Completed Orders section on the home page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOrder}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Order?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this order? This action cannot be undone and will permanently remove all {order.orders.length} individual order{order.orders.length !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

