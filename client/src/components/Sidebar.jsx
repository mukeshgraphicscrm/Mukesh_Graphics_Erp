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
      "h-screen bg-[#060b14] text-white transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-[260px]"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-brand-line">
        <div className="flex items-center space-x-3 w-full px-6">
          <div className="w-10 h-10 rounded-xl bg-[#E8A33D] flex items-center justify-center text-[#060b14] font-bold text-lg flex-shrink-0">
            MG
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-[15px] leading-tight text-white whitespace-nowrap">Mukesh Graphics</span>
              <span className="text-[11px] text-[#7A8399] font-medium whitespace-nowrap">Printing & Packaging ERP</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              "flex items-center px-4 py-[14px] mx-4 rounded-xl transition-all duration-200 gap-4 group",
              isActive
                ? "bg-[#141d30] shadow-[inset_3px_0_0_0_#E8A33D]"
                : "hover:bg-white/5 border border-transparent"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-[22px] h-[22px] flex-shrink-0 transition-colors",
                    isActive ? "text-[#E8A33D]" : "text-[#7A8399] group-hover:text-white"
                  )}
                  strokeWidth={1.5}
                />
                {!collapsed && (
                  <span className={cn(
                    "font-medium text-[15px] transition-colors",
                    isActive ? "text-white" : "text-[#8A93A8] group-hover:text-white"
                  )}>
                    {item.name}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 mb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center w-full px-4 py-3 rounded-xl transition-colors border border-transparent gap-4 group",
            "hover:bg-white/5"
          )}
        >
          <ChevronLeft className={cn(
            "w-[22px] h-[22px] flex-shrink-0 transition-all text-[#7A8399] group-hover:text-white",
            collapsed ? "rotate-180 mx-auto" : ""
          )} strokeWidth={1.5} />
          {!collapsed && <span className="font-medium text-[15px] text-[#8A93A8] group-hover:text-white">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
