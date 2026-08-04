import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = "Select...", name, required, placement = "bottom", icon: Icon, triggerClassName, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <div 
        className={triggerClassName || `w-full ${Icon ? 'pl-9 pr-3' : 'px-3'} py-2 border rounded-md transition-colors ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300' : 'cursor-pointer bg-white border-gray-300 hover:border-gray-400'} flex justify-between items-center ${
          isOpen ? 'border-[#1b2f63] ring-2 ring-[#1b2f63]/50' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <span className={`block truncate text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2`} />
      </div>
      
      {/* Hidden input to support required prop in forms */}
      <input type="hidden" name={name} value={value} required={required} />

      {isOpen && (
        <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-gray-300 ${
          placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            <ul className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center ${
                    value === option.value 
                      ? 'bg-[#E8A33D]/10 text-[#E8A33D] font-bold' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    onChange({ target: { name, value: option.value } });
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
