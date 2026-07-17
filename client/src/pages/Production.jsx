import React, { useState, useEffect } from 'react';
import { Settings, User, Calendar, Clock, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Production Floor</h2>
        <p className="text-sm text-gray-500 mt-1">Live tracking of all running job cards.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 bg-semantic-info-bg text-semantic-info-text text-xs font-semibold rounded-md mb-2">
                    {job.stage}
                  </span>
                  <h4 className="font-bold text-gray-900 text-lg">{job.jobCardNo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{job.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Units</p>
                  <p className="font-semibold text-gray-900">{job.units.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-5 bg-gray-50 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Progress</span>
                    <span className="text-brand-accent font-bold">{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-brand-accent h-1.5 rounded-full" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Settings className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700 truncate" title={job.machine}>{job.machine}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{job.operator}</span>
                  </div>
                  <div className="col-span-2 flex items-center text-sm border-t border-gray-200 pt-3 mt-1">
                    <Calendar className="w-4 h-4 text-amber-500 mr-2" />
                    <span className="text-gray-700">Deadline: <span className="font-semibold text-gray-900">{new Date(job.deadline).toLocaleDateString('en-IN')}</span></span>
                  </div>
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
  );
}
