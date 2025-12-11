import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block mb-1.5 font-semibold text-sm text-gray-700">
        {label}
      </label>
      <input
        className={`w-full p-2.5 border rounded-lg transition-all duration-200 outline-none focus:ring-2 ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
        } ${className || ''}`}
        {...props}
      />
    </div>
  );
};