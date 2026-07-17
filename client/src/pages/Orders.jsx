import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import CreateOrderModal from '../components/CreateOrderModal';
import api from '../lib/api';

export default function Orders() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  useEffect(() => {
    // In a real app, you might fetch populated data from the backend. 
    // Here we fetch multiple and join.
    Promise.all([
      api.get('/orders'),
      api.get('/customers'),
      api.get('/products')
    ]).then(([ordersRes, custRes, prodRes]) => {
      const custMap = {};
      custRes.data.forEach(c => custMap[c.id] = c);
      setCustomers(custMap);
      
      const prodMap = {};
      prodRes.data.forEach(p => prodMap[p.id] = p);
      setProducts(prodMap);
      
      setData(ordersRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching orders:', err);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'Order #', accessor: row => row.orderNo, render: row => <span className="font-medium text-brand-accent">{row.orderNo}</span> },
    { header: 'Customer', accessor: row => customers[row.customerId]?.name || row.customerId },
    { header: 'Product', accessor: row => products[row.productId]?.name || row.productId },
    { header: 'Quantity', accessor: row => row.quantity.toLocaleString('en-IN') },
    { header: 'Amount', accessor: row => `₹${row.amount.toLocaleString('en-IN')}` },
    { header: 'Delivery Date', accessor: row => new Date(row.deliveryDate).toLocaleDateString('en-IN') },
    { header: 'Status', accessor: row => row.status, render: row => <StatusBadge status={row.status} /> },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Orders...</div>;

  const handleOrderAdded = (newOrder) => {
    setData(prev => [newOrder, ...prev]);
  };

  const handleOrderUpdated = (updatedOrder) => {
    setData((prev) => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <DataTable
        title="Order Management"
        subtitle="Track and manage all customer orders."
        actionButton={
          <button 
            onClick={() => {
              setOrderToEdit(null);
              setIsModalOpen(true);
            }}
            className="bg-brand-primary hover:bg-brand-primarydark text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            + New Order
          </button>
        }
        columns={columns}
        data={data}
        onRowClick={(row) => {
          setOrderToEdit(row);
          setIsModalOpen(true);
        }}
      />
      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setOrderToEdit(null);
        }} 
        onOrderAdded={handleOrderAdded} 
        onOrderUpdated={handleOrderUpdated}
        orders={data} 
        orderToEdit={orderToEdit}
      />
    </div>
  );
}
