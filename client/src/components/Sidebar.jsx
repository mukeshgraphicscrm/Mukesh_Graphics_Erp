import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitBranch, FileText,
  ShoppingCart, Package, Factory,
  Boxes, Truck, ShoppingBag, IndianRupee, ChevronLeft,
  Settings, Layers, ChevronDown, ClipboardList
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: GitBranch },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Jobcard', path: '/jobcard', icon: ClipboardList },
  { name: 'Production', path: '/production', icon: Factory },
  { name: 'Dispatch', path: '/dispatch', icon: Truck },
  { 
    name: 'Other', 
    icon: Layers, 
    subItems: [
      { name: 'Inventory', path: '/inventory', icon: Boxes },
      { name: 'Purchase', path: '/purchase', icon: ShoppingBag },
      { name: 'Accounts', path: '/accounts', icon: IndianRupee },
    ]
  },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const location = useLocation();

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const isSubItemActive = (subItems) => {
    return subItems?.some(item => location.pathname === item.path);
  };

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
        {navItems.map((item) => {
          if (item.subItems) {
            const isOpen = openSubmenus[item.name];
            const isChildActive = isSubItemActive(item.subItems);
            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (collapsed) setCollapsed(false);
                    toggleSubmenu(item.name);
                  }}
                  className={cn(
                    "flex items-center w-full px-4 py-[14px] mx-4 rounded-xl transition-all duration-200 gap-4 group cursor-pointer max-w-[calc(100%-32px)]",
                    isChildActive && !isOpen
                      ? "bg-[#1A2740] border border-[#E8A33D]/30 shadow-[inset_3px_0_0_0_#E8A33D]"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-[22px] h-[22px] flex-shrink-0 transition-colors",
                      isChildActive ? "text-[#E8A33D]" : "text-[#7A8399] group-hover:text-white"
                    )}
                    strokeWidth={1.5}
                  />
                  {!collapsed && (
                    <>
                      <span className={cn(
                        "font-medium text-[15px] transition-colors flex-1 text-left",
                        isChildActive ? "text-white" : "text-[#8A93A8] group-hover:text-white"
                      )}>
                        {item.name}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-[#7A8399] transition-transform duration-200",
                          isOpen ? "rotate-180" : ""
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        onClick={handleLinkClick}
                        className={({ isActive }) => cn(
                          "flex items-center pl-[52px] pr-4 py-[10px] mx-4 rounded-xl transition-all duration-200 gap-3 group max-w-[calc(100%-32px)]",
                          isActive
                            ? "bg-[#1A2740] text-white shadow-[inset_2px_0_0_0_#E8A33D]"
                            : "text-[#8A93A8] hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            {subItem.icon && (
                              <subItem.icon 
                                className={cn(
                                  "w-[18px] h-[18px] flex-shrink-0", 
                                  isActive ? "text-[#E8A33D]" : "text-[#7A8399] group-hover:text-white"
                                )} 
                                strokeWidth={1.5} 
                              />
                            )}
                            <span className="font-medium text-[14px]">{subItem.name}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-[14px] mx-4 rounded-xl transition-all duration-200 gap-4 group max-w-[calc(100%-32px)]",
                isActive 
                  ? "bg-[#1A2740] border border-[#E8A33D]/30 shadow-[inset_3px_0_0_0_#E8A33D]" 
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
          );
        })}
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
