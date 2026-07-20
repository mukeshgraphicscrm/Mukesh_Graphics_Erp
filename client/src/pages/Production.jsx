import React, { useState, useEffect } from 'react';
import { Settings, User, Calendar, Clock, AlertTriangle, Plus } from 'lucide-react';
import api from '../lib/api';
import CreateJobModal from '../components/CreateJobModal';
const stages = [
  { id: 1, name: 'Printing', key: 'Printing' },
  { id: 2, name: 'Coating', key: 'Coating' },
  { id: 3, name: 'Lamination', key: 'Lamination' },
  { id: 4, name: 'Die Cutting', key: 'Die Cutting' },
  { id: 5, name: 'Folding', key: 'Folding' },
  { id: 6, name: 'Packing', key: 'Packing' },
];

export default function Production() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    api.get('/productionJobs')
      .then(res => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching production jobs:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Production Floor...</div>;

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Production Floor</h2>
          <p className="text-sm text-gray-500 mt-1">Live tracking of all running job cards.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-add"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-brand-line">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
          </div>
          <Settings className="w-8 h-8 text-brand-line opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-sm font-medium text-gray-500">On Schedule</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.filter(j => j.status === 'On Schedule').length}</p>
          </div>
          <Clock className="w-8 h-8 text-green-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-sm font-medium text-gray-500">At Risk</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.filter(j => j.status === 'At Risk').length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-sm font-medium text-gray-500">Delayed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.filter(j => j.status === 'Delayed').length}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500 opacity-20" />
        </div>
      </div>

      {/* Production Pipeline Tiles */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 overflow-x-auto">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Production Pipeline</h3>
        <div className="flex space-x-4 min-w-max">
          {stages.map((stage) => {
            const count = jobs.filter(j => j.stage === stage.key).length;
            return (
              <div key={stage.id} className="flex-1 min-w-[150px] bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="font-semibold text-gray-900 text-sm">{stage.name}</p>
                  <p className="text-2xl font-bold text-brand-accent mt-2">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">Active jobs</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Job Cards Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Active Job Cards</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {jobs.slice().sort((a, b) => (a.jobCardNo || '').localeCompare(b.jobCardNo || '')).map((job) => (
            <div 
              key={job.id} 
              onClick={() => handleEditJob(job)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:ring-2 hover:ring-brand-accent/20 cursor-pointer transition-all p-6"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-slate-800 tracking-wide">{job.jobCardNo}</span>
                <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
                  {job.stage}
                </span>
              </div>
              
              {/* Title Row */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 text-xl">{job.productName}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {job.customerName || 'Customer Name'} · {job.units ? job.units.toLocaleString('en-IN') : 0} units
                </p>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-bold text-gray-900">{job.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${job.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Machine</p>
                  <p className="text-sm font-medium text-gray-900 truncate" title={job.machine}>{job.machine || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Operator</p>
                  <p className="text-sm font-medium text-gray-900 truncate" title={job.operator}>{job.operator || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deadline</p>
                  <p className="text-sm font-medium text-gray-900">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
              No active job cards found.
            </div>
          )}
        </div>
      </div>
      </div>

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingJob(null);
        }}
        onJobAdded={(newJob) => setJobs(prev => [...prev, newJob])}
        onJobUpdated={(updatedJob) => setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j))}
        jobs={jobs}
        jobToEdit={editingJob}
      />
    </>
  );
}
