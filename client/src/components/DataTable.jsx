import React, { useState } from 'react';
import { Search, Download, Filter, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataTable({
  title,
  subtitle,
  actionButton,
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Search records..."
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});

  const filteredData = data.filter(row => {
    // Global search
    let matchesSearch = true;
    if (searchTerm) {
      matchesSearch = Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (!matchesSearch) return false;

    // Column specific filters
    for (const [key, value] of Object.entries(columnFilters)) {
      if (value) {
        const column = columns[key];
        if (column) {
          const cellValue = String(column.accessor(row) || '').toLowerCase();
          if (!cellValue.includes(value.toLowerCase())) {
            return false;
          }
        }
      }
    }

    return true;
  });

  const exportData = () => {
    if (filteredData.length === 0) return;

    // 1. Prepare data array (Headers + Rows)
    const headers = columns.map(c => c.header);
    const dataArray = [headers];

    filteredData.forEach(row => {
      const rowData = columns.map(c => {
        let val = c.accessor(row);
        if (val === null || val === undefined) val = '';
        return String(val); // Force all to string to prevent Excel scientific notation on mobile numbers
      });
      dataArray.push(rowData);
    });

    // 2. Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataArray);

    // 3. Automatically calculate and set column widths
    const colWidths = headers.map((header, colIndex) => {
      let maxLength = header.length;
      dataArray.forEach(row => {
        const cellValue = row[colIndex] || '';
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length;
        }
      });
      return { wch: maxLength + 2 }; // Add padding for clean UI
    });
    ws['!cols'] = colWidths;

    // 4. Build and download workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    const fileName = `${(title || 'export').replace(/\s+/g, '_').toLowerCase()}_export.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {(title || actionButton) && (
        <div className="pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-[14px] text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div>
            {actionButton}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full flex-1 sm:max-w-none sm:mr-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-[13px] transition-colors shadow-sm"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          {showFilters && (
            <button
              onClick={() => {
                setColumnFilters({});
                setSearchTerm('');
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-gray-500" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-[13px] font-medium transition-colors shadow-sm ${showFilters
              ? 'border-brand-accent bg-brand-primary/5 text-brand-primary'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm mb-6">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
            {showFilters && (
              <tr className="bg-gray-50/50 border-t border-b border-gray-100">
                {columns.map((col, idx) => (
                  <th key={`filter-${idx}`} className="px-3 py-3 font-normal">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-[12px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors placeholder-gray-400 bg-white shadow-sm"
                      placeholder={`Filter ${col.header}...`}
                      value={columnFilters[idx] || ''}
                      onChange={(e) => setColumnFilters(prev => ({ ...prev, [idx]: e.target.value }))}
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render ? col.render(row) : col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-500 text-[13px]">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
