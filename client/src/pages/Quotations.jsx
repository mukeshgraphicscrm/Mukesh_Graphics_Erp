import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import CreateQuotationModal from '../components/CreateQuotationModal';
import api from '../lib/api';

export default function Quotations() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/quotations'),
      api.get('/customers'),
      api.get('/products')
    ]).then(([qtnsRes, custRes, prodRes]) => {
      const custMap = {};
      custRes.data.forEach(c => custMap[c.id] = c);
      setCustomers(custMap);
      
      const prodMap = {};
      prodRes.data.forEach(p => prodMap[p.id] = p);
      setProducts(prodMap);
      
      setData(qtnsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching quotations:', err);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'QUOTATION #', accessor: row => row.quotationNo, render: row => <span className="font-bold text-[#1e3a8a] text-[13px]">{row.quotationNo}</span> },
    { 
      header: 'CUSTOMER', 
      accessor: row => customers[row.customerId]?.name || row.customerId,
      render: row => <span className="font-medium text-gray-900 text-[13px]">{customers[row.customerId]?.name || row.customerId}</span> 
    },
    { 
      header: 'PRODUCT', 
      accessor: row => `${products[row.productId]?.name || row.productId} - ${row.specs || ''}`, 
      render: row => (
        <div className="max-w-[250px]">
          <div className="font-bold text-gray-900 text-[13px] truncate" title={products[row.productId]?.name || row.productId}>
            {products[row.productId]?.name || row.productId}
          </div>
          <div className="text-[12px] text-gray-500 truncate" title={row.specs}>{row.specs}</div>
        </div>
      )
    },
    { 
      header: 'QTY', 
      accessor: row => row.qty, 
      render: row => <span className="text-gray-900 text-[13px]">{row.qty?.toLocaleString('en-IN') || 0}</span> 
    },
    { 
      header: 'COST', 
      accessor: row => row.cost, 
      render: row => <span className="text-gray-600 text-[13px]">₹{row.cost?.toLocaleString('en-IN') || 0}</span> 
    },
    { 
      header: 'PRICE', 
      accessor: row => row.price, 
      render: row => <span className="font-bold text-gray-900 text-[13px]">₹{row.price?.toLocaleString('en-IN') || 0}</span> 
    },
    { 
      header: 'PROFIT', 
      accessor: row => row.profit, 
      render: row => (
        <span className="text-emerald-500 font-bold text-[13px]">
          ₹{row.profit?.toLocaleString('en-IN') || 0}
        </span>
      )
    },
    { header: 'STATUS', accessor: row => row.status, render: row => <StatusBadge status={row.status} /> },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Quotations...</div>;

  const handleQuotationAdded = (newQuotation) => {
    setData((prev) => [newQuotation, ...prev]);
  };

  const handleQuotationUpdated = (updatedQuotation) => {
    setData((prev) => prev.map(q => q.id === updatedQuotation.id ? updatedQuotation : q));
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <DataTable
        title="Quotations"
        subtitle="Manage and send price estimations to customers."
        actionButton={
          <button 
            onClick={() => {
              setQuotationToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn-add"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Quotation</span>
          </button>
        }
        columns={columns}
        data={data}
        onRowClick={(row) => {
          setQuotationToEdit(row);
          setIsModalOpen(true);
        }}
      />
      <CreateQuotationModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setQuotationToEdit(null);
        }} 
        onQuotationAdded={handleQuotationAdded} 
        onQuotationUpdated={handleQuotationUpdated}
        quotations={data}
        quotationToEdit={quotationToEdit}
      />
    </div>
  );
}
