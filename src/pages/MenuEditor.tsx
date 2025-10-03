import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { MenuItem } from '../types';

const MenuEditor: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAppContext();
  const navigate = useNavigate();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (editingId) {
      updateMenuItem(editingId, formData);
    } else {
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined
      };
      addMenuItem(newItem);
    }
    
    resetForm();
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image || ''
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Menu Editor</h1>
              <p className="text-gray-600">Manage sushi roll options</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back Home
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Roll'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Roll' : 'Add New Roll'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Roll Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Spicy Salmon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of the roll"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  {editingId ? 'Update Roll' : 'Add Roll'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Menu ({menuItems.length} items)</h2>
          
          {menuItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No menu items yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      )}
                      {item.image && (
                        <div className="mt-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-32 h-20 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;

