import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Edit2, Trash2, Copy, RefreshCw, Download, Upload } from 'lucide-react';

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    length: 16
  });
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('passwords');
    if (saved) {
      setPasswords(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (data) => {
    localStorage.setItem('passwords', JSON.stringify(data));
    setPasswords(data);
  };

  const generatePassword = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.password) {
      showNotification('Please fill in all fields');
      return;
    }

    const entry = {
      name: formData.name,
      password: formData.password,
      lastUpdated: new Date().toLocaleString()
    };

    let newPasswords;
    if (editingIndex !== null) {
      newPasswords = [...passwords];
      newPasswords[editingIndex] = entry;
      showNotification('Password updated successfully!');
    } else {
      newPasswords = [...passwords, entry];
      showNotification('Password added successfully!');
    }

    saveToStorage(newPasswords);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', password: '', length: 16 });
    setShowModal(false);
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setFormData({
      name: passwords[index].name,
      password: passwords[index].password,
      length: 16
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      const newPasswords = passwords.filter((_, i) => i !== index);
      saveToStorage(newPasswords);
      showNotification('Password deleted successfully!');
    }
  };

  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    showNotification(`Password for ${name} copied to clipboard!`);
  };

  const togglePasswordVisibility = (index) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passwords.json';
    link.click();
    showNotification('Passwords exported successfully!');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          saveToStorage(imported);
          showNotification('Passwords imported successfully!');
        } catch (error) {
          showNotification('Error importing file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🔐 Password Manager</h1>
              <p className="text-gray-600 mt-1">Securely manage all your passwords</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Download size={18} />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {notification && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg mb-4 shadow-lg">
            {notification}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition mb-6 flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Add New Password
        </button>

        <div className="space-y-4">
          {passwords.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No passwords saved yet. Click "Add New Password" to get started!
            </div>
          ) : (
            passwords.map((entry, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{entry.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type={visiblePasswords[index] ? 'text' : 'password'}
                        value={entry.password}
                        readOnly
                        className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 font-mono"
                      />
                      <button
                        onClick={() => togglePasswordVisibility(index)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                      >
                        {visiblePasswords[index] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(entry.password, entry.name)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Last updated: {entry.lastUpdated}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingIndex !== null ? 'Edit Password' : 'Add New Password'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name (website/service)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Gmail, Facebook"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, password: generatePassword(formData.length) })}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                      title="Generate password"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Password Length: {formData.length}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>8</span>
                    <span>32</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    {editingIndex !== null ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordManager;
