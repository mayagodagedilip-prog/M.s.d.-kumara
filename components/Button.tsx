import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className, ...props }) => {
  const baseStyles = "w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white shadow-slate-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className || ''}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};