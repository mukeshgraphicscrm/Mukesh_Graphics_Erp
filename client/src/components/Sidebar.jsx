import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitBranch, FileText,
  ShoppingCart, Package, Image as ImageIcon, Factory,
  Boxes, Truck, ShoppingBag, IndianRupee, ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Leads', path: '/leads', icon: GitBranch },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Artworks', path: '/artworks', icon: ImageIcon },
  { name: 'Production', path: '/production', icon: Factory },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'Purchase & GRN', path: '/purchase', icon: ShoppingBag },
  { name: 'Dispatch', path: '/dispatch', icon: Truck },
  { name: 'Accounts', path: '/accounts', icon: IndianRupee },
];

export default function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className={cn(
      "h-screen bg-brand-navy text-white transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-brand-line">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand-navy font-bold text-lg flex-shrink-0">
            MG
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight text-white whitespace-nowrap">Mukesh Graphics</span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Printing & Packaging ERP</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768 && setMobileMenuOpen) {
                setMobileMenuOpen(false);
              }
            }}
            className={({ isActive }) => cn(
              "flex items-center px-4 py-3 mx-4 rounded-lg transition-colors",
              isActive 
                ? "bg-[#1A2740] border border-brand-accent text-white" 
                : "text-gray-400 hover:bg-brand-navylight hover:text-white border border-transparent"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-brand-accent" : "")} />
                {!collapsed && <span className="ml-3 font-medium text-sm">{item.name}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 mb-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center w-full px-4 py-3 rounded-lg transition-colors border border-transparent",
            "text-gray-400 hover:bg-brand-navylight hover:text-white bg-[#0f172a] shadow-sm"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 flex-shrink-0 transition-transform", collapsed ? "rotate-180 mx-auto" : "")} />
          {!collapsed && <span className="ml-3 font-medium text-sm">Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  );
}
