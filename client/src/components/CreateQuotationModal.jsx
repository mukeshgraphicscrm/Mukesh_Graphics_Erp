import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';

export default function CreateQuotationModal({ isOpen, onClose, onQuotationAdded, onQuotationUpdated, quotations = [], quotationToEdit }) {
  const [formData, setFormData] = useState({
    quotationNo: '',
    customerId: '',
    productId: '',
    specs: '',
    qty: '',
    cost: '',
    price: '',
    status: 'Draft',
  });
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]).then(([custRes, prodRes]) => {
        setCustomers(custRes.data);
        setProducts(prodRes.data);
        setFetching(false);
      }).catch(err => {
        console.error('Error fetching data:', err);
        toast.error('Failed to load customers and products.');
        setFetching(false);
      });
      
      if (quotationToEdit) {
        setFormData({
          quotationNo: quotationToEdit.quotationNo || '',
          customerId: quotationToEdit.customerId || '',
          productId: quotationToEdit.productId || '',
          specs: quotationToEdit.specs || '',
          qty: quotationToEdit.qty || '',
          cost: quotationToEdit.cost || '',
          price: quotationToEdit.price || '',
          status: quotationToEdit.status || 'Draft',
        });
      } else {
        const year = new Date().getFullYear();
        let nextNum = 1;
        if (quotations && quotations.length > 0) {
          const currentYearQtns = quotations.filter(q => q.quotationNo && q.quotationNo.startsWith(`QTN-${year}-`));
          if (currentYearQtns.length > 0) {
            const nums = currentYearQtns.map(q => {
              const parts = q.quotationNo.split('-');
              return parseInt(parts[2], 10) || 0;
            });
            nextNum = Math.max(...nums) + 1;
          }
        }
        const nextQuotationNo = `QTN-${year}-${String(nextNum).padStart(3, '0')}`;
        
        // Reset form on open
        setFormData({
          quotationNo: nextQuotationNo,
          customerId: '',
          productId: '',
          specs: '',
          qty: '',
          cost: '',
          price: '',
          status: 'Draft',
        });
      }
    }
  }, [isOpen, quotations, quotationToEdit]);

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
        ...formData,
        qty: Number(formData.qty),
        cost: Number(formData.cost),
        price: Number(formData.price),
        profit: Number(formData.price) - Number(formData.cost),
      };
      if (quotationToEdit) {
        const res = await api.put(`/quotations/${quotationToEdit.id}`, payload);
        if (onQuotationUpdated) onQuotationUpdated(res.data);
        toast.success('Quotation updated successfully!');
      } else {
        const res = await api.post('/quotations', payload);
        if (onQuotationAdded) onQuotationAdded(res.data);
        toast.success('Quotation created successfully!');
      }
      onClose();
    } catch (err) {
      console.error('Error saving quotation:', err);
      setError('Failed to save quotation. Please try again.');
      toast.error('Failed to save quotation.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{quotationToEdit ? 'Edit Quotation' : 'Create Quotation'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {fetching ? (
          <div className="p-8 text-center text-gray-500">Loading form data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation No *</label>
                <input
                  type="text"
                  name="quotationNo"
                  readOnly
                  value={formData.quotationNo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <CustomSelect
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <CustomSelect
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  options={customerOptions}
                  placeholder="Select Customer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="productId"
                  required
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. Premium Carton"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Specs *</label>
                <input
                  type="text"
                  name="specs"
                  required
                  value={formData.specs}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. 350 GSM Duplex · 5 Color Offset"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="qty"
                  required
                  min="1"
                  value={formData.qty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    name="cost"
                    required
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                    placeholder="e.g. 3.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                    placeholder="e.g. 4.20"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3 border-t border-gray-100 pt-5">
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
                {loading ? 'Saving...' : (quotationToEdit ? 'Save Changes' : 'Create Quotation')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
