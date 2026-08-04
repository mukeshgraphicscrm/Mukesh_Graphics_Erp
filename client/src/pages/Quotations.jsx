import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, ArrowRightLeft, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import CreateQuotationModal from '../components/CreateQuotationModal';
import api from '../lib/api';


export default function Quotations() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState(null);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);


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
    { header: 'QUOTATION No.', accessor: row => row.quotationNo, render: row => <span className="font-bold text-[#1e3a8a] text-[13px]">{row.quotationNo}</span> },
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
      header: 'TOTAL AMOUNT',
      accessor: row => (row.qty || 0) * (row.price || 0),
      render: row => <span className="font-bold text-gray-900 text-[13px]">₹{((row.qty || 0) * (row.price || 0)).toLocaleString('en-IN')}</span>
    },
    {
      header: 'DOCUMENT',
      accessor: 'document',
      render: row => (
        <button 
          onClick={(e) => { e.stopPropagation(); generatePDF(row); }}
          className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-md hover:bg-brand-primary/20 transition-colors"
          title="Generate Quotation Document"
        >
          <FileDown className="w-4 h-4" />
        </button>
      )
    },
    {
      header: 'ACTION',
      accessor: 'action',
      render: row => <QuotationActions row={row} onEdit={handleEdit} onDelete={handleDeleteClick} onMoveToOrder={handleMoveToOrder} />
    }
  ];


  if (loading) return <div className="p-8 text-center text-gray-500">Loading Quotations...</div>;

  
  const handleEdit = (row) => {
    setQuotationToEdit(row);
    setStartInEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setQuotationToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/quotations/${quotationToDelete.id}`);
      setData(data.filter(q => q.id !== quotationToDelete.id));
      toast.success('Quotation deleted successfully!');
      setIsDeleteModalOpen(false);
      setQuotationToDelete(null);
    } catch (err) {
      console.error('Error deleting quotation:', err);
      toast.error('Failed to delete quotation.');
    }
  };

  const handleMoveToOrder = async (quote) => {
    navigate('/orders', { state: { convertQuote: quote } });
  };

  const generatePDF = (quote) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('QUOTATION', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Quotation No: ${quote.quotationNo}`, 14, 40);
    const custName = customers[quote.customerId]?.name || quote.customerId;
    doc.text(`Customer: ${custName}`, 14, 48);
    const prodName = products[quote.productId]?.name || quote.productId;
    doc.text(`Product: ${prodName}`, 14, 56);
    doc.text(`Specs: ${quote.specs || ''}`, 14, 64);
    
    doc.text(`Quantity: ${quote.qty?.toLocaleString('en-IN') || 0}`, 14, 80);
    doc.text(`Unit Price: Rs. ${quote.price?.toLocaleString('en-IN') || 0}`, 14, 88);
    doc.text(`Total Amount: Rs. ${((quote.qty || 0) * (quote.price || 0)).toLocaleString('en-IN')}`, 14, 96);

    doc.save(`${quote.quotationNo}.pdf`);
    toast.success('Quotation document generated!');
  };

  const handleQuotationDeleted = (deletedQuote) => {
    setData(prev => prev.filter(q => q.id !== deletedQuote.id));
  };

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
              setStartInEditMode(true);
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
          setStartInEditMode(false);
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
        onQuotationDeleted={handleQuotationDeleted}
        quotations={data}
        quotationToEdit={quotationToEdit}
        startInEditMode={startInEditMode}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setQuotationToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation? This action cannot be undone."
      />
    </div>
  );
}

const QuotationActions = ({ row, onEdit, onDelete, onMoveToOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 192 });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
          className="w-48 bg-white rounded-md shadow-[0_0_15px_rgba(0,0,0,0.15)] border border-gray-100 z-[9999] py-1"
        >
          <button
            onClick={() => { setIsOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </button>
          <button
            onClick={() => { setIsOpen(false); onMoveToOrder(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" /> Move to Order
          </button>
          <div className="h-[1px] bg-gray-100 my-1"></div>
          <button
            onClick={() => { setIsOpen(false); onDelete(row); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
