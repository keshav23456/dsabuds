import { Input } from "@/components/common";
import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  icon?: LucideIcon;
  labelIcon?: LucideIcon;
  iconColor?: string;
}

export const FormField = ({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  labelIcon: LabelIcon,
  iconColor = "text-primary",
  ...props
}: FormFieldProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="text-neutral-400 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
          {LabelIcon && <LabelIcon className={`${iconColor} w-4 h-4`} />}
          {label}
        </label>
      )}
      <Input
        icon={Icon}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="mb-5"
        labelClassName="hidden"
        {...props}
      />
    </div>
  );
};
