import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ScheduleDispatchModal({ isOpen, onClose, onDispatchScheduled, onDispatchUpdated, dispatchToEdit }) {
  const [formData, setFormData] = useState({
    dispatchNo: '',
    customer: '',
    vehicleNo: '',
    driver: '',
    date: '',
    status: 'Scheduled',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-generate DSP number or set existing data when modal opens
    if (isOpen) {
      if (dispatchToEdit) {
        setFormData({
          dispatchNo: dispatchToEdit.dispatchNo || '',
          customer: dispatchToEdit.customer || '',
          vehicleNo: dispatchToEdit.vehicleNo || '',
          driver: dispatchToEdit.driver || '',
          date: dispatchToEdit.date || '',
          status: dispatchToEdit.status || 'Scheduled',
        });
      } else {
        const randomNum = Math.floor(100 + Math.random() * 900);
        setFormData({
          dispatchNo: `DSP-${randomNum}`,
          customer: '',
          vehicleNo: '',
          driver: '',
          date: new Date().toISOString().split('T')[0],
          status: 'Scheduled',
        });
      }
    }
  }, [isOpen, dispatchToEdit]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...(dispatchToEdit || {}),
        ...formData,
      };
      
      if (!dispatchToEdit) {
        payload.createdAt = new Date().toISOString();
      }

      if (dispatchToEdit) {
        const res = await api.put(`/dispatches/${dispatchToEdit.id}`, payload);
        if (onDispatchUpdated) onDispatchUpdated(res.data);
        toast.success('Dispatch updated successfully!');
      } else {
        const res = await api.post('/dispatches', payload);
        if (onDispatchScheduled) onDispatchScheduled(res.data);
        toast.success('Dispatch scheduled successfully!');
      }

      setFormData({ dispatchNo: '', customer: '', vehicleNo: '', driver: '', date: '', status: 'Scheduled' });
      onClose();
    } catch (err) {
      console.error('Error saving dispatch:', err);
      setError('Failed to save dispatch. Please try again.');
      toast.error('Failed to save dispatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{dispatchToEdit ? 'Edit Dispatch' : 'Schedule Dispatch'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                name="customer"
                required
                value={formData.customer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                placeholder="e.g. Amul Foods"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No.</label>
                <input
                  type="text"
                  name="vehicleNo"
                  required
                  value={formData.vehicleNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors uppercase"
                  placeholder="e.g. GJ01AB1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  name="driver"
                  required
                  value={formData.driver}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                  placeholder="e.g. Suresh Patel"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Loading">Loading</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1b2f63] rounded-md hover:bg-[#112046] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (dispatchToEdit ? 'Save Changes' : 'Schedule Dispatch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
