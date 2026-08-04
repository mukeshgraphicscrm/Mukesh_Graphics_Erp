import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function CreateOrderModal({ isOpen, onClose, onOrderAdded, onOrderUpdated, onOrderDeleted, orders = [], orderToEdit, startInEditMode, initialData }) {
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState({
    orderNo: '',
    customerId: '',
    productId: '',
    quantity: '',
    amount: '',
    orderDate: '',
    deliveryDate: '',
    notes: '',
    status: 'Approved',
  });
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatIndianNumber = (numStr) => {
    if (!numStr) return '';
    const numericOnly = numStr.toString().replace(/[^0-9.]/g, '');
    const parts = numericOnly.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherNumbers = integerPart.substring(0, integerPart.length - 3);
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return integerPart + decimalPart;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleteModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeleteModalOpen]);

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
      setIsViewMode(!startInEditMode && !!orderToEdit);

      if (orderToEdit) {
        setFormData({
          orderNo: orderToEdit.orderNo || '',
          customerId: orderToEdit.customerId || '',
          productId: orderToEdit.productId || '',
          quantity: formatIndianNumber(orderToEdit.quantity || ''),
          amount: formatIndianNumber(orderToEdit.amount || ''),
          orderDate: orderToEdit.orderDate ? new Date(orderToEdit.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          deliveryDate: orderToEdit.deliveryDate ? new Date(orderToEdit.deliveryDate).toISOString().split('T')[0] : '',
          notes: orderToEdit.notes || '',
          status: orderToEdit.status || 'Approved',
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
          customerId: initialData?.customerId || '',
          productId: initialData?.productId || '',
          quantity: formatIndianNumber(initialData?.qty || ''),
          amount: formatIndianNumber((initialData?.qty || 0) * (initialData?.price || 0) || ''),
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate: new Date().toISOString().split('T')[0],
          notes: initialData?.specs ? `Specs: ${initialData.specs}` : '',
          status: 'Job Preparation',
        });

        setIsViewMode(false);
      }
    }
  }, [isOpen, orders, orderToEdit, startInEditMode, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'notes') {
      setFormData((prev) => ({ ...prev, [name]: typeof value === 'string' ? value.toUpperCase() : value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const formatted = formatIndianNumber(value);
    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity.toString().replace(/,/g, '')),
        amount: Number(formData.amount.toString().replace(/,/g, '')),
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

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/orders/${orderToEdit.id}`);
      if (onOrderDeleted) onOrderDeleted(orderToEdit.id);
      toast.success('Order deleted successfully!');
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error('Failed to delete order.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Approved', label: 'Approved' },
    { value: 'Job Preparation', label: 'Job Preparation' },
    { value: 'Printing', label: 'Printing' },
    { value: 'In Production', label: 'In Production' },
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
          <h2 className="text-lg font-bold text-gray-900">
            {isViewMode ? 'View Order' : (orderToEdit ? 'Edit Order' : 'Create Order')}
          </h2>
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="text"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors ${
                    isViewMode ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 50,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="text"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleNumberChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors ${
                    isViewMode ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 25,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                <input
                  type="date"
                  name="orderDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.orderDate}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors ${
                    isViewMode ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors ${
                    isViewMode ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isViewMode}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors resize-none ${
                    isViewMode ? 'bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300'
                  }`}
                  placeholder="Enter any additional notes or instructions..."
                />
              </div>
            </div>
            
            <div className={`mt-8 flex ${orderToEdit ? 'justify-between' : 'justify-end'} items-center border-t border-gray-100 pt-5`}>
              {orderToEdit && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Order
                </button>
              )}
              <div className="flex space-x-3">
                {isViewMode ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsViewMode(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primarydark transition-colors"
                    >
                      Edit Order
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone and it will be permanently removed from the system."
        isLoading={loading}
      />
    </div>
  );
}
