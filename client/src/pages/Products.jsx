import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, Box, Download } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import api from '../lib/api';
import { cn } from '../lib/utils';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Food Packaging': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Pharma Packaging': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'FMCG': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Product Master...</div>;

  return (
    <>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Master</h2>
          <p className="text-sm text-gray-500 mt-1">Catalog of standard SKUs across food, pharma and FMCG packaging.</p>
        </div>
        <button 
          onClick={() => {
            setProductToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="bg-[#1b2f63] hover:bg-[#112046] text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center shadow-sm w-fit text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products, categories..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent bg-white shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col border border-gray-200 cursor-pointer"
            onClick={() => {
              setProductToEdit(product);
              setIsAddModalOpen(true);
            }}
          >
            {/* Card Header (Dark Blue) */}
            <div className="bg-[#1b2f63] h-32 flex items-center justify-center">
              <Box className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate" title={product.name}>{product.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{product.dimensions}</p>
                </div>
                <span className={cn("inline-block px-2.5 py-1 text-[10px] font-semibold rounded-full flex-shrink-0", getCategoryColor(product.category))}>
                  {product.category || 'Uncategorized'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">Material</p>
                  <p className="font-medium text-gray-900 text-[13px]">{product.material}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">GSM</p>
                  <p className="font-medium text-gray-900 text-[13px]">{product.gsm}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-[11px] mb-0.5">Printing</p>
                  <p className="font-medium text-gray-900 text-[13px]">{product.printing}</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-4 flex justify-between items-center bg-white border-t border-gray-100">
              <span className="text-[12px] text-gray-400">Unit price</span>
              <span className="text-lg font-bold text-[#1b2f63]">
                ₹{product.unitPrice}
              </span>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-200 border-dashed">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>

    <AddProductModal 
      isOpen={isAddModalOpen} 
      onClose={() => {
        setIsAddModalOpen(false);
        setProductToEdit(null);
      }} 
      onProductAdded={(newProduct) => {
        setProducts([newProduct, ...products]);
      }} 
      onProductUpdated={(updatedProduct) => {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      }}
      productToEdit={productToEdit}
    />
    </>
  );
}
