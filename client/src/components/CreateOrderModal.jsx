import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';

export default function CreateOrderModal({ isOpen, onClose, onOrderAdded, onOrderUpdated, orders = [], orderToEdit }) {
  const [formData, setFormData] = useState({
    orderNo: '',
    customerId: '',
    productId: '',
    quantity: '',
    amount: '',
    deliveryDate: '',
    status: 'Pending',
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
      
      if (orderToEdit) {
        setFormData({
          orderNo: orderToEdit.orderNo || '',
          customerId: orderToEdit.customerId || '',
          productId: orderToEdit.productId || '',
          quantity: orderToEdit.quantity || '',
          amount: orderToEdit.amount || '',
          deliveryDate: orderToEdit.deliveryDate ? new Date(orderToEdit.deliveryDate).toISOString().split('T')[0] : '',
          status: orderToEdit.status || 'Pending',
        });
      } else {
        let nextNum = 1;
        if (orders && orders.length > 0) {
          const currentOrders = orders.filter(o => o.orderNo && o.orderNo.startsWith(`ORD-`));
          if (currentOrders.length > 0) {
            const nums = currentOrders.map(o => {
              const parts = o.orderNo.split('-');
              return parseInt(parts[1], 10) || 0;
            });
            nextNum = Math.max(...nums) + 1;
          }
        }
        const nextOrderNo = `ORD-${String(nextNum).padStart(3, '0')}`;
        
        // Reset form on open
        setFormData({
          orderNo: nextOrderNo,
          customerId: '',
          productId: '',
          quantity: '',
          amount: '',
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
        });
      }
    }
  }, [isOpen, orders, orderToEdit]);

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
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
      };
      if (orderToEdit) {
        const res = await api.put(`/orders/${orderToEdit.id}`, payload);
        if (onOrderUpdated) onOrderUpdated(res.data);
        toast.success('Order updated successfully!');
      } else {
        const res = await api.post('/orders', payload);
        if (onOrderAdded) onOrderAdded(res.data);
        toast.success('Order created successfully!');
      }
      onClose();
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to save order. Please try again.');
      toast.error('Failed to save order.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'In Production', label: 'In Production' },
    { value: 'Printing Stage', label: 'Printing Stage' },
    { value: 'Ready For Dispatch', label: 'Ready For Dispatch' },
    { value: 'Dispatched', label: 'Dispatched' },
    { value: 'Completed', label: 'Completed' },
  ];

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
  const productOptions = products.map(p => ({ value: p.id, label: p.name }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{orderToEdit ? 'Edit Order' : 'Create Order'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Order No *</label>
                <input
                  type="text"
                  name="orderNo"
                  readOnly
                  value={formData.orderNo}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <CustomSelect
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  options={productOptions}
                  placeholder="Select Product"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                  placeholder="e.g. 25000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  required
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                />
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
                {loading ? 'Saving...' : (orderToEdit ? 'Save Changes' : 'Create Order')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
