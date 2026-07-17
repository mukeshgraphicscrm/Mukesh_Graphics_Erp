import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../lib/api';
import AddLeadModal from '../components/AddLeadModal';
const columnsConfig = [
  { id: 'New Inquiry', label: 'New Inquiry', color: 'bg-blue-500' },
  { id: 'Follow Up', label: 'Follow Up', color: 'bg-amber-500' },
  { id: 'Quotation Sent', label: 'Quotation Sent', color: 'bg-brand-navy' },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'Won', label: 'Won', color: 'bg-green-500' },
  { id: 'Lost', label: 'Lost', color: 'bg-red-500' },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leads:', err);
        setLoading(false);
      });
  }, []);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, newStage) => {
    const id = e.dataTransfer.getData('leadId');
    // Optimistic UI update
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, stage: newStage } : lead
    ));

    // Update in backend
    api.put(`/leads/${id}`, { stage: newStage })
      .catch(err => {
        console.error('Error updating lead stage:', err);
        // In a real app, revert the UI state here
      });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Leads...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lead Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Drag and drop leads through the sales pipeline.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-primarydark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {columnsConfig.map(col => {
            const columnLeads = leads.filter(l => l.stage === col.id);
            const totalValue = columnLeads.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
            
            return (
              <div 
                key={col.id} 
                className="w-80 flex flex-col bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className={`h-1 w-full ${col.color}`}></div>
                <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {columnLeads.length}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      ₹{totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {columnLeads.map(lead => (
                    <div 
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-brand-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">{lead.company}</h4>
                        <span className="text-xs font-semibold text-brand-accent">
                          ₹{(Number(lead.amount) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {lead.contactPerson} • {lead.city}
                      </div>
                      
                      {lead.notes && (
                        <div className="bg-gray-50 p-2 rounded text-[11px] text-gray-600 mb-3 border border-gray-100 line-clamp-2">
                          {lead.notes}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <div className="w-5 h-5 rounded-full bg-brand-navylight text-white flex items-center justify-center text-[10px] font-bold" title="Assignee">
                          {lead.contactPerson?.charAt(0) || 'U'}
                        </div>
                        <button className="text-[10px] text-brand-accent hover:underline ml-auto">
                          Create Quotation
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-gray-400">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onLeadAdded={(newLead) => setLeads(prev => [newLead, ...prev])} 
      />
    </div>
  );
}
