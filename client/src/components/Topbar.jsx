import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center flex-1 max-w-xl">
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={onMenuClick}
          className="mr-4 text-gray-500 hover:text-gray-700 md:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-colors"
            placeholder="Search orders, customers, invoices..."
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Notifications */}
        <button className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          {/* Red dot badge */}
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900 leading-none">Mukesh Patel</div>
            <div className="text-xs text-gray-500 mt-1">Administrator</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
            MP
          </div>
        </div>
      </div>
    </div>
  );
}
