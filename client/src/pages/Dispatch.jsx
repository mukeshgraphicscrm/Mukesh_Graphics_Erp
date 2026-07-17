import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { MapPin, FileText, Truck, Plus } from 'lucide-react';
import ScheduleDispatchModal from '../components/ScheduleDispatchModal';
import api from '../lib/api';

export default function Dispatch() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchToEdit, setDispatchToEdit] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/dispatches'),
      api.get('/customers'),
    ]).then(([dspRes, custRes]) => {
      const custMap = {};
      custRes.data.forEach(c => custMap[c.id] = c);
      setCustomers(custMap);
      setData(dspRes.data || []);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching dispatches:', err);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'DISPATCH #', accessor: row => row.dispatchNo, render: row => <span className="font-bold text-gray-900 text-[13px]">{row.dispatchNo}</span> },
    { header: 'CUSTOMER', accessor: row => row.customer || customers[row.customerId]?.name || row.customerId, render: row => <span className="text-[13px] text-gray-700 font-medium">{row.customer || customers[row.customerId]?.name || row.customerId}</span> },
    { header: 'VEHICLE', accessor: row => row.vehicleNo, render: row => (
        <div className="flex items-center text-gray-600 text-[13px]">
          <Truck className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-mono">{row.vehicleNo}</span>
        </div>
      ) 
    },
    { header: 'DRIVER', accessor: row => row.driver, render: row => <span className="text-[13px] text-gray-700">{row.driver}</span> },
    { header: 'DATE', accessor: row => new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), render: row => <span className="text-[13px] text-gray-500">{new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
    { header: 'STATUS', accessor: row => row.status, render: row => <StatusBadge status={row.status} /> },
    { 
      header: 'ACTIONS', 
      accessor: () => null, 
      render: () => (
        <div className="flex space-x-3">
          <button className="text-gray-400 hover:text-[#1b2f63] transition-colors" title="View Challan">
            <FileText className="w-4 h-4" />
          </button>
          <button className="text-[#1b2f63] hover:text-[#112046] transition-colors bg-blue-50 p-1 rounded" title="View Map Location">
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      ) 
    },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dispatch Schedule...</div>;

  return (
    <>
      <div className="h-[calc(100vh-8rem)]">
        <DataTable
          title="Dispatch"
          subtitle="Vehicles, drivers and delivery challans — every shipment tracked."
          searchPlaceholder="Search dispatch #, vehicle, driver..."
          actionButton={
            <button 
              onClick={() => {
                setDispatchToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-[#1b2f63] hover:bg-[#112046] text-white px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors shadow-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Schedule Dispatch
            </button>
          }
          columns={columns}
          data={data}
          onRowClick={(row) => {
            setDispatchToEdit(row);
            setIsModalOpen(true);
          }}
        />
      </div>

      <ScheduleDispatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDispatchToEdit(null);
        }}
        onDispatchScheduled={(newDispatch) => {
          setData(prev => [newDispatch, ...prev]);
        }}
        onDispatchUpdated={(updatedDispatch) => {
          setData(prev => prev.map(d => d.id === updatedDispatch.id ? updatedDispatch : d));
        }}
        dispatchToEdit={dispatchToEdit}
      />
    </>
  );
}
