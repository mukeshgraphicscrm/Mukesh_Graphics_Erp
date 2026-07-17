import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';

export default function AddProductModal({ isOpen, onClose, onProductAdded, onProductUpdated, productToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food Packaging',
    dimensions: '',
    material: '',
    gsm: '',
    printing: '',
    unitPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'Food Packaging',
        dimensions: productToEdit.dimensions || '',
        material: productToEdit.material || '',
        gsm: productToEdit.gsm || '',
        printing: productToEdit.printing || '',
        unitPrice: productToEdit.unitPrice || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Food Packaging',
        dimensions: '',
        material: '',
        gsm: '',
        printing: '',
        unitPrice: '',
      });
    }
  }, [productToEdit, isOpen]);

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
        ...formData,
        unitPrice: Number(formData.unitPrice),
      };
      
      if (productToEdit) {
        const res = await api.put(`/products/${productToEdit.id}`, payload);
        if (onProductUpdated) onProductUpdated(res.data);
        toast.success('Product updated successfully!');
      } else {
        const res = await api.post('/products', payload);
        if (onProductAdded) onProductAdded(res.data);
        toast.success('Product added successfully!');
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
      toast.error('Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'Food Packaging', label: 'Food Packaging' },
    { value: 'Pharma Packaging', label: 'Pharma Packaging' },
    { value: 'FMCG', label: 'FMCG' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{productToEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. Ice Cream Box"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <CustomSelect
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions *</label>
              <input
                type="text"
                name="dimensions"
                required
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 120x90x60 mm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
              <input
                type="text"
                name="material"
                required
                value={formData.material}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. Duplex Board"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSM *</label>
              <input
                type="text"
                name="gsm"
                required
                value={formData.gsm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 350"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Printing *</label>
              <input
                type="text"
                name="printing"
                required
                value={formData.printing}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 5 Color Offset"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                name="unitPrice"
                required
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 5"
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
              {loading ? 'Saving...' : (productToEdit ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
