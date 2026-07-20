import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import CustomSelect from './CustomSelect';

const stageOptions = [
  { value: 'Printing', label: 'Printing' },
  { value: 'Coating', label: 'Coating' },
  { value: 'Lamination', label: 'Lamination' },
  { value: 'Die Cutting', label: 'Die Cutting' },
  { value: 'Folding', label: 'Folding' },
  { value: 'Packing', label: 'Packing' },
];

const statusOptions = [
  { value: 'On Schedule', label: 'On Schedule' },
  { value: 'At Risk', label: 'At Risk' },
  { value: 'Delayed', label: 'Delayed' },
];

export default function CreateJobModal({ isOpen, onClose, onJobAdded, onJobUpdated, jobs = [], jobToEdit }) {
  const [formData, setFormData] = useState({
    jobCardNo: '',
    productName: '',
    customerName: '',
    units: '',
    stage: 'Printing',
    status: 'On Schedule',
    progress: '0',
    machine: '',
    operator: '',
    deadline: '',
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

  useEffect(() => {
    if (isOpen) {
      if (jobToEdit) {
        setFormData({
          jobCardNo: jobToEdit.jobCardNo || '',
          productName: jobToEdit.productName || '',
          customerName: jobToEdit.customerName || '',
          units: jobToEdit.units || '',
          stage: jobToEdit.stage || 'Printing',
          status: jobToEdit.status || 'On Schedule',
          progress: jobToEdit.progress || '0',
          machine: jobToEdit.machine || '',
          operator: jobToEdit.operator || '',
          deadline: jobToEdit.deadline ? new Date(jobToEdit.deadline).toISOString().split('T')[0] : '',
        });
      } else {
        const currentYear = new Date().getFullYear();
        const prefix = `JC-${currentYear}-`;
        
        let nextNum = 1;
        if (jobs && jobs.length > 0) {
          const currentJobs = jobs.filter(j => j.jobCardNo && j.jobCardNo.startsWith(prefix));
          if (currentJobs.length > 0) {
            const nums = currentJobs.map(j => {
              const parts = j.jobCardNo.split('-');
              return parseInt(parts[2], 10) || 0;
            });
            nextNum = Math.max(...nums) + 1;
          }
        }
        const nextJobNo = `${prefix}${String(nextNum).padStart(3, '0')}`;
        
        // Reset form on open
        setFormData({
          jobCardNo: nextJobNo,
          productName: '',
          customerName: '',
          units: '',
          stage: 'Printing',
          status: 'On Schedule',
          progress: '0',
          machine: '',
          operator: '',
          deadline: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [isOpen, jobs, jobToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'stage') {
      const stageIndex = stageOptions.findIndex(s => s.value === value) + 1;
      const calculatedProgress = Math.round((stageIndex / stageOptions.length) * 100);
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        progress: calculatedProgress.toString()
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        units: Number(formData.units),
        progress: Number(formData.progress),
      };
      if (jobToEdit) {
        const res = await api.put(`/productionJobs/${jobToEdit.id}`, payload);
        if (onJobUpdated) onJobUpdated(res.data);
        toast.success('Job updated successfully!');
      } else {
        const res = await api.post('/productionJobs', payload);
        if (onJobAdded) onJobAdded(res.data);
        toast.success('Job created successfully!');
      }
      onClose();
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job. Please try again.');
      toast.error('Failed to save job.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{jobToEdit ? 'Edit Job' : 'Create Job'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Card No *</label>
              <input
                type="text"
                name="jobCardNo"
                required
                value={formData.jobCardNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. JC-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="productName"
                required
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
              <CustomSelect
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                options={stageOptions}
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Units *</label>
              <input
                type="number"
                name="units"
                required
                min="1"
                value={formData.units}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. 10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%) *</label>
              <input
                type="number"
                name="progress"
                required
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
              <input
                type="text"
                name="machine"
                value={formData.machine}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. Heidelberg CD 102"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
              <input
                type="text"
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
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
              {loading ? 'Saving...' : (jobToEdit ? 'Save Changes' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
