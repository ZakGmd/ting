import { useState, useRef, useEffect } from "react";

type CustomDropdownProps = {
    options: string[];
    value: string;
    onChange: (e: { target: { name: string; value: string } }) => void;
    placeholder?: string;
    name: string;
    id: string;
  };


export default function CustomDropdown({ options, value, onChange, placeholder = "Select an option", name, id }:CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");
    const dropdownRef = useRef<HTMLDivElement>(null);
  
    // Handle outside clicks to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    // Update local state when value prop changes
    useEffect(() => {
      setSelectedValue(value);
    }, [value]);
  
    const handleOptionClick = (option: string) => {
      setSelectedValue(option);
      setIsOpen(false);
      
      // Create a synthetic event similar to native select onChange
      const syntheticEvent = {
        target: {
          name,
          value: option
        }
      };
      
      onChange(syntheticEvent);
    };
  
    return (
      <div ref={dropdownRef} className="relative w-full">
        {/* Hidden native select for form submission */}
        <select 
          className="sr-only" 
          aria-hidden="true"
          name={name}
          id={id}
          value={selectedValue}
          onChange={() => {}}
        >
          <option value="">{placeholder}</option>
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
  
        {/* Custom dropdown trigger */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none w-full cursor-pointer flex justify-between items-center"
        >
          <span className={selectedValue ? '' : 'text-white/50'}>
            {selectedValue || placeholder}
          </span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
  
        {/* Dropdown options */}
        {isOpen && (
          <div className="dropDown absolute z-10 w-full mt-1 bg-gradient-to-b from-black/45 to-[#fc7348]/20 from-[19%] to-[230%]  border-[0.5px] border-white/9  backdrop-blur-xl rounded-xl shadow-lg  max-h-60 overflow-auto">
            <ul className="py-2 px-2 flex flex-col gap-1">
              {options.map((option, idx) => (
                <li
                  key={idx}
                  className={`px-4 py-2 cursor-pointer hover:opacity-90   transition-all duration-200 rounded-xl ${
                    selectedValue === option 
                      ? 'bg-white/8 text-white   ' 
                      : 'hover:bg-white/5 text-white/80 opacity-50'
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };