import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  icon?: LucideIcon;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Input = ({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  className = "",
  labelClassName = "",
  inputClassName = "",
  name,
  value,
  onChange,
  ...props
}: InputProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`text-content uppercase block mb-2 text-sm ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-[#0D1117] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-[#35b9f1] focus:ring-1 focus:ring-[#35b9f1] transition-colors font-mono text-sm ${inputClassName}`}
          {...props}
        />
      </div>
    </div>
  );
};
