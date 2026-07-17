import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded, onCustomerUpdated, customerToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    mobile: '',
    city: '',
    gstNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name || '',
        contactPerson: customerToEdit.contactPerson || '',
        mobile: customerToEdit.mobile || '',
        city: customerToEdit.city || '',
        gstNumber: customerToEdit.gstNumber || '',
      });
    } else {
      setFormData({ name: '', contactPerson: '', mobile: '', city: '', gstNumber: '' });
    }
  }, [customerToEdit, isOpen]);

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
      if (customerToEdit) {
        const payload = { ...formData };
        const res = await api.put(`/customers/${customerToEdit.id}`, payload);
        if (onCustomerUpdated) onCustomerUpdated(res.data);
        toast.success('Customer updated successfully!');
      } else {
        const payload = {
          ...formData,
          outstanding: 0,
          totalBusiness: 0,
          createdAt: new Date().toISOString(),
        };
        const res = await api.post('/customers', payload);
        if (onCustomerAdded) onCustomerAdded(res.data);
        toast.success('Customer added successfully!');
      }
      onClose();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError('Failed to save customer. Please try again.');
      toast.error('Failed to save customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{customerToEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company / Customer Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. Acme Corp"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    if (onlyNums.length <= 10) {
                      setFormData(prev => ({ ...prev, mobile: onlyNums }));
                    }
                  }}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Mobile number must be exactly 10 digits"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 27AADCB2230M1Z2"
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
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primarydark transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (customerToEdit ? 'Save Changes' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
