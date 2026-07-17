import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = "Select...", name, required }) {
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
        className={`w-full px-3 py-2 border rounded-md transition-colors cursor-pointer flex justify-between items-center bg-white ${
          isOpen ? 'border-brand-accent ring-2 ring-brand-accent/50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={`block truncate text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2`} />
      </div>
      
      {/* Hidden input to support required prop in forms */}
      <input type="hidden" name={name} value={value} required={required} />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            <ul className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center ${
                    value === option.value 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
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
