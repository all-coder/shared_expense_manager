import React, { useState, useRef, useEffect } from "react";

export default function StyledDropdown({ label = "Dropdown", items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-56" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full justify-between rounded-md bg-gray-900 px-5 py-3 text-base font-medium text-white"
      >
        {label}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="ml-2 fill-current"
        >
          <path d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
        </svg>
      </button>

      <div
        className={`absolute left-0 z-40 mt-2 w-full rounded-md bg-gray-800 py-2 shadow-lg transition-all ${
          isOpen ? "top-full opacity-100 visible" : "top-[110%] invisible opacity-0"
        }`}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            className="block w-full text-left px-5 py-2 text-base text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
