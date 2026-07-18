import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';

export default function AddLeadModal({ isOpen, onClose, onLeadAdded }) {
  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    city: '',
    amount: '',
    notes: '',
    stage: 'New Inquiry',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const res = await api.post('/leads', formData);
      if (onLeadAdded) onLeadAdded(res.data);
      toast.success('Lead added successfully!');
      setFormData({ company: '', contactPerson: '', city: '', amount: '', notes: '', stage: 'New Inquiry' });
      onClose();
    } catch (err) {
      console.error('Error adding lead:', err);
      setError('Failed to add lead. Please try again.');
      toast.error('Failed to add lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                placeholder="e.g. ABC Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount (₹)</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors"
                placeholder="e.g. 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b2f63]/50 focus:border-[#1b2f63] transition-colors resize-none"
                placeholder="Add any relevant notes or requirements..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <CustomSelect
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                options={[
                  { label: 'New Inquiry', value: 'New Inquiry' },
                  { label: 'Follow Up', value: 'Follow Up' },
                  { label: 'Quotation Sent', value: 'Quotation Sent' },
                  { label: 'Negotiation', value: 'Negotiation' },
                  { label: 'Won', value: 'Won' },
                  { label: 'Lost', value: 'Lost' }
                ]}
              />
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
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
