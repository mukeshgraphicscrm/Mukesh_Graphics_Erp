import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { UploadCloud } from 'lucide-react';
import api from '../lib/api';

export default function Artworks() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/artworks'),
      api.get('/customers'),
    ]).then(([artRes, custRes]) => {
      const custMap = {};
      custRes.data.forEach(c => custMap[c.id] = c);
      setCustomers(custMap);
      setData(artRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching artworks:', err);
      setLoading(false);
    });
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
    // In a real app, upload these to Firebase Storage here
    alert(`Received ${files.length} file(s). Upload logic to Firebase Storage goes here.`);
  };

  const columns = [
    { header: 'File Name', accessor: row => row.fileName, render: row => <span className="font-medium text-brand-line">{row.fileName}</span> },
    { header: 'Customer', accessor: row => customers[row.customerId]?.name || row.customerId },
    { header: 'Version', accessor: row => row.version, render: row => <span className="text-gray-500">{row.version}</span> },
    { header: 'Uploaded At', accessor: row => new Date(row.uploadedAt).toLocaleDateString('en-IN') },
    { header: 'Status', accessor: row => row.status, render: row => <StatusBadge status={row.status} /> },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Artworks...</div>;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors bg-white ${isDragging ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-brand-accent' : 'text-gray-400'}`} />
        <h3 className="text-lg font-medium text-gray-900">Drop artwork files here</h3>
        <p className="text-sm text-gray-500 mt-1">Supports .pdf, .ai, .psd, .indd up to 200 MB per file</p>
        <button className="mt-4 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          Browse Files
        </button>
      </div>

      {/* Data Table */}
      <div className="h-[calc(100vh-24rem)]">
        <DataTable
          title="Artwork Management"
          subtitle="Manage all customer artwork assets and approval statuses."
          columns={columns}
          data={data}
        />
      </div>
    </div>
  );
}
